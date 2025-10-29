# コンシューマ体験ユニット 論理設計

## 1. 目的と範囲
- 消費者がレストラン探索から注文確定、追跡、変更、再注文に至る一連のフローを提供するバックエンドの論理構造を定義する。
- ドメインモデルで定義された `ConsumerAccount`, `ShoppingCart`, `ConsumerOrder`, `OrderExperienceTimeline` の整合性を保ちながら、`integration_contract` の Consumer API を実装するためのアプリケーション層コンポーネント、イベント連携、データ投影を設計対象とする。
- 決済実行や配達運行、店舗調理は他ユニットに委任し、本ユニットではトランザクションオーケストレーションと体験品質に焦点を当てる。

## 2. アーキテクチャ概要
- 基盤パターン: ヘキサゴナルアーキテクチャを採用し、アプリケーションサービスがドメインモデルをオーケストレート。外部との同期連携は REST API、非同期連携はイベントストリームで行う。
- デプロイ構成: API ファサード（GraphQL/REST Gateway）とアプリケーションサービス層をスケールアウト可能な stateless サービスとして構築。書き込みモデル・読み取りモデルは別ストアに分離し、最終的整合性で同期する。
- サービス分割:
  - `ExperienceAPI`: Consumer API エンドポイント公開と認可、レート制御。
  - `ConsumerCommandService`: カート、注文、変更申請などコマンド処理。
  - `ConsumerQueryService`: 検索・履歴・トラッキング投影の読み取り API。
  - `NotificationGateway`: `ConsumerNotified` イベントを外部通知チャンネルへ接続。
  - `TimelineUpdater`: 配達員および店舗イベントを受信し `OrderExperienceTimeline` を更新。

## 3. レイヤおよびモジュール構成
- **インターフェース層**
  - `ConsumerRestController`: Integration contract のエンドポイントを実装し、入力検証とアクセストークン検証を実施。
  - `ConsumerMessageSubscriber`: イベントブローカー購読アダプタ。トピック分類は `restaurant.orders.*`, `courier.assignments.*`, `platform.notifications.*`。
- **アプリケーション層**
  - `RestaurantDiscoveryAppService`: 検索クエリを評価し、`RestaurantSummary` 投影と SLA 情報を返却。
  - `CheckoutAppService`: カート検証、決済プレオーソリ要求、`OrderPlaced` イベント発火までを実行。`CheckoutOrchestrator` ドメインサービスを利用。
  - `OrderLifecycleAppService`: 注文変更・キャンセル要求の受理、`ChangeConflictPolicy` 適用、ステータス照会。
  - `TrackingAppService`: リアルタイム追跡情報を `OrderExperienceTimeline` から取得し API レスポンスへ整形。
  - `ReorderAppService`: 過去注文から新規カートを生成し、価格差分を `CartPriced` イベントに反映。
- **ドメイン層**
  - アグリゲートはイベントソーシングを前提としたアクターモデルで管理。`ConsumerOrder` は状態遷移と変更申請のスケジューリングを担う。
  - ドメインサービス (`CheckoutOrchestrator`, `StatusSyncService`, `NotificationRateLimitPolicy`) はアプリケーション層から呼び出される。
- **インフラ層**
  - `ConsumerAccountRepository`: RDBMS またはキー値ストアで永続化。
  - `EventStore`: 書き込みモデルはイベントストアに保存し、プロジェクタが読み取りモデルを更新。
  - `QueryCache`: レストラン候補や注文履歴は列指向ストア＋キャッシュ層（例: Redis）で高速提供。

## 4. 主要ユースケースフロー
- **レストラン探索 (`GET /consumer/restaurants`)**
  1. `ConsumerRestController` が検索条件を受理し、`RestaurantDiscoveryAppService` に委譲。
  2. サービスは `RestaurantCatalogProjection`（`restaurant_operations` 由来イベントの投影）を参照し、レイテンシ SLA と `EstimatedArrival` を計算。
  3. 結果をクエリレスポンスに変換し返却。
- **注文確定 (`POST /consumer/orders`)**
  1. リクエストバリデーション後、`CheckoutAppService` が現行カートと支払い方法を取得。
  2. `CheckoutOrchestrator` が在庫・価格検証、プロモーション適用、`PaymentVerificationPolicy` を適用。
  3. `OrderPlaced` イベントを発行し、書き込みモデルへ永続化。レスポンスで注文 ID と ETA を返却。
- **注文変更／キャンセル (`PATCH /consumer/orders/{orderId}`)**
  1. `OrderLifecycleAppService` が `ConsumerOrder` をロードし、`ChangeConflictPolicy` や `CancellationEligibilityPolicy` を評価。
  2. 承認フローが必要な場合は `OrderChangeRequested` イベントを発行し、レスポンスで保留状態を通知。
  3. 店舗／運用ユニットが結果イベントを返した際に `OrderStatusUpdated` や `OrderCancellationRequested` を更新。
- **追跡表示 (`GET /consumer/orders/{orderId}/tracking`)**
  1. `TrackingAppService` が `OrderExperienceTimeline` 投影を参照。
  2. 最終チェックポイントと `EstimatedArrival` をまとめてレスポンスに変換。

## 5. イベント連携
- 発行イベント（例）: `OrderPlaced`, `OrderChangeRequested`, `OrderCancellationRequested`, `OrderStatusUpdated`, `ConsumerNotified`.
- 購読イベント（例）:
  - `restaurant_operations`: `OrderAcknowledged`, `OrderReadyForPickup`, `OrderHandedOver`.
  - `courier_mobility`: `JobAccepted`, `PickupConfirmed`, `DeliveryCompleted`.
  - `platform_operations`: `TicketResolved`, `MitigationStarted`（キャンセル可否連携）。
- イベント処理方式: 各イベントを `TimelineUpdater` と `OrderLifecycleSaga` が購読し、ドメインアグリゲートを更新。リードモデルは非同期プロジェクタで更新。
- エラーハンドリング: 冪等性キーを基に重複処理を防ぐ。失敗イベントは DLQ に送信し、再処理ワーカーがバックオフ制御で復旧。

## 6. データ管理
- 書き込みモデル: イベントストア（例: Kafka + 永続化層）にアグリゲートイベントを保存し、スナップショットを定期作成。
- 読み取りモデル:
  - `RestaurantCatalogProjection`: カテゴリ・営業時間・ETA 要約を保持し、`restaurant_operations` 由来イベントで更新。
  - `OrderTrackingProjection`: 注文状態とタイムラインを結合したビュー。
  - `OrderHistoryProjection`: 並列クエリエンジン（例: Presto/Athena）向けにバッチ同期。
- キャッシュ・セッション: `ShoppingCart` はセッションストア（TTL 管理）、`DeliveryAddress` は暗号化して保存。
- 一貫性: 書き込みは強整合性、クエリは最終的整合性。ユーザーにはタイムスタンプを返して最新でない可能性を明示。

## 7. 外部統合
- REST API: integration contract の仕様に準拠。`ExperienceAPI` で認可トークン検証、レートリミット、入力スキーマ検証を実施。
- 決済ゲートウェイ: `PaymentProfile` トークンを共通決済サービスへ送信するためのアウトバウンドポートを設置。結果は非同期コールバックで反映。
- 通知サービス: `ConsumerNotified` 発火時に Push/SMS/Email アダプタが起動し送信。
- フロントエンド: BFF 層が必要な場合は `ConsumerQueryService` のクエリ API を再利用。

## 8. スケーラビリティとレジリエンス
- API 層とアプリケーション層は stateless に保ち、オートスケーリング対象とする。
- カート処理はセッションシャーディングを採用し、ホットスポットを回避。
- イベントプロジェクタはパーティションキーを注文 ID・レストラン ID で設定し、順序保証を確保。
- サーキットブレーカ: 店舗・配達関連イベントが遅延する場合、UI には既存 ETA を提示しフォールバックを適用。
- スキーマ管理: `integration_contract` から受け取るスキーマバージョンを契約レジストリで検証し互換性を保障。

## 9. オブザーバビリティ
- メトリクス: API レイテンシ、カート確定成功率、注文ステータス伝播時間。
- 分散トレーシング: 各リクエストに `orderId` をトレース ID として紐付け、イベントチェーンを可視化。
- ログ: ドメインイベントは構造化ログとして出力し、再注文時の診断に活用。
- アラート: カートエラー率や ETA 更新失敗をしきい値監視。`platform_operations` へアラートイベントを通知。

## 10. セキュリティとコンプライアンス
- PII（住所、支払いトークン）は暗号化保存し、アクセスはロールベースで制御。
- イベントデータは最小限の個人情報のみ含め、購読者キュー毎にフィルタリングを適用。
- GDPR 対応: `ConsumerAccount` の削除要求はソフトデリート後に非同期ワーカーがサニタイズ。注文履歴は匿名化して保持。

## 11. 未解決課題・フォローアップ
- リアルタイムトラッキングの SLA とメッセージ頻度上限を配達ユニットと再調整する必要がある。
- 決済失敗時のリトライ戦略とユーザー通知方針を `platform_operations` と合意する必要がある。
