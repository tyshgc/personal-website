---
description: "Mark an Epic as done and clean up temporary artifacts (e.g. /production:epic-done service-operation)"
---

# /production:epic-done

## Purpose

Mark an Epic as complete and clean up all temporary artifacts.
Ensures `.claude/tmp/` always reflects only active, in-progress work.

Before cleanup, this command also persists any design decisions, domain knowledge,
or workflow rules learned during the Epic into durable project documentation
(conventions, CLAUDE.md, docs/, etc.) so they survive the deletion of tmp artifacts.

---

## Inputs

- **Epic slug or name** (required): e.g. `service-operation`

---

## Steps

### 1. Verify Completion

Before cleaning up, verify the Epic is actually done:

1. Check that the Story branch has been merged to main:

```shell
git log main --oneline --grep="{epic-slug}" | head -5
```

2. Check for open issues or PRs related to this Epic:

```shell
gh issue list --state open --search "{epic-slug}" --limit 10
gh pr list --state open --search "{epic-slug}" --limit 10
```

If the Story branch is NOT merged or open issues/PRs remain → warn and ask the user to confirm before proceeding.

### 2. Persist Knowledge

Before deletion, extract durable knowledge from the Epic's artifacts and persist it
into permanent documentation.

This step must NOT create code, reopen critic judgment, or generate new design.
It exists solely to convert ephemeral Epic outcomes into stable project knowledge.

#### 2a. Output Language

Persisted documents are for the team. Decide the output language by priority:

1. The language the user is using in the current conversation
2. The dominant language of the project (CLAUDE.md, commit messages, existing docs as a whole)

Scope:

- Applies to project documents under `docs/`, top-level `README.md`, and similar product-facing artifacts.
- Does NOT apply to `.claude/` internals (commands, conventions, skills) — those remain in their own established language.

If an existing target document uses a different language from the above priority, prefer migrating the touched sections rather than mixing languages within a single section.

#### 2b. Detect Knowledge Worth Persisting

Scan the following sources:

- `.claude/tmp/production/{epic-slug}/prepare.md`
- `.claude/tmp/production/{epic-slug}/task-plan.md`
- `.claude/tmp/production/{epic-slug}/implementation.md` (if present)
- Latest critic reports produced during the Epic
- fix-review outcomes and PR discussions
- RDRA / Event Storming artifacts updated during the Epic
- Workflow or convention decisions made in conversation

Extract only:

- Architectural decisions
- Domain modeling constraints
- Convention updates (new rules, exceptions, rationales)
- Behavioral clarifications
- Workflow rules (branching / PR / review / triage policy)
- Risk mitigations that became policy

Ignore:

- Temporary implementation notes
- Local debugging outcomes
- Speculative ideas that were not adopted
- Open Points that remain unresolved

If nothing meaningful was learned → report **「永続化不要」** and proceed directly to Step 3.

#### 2c. Determine Target Location

Typical targets:

| Knowledge Type | Target |
| --- | --- |
| Domain / Architecture | `docs/rdra/event-storming/*`, `docs/architecture/*`, ADR files, domain conventions |
| AI Development Conventions | `.claude/conventions/*`, skill documentation |
| Workflow / Agile Operation | branch strategy docs, PR workflow docs, task-plan structural rules, acceptance-criteria rules |
| Setup / Runtime Knowledge | `README.md` sections, infra assumptions, auth / integration constraints |
| Project-wide rules | `CLAUDE.md` |

#### 2d. Present Persistence Plan to User

Before writing anything, present the plan and wait for approval:

```template
## Persistence Plan

以下の知識を永続化します。内容を確認してください。

### 更新対象
| # | File | Change Type | Summary |
| --- | --- | --- | --- |
| 1 | {path} | {add / update} | {1-line summary} |
| 2 | {path} | {add / update} | {1-line summary} |

### 永続化する知識
- {bullet summary of knowledge to persist}

この内容で永続化しますか？ (Y/n)
```

Wait for explicit confirmation before proceeding.

#### 2e. Perform Minimal Correct Update

After approval, apply the updates following these rules:

- Update only what changed
- Never rewrite whole documents unnecessarily
- Preserve history readability (diff-friendly)
- Do not reorganize documents unless explicitly required
- Avoid stylistic rewrites
- Avoid summarization that loses precision

Normalize conversation outcomes into:

- stable wording
- imperative rules
- convention statements
- domain invariants
- short decision rationale

Never:

- Generate implementation tasks
- Generate new design
- Reinterpret domain scope
- Introduce new abstractions
- Modify code
- Modify task-plan ordering
- Reopen critic judgment

#### 2f. Report

After writing (or if nothing was written):

```template
## Persistence Result

- **更新ファイル**: {list or "なし"}
- **永続化した知識**:
  - {bullet}
  - {bullet}
```

Then ask:

```template
tmp アーティファクトの削除に進みます。続行しますか？ (Y/n)
```

Wait for confirmation.

If the user declines (e.g., "n"):

- Keep the persisted changes already written in Step 2
- Skip the tmp artifact deletion (Step 3)
- Report current state and ask for the next action (continue with branch cleanup? rollback? end here?)

### 3. Clean Up Temporary Artifacts

Delete the following:

```shell
rm -rf .claude/tmp/production/{epic-slug}/
rm -f .claude/tmp/epics/{epic-slug}.md
```

This removes:
- `prepare.md`
- `task-plan.md`
- `implementation.md` (if exists)
- Epic artifact file

### 4. Clean Up Branches

List merged branches related to this Epic and offer to delete:

```shell
git branch --merged main | grep -E "(story|feature|fix).*{epic-slug-or-related}"
```

If merged branches exist, offer to delete them (local + remote).

### 5. Output Summary

```template
## Epic Done

- **Epic**: {epic name}
- **Slug**: {epic-slug}
- **Persisted knowledge**: {list of updated docs or "なし"}
- **Artifacts removed**:
  - .claude/tmp/production/{epic-slug}/ (prepare.md, task-plan.md, ...)
  - .claude/tmp/epics/{epic-slug}.md
- **Branches cleaned**: {list or "none"}

Only currently in-progress work remains in `.claude/tmp/`.
```

---

## Rules

- Always confirm with the user before deleting anything
- Always perform knowledge persistence (Step 2) before deletion, unless nothing meaningful was learned
- Persistence plan must be presented and approved before writing
- Do not delete files outside `.claude/tmp/`
- Do not delete branches that are not merged to main
- Do not delete `docs/rdra/` artifacts (these are permanent)
- If `.claude/tmp/production/{epic-slug}/` does not exist → report and stop

---

## What is NOT deleted

The following are permanent artifacts and must NOT be deleted:

- `docs/rdra/snapshots/main.md`
- `docs/rdra/event-storming/{buc-slug}.md`
- `docs/rdra/blueprint/{buc-slug}.md`
- `.claude/conventions/` files
- Any files outside `.claude/tmp/`
