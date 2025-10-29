# 配達員モビリティドメインモデル

## コンテキスト概要
- 目的: 配達員が最適な案件を選び、迷わず配達し、確実に証跡を残し、報酬を管理できるよう支援する。
- 主な利用者: 配達員、配達オペレーション担当。
- 境界づけ: 配達員の稼働体験全般に集中し、レストランのオペレーションや消費者側 UI は別コンテキストに委任する。

## アグリゲート
### CourierAccount
- 役割: 配達員のプロフィール、稼働資格、移動手段、勤務可能エリアなどを保持する。
- 構成要素: `EligibilityStatus` 値オブジェクト、`TransportProfile` 値オブジェクト、`PreferredZones` 値オブジェクト集合、`DeviceBinding` エンティティ。
- 不変条件: 稼働資格が失効した状態ではジョブ受諾不可／移動手段と希望エリアは組合せの妥当性検証が必要（例: 自転車では遠距離エリア不可）。
- 関連イベント: `CourierActivated`, `CourierSuspended`, `PreferredZoneUpdated`.

### JobOfferStream
- 役割: 条件に合致した案件候補を配達員ごとに提示し、受諾・辞退・タイムアウトを管理する。
- 構成要素: `JobOpportunity` エンティティ集合、`OfferWindow` 値オブジェクト。
- 不変条件: 同一案件を複数配達員に提示する際は割当優先度を保持／受諾ウィンドウ経過後は自動的に辞退として扱う。
- 関連イベント: `JobOffered`, `JobOfferExpired`, `JobDeclined`.

### DeliveryAssignment
- 役割: 配達員が受諾した案件の遂行ライフサイクル（ピックアップ〜ドロップ）をトラックする。
- 構成要素: `AssignmentStatus` 値オブジェクト、`RoutePlan` エンティティ、`ContactChannel` 値オブジェクト、`Checkpoint` エンティティ集合。
- 不変条件: ステータスは `ACCEPTED` → `PICKED_UP` → `DELIVERING` → `COMPLETED`／分岐ステータスとして `FAILED`, `RETURN_TO_STORE` などを定義／ルートはチェックポイントと整合する。
- 関連イベント: `JobAccepted`, `PickupConfirmed`, `RouteUpdated`, `DeliveryCompleted`, `DeliveryFailed`.

### ProofPackage
- 役割: 配達証明情報（写真、署名、メモ）を一括管理し、コンプライアンスを保証する。
- 構成要素: `ProofArtifact` エンティティ集合、`SubmissionStatus` 値オブジェクト。
- 不変条件: 証明は `DeliveryAssignment` 完了前に必須／署名データは暗号化保存／不適切な写真はフィルタリングルールに従う。
- 関連イベント: `ProofSubmitted`, `ProofRejected`, `ProofApproved`.

### PayoutStatement
- 役割: 日次・週次の報酬と支払いステータスを集約し、配達員が収入を把握できるようにする。
- 構成要素: `StatementPeriod` 値オブジェクト、`EarningLineItem` エンティティ集合、`PayoutStatus` 値オブジェクト。
- 不変条件: 各 `DeliveryAssignment` は一度だけ計上／インセンティブ条件の満たし方を検証／支払ステータス遷移は `PLANNED` → `PROCESSING` → `PAID`。
- 関連イベント: `EarningsCalculated`, `PayoutScheduled`, `PayoutReleased`.

## エンティティ
- `DeviceBinding`: 認証済み端末情報とトークン、最終ログイン時刻を保持。
- `JobOpportunity`: 案件ID、報酬、ピックアップ地点、配達先、締切、優先度を保持。
- `RoutePlan`: ルートレッグの集合、推定走行時間、トラフィック要因を保持。
- `Checkpoint`: 現在位置、タイムスタンプ、ステータスを保持し、ナビゲーション進捗を把握。
- `ProofArtifact`: 画像URL、署名データ、メモ、検証結果を保持。
- `EarningLineItem`: 基本報酬、距離報酬、ボーナス、控除を保持。

## 値オブジェクト
- `EligibilityStatus`: 背景チェック結果、有効期限、制限事項を内包。
- `TransportProfile`: 移動手段種別と最大積載量、速度プロファイルを内包。
- `PreferredZones`: エリアID集合と優先度、稼働時間帯を内包。
- `OfferWindow`: 提示開始・終了時刻、タイムアウトポリシーを内包。
- `AssignmentStatus`: 現在の配達進捗、ステータスコード、更新時刻を内包。
- `ContactChannel`: 顧客連絡先、匿名化電話番号、チャットルームIDを内包。
- `SubmissionStatus`: 証拠提出状態と検証ステータス、フィードバックコードを内包。
- `StatementPeriod`: 集計開始・終了日、サイクル種別（週次・日次）を内包。
- `PayoutStatus`: 支払い状態、支払予定日、決済手段を内包。
- `CompensationBreakdown`: `EarningLineItem` 計算に用いる距離・時間・インセンティブ条件の結果セット。

## ドメインサービス
- `JobMatchingService`: 配達員の `CourierAccount` 条件とリアルタイム需要を突き合わせて `JobOfferStream` に案件を投入する。
- `RouteOptimizationService`: ナビゲーションプロバイダから得た候補を評価し、最適ルートを `RoutePlan` として生成する。
- `ProofValidationService`: 提出された `ProofPackage` を検証ルールに照らし合わせて承認可否を判定する。
- `EarningsCalculationService`: 完了した配達実績をもとに報酬ラインアイテムを算出し `PayoutStatement` を更新する。
- `AvailabilitySyncService`: 配達員のステータス（オンライン／オフライン／ビジー）を管理し、案件配信を制御する。

## ポリシー
- `EligibilityPolicy`: 背景チェック結果の有効期限や違反ペナルティによる稼働制限を定義。
- `AssignmentTimeoutPolicy`: `JobOfferStream` で受諾期限を過ぎた案件を自動解放し、再度配信する条件を定義。
- `ProofCompliancePolicy`: 必須証跡種別や画像品質基準、署名必須条件を定義。
- `PayoutSchedulePolicy`: 地域ごとの支払サイクルや最低支払額を定義。
- `SafetyIncidentPolicy`: 事故・トラブル報告時の稼働停止と再開条件を定義。

## ドメインイベント
- `CourierActivated`, `CourierSuspended`, `PreferredZoneUpdated`
- `JobOffered`, `JobOfferExpired`, `JobDeclined`, `JobAccepted`
- `PickupConfirmed`, `RouteUpdated`, `DeliveryCompleted`, `DeliveryFailed`
- `ProofSubmitted`, `ProofRejected`, `ProofApproved`
- `EarningsCalculated`, `PayoutScheduled`, `PayoutReleased`
- `AvailabilityStatusChanged`（オンライン状態の更新通知）

## リポジトリ
- `CourierAccountRepository`: プロフィール取得・更新、資格状態の永続化。
- `JobOfferStreamRepository`: 案件候補キューの保存、タイムアウト管理。
- `DeliveryAssignmentRepository`: 稼働中および履歴の配達案件取得、ステータス更新。
- `ProofPackageRepository`: 証跡データの保存、検証結果の参照。
- `PayoutStatementRepository`: 報酬サイクルごとの集計保存、支払状態更新。

## 外部境界と連携
- `integration_contract` の Courier API を通じて案件取得、受諾、ルート、証跡提出、報酬照会を実装する。
- ナビゲーション・地図サービスとの連携は `RouteOptimizationService` を介して行い、道路情報をドメインに反映する。
- 配達完了やステータス更新は `consumer_experience` と `restaurant_operations` へイベント通知し、顧客トラッキングと店舗連携を維持する。
- 報酬支払いはプラットフォーム共通の決済サービスと結合し、Payout イベントで `platform_operations` に報告する。
