---
description: "Create a Task branch under the current Story (e.g. /agile:branch-task T1 account-aggregate)"
---

# /agile:branch-task

## Purpose

Create a Task work branch from the corresponding Story branch.
Run this command before starting implementation for a single Task.

---

## Branch Strategy

- A Task branch is a short-lived branch.
- A Task branch MUST be created from the corresponding Story branch.
- One Task branch MUST represent one Task only.
- All implementation, critic feedback handling, and PR updates for that Task MUST happen on the same Task branch.

### Naming Convention

```shell
feature/{task-id}-{short-description}
```

### Examples

```shell
feature/T-1-account-executable-spec
feature/B-1-account-aggregate
feature/F-4-signup-ui
```

---

## Preconditions

- The corresponding Story branch already exists.
- The target Task has been identified from the active task-plan.
- The Task is ready to start.

---

## Steps

### 0. Fetch latest story state and verify dependencies

```shell
git fetch origin
git log --oneline origin/story/{epic-key}-{story-key}-{short-description} -10
```

- Read the target Task's `Dependencies` in `task-plan.md`.
- For each dependency, verify its implementation is present on the story branch by inspecting the merge commits and/or relevant file contents in `origin/story/...`.
- If all dependencies are merged, proceed silently. Do NOT emit warnings based on conversation memory or assumption.
- If a dependency is actually missing, report the specific missing merge commit / file state, not a vague "probably not merged" warning.

### 1. Switch to the Story branch

```shell
git checkout story/{epic-key}-{story-key>-{short-description}
git pull origin story/{epic-key}-{story-key>-{short-description}
```

### 2. Create the Task branch

```shell
git checkout -b feature/{task-id}-{short-description}
```

### 3. Push the branch

```shell
git push -u origin feature/{task-id}-{short-description}
```

---

## Rules

- Do not reuse one Task branch for multiple Tasks.
- Do not branch directly from `main` for Task implementation.
- Do not start implementation before the Task branch is created.
- Keep the branch name aligned with the Task ID used in `task-plan`.
- MUST verify dependency merge state via `git log origin/story/...` (and `gh pr view {dep-pr-number} --json state,mergedAt` when a dependency PR number is known) BEFORE emitting any dependency-related warning. Never emit "dependency may not be merged" based on conversation memory alone.

---

## Command Output Template

```template
✅ Task branch created

Story Branch:
story/{epic-key}-{story-key}-{short-description}

Task Branch:
feature/{task-id}-{short-description}

Next Action:
Start implementation for this Task

production:implement {task-id}
```
