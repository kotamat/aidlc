# プラットフォーム運用ユニット 論理設計

## 1. 目的と範囲
- 問い合わせ対応、リスク管理、都市運用モニタリングを統合し、プラットフォーム全体の安定稼働を支えるバックエンド論理設計を定義する。
- ドメインモデルで示された `SupportTicket`, `RiskCase`, `CityOperationsBoard`, `OpsWorkflow` を基盤とし、`integration_contract` の Operations API を実装する。
- 消費者／レストラン／配達ユニットの詳細ロジックには踏み込まず、運用統制プロセスと情報ハブに焦点を当てる。

## 2. アーキテクチャ概要
- 事件（チケット／リスク）と計測（都市指標）を共通ワークフロー基盤に統合するイベント駆動アーキテクチャ。
- サービス分割:
  - `SupportCaseService`: 問い合わせチケット管理。
  - `RiskManagementService`: 不正・異常検知と対処フロー。
  - `CityMonitoringService`: 都市別指標集計とアラート発火。
  - `WorkflowEngineService`: 横断ワークフローのテンプレート管理・実行。
  - `OpsNotificationService`: 通知とレポート配信。
- 外部からのイベント（注文異常、配達遅延等）を収集し、意思決定結果を再度イベントとして配信する。

## 3. レイヤおよびモジュール構成
- **インターフェース層**
  - `OperationsRestController`: Integration contract の API を公開。リクエスト認可と監査ログ出力。
  - `OpsDashboardGateway`: 運用チーム向けリアルタイム UI の GraphQL/Subscriptions。
  - `InboundEventHub`: 消費者・レストラン・配達ユニットからのイベントを統合するストリームインジェスター。
- **アプリケーション層**
  - `TicketRoutingAppService`: カテゴリ、SLA、負荷を基に担当者を割り当てる。
  - `RiskAssessmentAppService`: `RiskScoringService` を呼び出しリスクレベル判定。
  - `AlertManagementAppService`: 都市指標更新時に `AlertEvaluationService` を適用しアラート生成。
  - `WorkflowOrchestrationAppService`: テンプレートに基づき `OpsWorkflow` を起動し、ステップ完了を監視。
  - `ReportingAppService`: SLA、リスク処理統計、都市パフォーマンスを集計してレポート API／通知を提供。
- **ドメイン層**
  - `SupportTicket`: 状態遷移を管理し、`TicketSlaPolicy` で SLA 違反を検出。
  - `RiskCase`: `RiskEscalationPolicy` を適用しエスカレーション先を決定。
  - `CityOperationsBoard`: `AlertRule` に基づき閾値判定。
  - `OpsWorkflow`: `WorkflowCompliancePolicy` に従いステップ順序と承認を制御。
- **インフラ層**
  - `SupportTicketRepository`: RDBMS＋検索エンジン（全文検索）でチケットを保存。
  - `RiskCaseRepository`: イベントソーシングストアと監査ログストア。
  - `CityOperationsBoardRepository`: タイムシリーズデータベース（TSDB）で指標を保持。
  - `OpsWorkflowRepository`: ワークフローテンプレートのバージョン管理、インスタンス進行状態を保存。
  - `NotificationAdapter`: Email/Slack/PagerDuty などへのアウトバウンド。

## 4. 主要ユースケースフロー
- **チケット一覧取得 (`GET /operations/tickets`)**
  1. `OperationsRestController` がクエリを受理。
  2. `TicketRoutingAppService` が `SupportTicket` リードモデル（検索インデックス）を参照し、フィルタ結果を返却。
  3. SLA メトリクスを付随情報としてレスポンス。
- **チケット更新 (`PATCH /operations/tickets/{ticketId}`)**
  1. リクエストを `TicketRoutingAppService` が処理。
  2. `SupportTicket` アグリゲートを更新し、必要に応じて `TicketAssigned`, `TicketStatusUpdated` を発行。
  3. `OpsWorkflow` がリンクされている場合、該当ステップを進行。
- **リスク監視 (`GET /operations/risks`)**
  1. `RiskAssessmentAppService` が最新の `RiskCase` 投影とシグナルを照合。
  2. レスポンスに評価結果と推奨アクションを含める。
- **リスク対処アクション (`POST /operations/risks/{riskId}/actions`)**
  1. `RiskCase` のミティゲーションプランを更新し、`MitigationStarted` を発行。
  2. 終了時に `MitigationCompleted` を発行し、影響範囲へ通知。
- **都市指標取得 (`GET /operations/cities`)**
  1. `CityOperationsBoard` 投影と TSDB を参照し、需要・供給バランス、アラート状態を返却。

## 5. イベント連携
- 発行イベント: `TicketCreated`, `TicketAssigned`, `TicketStatusUpdated`, `TicketResolved`, `TicketEscalated`, `SlaBreached`, `RiskDetected`, `RiskAssessed`, `MitigationStarted`, `MitigationCompleted`, `CaseClosed`, `IndicatorUpdated`, `AlertTriggered`, `ResponsePlanExecuted`, `WorkflowInitiated`, `TaskStepCompleted`, `WorkflowCompleted`, `OpsReportGenerated`.
- 購読イベント:
  - `consumer_experience`: `OrderCancellationRequested`, `OrderStatusUpdated`, `ConsumerNotified`（サポート発端）。
  - `restaurant_operations`: `OrderRejected`, `KitchenOverloaded`.
  - `courier_mobility`: `DeliveryFailed`, `SafetyIncidentPolicy` 関連イベント。
  - `integration_contract`: 契約変更通知（運用へのアラート）。
- イベント処理: `InboundEventHub` がイベントを正規化し、各アプリケーションサービスへルーティング。重要イベントはワークフローをトリガー。

## 6. データ管理
- `SupportTicket`: ステータス、担当者、タイムラインを正規化テーブルで管理。コメントは監査追跡が必要。
- `RiskCase`: シグナル情報をドキュメントストアに保存し、監査証跡を Append-only ログに記録。
- `CityOperationsBoard`: 5 分粒度の指標を TSDB に蓄積。日次でデータレイクへアーカイブ。
- `OpsWorkflow`: テンプレートは GitOps 連携（バージョン管理）。進行中ステップはトランザクションログで保護。
- データ保持: `DataRetentionPolicy` に基づき、チケットは 2 年、リスクケースは 5 年、都市指標は 3 年保持（例示）。

## 7. 外部統合
- REST API: Integration contract に準拠。OAuth2 スコープでチーム別アクセス制御。
- 通知: PagerDuty/Slack メッセージを `OpsNotificationService` が送信。SLA 逸脱時には自動エスカレーション。
- レポート配信: BI ツールや経営ダッシュボードにデータを提供。`OpsReportingService` が ETL を管理。
- 監査: 監査ログを中央監査プラットフォームへストリーミング。

## 8. スケーラビリティとレジリエンス
- チケット検索は全文検索クラスタ（Elasticsearch 等）で水平スケール。
- 指標処理はストリーム＋バッチのハイブリッド。ピーク時はストリーム処理に優先リソースを割り当てる。
- ワークフローエンジンは分散ロックを使用し、冪等なタスク実行を確保。
- リスク検知は外部モデリングサービス（機械学習）を呼び出す場合があり、タイムアウト・サーキットブレーカで保護。

## 9. オブザーバビリティ
- メトリクス: SLA 遵守率、リスク処理時間、都市アラート解決時間。
- トレーシング: チケット ID / リスク ID をキーにイベントチェーンを追跡。
- ログ: すべての変更は監査用に不可変ログへ書き込み。個人情報はマスキング。
- アラート: イベント処理レイテンシ、ワークフローバックログ、指標更新停止を監視。

## 10. セキュリティとコンプライアンス
- ロールベースアクセス（サポート、リスク、マネージャ等）。特権操作は多要素認証を要求。
- 法規制（GDPR、SOC2 等）に準拠するため、監査証跡とアクセスログを長期保管。
- リスクデータはマスキングと暗号化を実施。外部共有時は匿名化。

## 11. 未解決課題・フォローアップ
- リスクスコアリングの ML モデル更新フローを `integration_contract` で標準化する必要がある。
- 都市指標データのソースシステム SLA を関係ユニットと調整し、遅延が発生した際のフォールバック戦略を定義する。
