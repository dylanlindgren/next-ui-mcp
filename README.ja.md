# Next UI MCP

[English](README.md) | [日本語](README.ja.md)

Next UI MCP は、ServiceNow の Now/Next Experience UI Framework を使ったプロジェクトの開発や検証を支援する MCP サーバーです。

フレームワークのガイダンスやコンポーネントのひな形を提供し、ServiceNow インスタンス上のコンポーネントを検索・確認できます。

> このプロジェクトは、ServiceNow とは無関係にコミュニティによって保守されています。ServiceNow との提携、推奨、サポートを受けているものではありません。

## クイックスタート

Node.js 18.20 以降と、MCP に対応したコーディングアシスタントが必要です。

アシスタントの MCP 設定にこのサーバーを追加します。たとえば、Claude Code では `.mcp.json`、Cursor では `.cursor/mcp.json` を使います。

macOS では、先に `snc configure profile` で Basic 認証のプロファイルを設定してください。サーバーは自動的に `default` プロファイルを使用します。

```json
{
  "mcpServers": {
    "next-ui": {
      "command": "npx",
      "args": ["-y", "next-ui-mcp@latest"]
    }
  }
}
```

サーバーはプロファイルのホスト名とユーザー名を `~/.snc/config.json` から、パスワードを macOS のキーチェーンから読み込みます。プロジェクト設定に認証情報を記載する必要はありません。`default` 以外のプロファイルを使う場合は、サーバーの `env` 設定に `NEXT_UI_SNC_PROFILE` を指定してください。

MCP 設定を変更したら、コーディングアシスタントを再起動するか、設定を再読み込みしてください。ツールがプロジェクトで使えるようになります。

## エージェントでできること

### フレームワークを学び、コンポーネントを作成する

- `get_framework_guidance` — フレームワーク、プロジェクト構成、Storybook、マニフェスト、コンポーネント開発に関するガイダンスを取得します。
- `get_component_scaffold` — コンポーネントのひな形ファイルを生成します。
- `explain_now_ui_manifest` — `now-ui.json` とコンポーネントの関係を確認します。

Storybook のガイダンスとひな形は、ローカルでのコンポーネント開発とプレビューに [next-ui-storybook](https://github.com/dylanlindgren/next-ui-storybook) を使用します。

### プラットフォームコンポーネントを検索・確認する

- `recommend_instance_components` — 用途に合う可能性のあるプラットフォームコンポーネントを探します。
- `search_instance_components` — インスタンスで利用可能なコンポーネントを検索します。
- `search_instance_icons` — インスタンスで利用可能なアイコンを検索します。
- `evaluate_platform_component_fit` — プラットフォームコンポーネントをそのまま使うか、組み合わせるか、独自に作るかを検討します。
- `get_component_api` — インスタンスからコンポーネントのプロパティ、イベント、スロットを確認します。
- `resolve_component_package` — プラットフォームコンポーネントが属する npm パッケージを確認します。

### プロジェクトを確認する

- `validate_now_ui_manifest` — `now-ui.json` マニフェストを検証します。
- `analyze_project_dependencies` — `package.json` におけるプラットフォームパッケージの宣言を確認します。

## ServiceNow インスタンスへの接続

インスタンス認証情報を設定すると、コンポーネントやアイコンの情報を検索するツールを利用できます。次の 3 つの方法から 1 つを選んでください。

### 1. `snc` プロファイルを使う（macOS）

`snc configure profile` で Basic 認証のプロファイルを設定します。`NEXT_UI_INSTANCE_URL` は設定しないでください。サーバーは `default` プロファイルを使用します。別のプロファイルを使う場合は、`NEXT_UI_SNC_PROFILE` にプロファイル名を指定してください。ホスト名とユーザー名は `~/.snc/config.json` から、パスワードは macOS のキーチェーンから読み込まれます。

### 2. ユーザー名とパスワードを使う

MCP サーバーの `env` 設定に、次の変数を指定してください。

- `NEXT_UI_INSTANCE_URL`
- `NEXT_UI_INSTANCE_USER`
- `NEXT_UI_INSTANCE_PASSWORD`

### 3. Bearer トークンを使う

MCP サーバーの `env` 設定に `NEXT_UI_INSTANCE_URL` と `NEXT_UI_INSTANCE_TOKEN` を指定してください。トークンは Bearer トークンとして送信されます。トークンとユーザー名・パスワードの両方を設定した場合は、トークンが優先されます。

インスタンスへのリクエストは、既定で 20 秒後にタイムアウトします。変更するには、サーバーの `env` 設定で `NEXT_UI_INSTANCE_TIMEOUT_MS` を指定してください。

## プロジェクトのワークフローに沿ってエージェントを使う

MCP 設定はサーバーに接続します。プロジェクトの指示ファイルを使うと、エージェントが適切な場面でツールを使いやすくなります。プロジェクトのルートに `AGENTS.md` を追加するか、既存の指示ファイルに内容を統合してください。例:

```markdown
# ServiceNow UI 開発

## HDS ポリシー

- 独自実装より HDS コンポーネントを優先する。
- HDS コンポーネントが一部の要件に合わない場合は、組み合わせるか薄いラッパーを使う。
- 独自 UI を作るのは、具体的な機能上またはデザイン上の不足がある場合に限る。

## 必須ワークフロー

新しい UI の実装や既存 UI の大幅な変更を行う場合:

- 実装前に next-ui-mcp の get_framework_guidance を topic
  "agent-workflow-contract" で呼び出し、そのガイダンスに従う。
- recommend_instance_components または search_instance_components で HDS の候補を探す。
- 有力な候補を evaluate_platform_component_fit で評価する。
- 選定したコンポーネントを使う前に get_component_api で確認する。
- インポート方法とインスタンス依存のパッケージについて、MCP のガイダンスに従う。
- 独自コンポーネントを作る場合は、その理由を簡潔に説明する。
- MCP ツールが使えない、または失敗した場合は、その制約を報告する。
  検索に失敗したことを、適切な HDS コンポーネントが存在しない根拠にしない。
```

各コーディングアシスタントで、MCP サーバーを個別に設定してください。指示ファイルだけではサーバーに接続されません。また、指示はエージェントの動作を促しますが、必ず従うことを保証するものではありません。

## デモ

[![デモを見る](https://img.youtube.com/vi/D9xCnDnverw/maxresdefault.jpg)](https://www.youtube.com/watch?v=D9xCnDnverw)

## コントリビュート

フレームワークのガイダンスや、インスタンスを使ったコンポーネント検索の改善を歓迎します。

### 開発環境のセットアップ

以下はソースコードに変更を加えるコントリビューター向けの手順です。MCP サーバーをインストールまたは利用するだけであれば必要ありません。

```bash
pnpm install
pnpm run build
pnpm test
```

開発中にソースからサーバーを実行するには:

```bash
pnpm run dev
```

## ライセンス

[MIT](./LICENSE)
