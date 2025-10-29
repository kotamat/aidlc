# ドメインモデル設計計画

- [x] `/inception/units/*.md` の各文書から主要な目標・アクター・ワークフローを整理し、共通のドメイン理解を固める。
- [x] モデリング境界、ユニット間の接続点、必要な詳細レベルを明確化してから戦術的コンポーネントの設計方針を定める。  
  [Question] 各ユニットは独立した境界づけられたコンテキストとして扱うべきでしょうか？それとも複数ユニットに跨って共有すべき既知のアグリゲートやエンティティがありますか？  
  [Answer] 各ユニットは独立した境界づけられたコンテキストとして扱うべきです。現在のところ、複数ユニットに跨って共有すべき既知のアグリゲートやエンティティはありません。
- [x] `consumer_experience` ユニットをモデリングし、アグリゲート・エンティティ・値オブジェクト・ドメインサービス・ポリシー・ドメインイベント・リポジトリ契約を特定して `construction/consumer_experience/domain_model.md` に記録する。
- [x] `courier_mobility` ユニットのドメインモデルを設計し、すべての戦術的コンポーネントを `construction/courier_mobility/domain_model.md` に記録する。
- [x] `restaurant_operations` ユニットのドメインモデルを設計し、すべての戦術的コンポーネントを `construction/restaurant_operations/domain_model.md` に記録する。
- [x] `platform_operations` ユニットのドメインモデルを設計し、すべての戦術的コンポーネントを `construction/platform_operations/domain_model.md` に記録する。
- [x] `integration_contract` ユニットのドメインモデルを設計し、すべての戦術的コンポーネントを `construction/integration_contract/domain_model.md` に記録する。
- [x] ユニット横断の整合性確認を行い、ユビキタス言語・共有ポリシー・イベント連携の整合を取ってから最終成果物とする。
