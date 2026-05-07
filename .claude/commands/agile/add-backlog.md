---
description: "Create GitHub Issues for Epic/Story/Tasks from production artifacts and add to GitHub Projects (e.g. /agile:add-backlog)"
---

# /agile:add-backlog

## Purpose

Create GitHub Issues from production artifacts (Epic, Stories, Tasks) and add them to a GitHub Project board for visibility and tracking.

One command registers the full hierarchy: Epic → Stories → Tasks.

## Scope Boundary

This command handles **User Story hierarchy Issues only** (Epic / Story / Task).

Non-user-story chore Issues (e.g. information-model traceability gaps, process improvements,
refactors) are **out of scope** for this command and must be created separately per the
classification rules in `.claude/conventions/agile/issue-classification.md`.

Before invoking this command, confirm each prepared Story is a genuine User Story
(= expresses "As a X, I want Y, so that Z"). If a listed "Story" is actually a chore,
exclude it here and create a chore Issue separately.

---

## Bot Authentication

Use the bot command wrapper for all gh invocations:

```shell
npx dotenvx run -- node scripts/gh-bot-command.mjs <gh-args...>
```

If token generation fails → warn the user and stop.

---

## Required Inputs

- **Epic slug** (required): e.g. `service-operation`
- The following artifacts must exist:
  - `.claude/tmp/epics/{epic-slug}.md`
  - `.claude/tmp/production/{epic-slug}/task-plan.md`

If artifacts are missing → report and stop.

---

## Steps

### 1. Parse Artifacts

Read the Epic and task-plan to extract:

- **Epic**: name, summary, scope
- **Stories**: Slices from prepare.md (S1, S2, S3, ...) or from task-plan's scope boundary
- **Tasks**: Work Items from task-plan (S-1, B-1, B-2, F-1, ...)

### 2. Ensure Labels Exist

```shell
npx dotenvx run -- node scripts/gh-bot-command.mjs label create "epic" --description "Epic-level issue" --color "6A0DAD" --force
npx dotenvx run -- node scripts/gh-bot-command.mjs label create "story" --description "Story-level issue" --color "0075CA" --force
npx dotenvx run -- node scripts/gh-bot-command.mjs label create "task" --description "Task-level work item" --color "0E8A16" --force
```

### 3. Create Epic Issue

```shell
npx dotenvx run -- node scripts/gh-bot-command.mjs issue create \
  --title "Epic: {epic name}" \
  --label "epic" \
  --body "..."
```

#### Epic Body Template

````template
## Epic: {epic name}

{epic summary}

### RDRA Scope

- **BUC**: {buc name}
- **Activities**: {activity list}

### Stories

- [ ] Story: {story 1 name}
- [ ] Story: {story 2 name}
- ...

### Source

- Epic: `.claude/tmp/epics/{epic-slug}.md`
- Task Plan: `.claude/tmp/production/{epic-slug}/task-plan.md`
````

### 4. Create Story Issues

For each Story (Slice) identified in prepare.md or task-plan:

```shell
npx dotenvx run -- node scripts/gh-bot-command.mjs issue create \
  --title "Story: {story name}" \
  --label "story" \
  --body "..."
```

#### Story Body Template

````template
## Story: {story name}

Part of Epic #{epic-issue-number}

### Scope

{story scope description}

### Tasks

- [ ] {task-id}: {task title}
- [ ] {task-id}: {task title}
- ...

### Out of Scope

{out of scope items}
````

### 5. Create Task Issues

For each Work Item in the task-plan:

```shell
npx dotenvx run -- node scripts/gh-bot-command.mjs issue create \
  --title "Task {task-id}: {task title}" \
  --label "task" \
  --body "..."
```

#### Task Body Template

````template
## Task {task-id}: {task title}

Part of Story #{story-issue-number}

### Description

{task description from task-plan}

### Target Path

{target file paths}

### Dependencies

{dependency task IDs}

### Acceptance Criteria

```gherkin
{acceptance criteria from task-plan}
```
````

### 6. Add to GitHub Project (if configured)

If a GitHub Project board exists:

```shell
npx dotenvx run -- node scripts/gh-bot-command.mjs project item-add {project-number} --owner {org} --url {issue-url}
```

If no project is configured → skip and report.

### 7. Update Epic Issue with Cross-References

After all issues are created, update the Epic issue body with actual issue numbers:

```template
### Stories

- [ ] #{story-1-number} Story: {story 1 name}
- [ ] #{story-2-number} Story: {story 2 name}
```

Similarly update Story issues with Task issue numbers.

### 8. Confirm with User

Before creating issues, show a summary:

```template
## Backlog Summary

| Type | Count | Items |
| --- | --- | --- |
| Epic | 1 | {epic name} |
| Stories | {n} | {story names} |
| Tasks | {n} | {task IDs} |

Total: {total} GitHub Issues will be created.
Proceed? (Y/n)
```

Wait for confirmation before creating issues.

### 9. Output Summary

```template
## Backlog Created

### Epic
- #{number} Epic: {name}

### Stories
| # | Issue | Title |
| --- | --- | --- |
| 1 | #{number} | Story: {name} |
| 2 | #{number} | Story: {name} |

### Tasks
| # | Issue | Story | Title |
| --- | --- | --- | --- |
| 1 | #{number} | #{story} | Task B-1: {name} |
| 2 | #{number} | #{story} | Task B-2: {name} |
| ... | | | |

Total: {count} issues created.
```

---

## Hierarchy and Linking

Issues are linked through body content (not GitHub sub-issues):

```text
Epic #{n}
├── Story #{n} ("Part of Epic #{epic}")
│   ├── Task #{n} ("Part of Story #{story}")
│   ├── Task #{n}
│   └── Task #{n}
├── Story #{n}
│   ├── Task #{n}
│   └── Task #{n}
```

- Epic body contains checkboxes for all Stories
- Story body contains checkboxes for all Tasks
- Task body references its parent Story

---

## Duplicate Prevention

Before creating issues, check for existing issues:

```shell
npx dotenvx run -- node scripts/gh-bot-command.mjs issue list --label "epic" --search "{epic name}" --state open
npx dotenvx run -- node scripts/gh-bot-command.mjs issue list --label "task" --search "Task {task-id}" --state open
```

If duplicates exist → skip and report.

---

## Rules

- Always confirm with the user before creating issues
- One task-plan Work Item = One Task issue
- Do not create issues for out-of-scope items
- Do not create issues for "Do Not Implement Yet" items
- Include Acceptance Criteria in Task issues when available
- Include dependency information in Task issues
- Task IDs in issue titles must match task-plan IDs (B-1, F-1, S-1, etc.)
