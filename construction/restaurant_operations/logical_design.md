# レストランオペレーションユニット 論理設計

## 1. 目的と範囲
- レストランパートナーが営業時間・メニュー管理・注文処理・分析を行うためのバックエンド論理設計を定義する。
- ドメインモデルで示された `RestaurantAccount`, `MenuCatalog`, `OrderBoard`, `RevenueLedger` を中核に、`integration_contract` の Restaurant API を実装する。
- 消費者体験および配達員運行の詳細は対象外とし、店舗内部オペレーション最適化にフォーカスする。

## 2. アーキテクチャ概要
- ヘキサゴナルアーキテクチャを基礎に、API コマンド処理とイベント駆動の調理ライン制御を組み合わせる。
- サービス分割:
  - `RestaurantConfigService`: 営業時間・配達エリア更新。
  - `MenuAuthoringService`: メニュー編集・バージョン管理。
  - `KitchenOrderService`: 注文受諾から引き渡しまでのリアルタイム制御。
  - `RestaurantAnalyticsService`: 売上・キャンセル率等の集計と提供。
  - `RestaurantEventPublisher`: 店舗イベントを他ユニットへ発行。
- 状態同期はイベントソーシングを採用し、読み取り用に `OrderBoardProjection` 等を構築。

## 3. レイヤおよびモジュール構成
- **インターフェース層**
  - `RestaurantRestController`: Integration contract の API を実装。入力検証、アクセススコープ確認、監査ログ付与。
  - `PartnerConsoleGateway`: 店舗ダッシュボード向け WebSocket/GraphQL。注文更新をプッシュ配信。
  - `InboundEventSubscriber`: 消費者／配達ユニットのイベント購読。`OrderPlaced`, `DeliveryCompleted` 等を処理。
- **アプリケーション層**
  - `RestaurantAccountAppService`: 営業時間や配達エリアの更新コマンドを処理。`AvailabilityPolicy` を適用。
  - `MenuCatalogAppService`: 下書きメニュー更新、公開、アーカイブ。`MenuPublishingService` を呼び出す。
  - `OrderBoardAppService`: 注文チケットの受諾・調理ステータス更新・変更要求評価。
  - `AnalyticsAppService`: 集計リクエストを受け `RevenueLedger` 投影へアクセス。
- **ドメイン層**
  - アグリゲート間の整合性を SAGA で連携 (`OrderBoard` 完了 → `RevenueLedger` 更新)。
  - ポリシー (`OrderAcceptancePolicy`, `ChangeWindowPolicy`) はアプリケーション層から注入。
- **インフラ層**
  - `RestaurantAccountRepository`: RDBMS（地理情報拡張）でエリア情報を保持。
  - `MenuCatalogRepository`: ドキュメントストアで多言語説明・画像 URL を保存。
  - `OrderBoardRepository`: イベントストア＋インメモリキューでリアルタイム処理。
  - `AnalyticsWarehouse`: 別途列指向 DB で時間集計を保持。

## 4. 主要ユースケースフロー
- **営業時間更新 (`PUT /restaurants/{restaurantId}/settings`)**
  1. `RestaurantRestController` がリクエストを受け、`RestaurantAccountAppService` に渡す。
  2. アプリケーションサービスが `RestaurantAccount` をロードし、新設定を適用。`AvailabilityPolicy` で重複やロックダウン判定。
  3. `OperatingHoursUpdated` イベント発行後、設定プロジェクションを更新してレスポンスを返却。
- **メニュー編集 (`PUT /restaurants/{restaurantId}/menu-items/{itemId?}`)**
  1. 入力を `MenuCatalogAppService` が受理。
  2. ドメインで `MenuVersioningPolicy` を適用し、ドラフト更新または新規作成。
  3. 公開時には `MenuPublished` を発行。`consumer_experience` のカタログ投影が更新される。
- **注文受注 (`POST /restaurants/{restaurantId}/orders/{orderId}/status`)**
  1. 店舗が `ACKNOWLEDGED` や `READY_FOR_PICKUP` ステータスを送信。
  2. `OrderBoardAppService` が `OrderTicket` を更新し、必要な場合は `OrderChangeResponded` を発行。
  3. ステータス変更イベントを `consumer_experience` と `courier_mobility` へ配信。
- **分析取得 (`GET /restaurants/{restaurantId}/analytics`)**
  1. `AnalyticsAppService` が `RevenueLedger` 投影と `AnalyticsWarehouse` を参照。
  2. 指定期間の売上・キャンセル率などを計算して返却。

## 5. イベント連携
- 発行イベント: `OperatingHoursUpdated`, `DeliveryZoneUpdated`, `RestaurantTemporarilyClosed`, `MenuItemUpdated`, `MenuPublished`, `OrderAcknowledged`, `OrderReadyForPickup`, `OrderHandedOver`, `OrderChangeResponded`, `SalesMetricsUpdated`.
- 購読イベント:
  - `consumer_experience`: `OrderPlaced`, `OrderChangeRequested`, `OrderCancellationRequested`.
  - `courier_mobility`: `DeliveryCompleted`, `DeliveryFailed`.
  - `platform_operations`: `TicketCreated`, `MitigationStarted`（厨房負荷対応）。
- イベント処理: `KitchenOrderService` が注文関連イベントを順序制御付きストリームで処理。`RestaurantAnalyticsService` はバッチ更新イベントを使用。

## 6. データ管理
- `RestaurantAccount`: 1 店舗 1 レコード。営業時間、エリアは JSONB / GeoJSON カラム。
- `MenuCatalog`: バージョン ID によるスナップショットと差分履歴。公開中バージョンはキャッシュに保持。
- `OrderBoard`: ホットデータはインメモリストアで高速化。履歴はイベントストア経由でアーカイブ。
- `RevenueLedger`: ストリーミング集計（短期）とバッチ（長期）を組み合わせ。`SalesMetric` を時系列 DB に格納。
- トランザクション整合性: 同一注文に対する更新はストリームパーティション（注文 ID）で線形化。

## 7. 外部統合
- REST API: Integration contract で定義されたメソッドを `RestaurantRestController` が提供。Webhook で成功通知を `integration_contract` に送信可能。
- メニュー画像管理: CDN/オブジェクトストレージに非同期アップロードし、署名 URL を `MenuCatalog` に保持。
- 調理機器連携（Optional）: `OrderBoard` が厨房ディスプレイシステムへイベント発行。
- サポート窓口: SLA 超過や拒否率上昇イベントを `platform_operations` へ送信。

## 8. スケーラビリティとレジリエンス
- 注文処理パス（`KitchenOrderService`）はアクターモデルで実装し、レストランごとに独立スレッド化しホットスポットを隔離。
- メニュー公開はドラフト反映と公開反映を分離し、公開処理をイベント駆動のバックグラウンドタスクで実施。
- フェイルオーバー: 店舗コンソールとの WebSocket 接続は複数リージョンに配置。イベントストリームは少なくとも 3 レプリカを維持。
- バックプレッシャ: 注文ピーク時には `OrderAcceptancePolicy` に従い受付一時停止を自動適用。

## 9. オブザーバビリティ
- メトリクス: 注文承認 SLA、調理ステータス遷移時間、メニュー公開レイテンシ。
- ログ: 注文変更理由、拒否理由を構造化ログに記録し、サポート解析に渡す。
- トレーシング: `orderId` と `restaurantId` をキーにイベントチェーンを追跡。`OrderBoard` 内部処理を spans で可視化。
- アラート: `KitchenOverloaded` 発火時にオンコール通知。`SalesMetricsUpdated` が停止した場合にバッチ異常アラート。

## 10. セキュリティとコンプライアンス
- 店舗スタッフごとのロールベース認可。注文データ閲覧は最小権限。
- 監査証跡: `ChangeDirective` や設定変更は不変ログストアへ書き込み、`integration_contract` の変更監査に同期。
- 食品安全情報（アレルゲン等）は暗号化＋アクセス制御。GDPR 対応として個人顧客情報はマスキングされた形で保持。

## 11. 未解決課題・フォローアップ
- `OrderBoard` と外部厨房設備のインターフェース仕様は別途定義が必要。
- 分析指標の粒度と保管期間について `platform_operations` のデータ保持方針を確認する。
