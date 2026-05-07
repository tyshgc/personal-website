---
description: "Fix a critic-fix GitHub Issue: branch, implement, commit, push, PR (e.g. /agile:fix-issue 42)"
---

# /agile:fix-issue

## Purpose

Autonomously resolve a single `critic-fix` GitHub Issue by:

1. Creating a fix branch
2. Implementing the fix
3. Committing and pushing
4. Creating a Pull Request

This command implements **exactly one issue per invocation**.

---

## Bot Authentication

All `gh` commands MUST be executed with the bot token so that:

- PRs are authored by the bot account (not the human developer)
- The human developer can approve and merge the PR

Generate a fresh token at the start of command execution:

```shell
CLAUDE_BOT_GH_TOKEN=$(npx dotenvx run -- node scripts/gh-app-token.mjs 2>&1 | tail -1)
GH_TOKEN="$CLAUDE_BOT_GH_TOKEN" gh ...
```

If token generation fails → warn the user and stop. Do not fall back to the default `gh` auth.
See `.config/github/README.md` for GitHub App setup instructions.

---

## Inputs

- **Issue number** (required): GitHub Issue number (e.g. `42`)
- **`--all {severity}`** (optional): Process all open `critic-fix` issues of given severity sequentially

When `--all` is used, process each issue one by one in issue-number order.

---

## Preconditions

- The specified issue exists and has the `critic-fix` label
- The issue body contains `Base Branch for Fix:` metadata
- The base branch (Story branch) exists locally and remotely

If any precondition fails → report and stop.

---

## Steps

### 1. Fetch Issue Details

```shell
gh issue view {issue-number} --json title,body,labels,number
```

Extract from the issue body:

- **Work Item ID**
- **Category** and **Severity**
- **Base Branch** (Story branch)
- **Location** (file paths)
- **Suggested Fix**

### 2. Create Fix Branch

Branch from the Story branch specified in the issue:

```shell
git checkout {base-branch}
git pull origin {base-branch}
git checkout -b fix/{issue-number}-{short-slug}
```

#### Branch Naming

```template
fix/{issue-number}-{short-slug}
```

Example: `fix/42-immutable-state-convention`

The `short-slug` is derived from the issue title (max 40 chars, kebab-case, ASCII only).

### 3. Implement the Fix

Apply the fix based on:

- **Suggested Fix** from the issue body
- **Location** information
- Project conventions (FDDD, FSD, RDRA alignment)

#### Fix Scope Rules

- Fix ONLY what the issue describes. Do not expand scope.
- Follow the same conventions as `production:implement`.
- If the fix requires changes outside the described scope → add a comment to the issue and stop.
- Run existing tests to verify the fix does not break anything.

### 4. Commit and Push

```shell
git add {changed-files}
git commit -m "[critic-fix] #{issue-number} {short-description}"
git push -u origin fix/{issue-number}-{short-slug}
```

#### Commit Message Format

```template
[critic-fix] #{issue-number} {short-description}

- Category: {category}
- Severity: {severity}
- Work Item: {work-item-id}
```

### 5. Create Pull Request

```shell
GH_TOKEN="$CLAUDE_BOT_GH_TOKEN" gh pr create \
  --base {base-branch} \
  --title "[critic-fix] #{issue-number} {short-description}" \
  --label "critic-fix" \
  --reviewer "tyshgc" \
  --body "..."
```

#### PR Body Template

````template
## Critic Fix

Closes #{issue-number}

- **Category**: {category}
- **Severity**: {severity}
- **Work Item**: {work-item-id}

## Changes

{bullet list of what was changed and why}

## Verification

- [ ] Fix addresses the issue description
- [ ] Existing tests pass
- [ ] No scope expansion beyond the issue
- [ ] Convention conformance maintained

## Review

To re-review this fix:

```
/production:critic-issue {issue-number}
```
````

### 6. Output Summary

```template
## Fix Applied

- Issue: #{issue-number}
- Branch: fix/{issue-number}-{short-slug}
- PR: #{pr-number}
- Files Changed: {count}

## Next Action

Review the PR or run:
  /production:critic-issue {issue-number}

Approve and merge when ready.
```

---

## Batch Mode (`--all`)

When `--all {severity}` is specified:

1. List all open issues with labels `critic-fix` AND `{severity}`
2. Process each sequentially (Steps 1-6)
3. Output a combined summary at the end

```template
## Batch Fix Summary

| Issue | Branch | PR | Status |
|-------|--------|----|--------|
| #42 | fix/42-... | #50 | Created |
| #43 | fix/43-... | #51 | Created |

All {severity} critic-fix issues processed.
```

---

## Rules

- One issue = One branch = One PR. Never combine multiple issues.
- Base branch is ALWAYS the Story branch from the issue metadata, never `main`.
- Do not close the issue manually — `Closes #N` in the PR handles it on merge.
- If the fix cannot be completed autonomously, comment on the issue with blockers and stop.
- Do not modify code unrelated to the issue.
- After creating the PR, return control to the user.

---

## Error Handling

| Situation                         | Action                                      |
| --------------------------------- | ------------------------------------------- |
| Issue not found                   | Report and stop                             |
| Issue lacks `critic-fix` label    | Report and stop                             |
| Base branch not found             | Report and stop                             |
| Fix requires out-of-scope changes | Comment on issue, stop                      |
| Tests fail after fix              | Report failure, do not create PR            |
| Branch already exists             | Check out existing branch, continue         |
| PR already exists                 | Update existing PR, do not create duplicate |
