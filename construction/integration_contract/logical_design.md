# 統合契約ユニット 論理設計

## 1. 目的と範囲
- 各コンテキスト間の API／イベント契約を一元管理し、変更ライフサイクルを統制するバックエンド論理設計を定義する。
- ドメインモデルで示された `ApiSuite`, `EndpointSpecification`, `EventContract`, `IntegrationChangeRequest` を中心に、契約登録・承認・公開を担う。
- 実サービスのビジネスロジックには立ち入らず、契約メタデータと互換性管理、承認フローを扱う。

## 2. アーキテクチャ概要
- ヘキサゴナルアーキテクチャを採用し、契約レジストリ API とイベント契約ストアを中心としたマイクロサービス構成。
- サービス分割:
  - `ContractRegistryService`: API／イベント契約の CRUD とバージョン管理。
  - `SchemaValidationService`: スキーマ検証、自動テスト連携。
  - `CompatibilityService`: 互換性マトリクス生成と検証結果の保持。
  - `ChangeGovernanceService`: 変更申請ワークフローと承認プロセス。
  - `ContractPublicationService`: 公開済み契約の配信と通知。
- 契約データはバージョン履歴を保持するドキュメントストアに保存。イベントは `ContractPublished`, `VersionRetired` などで通知。

## 3. レイヤおよびモジュール構成
- **インターフェース層**
  - `ContractRestController`: API/イベント契約の登録・更新・検索エンドポイント（認証必須）。
  - `ContractWebhookPublisher`: バージョン公開時に関係ユニットへ通知する Webhook/イベント発行アダプタ。
  - `CiPipelineAdapter`: CI/CD からの契約検証リクエストを受け付ける。
- **アプリケーション層**
  - `ApiSuiteAppService`: API 契約の登録、バージョン公開、互換性管理。
  - `EndpointSpecificationAppService`: エンドポイント単位のスキーマ更新、エラーハンドリング。
  - `EventContractAppService`: イベントスキーマ登録、購読ポリシー管理。
  - `ChangeRequestAppService`: 変更申請受理、影響評価、承認フロー管理。
- **ドメイン層**
  - `ApiSuite`: バージョン整合性と互換性マトリクスを維持。
  - `EndpointSpecification`: スキーマとエラーモデルをバージョン管理。
  - `EventContract`: 発火条件、ペイロード、購読ポリシーを保持し、`RetentionPolicy` を適用。
  - `IntegrationChangeRequest`: 承認フローを管理。`ContractApprovalPolicy`, `BreakingChangePolicy` を適用。
  - ドメインサービス: `ContractValidationService`, `ChangeImpactService`, `VersionLifecycleService`。
- **インフラ層**
  - `ContractRepository`: ドキュメントストア（バージョニング対応）で契約を永続化。
  - `SchemaRegistry`: JSON/YAML スキーマ保存、互換性チェック API。
  - `WorkflowEngine`: 承認フローの状態管理（`IntegrationChangeRequestRepository`）。
  - `NotificationAdapter`: Email/Slack/API Gateway への通知送信。

## 4. 主要ユースケースフロー
- **契約検索**
  1. クライアント（ユニット開発チーム）が `ContractRestController` 経由で API 契約を検索。
  2. `ApiSuiteAppService` が `ContractRepository` からバージョン情報を取得しレスポンス。
- **契約登録／更新**
  1. リクエストを `EndpointSpecificationAppService` が受理。
  2. `SchemaValidationService` によるスキーマ検証、命名衝突チェックを実施。
  3. 問題なければドラフトバージョンとして保存し、`EndpointDefined` イベントを発行。
- **イベント契約管理**
  1. `EventContractAppService` がイベントのペイロード・購読ポリシーを登録。
  2. `SubscriberPolicyChanged` を発行し、消費側に SLA 変更を通知。
- **変更申請フロー**
  1. `ChangeRequestAppService` が申請を受理し、`ChangeProposal` を保存。
  2. `ChangeImpactService` が影響ユニット分析を実行し、結果を `ImpactAssessment` として記録。
  3. 関係者承認後 `ChangeApproved` を発行し、`ContractPublicationService` が公開。
- **契約公開**
  1. `VersionLifecycleService` が `ApiVersion` を `PUBLISHED` に昇格。
  2. `ContractPublicationService` が通知を発行し、`CompatibilityMatrixUpdated` を更新。

## 5. イベント連携
- 発行イベント: `ApiSuiteCreated`, `ApiVersionPublished`, `CompatibilityMatrixUpdated`, `EndpointDefined`, `EndpointSchemaUpdated`, `EndpointDeprecated`, `EventContractRegistered`, `EventSchemaUpdated`, `SubscriberPolicyChanged`, `ChangeRequestSubmitted`, `ImpactAssessmentCompleted`, `ChangeApproved`, `ChangeRejected`, `ContractPublished`, `VersionRetired`.
- 購読イベント:
  - 各ユニットからの契約テレメトリ（バージョン利用状況、スキーマ検証結果）。
  - CI パイプラインからの検証結果イベント。
- イベントフロー: `ContractPublicationService` がイベントブローカーに発行し、`consumer_experience` など依存ユニットが自動サブスクライブ。

## 6. データ管理
- 契約データはドキュメント指向ストアでスキーマ構造を保持。バージョンごとに差分を記録。
- 互換性マトリクスはグラフ構造で保存し、依存関係クエリを高速化。
- 変更申請はワークフローエンジンで状態を管理。承認履歴は append-only で保持。
- スキーマファイルはオブジェクトストレージに保存し、ハッシュで完全性を保証。

## 7. 外部統合
- REST API: 認証済み内部ユーザー向け。契約データを JSON/YAML で提供。
- CI/CD 連携: Pull Request マージ前に契約検証をトリガーし、結果を `IntegrationChangeRequest` に反映。
- ドキュメントポータル: `ContractPublicationService` が公開済み契約を API ドキュメントサイトへ配信。
- 監査: 監査プラットフォームに変更履歴を送信し、コンプライアンス確認を容易にする。

## 8. スケーラビリティとレジリエンス
- 契約クエリは高頻度だが書き込みは比較的少ないため、読み取り最適化キャッシュを導入。
- スキーマ検証は非同期ワーカーで並列化し、大規模契約変更にも対応。
- 変更フローはワークフローエンジンで冪等に実行し、失敗時はステップごとにリトライ。
- レプリケーション: 契約ストアをマルチリージョンレプリカで構成し、グローバルチームからの参照に対応。

## 9. オブザーバビリティ
- メトリクス: 契約変更数、破壊的変更検出件数、検証失敗率。
- トレーシング: 変更申請 ID をキーにワークフロー進捗を可視化。
- ログ: 契約変更の詳細を構造化ログに出力し、監査用に保全。
- アラート: 検証失敗の連続発生、互換性マトリクス更新失敗、通知配信失敗を監視。

## 10. セキュリティとコンプライアンス
- アクセス制御: 各ユニットのアーキテクトのみが書き込み権限。読み取りはチーム単位でスコープ設定。
- 完全性保証: 契約ファイルは署名付きハッシュで検証。改ざん検出のための監査ログと併用。
- データ保持: 契約履歴は法的要件に合わせて長期保存。廃止契約も参照できるようアーカイブ。
- 変更承認: 多段階承認（公開側・利用側）を必須化し、`ContractApprovalPolicy` に従う。

## 11. 未解決課題・フォローアップ
- CI/CD との統合レベル（必須／任意）と、検証失敗時の自動ロールバック手順を決定する必要がある。
- 契約通知の多言語対応方針を各ユニットと協議し、`DocumentationPolicy` に反映する。
