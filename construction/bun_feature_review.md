# Bun 1.3 機能確認メモ

- 利用予定の API は ECMAScript 標準クラス（`Map`, `Set`, `Promise`）および Bun が Node.js 互換で提供する `process`, `console` のみ。
- Bun 1.3 の TypeScript 実行は `bun run` で直接サポートされていることを確認済み（バージョン情報は `bun --version` コマンドで参照可能）。
- 外部ライブラリは利用しないため、互換性リスクは Bun ランタイムの標準 TS トランスパイル機能に限定される。
- イベントバスは独自実装とし、Bun 固有 API へ依存しない。
