# 統合契約

## 前提
- 各ユニットは独立したサービスとして実装され、共通 ID（注文ID、ユーザーID、店舗IDなど）で連携する。
- 認証・認可は共通の API ゲートウェイで実施する前提とし、契約ではペイロード構造とメソッドのみ定義する。

---

## コンシューマ体験 API

### GET /consumer/restaurants
- クエリ: `category`, `ratingMin`, `keyword`, `location`
- レスポンス: レストラン候補リスト、営業時間、配達 ETA のサマリ

### POST /consumer/orders
- リクエスト: カート内容、支払い方法 ID、配送先
- レスポンス: 注文ID、見積もり配達時間、トラッキングURL

### PATCH /consumer/orders/{orderId}
- リクエスト: 変更内容（アイテム追加・削除、備考、キャンセル理由）
- レスポンス: 更新後の注文状態、承認ステータス

### GET /consumer/orders/{orderId}/tracking
- レスポンス: 現在の配達ステータス、ETA、ドライバー位置

### GET /consumer/orders/history
- クエリ: `limit`, `offset`
- レスポンス: 過去注文一覧、再注文用ショートカット情報

---

## レストランオペレーション API

### PUT /restaurants/{restaurantId}/settings
- リクエスト: 営業時間（曜日別）、配達可能エリア
- レスポンス: 更新結果、反映タイムスタンプ

### PUT /restaurants/{restaurantId}/menu-items/{itemId?}
- リクエスト: メニュー情報（名称、価格、カテゴリ、説明、画像URL）
- レスポンス: 更新されたメニューID、公開ステータス

### GET /restaurants/{restaurantId}/orders
- クエリ: `status`, `since`
- レスポンス: 未処理注文一覧、変更リクエスト、顧客備考

### POST /restaurants/{restaurantId}/orders/{orderId}/status
- リクエスト: ステータス変更（承認、調理中、準備完了、拒否）、理由
- レスポンス: 注文の最新状態、通知結果

### GET /restaurants/{restaurantId}/analytics
- クエリ: `period`, `metrics`
- レスポンス: 売上サマリ、人気商品、キャンセル率などの指標

---

## 配達員モビリティ API

### GET /couriers/{courierId}/jobs
- クエリ: `location`, `radius`, `transport`, `status`
- レスポンス: 提案案件一覧、報酬、締切時間

### POST /couriers/{courierId}/jobs/{jobId}/accept
- リクエスト: 配達員位置、受諾確認
- レスポンス: 割り当て結果、ピックアップ情報

### GET /couriers/{courierId}/jobs/{jobId}/route
- レスポンス: 推奨ルート、顧客連絡先、ステータス

### POST /couriers/{courierId}/jobs/{jobId}/proof
- リクエスト: 受領証明（写真URL、署名データ、メモ）
- レスポンス: 登録結果、タイムスタンプ

### GET /couriers/{courierId}/earnings
- クエリ: `period`
- レスポンス: 報酬内訳、インセンティブ、支払い予定

---

## プラットフォーム運用 API

### GET /operations/tickets
- クエリ: `status`, `priority`, `assignee`
- レスポンス: チケット一覧、SL A情報

### PATCH /operations/tickets/{ticketId}
- リクエスト: ステータス更新、担当者、メモ
- レスポンス: 更新後のチケット詳細

### GET /operations/risks
- クエリ: `type`, `severity`
- レスポンス: リスクイベント一覧、推奨対処アクション

### POST /operations/risks/{riskId}/actions
- リクエスト: 選択した対処フロー、担当者
- レスポンス: 対応タスクの作成結果

### GET /operations/cities
- クエリ: `period`
- レスポンス: 都市別稼働指標、需要供給バランス、アラート
