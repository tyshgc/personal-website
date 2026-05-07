---
description: "Create GitHub Issues from production:critic findings (e.g. /agile:critic-issues)"
---

# /agile:critic-issues

## Purpose

Convert `production:critic` findings into individual GitHub Issues.
Each issue is labeled `critic-fix` and includes enough context for autonomous or manual resolution.

This command **does NOT fix code**. It only creates trackable issues.

## Issue Classification

Critic-fix Issues are **chore Issues** (not User Story Issues). They do not belong to
the Epic / Story / Task hierarchy.

Classification and labeling follow `.claude/conventions/agile/issue-classification.md`:

- `critic-fix` + `must-fix` or `should-fix` labels (this command's defaults)
- No `story` / `task` label
- Title prefix: `[critic-fix] {category}: {title}`

---

## Bot Authentication

All `gh` commands in this workflow MUST be executed with the bot token to ensure:

- Issues are authored by the bot account (not the human developer)
- The human developer can review and approve PRs created by the bot

### Token Resolution

Use the bot command wrapper for all gh invocations:

```shell
npx dotenvx run -- node scripts/gh-bot-command.mjs <gh-args...>
```

If token generation fails → warn the user and stop. Do not fall back to the default `gh` auth.
See `.config/github/README.md` for GitHub App setup instructions.

---

## Preconditions

- `production:critic` has been executed in the current conversation (or its output is available)
- Critic judgment is **PASS WITH NOTES** or **REWORK REQUIRED**
- Findings tagged with `[FIX]` exist in the critic output
- A Story branch is currently checked out (or identifiable)

If no `[FIX]` findings exist → report "No actionable findings" and stop.

---

## Steps

### 1. Extract Findings

From the most recent `production:critic` output, collect all findings marked with `[FIX]`.

Each finding must have:

- **Title**: One-line summary of the issue
- **Category**: One of `scope` | `convention` | `structure` | `risk`
- **Severity**: One of `must-fix` | `should-fix`
- **Description**: What is wrong and why
- **Location**: File path(s) and line range(s) affected
- **Suggested Fix**: Concrete recommended action from the critic output
- **Work Item Reference**: The original Work Item ID (e.g. `B-1`)

### 2. Confirm with User

Display the extracted findings and offer a choice:

```template
## Critic Findings

| # | Category | Severity | Title | Location |
|---|----------|----------|-------|----------|
| 1 | convention | must-fix | ... | ... |
| 2 | structure | should-fix | ... | ... |

対応方法を選んでください:

A. すべてローカルで即座に修正する
   → この場で修正 → commit → push します。

B. すべて GitHub Issues に登録する
   → Issue 作成に進みます。

C. 個別に選択する（番号を指定）
   → 例: 「1 はローカル修正、2 は Issue 化」
```

Wait for user's choice before proceeding.

- **A の場合**: 各 finding について修正を適用 → commit → push。Issue は作成しない。
- **B の場合**: Step 3 に進み、全件を GitHub Issues として作成する。
- **C の場合**: ユーザーが指定した番号ごとにローカル修正 or Issue 化を振り分ける。

### 3. Create GitHub Issues

For each finding, create a GitHub Issue using `gh issue create`:

#### Issue Title

```template
[critic-fix] {category}: {title}
```

#### Issue Labels

- `critic-fix` (always)
- `must-fix` or `should-fix` (based on severity)

#### Issue Body

```template
## Critic Finding

- **Work Item**: {work-item-id}
- **Category**: {category}
- **Severity**: {severity}
- **Story Branch**: {current story branch}
- **Base Branch for Fix**: {current story branch}

## Description

{description}

## Location

{file paths and line ranges}

## Suggested Fix

{suggested fix from critic output}

## Context

- Task Plan: {task-plan path}
- Critic Judgment: {PASS WITH NOTES | REWORK REQUIRED}
```

#### Create Command

```shell
npx dotenvx run -- node scripts/gh-bot-command.mjs issue create \
  --title "[critic-fix] {category}: {title}" \
  --label "critic-fix" \
  --label "{severity}" \
  --body "..."
```

If the labels do not exist yet, create them first:

```shell
npx dotenvx run -- node scripts/gh-bot-command.mjs label create "critic-fix" --description "Fix identified by production:critic" --color "D93F0B" --force
npx dotenvx run -- node scripts/gh-bot-command.mjs label create "must-fix" --description "Must be fixed before merge" --color "B60205" --force
npx dotenvx run -- node scripts/gh-bot-command.mjs label create "should-fix" --description "Should be fixed, lower priority" --color "FBCA04" --force
```

### 4. Output Summary

```template
## Issues Created

| # | Issue | Title | Severity |
|---|-------|-------|----------|
| 1 | #{number} | ... | must-fix |
| 2 | #{number} | ... | should-fix |

## Next Action

Fix individually:
  /agile:fix-issue {issue-number}

Fix all must-fix issues:
  /agile:fix-issue --all must-fix
```

---

## Rules

- One finding = One issue. Do not merge multiple findings into one issue.
- Do not create duplicate issues. Check existing open issues with `critic-fix` label before creating.
- Do not modify critic output or expand scope.
- Always include the Story branch name in the issue body so `fix-issue` knows the base branch.
- Issue creation requires user confirmation.

---

## Label Reference

| Label        | Color                  | Purpose                      |
| ------------ | ---------------------- | ---------------------------- |
| `critic-fix` | `#D93F0B` (red-orange) | All critic-originated issues |
| `must-fix`   | `#B60205` (red)        | Blocks merge                 |
| `should-fix` | `#FBCA04` (yellow)     | Recommended but non-blocking |
