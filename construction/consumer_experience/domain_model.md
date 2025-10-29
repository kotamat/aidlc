# コンシューマ体験ドメインモデル

## コンテキスト概要
- 目的: 消費者によるレストラン探索、注文確定、決済、追跡、再注文、変更・キャンセル申請を一貫して提供する。
- 主な利用者: 一般消費者。
- 境界づけ: 消費者向けアプリケーション体験に限定し、決済実行、配達運行、店舗調理業務は他コンテキストに委任する。

## アグリゲート
### ConsumerAccount
- 役割: 消費者の利用設定全般を保持するルート。支払い方法・お気に入り・通知設定を整合性ある状態で管理する。
- 構成要素: `PaymentProfile` エンティティ集合、`FavoriteRestaurant` エンティティ集合、`DefaultPreferences` 値オブジェクト。
- 不変条件: 既定支払い方法は登録済みの `PaymentProfile` に限る／同一カードトークンの重複登録不可／非アクティブな支払い方法は選択不可。
- 関連イベント: `PaymentMethodRegistered`, `PaymentMethodDeactivated`, `FavoriteRestaurantUpdated`.

### ShoppingCart
- 役割: 消費者が注文確定前に構築する一時的アグリゲート。再注文・現在のカート操作・価格計算を担う。
- 構成要素: `CartItem` エンティティ集合、`AppliedPromotion` 値オブジェクト、`DeliveryAddress` 値オブジェクト。
- 不変条件: すべての `CartItem` は同一レストランに属する／在庫・価格はレストランオペレーション側の最新情報と同期が必要／プロモーションは重複適用不可。
- 関連イベント: `CartInitialized`, `CartItemAdjusted`, `CartPriced`.

### ConsumerOrder
- 役割: 消費者視点での注文ライフサイクルを保持し、追跡と変更要求の状態を管理する。
- 構成要素: `OrderSnapshot` 値オブジェクト、`FulfillmentStatus` 値オブジェクト、`ChangeRequest` エンティティ集合、`CancellationRequest` エンティティ。
- 不変条件: `ConsumerOrder` は一意な注文IDで識別／変更要求は承認状態が確定するまで複数同時に保留可能だが互いの影響範囲でコンフリクト検知が必要／キャンセルはステータスポリシーに従う。
- 関連イベント: `OrderPlaced`, `OrderStatusUpdated`, `OrderChangeRequested`, `OrderCancellationRequested`, `OrderReordered`.

### OrderExperienceTimeline
- 役割: リアルタイムトラッキングと通知履歴を時系列で保持し、 ETA 推定を安定させる。
- 構成要素: `TrackingCheckpoint` エンティティ集合、`EstimatedArrival` 値オブジェクト、`NotificationLog` エンティティ集合。
- 不変条件: チェックポイントは発生時刻順で整列／推定到着時刻は最新チェックポイントと配達員コンテキストからのイベントで更新する／通知の重複発行を抑止。
- 関連イベント: `TrackingUpdated`, `EtaAdjusted`, `DeliveryCompleted`.

## エンティティ
- `PaymentProfile`: 決済手段の状態（アクティブ／非アクティブ、検証ステータス、トークン）を保持。`ConsumerAccount` 配下で識別子を持つ。
- `FavoriteRestaurant`: 消費者がお気に入り登録したレストランに関する順位やメモを保持。
- `CartItem`: メニューID、数量、オプション選択、調整履歴を保持。カート内の順序を持つ。
- `ChangeRequest`: 変更対象アイテム、要望内容、承認ステータス、タイムスタンプを保持。
- `CancellationRequest`: キャンセル理由、提出時刻、審査結果、返金ステータスを保持。
- `TrackingCheckpoint`: 配達ステータス、地理位置、発生元（レストラン／配達員／システム）を保持。
- `NotificationLog`: 通知タイプ、送信チャネル、送信結果を保持。

## 値オブジェクト
- `DefaultPreferences`: 既定支払い方法ID、通知設定、言語を内包。
- `AppliedPromotion`: プロモーションコード、割引タイプ、適用条件を内包し、検証結果を保持。
- `DeliveryAddress`: 住所文字列、緯度経度、建物情報、受け取り指示を内包。
- `OrderSnapshot`: 注文確定時の項目明細、合計金額、手数料、支払い方法、配送先を固定化。
- `FulfillmentStatus`: ステータス値（例: `PENDING`, `CONFIRMED`, `PREPARING`, `EN_ROUTE`, `DELIVERED`, `FAILED`）、タイムスタンプ、進行指標を内包。
- `EstimatedArrival`: 到着予測時刻、信頼度、算出根拠を内包。
- `RoutePoint`: トラッキング表示用の座標とタイムスタンプ（`TrackingCheckpoint` で利用）。

## ドメインサービス
- `RestaurantDiscoveryService`: レストラン検索条件を評価し、結果をランキングして `RestaurantSummary` 値オブジェクト集合として返却する。
- `CheckoutOrchestrator`: カート、支払い検証、プロモーション適用を一貫して処理し `ConsumerOrder` を生成する。
- `ReorderService`: 過去注文から `ShoppingCart` を再構築し、在庫・価格の差異を調整する。
- `StatusSyncService`: 外部（配達員・プラットフォーム運用）からのステータスイベントを取り込み `ConsumerOrder` と `OrderExperienceTimeline` を同期させる。

## ポリシー
- `CancellationEligibilityPolicy`: 注文ステータスと経過時間、店舗承諾状況に基づきキャンセル可否と手数料条件を決定する。
- `ChangeConflictPolicy`: 複数の変更要求が同一アイテムに及ぶ場合の優先順位やマージ戦略を定義する。
- `PaymentVerificationPolicy`: 登録・利用時に決済手段の検証フロー（小額オーソリ等）を管理し、`PaymentProfile` の状態遷移を制御する。
- `NotificationRateLimitPolicy`: 短時間の過剰通知を抑制し、ユーザー体験を保護する。

## ドメインイベント
- `PaymentMethodRegistered`, `PaymentMethodDeactivated`
- `CartInitialized`, `CartItemAdjusted`, `CartPriced`
- `OrderPlaced`, `OrderStatusUpdated`, `OrderChangeRequested`, `OrderCancellationRequested`, `OrderReordered`
- `TrackingUpdated`, `EtaAdjusted`, `DeliveryCompleted`
- `ConsumerNotified`（重要通知が送信された際に発火）

## リポジトリ
- `ConsumerAccountRepository`: アグリゲートの取得・保存、支払い方法検索、既定設定の更新。
- `ShoppingCartRepository`: カートのロード・保存、セッション有効期限管理。
- `ConsumerOrderRepository`: 注文履歴の検索、ステータス更新、再注文用スナップショット取得。
- `OrderExperienceTimelineRepository`: トラッキング履歴の追加・検索、通知ログの参照。

## 外部境界と連携
- `integration_contract` で定義された Consumer API を通じて注文確定・追跡情報を外部に公開する。
- 決済ゲートウェイとの連携はトークン化された `PaymentProfile` 経由で行い、真正な支払い処理はプラットフォーム共通サービスに委任する。
- 配達ステータス更新は `courier_mobility` からのイベント、キャンセル・変更承認は `restaurant_operations` と `platform_operations` からのコールバックを受ける。
- 内部通知はプッシュ通知サービスやメールサービスなどの外部チャンネルにドメインイベントを介して連携する。
