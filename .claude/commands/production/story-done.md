---
description: "Mark a Story as done: RDRA refine, snapshot, issue/project updates, branch cleanup (e.g. /production:story-done S1)"
---

# /production:story-done

## Purpose

Mark a Story as complete and execute all post-Story completion tasks in a single command.
This replaces the manual sequence of RDRA refinement, snapshot, issue management, and branch cleanup.

---

## Inputs

- **Story ID** (required): e.g. `S1`, `S2`
- **Epic slug** (required if not inferrable): e.g. `service-operation`

The command infers the Epic slug from the current branch name or `.claude/tmp/production/` contents when possible.

If inputs cannot be resolved → ask the user to clarify.

---

## Notification

All completion and stop points MUST send an OS notification.

```shell
node scripts/notify.mjs --title "story-done" \
  --subtitle "{icon} {story-id}: {status}" \
  --message "{summary}"
```

### Notification Icons

| Status | Icon | Subtitle Example |
| --- | --- | --- |
| Story completed | ✅ | `✅ S1: Story completed` |
| Stopped on verification failure | 🚫 | `🚫 S1: Unmerged PRs exist` |
| RDRA refine completed | 📝 | `📝 S1: RDRA updated` |

---

## Flow

```text
story-done {story-id}
  │
  ├─ 1. Completion verification
  │    ├─ Check that all Task PRs are merged
  │    ├─ Check that no open critic-fix / chore Issues remain
  │    └─ [Incomplete] → 🚫 notify → stop
  │
  ├─ 2. RDRA feedback
  │    ├─ Run rdra:refine (reflect implementation into RDRA definitions)
  │    └─ Run rdra:snapshot
  │
  ├─ 3. GitHub Issues / Project updates
  │    ├─ Move Task Issues under the Story to Done
  │    ├─ Close the Story Issue
  │    └─ Update the Epic Issue checkbox
  │
  ├─ 4. Branch cleanup
  │    ├─ Delete merged feature/ branches
  │    ├─ Delete merged chore/ branches
  │    ├─ Delete merged fix/ branches
  │    └─ Keep the Story branch (until Epic completion)
  │
  └─ ✅ notify → done
```

---

## Steps

### 1. Completion Verification

Before proceeding, verify that the Story is actually done.

#### 1a. Check all Task PRs are merged

```shell
npx dotenvx run -- node scripts/gh-bot-command.mjs pr list \
  --state open \
  --search "Story:{story-slug}" \
  --json number,title,state
```

Also check for open PRs on related branches:

```shell
git branch -r --no-merged origin/story/{epic-key}-{story-key}-{short-description} \
  | grep -E "(feature|chore|fix)/"
```

If any Task PR is not merged → **notify and stop**:

```template
## Completion Verification: Failed

The following PRs are not yet merged:
| PR | Title | Status |
| --- | --- | --- |
| #{number} | {title} | {state} |

Merge all PRs and re-run the command.
```

#### 1b. Check for open related Issues

```shell
npx dotenvx run -- node scripts/gh-bot-command.mjs issue list \
  --state open \
  --label "critic-fix" \
  --search "{story-slug}" \
  --json number,title,labels
```

```shell
npx dotenvx run -- node scripts/gh-bot-command.mjs issue list \
  --state open \
  --label "chore" \
  --search "{story-slug}" \
  --json number,title,labels
```

If open issues exist → **warn** (do not stop):

```template
## Warning

The following Issues are still open:
| Issue | Title | Label |
| --- | --- | --- |
| #{number} | {title} | {labels} |

Are these expected to be addressed in the next Story or sprint?
Enter Y to continue.
```

Wait for user confirmation before proceeding.

### 2. RDRA Feedback

#### 2a. Execute rdra:refine

Execute `rdra:refine` to reflect implementation learnings back to RDRA definitions.

This is an existing command — invoke it as-is. The command will:

- Review implementation changes in the Story scope
- Identify RDRA definition updates needed
- Apply updates to RDRA documents

#### 2b. Execute rdra:snapshot

After refine is complete, execute `rdra:snapshot` to capture the updated RDRA state.

#### 2c. Commit RDRA changes

If RDRA documents were updated:

```shell
git add docs/rdra/
git commit -m "docs(rdra): refine after Story {story-id} completion"
git push origin story/{epic-key}-{story-key}-{short-description}
```

### 3. GitHub Issues / Project Updates

#### 3a. Move Task Issues to Done

Identify all Task Issues under this Story:

```shell
npx dotenvx run -- node scripts/gh-bot-command.mjs issue list \
  --state closed \
  --label "task" \
  --search "Part of Story #{story-issue-number}" \
  --json number,title,projectItems
```

For each Task Issue, move to the "Done" column in GitHub Projects:

```shell
npx dotenvx run -- node scripts/gh-bot-command.mjs project item-edit \
  {project-number} \
  --owner {org} \
  --id {item-id} \
  --field-id {status-field-id} \
  --single-select-option-id {done-option-id}
```

If Project field IDs are not known, list them first:

```shell
npx dotenvx run -- node scripts/gh-bot-command.mjs project field-list {project-number} --owner {org}
```

#### 3b. Close Story Issue

```shell
npx dotenvx run -- node scripts/gh-bot-command.mjs issue close {story-issue-number} \
  --comment "Story {story-id} completed. All Tasks merged, RDRA updated."
```

#### 3c. Update Epic Issue Checkbox

Read the Epic Issue body, find the Story checkbox, and mark it as checked:

```shell
npx dotenvx run -- node scripts/gh-bot-command.mjs issue view {epic-issue-number} --json body
```

Replace `- [ ] #{story-issue-number}` with `- [x] #{story-issue-number}` in the Epic body:

```shell
npx dotenvx run -- node scripts/gh-bot-command.mjs issue edit {epic-issue-number} --body "{updated-body}"
```

### 4. Branch Cleanup

#### 4a. List merged branches

```shell
git branch -r --merged origin/story/{epic-key}-{story-key}-{short-description} \
  | grep -E "(feature|chore|fix)/"
```

#### 4b. Delete merged branches

For each merged branch, delete both local and remote:

```shell
git branch -d {branch-name} 2>/dev/null
git push origin --delete {branch-name}
```

#### 4c. Story branch handling

**Do NOT delete the Story branch.** The Story branch is kept until Epic completion.
`epic-done` handles Story branch cleanup.

#### 4d. Confirm cleanup results

```template
## Branch Cleanup

| Branch | Status |
| --- | --- |
| feature/B-1-account-aggregate | deleted |
| feature/B-2-auth-adapter | deleted |
| chore/52-di-pattern | deleted |
| story/{story-branch} | kept (until Epic completion) |
```

---

## Command Output Template

### On Successful Completion

```template
## story-done completed

- **Story**: {story-id}
- **Epic**: {epic-slug}
- **Branch**: story/{epic-key}-{story-key}-{short-description}

### RDRA Updates
- rdra:refine: {executed / no changes}
- rdra:snapshot: {executed}
- Commit: {sha or "none"}

### GitHub Updates
- Task Issues → Done: {n}
- Story Issue #{story-issue-number}: closed
- Epic Issue #{epic-issue-number}: checkbox updated

### Branch Cleanup
- Deleted: {n} ({branch-names})
- Kept: story/{story-branch}

### Next Action

{If a next Story exists}
Proceed to the next Story: Story {next-story-id}
/agile:branch-story {next-story-key} {next-story-slug}

{If this was the last Story of the Epic}
All Stories are completed. Close out the Epic:
/production:epic-done {epic-slug}
```

### On Stop

```template
## story-done stopped

- **Story**: {story-id}
- **Stop reason**: {reason}

### Details
{details}

### Next Action
{single actionable instruction}
```

---

## Rules

- Always verify that all Task PRs are merged
- If open critic-fix / chore Issues exist, ask the user to confirm (do not stop)
- Invoke rdra:refine as-is (existing command)
- Do not delete the Story branch (keep until Epic completion)
- Move Project columns by dynamically fetching field ID / option ID
- Update the Epic Issue checkbox via string replacement in the body
- Send notifications at both completion and stop points

---

## Error Handling

| Situation | Action |
| --- | --- |
| Story ID cannot be resolved | Confirm with user and stop |
| Task PR is not merged | Notify (🚫) and stop |
| rdra:refine fails | Report error, defer judgment to the user |
| rdra:snapshot fails | Report error, defer judgment to the user |
| Failed to fetch GitHub Project field ID | Warn, guide manual move, continue |
| Failed to update Epic Issue checkbox | Warn and continue |
| Branch deletion fails | Warn and continue (non-fatal) |
| Notification fails | Log warning, continue |

---

## Bot Authentication

All `gh` commands MUST use the bot token wrapper:

```shell
npx dotenvx run -- node scripts/gh-bot-command.mjs <gh-args...>
```
