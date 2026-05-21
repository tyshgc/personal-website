---
description: Notion(Outputs/外部サイト)を取得・画像ローカル化し、ビルド・差分確認・コミットまで実行する
allowed-tools: Bash, Read, Edit
---

# /publish

Notion を SSoT として、サイトを公開可能な状態に同期させるコマンド。

## 前提

- `.env` に以下が設定済みであること:
  - `NOTION_API_KEY`（Internal Integration Token）
  - `NOTION_OUTPUTS_DATA_SOURCE_ID`
  - `NOTION_EXTERNALS_DATA_SOURCE_ID`
- Notion の「Outputsデータ」DB と「外部サイト」DB の両方に該当 Integration の Connection が追加済みであること
- 作業ツリーがクリーン（未コミットの変更が無い）であること

## 手順

順番に実行し、各ステップ後に結果を簡潔に共有する。エラーが出たらそこで止めて報告する。

### 1. 環境チェック

- `git status` で作業ツリーがクリーンか確認。未コミットの変更があれば中断して確認する
- `.env` が存在し `NOTION_API_KEY` が空でないことを確認

### 2. Notion から取得（画像ローカル化込み）

```sh
pnpm fetch:notion
```

- Outputs（status=Published）と外部サイトを取得し、`src/content/outputs/{slug}.json` と `src/content/externals.json` に書き出す
- Notion の署名付き画像URLは `public/images/` にダウンロードされ、URLがローカルパスに書き換わる（署名付きURL=AWS一時鍵をコミットしないため。Step 7で対応済み）
- 取得件数・書き出しファイルを共有する

### 3. 差分の確認

```sh
git status --short src/content/ public/images/
```

- 増減した記事・外部サイト・画像の要約を提示する

### 4. ビルド検証（OG画像生成込み）

```sh
pnpm typecheck
pnpm build
```

- `build` は `generate:og`（記事ごとのOG画像生成）→ `vp build` → `build-ssg`（hono/ssgで静的HTML出力）の3段
- 失敗したら止まる。成功したら生成HTML数を共有

### 5. コミット & プッシュ前確認

- 変更内容（`src/content/`・`public/images/`）をレビューしてもらう
- 承認を得てから commit:

```sh
git add src/content public/images && git commit -m "publish: <要約>"
```

- `public/og/` と `dist/` は gitignore（ビルド時に再生成されるためコミットしない）
- push は明示確認を取ってから（自動化しない）

### 6. デプロイ確認

- Cloudflare Pages 連携（Step 9）が完了後、ここにデプロイ状況確認を追記する
- 現状は push 後に Cloudflare 側のビルドが走る想定（Step 9 で確定）

## 対象外

- リソース空き状況（`src/content/availability.json`）は手編集で更新する（このコマンドの対象外）
- X / Instagram のタイムライン混在は今フェーズ見送り
