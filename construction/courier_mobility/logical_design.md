# 配達員モビリティユニット 論理設計

## 1. 目的と範囲
- 配達員向けの案件配信、配送ステータス管理、証跡提出、報酬集計を統括するバックエンド論理設計を定義する。
- ドメインモデルで示された `CourierAccount`, `JobOfferStream`, `DeliveryAssignment`, `ProofPackage`, `PayoutStatement` を中核に据え、`integration_contract` の Courier API を実装する。
- 消費者 UI や店舗オペレーションは参照のみとし、配達員の稼働体験に特化する。

## 2. アーキテクチャ概要
- イベント駆動マイクロサービス構成。案件配信とリアルタイム位置情報をストリーム処理し、証跡と報酬計算は非同期ジョブでハンドリング。
- サービス分割:
  - `CourierAccountService`: プロフィール・稼働資格管理。
  - `JobDispatchService`: 需要と稼働状況を照合して案件を提示。
  - `AssignmentOrchestrator`: 受諾後の配送ライフサイクル管理。
  - `ProofProcessingService`: 証跡検証と承認。
  - `EarningsService`: 報酬計算と支払スケジューリング。
- モバイルアプリ向けに低レイテンシな GraphQL/BFF レイヤを用意し、ステータス更新は双方向通信（WebSocket/Push）で補完。

## 3. レイヤおよびモジュール構成
- **インターフェース層**
  - `CourierRestController`: Integration contract の API を公開。デバイス認証・トークン検証。
  - `CourierRealtimeGateway`: 配達員クライアントとの WebSocket 接続。ジョブオファーとルート更新をプッシュ。
  - `InboundEventAdapters`: `consumer_experience` の注文イベント、`restaurant_operations` の調理完了イベントを購読。
- **アプリケーション層**
  - `CourierAccountAppService`: 登録、資格更新、稼働エリア設定。
  - `JobMatchingAppService`: `JobMatchingService` を呼び出して案件候補を生成。`OfferWindow` を制御。
  - `AssignmentLifecycleAppService`: 受諾、ピックアップ確認、配送完了、失敗処理。SLA 監視を実装。
  - `ProofAppService`: 証跡提出および再提出の処理。
  - `PayoutAppService`: 報酬計算リクエストを受理し、支払い予定を作成。
- **ドメイン層**
  - `JobOfferStream` は発行順序を保証するアクターモデル。`AssignmentTimeoutPolicy` を適用。
  - `DeliveryAssignment` はチェックポイントを更新し `consumer_experience` にトラッキングイベントを提供。
  - `ProofPackage` は `ProofCompliancePolicy` を評価し、`ProofApproved` 発火後に報酬計算を解放。
  - `PayoutStatement` は `PayoutSchedulePolicy` を適用して支払いサイクルを決定。
- **インフラ層**
  - `CourierAccountRepository`: RDBMS（PostGIS 拡張）でエリア情報を管理。
  - `JobOfferStreamRepository`: ストリームストア（Kafka/Redis Streams）で案件キューを保持。
  - `DeliveryAssignmentRepository`: イベントストアでライフサイクルを保存。位置情報は時系列 DB にも保存。
  - `ProofStorage`: 署名や写真の安全なオブジェクトストレージ。メタデータは暗号化。
  - `PayoutStatementRepository`: 分散トランザクションログ（ledger）で報酬明細を堅牢化。

## 4. 主要ユースケースフロー
- **案件取得 (`GET /couriers/{courierId}/jobs`)**
  1. `CourierRestController` が位置情報・フィルタを受理。
  2. `JobMatchingAppService` が `PreferredZones` と現在の需要を照合し、`JobOfferStream` 投影から提示可能案件を抽出。
  3. レスポンスにタイムアウト情報を含め返却。並行して WebSocket でも通知。
- **案件受諾 (`POST /couriers/{courierId}/jobs/{jobId}/accept`)**
  1. `AssignmentLifecycleAppService` が稼働資格・距離制限を検証。
  2. 受諾成功後 `JobAccepted` イベントを発行し、`DeliveryAssignment` を生成。
  3. `consumer_experience` と `restaurant_operations` に配達員情報を通知。
- **ルート案内 (`GET /couriers/{courierId}/jobs/{jobId}/route`)**
  1. `AssignmentLifecycleAppService` が `RouteOptimizationService` 経由でルートを再計算。
  2. `RouteUpdated` イベントを発行し、アプリへルートを返却。
- **証跡提出 (`POST /couriers/{courierId}/jobs/{jobId}/proof`)**
  1. `ProofAppService` が提出物を `ProofValidationService` に渡し、`ProofPackage` を更新。
  2. 承認済みであれば `ProofApproved` を発行し、報酬計算を解放。
- **報酬照会 (`GET /couriers/{courierId}/earnings`)**
  1. `PayoutAppService` が `PayoutStatement` 投影を参照し、期間別内訳を返却。

## 5. イベント連携
- 発行イベント: `CourierActivated`, `CourierSuspended`, `PreferredZoneUpdated`, `JobOffered`, `JobAccepted`, `JobOfferExpired`, `PickupConfirmed`, `RouteUpdated`, `DeliveryCompleted`, `DeliveryFailed`, `ProofSubmitted`, `ProofApproved`, `EarningsCalculated`, `PayoutScheduled`, `PayoutReleased`, `AvailabilityStatusChanged`.
- 購読イベント:
  - `consumer_experience`: `OrderPlaced`, `OrderCancellationRequested`, `OrderChangeRequested`.
  - `restaurant_operations`: `OrderReadyForPickup`, `OrderHandedOver`.
  - `platform_operations`: `AlertTriggered`, `MitigationPlan` アップデート（安全対策）。
- イベント制御: `AssignmentOrchestrator` が配送関連イベントの順序性を保証し、`JobDispatchService` は需要シグナルを反映。

## 6. データ管理
- `CourierAccount`: 稼働資格や交通手段は属性テーブルで管理し、更新履歴を保持。
- `JobOfferStream`: 案件毎に TTL を設定。期限切れは `JobOfferExpired` イベントとして処理。
- `DeliveryAssignment`: 位置情報はチェックポイント粒度で数十秒間隔。長期保管はアーカイブバケット。
- `ProofPackage`: 原本は透かし入りで保存。検証メタデータを付与し、不適切コンテンツ検出ワークフローを接続。
- `PayoutStatement`: ラインアイテムごとに `DeliveryAssignment` と双方向参照。支払いステータスは決済サービスと二相整合。

## 7. 外部統合
- REST API: Integration contract に準拠。デバイスバインディングにより端末ごとにトークン発行。
- ナビゲーション: ルート最適化は外部地図サービス API を利用。結果は `RoutePlan` として保存。
- 決済システム: 報酬支払いは共通決済サービスと連携し、`PayoutScheduled` で指示を送る。
- 運用チーム: インシデントや安全関連イベントを `platform_operations` へ通知。

## 8. スケーラビリティとレジリエンス
- 案件配信パイプラインは高スループットストリーム処理（Kafka Streams / Flink 等）を採用。`courierId` でパーティショニング。
- 位置情報更新は軽量プロトコル（MQTT/WebSocket）で受信し、バルク書き込みでストレージ負荷を抑制。
- 証跡検証は非同期ワーカーで処理し、画像解析は GPU プールを別途水平拡張。
- フォールバック: 外部地図 API 障害時はキャッシュされたルートまたはシンプルな直線距離案内を返却。

## 9. オブザーバビリティ
- メトリクス: 案件受諾率、ピックアップ遅延、配達完了までの SLA、証跡再提出率。
- トレーシング: `assignmentId` をトレースキーとして、注文→配達→報酬までのエンドツーエンド時間を測定。
- ログ: 稼働資格変更や安全インシデントを監査ログに記録。GDPR 対応のため PII はマスキング。
- アラート: 案件配信バックログ、ナビゲーション失敗率、支払い遅延率を監視し、閾値超過で `platform_operations` に通知。

## 10. セキュリティとコンプライアンス
- 配達員デバイスは証明書ピンニングとデバイスバインディングで保護。盗難端末は即時無効化可能。
- 証跡データは暗号化ストレージで保持し、アクセスは限定ロールのみ。コンプライアンス保持期限を設定。
- 支払いデータは決済システムに委譲し、当該システムからのトークンのみ保持。
- 安全インシデント時は `SafetyIncidentPolicy` に従った稼働停止を強制。

## 11. 未解決課題・フォローアップ
- 位置情報の精度・更新頻度に関する通信ポリシーを通信事業者とのコスト評価と共に再確認する。
- 報酬計算の税務処理要件を地域別に整理し、`PayoutSchedulePolicy` に反映する必要がある。
