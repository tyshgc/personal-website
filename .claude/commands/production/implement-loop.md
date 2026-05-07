---
description: "Run branch-task → implement → critic → triage → task-pr as an automated loop (e.g. /production:implement-loop B-1)"
---

# /production:implement-loop

## Purpose

Automate the single-Task implementation cycle from branch creation through PR creation.
This command chains existing commands with structured decision gates and AI-driven triage,
stopping only when human judgment is required.

---

## Inputs

- **Task ID** (required): e.g. `B-1`, `F-3`, `S-1`
- The following artifacts must be accessible:
  - `.claude/tmp/production/{epic-slug}/task-plan.md`
  - `.claude/tmp/production/{epic-slug}/prepare.md` (optional)
  - Active Story branch

If artifacts are missing → notify and stop.

---

## Notification

All stop points and the final completion point MUST send an OS notification
so the human is informed without needing to watch the terminal.

Notifications are dispatched through the project-local helper:

```shell
node scripts/notify.mjs \
  --title "implement-loop" \
  --subtitle "{icon} {task-id}: {status}" \
  --message "{summary_ja}"
```

The helper handles platform detection (`darwin` → `terminal-notifier`,
`linux` → `notify-send`) internally. dotenvx is NOT required.

### Notification Icons

| Status | Icon | Subtitle Example |
| --- | --- | --- |
| PR作成完了 | ✅ | `✅ B-1: PR作成完了` |
| 依存未解決で停止 | 🚫 | `🚫 B-1: 依存未解決` |
| ブロッカー検出で停止 | 🛑 | `🛑 B-1: ブロッカー検出` |
| must-fix検出で停止 | ⚠️ | `⚠️ B-1: must-fix検出` |
| 要リワーク | 🔴 | `🔴 B-1: 要リワーク` |
| inline fix適用完了 | 🔧 | `🔧 B-1: inline fix適用` |
| re-critic指摘で停止 | ⚠️ | `⚠️ B-1: re-critic指摘あり` |

### Message Content (Japanese)

Notification messages MUST be in Japanese and include a concise summary.
Multi-line messages can be passed by embedding `\n` in the `--message` value;
the helper will normalize them to real newlines.

#### Success (PR created)

```template
PR #{pr-number} レビュー待ちです
inline fix: {n}件適用済み
Issue登録: {n}件 ({issue-numbers})
```

#### Stop (dependency)

```template
依存タスクが未マージです
未解決: {dependency-task-ids}
Story branch: {branch-name}
```

#### Stop (blocker)

```template
実装中にブロッカーを検出しました
{blocker-summary}
対象: {file-paths}
```

#### Stop (must-fix)

```template
critic で must-fix が {n}件見つかりました
{finding-titles}
```

#### Stop (REWORK REQUIRED)

```template
critic 判定: REWORK REQUIRED
指摘 {n}件の対応が必要です
{top-finding-summaries}
```

---

## Flow

```
implement-loop {task-id}
  │
  ├─ 1. branch-task
  │    └─ [依存未解決] → 🚫 通知 → 停止
  │
  ├─ 2. implement {task-id}
  │    └─ [ブロッカー] → 🛑 通知 → 停止
  │
  ├─ 3. critic {task-id}
  │    ├─ PASS → 5. task-pr へ
  │    ├─ REWORK REQUIRED → 🔴 通知 → 停止
  │    └─ PASS WITH NOTES → 4. triage へ
  │
  ├─ 4. should-fix triage (AI判定)
  │    ├─ [must-fix あり] → ⚠️ 通知 → 停止
  │    ├─ 各 should-fix を判定:
  │    │    ├─ 低複雑度 × スコープ内 → inline fix
  │    │    └─ その他 → critic-issues (Issue登録)
  │    ├─ [inline fix あり] → re-critic (1回限り)
  │    │    ├─ PASS / PASS WITH NOTES (should-fix only, no must-fix) → 5. task-pr へ
  │    │    └─ must-fix or REWORK → ⚠️ 通知 → 停止
  │    └─ [inline fix なし] → 5. task-pr へ
  │
  ├─ 5. task-pr
  │    └─ PR description に Issue リンクを含める
  │
  └─ ✅ 通知 → 停止 (レビュー待ち)
```

---

## Steps

### 1. Branch Task

Execute `agile:branch-task` for the specified Task ID.

- Verify dependency merge state on the Story branch.
- If dependencies are not met → **notify and stop**.
- If successful → proceed to Step 2.

### 2. Implement

Execute `production:implement {task-id}`.

- Implementation follows task-plan scope and conventions.
- Auto commit and push on success.
- If a blocker is found → **notify and stop**.
- If successful → proceed to Step 3.

### 3. Critic

Execute `production:critic {task-id}`.

Evaluate the judgment:

| Judgment | Action |
| --- | --- |
| PASS | Skip to Step 5 (task-pr) |
| REWORK REQUIRED | **Notify and stop** |
| PASS WITH NOTES | Proceed to Step 4 (triage) |

### 4. Should-Fix Triage

This step is the core addition of `implement-loop`.
Claude Code evaluates each `[FIX]` finding from the critic output.

#### 4a. Must-Fix Gate

If ANY finding has `severity: must-fix` → **notify and stop**.
Do not attempt inline fix for must-fix findings.

#### 4b. AI Triage per Finding

For each `should-fix` finding, evaluate two axes:

**Complexity** (低 / 高):

- 低: Single file, localized change (≤ ~20 lines), no structural impact
  - Examples: naming correction, missing export, import reorder, type annotation fix
- 高: Multiple files, structural change, interface modification, new abstraction required

**Scope Relevance** (スコープ内 / スコープ外):

- スコープ内: Affected file/module is within the current Task's implementation boundary
- スコープ外: Affects shared modules, adjacent tasks, or cross-cutting concerns

#### Triage Matrix

| | スコープ内 | スコープ外 |
| --- | --- | --- |
| **低複雑度** | → inline fix | → Issue化 |
| **高複雑度** | → Issue化 | → Issue化 |

Only **低複雑度 × スコープ内** findings are fixed inline.
All other combinations are registered as GitHub Issues via `agile:critic-issues`.

#### 4c. Inline Fix Execution

For each finding triaged as inline fix:

1. Apply the fix following the `Suggested Fix` from the critic output
2. Stage and commit: `fix(critic): {finding-title}`
3. Push to the current branch

After all inline fixes are applied → proceed to Step 4d.

If no inline fixes exist (all findings were Issue-ized) → skip to Step 5.

#### 4d. Re-Critic (1回限り)

Execute `production:critic {task-id}` again to verify inline fixes.

**Re-critic is limited to exactly 1 cycle.** No further inline fix loops.

| Re-Critic Result | Action |
| --- | --- |
| PASS | Proceed to Step 5 |
| PASS WITH NOTES (should-fix only, no must-fix) | Issue化 remaining findings → Step 5 |
| PASS WITH NOTES (must-fix exists) | **Notify and stop** |
| REWORK REQUIRED | **Notify and stop** |

### 5. Task PR

Execute `agile:task-pr`.

If Issues were created during triage (Step 4), append them to the PR description:

```template
## Related Critic Issues

| Issue | Title | Severity | Triage |
| --- | --- | --- | --- |
| #{number} | {title} | should-fix | Issue化 (高複雑度) |
| #{number} | {title} | should-fix | Issue化 (スコープ外) |

Inline fixes applied: {count}
```

After PR creation → **notify (success) and stop**.

---

## Triage Log

The command MUST output a triage summary before proceeding to task-pr:

```template
## Triage Summary

### Inline Fixed
| # | Title | Category | Reason |
| --- | --- | --- | --- |
| 1 | {title} | {category} | 低複雑度 × スコープ内 |

### Issue化
| # | Issue | Title | Category | Reason |
| --- | --- | --- | --- | --- |
| 1 | #{number} | {title} | {category} | 高複雑度 |
| 2 | #{number} | {title} | {category} | スコープ外 |

### Re-Critic Result
- Judgment: {PASS | PASS WITH NOTES}
- New findings: {count} (all Issue化)
```

---

## Rules

- One task-id per invocation. Do not chain multiple tasks.
- All existing command rules remain in effect (scope, conventions, safety).
- Do not expand scope during inline fix — fix exactly what the critic identified.
- Re-critic loop is capped at 1 cycle. No recursive fix loops.
- Must-fix findings always stop the loop — never auto-fix must-fix.
- Notification is mandatory at every stop point and at completion.
- Triage decisions must be logged and visible in the output.
- PR description must reference all created Issues.

---

## Error Handling

| Situation | Action |
| --- | --- |
| Task-plan not found | Notify (🚫) and stop |
| Story branch not found | Notify (🚫) and stop |
| Dependency not merged | Notify (🚫) and stop |
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

All `gh` commands invoked by sub-commands MUST use the bot token wrapper:

```shell
npx dotenvx run -- node scripts/gh-bot-command.mjs <gh-args...>
```

This is inherited from the individual command definitions.
`implement-loop` does not introduce new `gh` invocations.

---

## Command Output Template

### On Successful Completion

```template
## implement-loop 完了

- **Task**: {task-id}
- **Branch**: feature/{task-id}-{short-description}
- **PR**: #{pr-number}
- **Critic Judgment**: {PASS | PASS WITH NOTES}

### Triage Result
- Inline fix: {n}件適用
- Issue登録: {n}件 ({issue-numbers})
- Re-critic: {実施 / スキップ}

### Next Action

PR #{pr-number} のレビューをお願いします。
coderabbit のレビュー結果と合わせて、ご確認ください。
should-fix Issue がある場合は、レビュー時に対応要否を判断してください。
```

### On Stop

```template
## implement-loop 停止

- **Task**: {task-id}
- **停止理由**: {reason}
- **停止ステップ**: {step name}

### 詳細
{structured details of the stop reason}

### Next Action
{single actionable instruction}
```
