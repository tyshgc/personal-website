---
description: "Create a Story branch under the current Epic (e.g. /agile:branch-story S1 auth-signup)"
---

# /agile:branch-story

## Purpose

Create the base branch for a Story.
Run this command when starting work on a Story under an Epic.

---

## Branch Strategy

- A Story branch is a long-lived branch.
- A Story branch is the base for Task branches.
- Do not implement directly on the Story branch.
- All implementation work must be done on Task branches.
- Pull Requests are created per Task (merged into the Story branch).
- After all Tasks are complete, create a Story PR to merge into `main` via `/agile:story-pr`.

### Naming Convention

```shell
story/{epic-key}-{story-key}-{short-description}
```

### Examples

```shell
story/auth-S1-social-login
story/billing-S3-subscription-domain
```

---

## Steps

### 1. Update `main`

```shell
git checkout main
git pull origin main
```

### 2. Create the Story branch

```shell
git checkout -b story/{epic-key}-{story-key}-{short-description}
```

### 3. Push the branch

```shell
git push -u origin story/{epic-key}-{story-key}-{short-description}
```

---

## Command Output Template

```template
✅ Story branch created

Branch:
story/{epic-key}-{story-key}-{short-description}

Next Action:
Plan the Task

/production:task-plan
```
