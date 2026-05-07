---
description: "Read PR review comments and fix issues, or confirm no action needed (e.g. /agile:fix-review 13)"
---

# /agile:fix-review

## Purpose

Read review comments on a Pull Request, determine if fixes are needed, and either:

- Apply fixes → commit → push
- Report that no action is needed (reviewer had no comments)

This command handles reviews from **human reviewers**.

---

## Bot Authentication

All `gh` commands MUST be executed with the bot token wrapper:

```shell
npx dotenvx run -- node scripts/gh-bot-command.mjs <gh-args...>
```

If token generation fails → warn the user and stop.

---

## Inputs

- **PR number** (required): GitHub PR number (e.g. `13`)

---

## Steps

### 1. Fetch PR and Reviews

```shell
npx dotenvx run -- node scripts/gh-bot-command.mjs pr view {pr-number} --json title,body,headRefName,baseRefName,state,reviewDecision
npx dotenvx run -- node scripts/gh-bot-command.mjs api repos/{owner}/{repo}/pulls/{pr-number}/reviews
npx dotenvx run -- node scripts/gh-bot-command.mjs api repos/{owner}/{repo}/pulls/{pr-number}/comments
```

### 2. Analyze Review Results

Classify the review status:

#### No Action Needed

The following conditions mean **no fix is required**:

- Reviewer approved without comments
- All review comments are informational (no change requests)

If no action needed → report to the user:

```template
## Review Result: No Action Needed

PR #{pr-number} has been reviewed with no actionable comments.

- Reviewer: {status}

You can approve and merge this PR.
```

#### Fixes Required

Review comments contain **change requests** if any of:

- GitHub review state is `CHANGES_REQUESTED`
- Review comments contain specific code suggestions or fix requests
- Inline comments point to specific files/lines with issues

### 3. Apply Fixes (if needed)

- Check out the PR branch:

```shell
git checkout {head-branch}
git pull origin {head-branch}
```

- For each actionable review comment:
  - Read the comment context (file, line, suggestion)
  - Apply the fix following project conventions
  - Scope fixes to what the reviewer requested — do not expand

- Commit and push:

```shell
git add {changed-files}
git commit -m "[review-fix] #{pr-number} {short-description}"
git push origin {head-branch}
```

- Reply to each addressed comment on the PR:

```shell
npx dotenvx run -- node scripts/gh-bot-command.mjs api repos/{owner}/{repo}/pulls/{pr-number}/comments/{comment-id}/replies \
  -X POST -f body="Fixed in {commit-sha}"
```

### 4. Output Summary

#### When fixes applied

```template
## Review Fixes Applied

PR #{pr-number}: {title}

| Comment | Reviewer | Action |
| --- | --- | --- |
| {comment summary} | {reviewer} | Fixed in {sha} |
| {comment summary} | {reviewer} | Fixed in {sha} |

Pushed to {head-branch}. Ready for re-review.
```

#### When no action needed

```template
## Review Result: No Action Needed

PR #{pr-number}: {title}

All reviews are clean. You can approve and merge.
```

---

## Review Comment Classification

| Indicator | Classification | Action |
| --- | --- | --- |
| "generated no comments" | No issues found | No action |
| APPROVED state | Approved | No action |
| CHANGES_REQUESTED state | Fix required | Apply fixes |
| Inline comment with code suggestion | Fix required | Apply suggestion |
| General comment without specific fix | Informational | No action (report to user) |
| "nit:" prefix | Optional | Report to user, do not auto-fix |

---

## Rules

- Do not apply fixes beyond what the reviewer requested
- Do not re-request review after pushing fixes — the user decides when to re-request
- Always report the result clearly, even when no action is needed
- Preserve existing PR description — do not overwrite
- If a review comment is ambiguous, report it to the user instead of guessing

---

## Error Handling

| Situation | Action |
| --- | --- |
| PR not found | Report and stop |
| PR is already merged | Report and stop |
| PR is closed | Report and stop |
| No reviews exist | Report "No reviews yet" and stop |
| Branch checkout fails | Report and stop |
| Fix conflicts with existing code | Report the conflict, do not force |
