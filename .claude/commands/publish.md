---
description: Notionの「Outputsデータ」DBから status=Published の記事を取得して、ビルド・確認・コミットまで実行する
allowed-tools: Bash, Read, Edit
---

# /publish

Notion を SSoT として、サイトに公開可能な状態に同期させるコマンド。

## 前提

- `.env` に `NOTION_API_KEY`（Internal Integration Token）と `NOTION_OUTPUTS_DATA_SOURCE_ID` が設定済みであること
- Notion の「Outputsデータ」DB に該当 Internal Integration の Connection が追加済みであること
- ブランチがクリーン（未コミットの変更が無い）であること

## 手順

以下を順番に実行してください。各ステップ後に結果を Tsuyoshi に簡潔に共有し、エラーがあればそこで止まること。

### 1. 環境チェック

- `git status` で作業ツリーがクリーンか確認。未コミットの変更があればステップを中断して Tsuyoshi に確認する
- `.env` が存在し、`NOTION_API_KEY` が空でないことを確認

### 2. Notion から記事を取得

```sh
pnpm fetch:notion
```

- スクリプトの出力（取得件数、書き出されたファイル）を共有する
- エラーが出た場合は内容を共有して止まる

### 3. 差分の確認

- `git status --short src/content/outputs/` で書き出された差分一覧を表示
- 主要な差分の要約を Tsuyoshi に提示

### 4. ビルド検証

```sh
pnpm typecheck
pnpm build
```

- 失敗したら止まる
- 成功したら生成された HTML ファイル数を共有

### 5. コミット & プッシュ前確認

- 生成された変更を Tsuyoshi にレビューしてもらう
- 承認を得てから `git add src/content/outputs/ && git commit -m "publish: <要約>"` を実行
- push する前に Tsuyoshi に確認する（push までは自動化しない）

## 制約

- 画像のローカルダウンロード（Notion S3 URLの差し替え）は v1.0 では未実装。Step 7/8 で追加予定
- 外部フィードの取得（Zenn / SpeakerDeck / YouTube / GitHub）は別コマンド `/fetch-feeds` で実装予定（Step 6）
- リソース空き状況 (`src/content/availability.json`) はこのコマンドの対象外。手編集で更新する
