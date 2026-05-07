---
description: "Run chore planning → issue → branch → implement → critic → task-pr as an automated loop (e.g. /production:chore-loop)"
---

# /production:chore-loop

## Purpose

Automate the chore task cycle from Issue creation through PR creation.
This command is the counterpart to `implement-loop` — while `implement-loop` operates from a task-plan,
`chore-loop` operates from a chore plan defined through conversation.

Chore tasks are structural improvements, refactoring, convention alignment, or technical debt resolution
that arise during review cycles (fix-review, coderabbit, human review).

---

## Inputs

The following inputs are gathered from the preceding conversation:

- **Title** (required): Chore の1行サマリ
- **Scope** (required): 変更対象のファイルパスまたはモジュール
- **Reason** (required): なぜこの chore が必要か（レビュー指摘の参照など）
- **Description** (required): 具体的に何をどう変えるか
- **Story branch** (required): ベースとなる Story branch 名
- **Acceptance Criteria** (optional): Gherkin 形式の受け入れ条件

If any required input is missing or ambiguous → ask the user to clarify before proceeding.
Do NOT infer scope or description from conversation context without explicit confirmation.

### Input Confirmation

Before starting execution, present the chore plan summary and wait for confirmation:

```template
## Chore Plan

- **Title**: {title}
- **Scope**: {scope}
- **Reason**: {reason}
- **Description**: {description}
- **Story Branch**: {story-branch}
- **Acceptance Criteria**: {criteria or "なし"}

この内容で実行しますか？ (Y/n)
```

---

## Notification

Same notification mechanism as `implement-loop`.
All stop points and the final completion point MUST send an OS notification.

```shell
node scripts/notify.mjs --title "chore-loop" \
  --subtitle "{icon} chore: {status}" \
  --message "{summary_ja}"
```

### Notification Icons

| Status | Icon | Subtitle Example |
| --- | --- | --- |
| PR作成完了 | ✅ | `✅ chore: PR作成完了` |
| ブロッカー検出 | 🛑 | `🛑 chore: ブロッカー検出` |
| must-fix検出 | ⚠️ | `⚠️ chore: must-fix検出` |
| 要リワーク | 🔴 | `🔴 chore: 要リワーク` |

### Message Content (Japanese)

#### Success

```template
PR #{pr-number} レビュー待ちです
Issue: #{issue-number}
変更対象: {scope}
```

#### Stop

```template
{stop-reason}
{details}
対象: {scope}
```

---

## Flow

```text
chore-loop
  │
  ├─ 1. Issue 作成 (enhancement / documentation / bug ラベル)
  │
  ├─ 2. branch-task (chore ブランチ作成)
  │    └─ branch: chore/{issue-number}-{short-slug}
  │
  ├─ 3. implement (chore 実装)
  │    └─ [ブロッカー] → 🛑 通知 → 停止
  │
  ├─ 4. critic (chore 検証)
  │    ├─ PASS → 6. task-pr へ
  │    ├─ REWORK REQUIRED → 🔴 通知 → 停止
  │    └─ PASS WITH NOTES → 5. triage へ
  │
  ├─ 5. should-fix triage (implement-loop と同一ロジック)
  │    ├─ [must-fix あり] → ⚠️ 通知 → 停止
  │    ├─ 低複雑度 × スコープ内 → inline fix → re-critic (1回限り)
  │    └─ その他 → Issue化 → 6. task-pr へ
  │
  ├─ 6. task-pr
  │    └─ PR description に各 Issue リンク + triage 結果を含める
  │
  └─ ✅ 通知 → 停止 (レビュー待ち)
```

---

## Steps

### 1. Create Issue

Create a GitHub Issue for the chore task. Label selection follows
`.claude/conventions/agile/issue-classification.md` — **do NOT create a dedicated
`chore` label**. Reuse `enhancement` (default) / `documentation` / `bug` per the
nature of the chore:

| Chore nature | Label |
| --- | --- |
| Feature extension, implementation improvement | `enhancement` (default) |
| Process, convention, or template improvement | `documentation` |
| Defect in existing behavior | `bug` |

```shell
npx dotenvx run -- node scripts/gh-bot-command.mjs issue create \
  --title "chore({scope}): {title}" \
  --label "enhancement" \
  --body "..."
```

#### Issue Body Template

````template
## Chore

- **Scope**: {scope}
- **Reason**: {reason}
- **Story Branch**: {story-branch}

## Description

{description}

## Acceptance Criteria

```gherkin
{criteria or "N/A"}
```
````

### 2. Branch Task

Create a chore branch from the Story branch:

```shell
git checkout {story-branch}
git pull origin {story-branch}
git checkout -b chore/{issue-number}-{short-slug}
git push -u origin chore/{issue-number}-{short-slug}
```

The `short-slug` is derived from the title (max 40 chars, kebab-case, ASCII only).

### 3. Implement

Execute implementation based on the chore Description and Scope.

- Follow the same conventions as `production:implement`.
- Scope is strictly limited to what the chore plan describes.
- Auto-commit and push on success.
- If a blocker is found → **notify and stop**.

#### Commit Message Format

```template
chore({scope}): {short-description}

Closes #{issue-number}

Co-Authored-By: ...
```

### 4. Critic

Execute `production:critic` equivalent review on the chore implementation.

The critic MUST evaluate:

- Does the change stay within the declared Scope?
- Does it follow project conventions?
- Does it introduce unintended side effects?

Judgment handling is identical to `implement-loop`:

| Judgment | Action |
| --- | --- |
| PASS | Skip to Step 6 (task-pr) |
| REWORK REQUIRED | **Notify and stop** |
| PASS WITH NOTES | Proceed to Step 5 (triage) |

### 5. Should-Fix Triage

Identical triage logic to `implement-loop` Step 4:

- must-fix → **notify and stop**
- should-fix: AI triage per complexity × scope relevance
  - 低複雑度 × スコープ内 → inline fix → re-critic (1回限り)
  - Other → Issue化
- Re-critic capped at 1 cycle

### 6. Task PR

Create a Pull Request:

```shell
npx dotenvx run -- node scripts/gh-bot-command.mjs pr create \
  --base {story-branch} \
  --title "chore({scope}): {title}" \
  --label "enhancement" \
  --reviewer "tyshgc" \
  --body "..."
```

PR label matches the Issue label picked in Step 1 (`enhancement` / `documentation` / `bug`).

#### PR Body Template

````template
## Chore

Closes #{issue-number}

- **Scope**: {scope}
- **Reason**: {reason}

## Changes

{bullet list of what was changed}

## Acceptance Criteria

```gherkin
{criteria or "N/A"}
```

## Related Critic Issues

| Issue | Title | Severity | Triage |
| --- | --- | --- | --- |
| #{number} | {title} | should-fix | {reason} |

Inline fixes applied: {count}

## Verification

- [ ] Change stays within declared scope
- [ ] No unintended side effects
- [ ] Conventions maintained
````

After PR creation → **notify (success) and stop**.

---

## Rules

- One chore per invocation. Do not combine multiple chores.
- Chore plan MUST be confirmed by the user before execution starts.
- All `implement-loop` rules for triage, re-critic, and notification apply equally.
- Do not expand scope beyond what the chore plan describes.
- Branch naming uses `chore/` prefix, not `feature/`.
- Re-critic loop is capped at 1 cycle.
- Must-fix findings always stop the loop.
- Notification is mandatory at every stop point and at completion.

---

## Differences from implement-loop

| Aspect | implement-loop | chore-loop |
| --- | --- | --- |
| Input source | task-plan.md の Work Item | 対話で確定した chore plan |
| Branch prefix | `feature/{task-id}-` | `chore/{issue-number}-` |
| Issue creation | 事前に add-backlog 済み | ループ内で自動作成 |
| Dependency check | task-plan の依存グラフ参照 | なし (chore は単発) |
| Commit prefix | `implement:` | `chore:` |
| Notification title | `implement-loop` | `chore-loop` |

---

## Error Handling

| Situation | Action |
| --- | --- |
| Required input missing | Ask user to clarify, do not proceed |
| Story branch not found | Notify (🛑) and stop |
| Issue creation fails | Notify (🛑) and stop |
| Implement blocker | Notify (🛑) and stop |
| must-fix detected | Notify (⚠️) and stop |
| REWORK REQUIRED | Notify (🔴) and stop |
| Re-critic must-fix | Notify (⚠️) and stop |
| Inline fix fails (test break) | Revert fix, Issue化 instead, continue |
| Notification command fails | Log warning, continue (do not block flow) |
| Git push fails | Notify (🛑) and stop |
| PR creation fails | Notify (🛑) and stop |

---

## Bot Authentication

All `gh` commands MUST use the bot token wrapper:

```shell
npx dotenvx run -- node scripts/gh-bot-command.mjs <gh-args...>
```

---

## Command Output Template

### On Successful Completion

```template
## chore-loop 完了

- **Title**: {title}
- **Issue**: #{issue-number}
- **Branch**: chore/{issue-number}-{short-slug}
- **PR**: #{pr-number}
- **Critic Judgment**: {PASS | PASS WITH NOTES}

### Triage Result
- Inline fix: {n}件適用
- Issue登録: {n}件 ({issue-numbers})
- Re-critic: {実施 / スキップ}

### Next Action

PR #{pr-number} のレビューをお願いします。
```

### On Stop

```template
## chore-loop 停止

- **Title**: {title}
- **停止理由**: {reason}
- **停止ステップ**: {step name}

### 詳細
{structured details of the stop reason}

### Next Action
{single actionable instruction}
```
