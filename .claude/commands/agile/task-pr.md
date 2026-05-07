---
description: "Create a Pull Request from the current Task branch (e.g. /agile:task-pr)"
---

# Agile Command — task-pr

## Purpose

Create or update a Pull Request for the current **Task branch**.

This command standardizes how Task-level PRs are created so that:

- 1 Task = 1 branch = 1 PR is always preserved
- Review scope remains small and structurally meaningful
- RDRA / Event Storming / Task‑Plan traceability is explicit

---

## Preconditions

- A **Story branch already exists**
- A **Task branch is currently checked out**
- Implementation for the Task has reached a reviewable state
- `command/critic` has been executed (or is about to be)

---

## Inputs

- Story ID or Story Slug
- Task ID
- RDRA BUC link (Notion URL)
- Related Event Storming document path
- Task‑Plan reference section

---

## PR Title Rule

```template
[Story:<story-slug>] Task:<task-id> <short-task-description>
```

Example:

```template
[Story:account-onboarding] Task:T-1 Supabase Auth Adapter
```

---

## PR Description Template

````template
## Scope

Implements **Task {task-id}** under **Story {story-slug}**.

- Domain Boundary: {aggregate / adapter / UI slice etc}
- Out of Scope: anything not listed in Task‑Plan

## RDRA Traceability

- BUC: {Notion URL}
- Event Storming: docs/rdra/event-storming/{file}.md
- Task‑Plan Section: {heading anchor or reference}

## Acceptance Criteria (Gherkin)

```gherkin
{paste from task-plan}
````

## Structural Notes

- Decision functions / adapters / UI flows introduced:
- Invariants enforced:
- Idempotency considerations:
- Error model:

## Critic Focus

Reviewer should especially verify:

- Scope leakage
- Convention conformance
- Invariant completeness
- Naming alignment with Event Storming

## Open Points

List ONLY unresolved structural or specification questions.

Each point must be written as:

- [Decision Needed] {short title}
  - Context:
  - Options:
  - Recommended Direction:
  - Impact Scope:

---

## Behavior

1. Detect current branch name
2. If PR does not exist:
   - Create the PR via `gh pr create` (base is the parent Story branch)
   - Immediately request review from `tyshgc` via the REST API:

     ```shell
     npx dotenvx run -- node scripts/gh-bot-command.mjs api -X POST \
       repos/{owner}/{repo}/pulls/{pr-number}/requested_reviewers \
       -f "reviewers[]=tyshgc"
     ```

   - This step is required because Task PRs target a Story branch (not `main`),
     and Story branches do not have Branch Protection that triggers
     CODEOWNERS auto-request. CODEOWNERS still covers PRs targeting `main`
     (Story PRs / chore PRs); Task PRs need this explicit reviewer call.
   - Do NOT pass `--reviewer` to `gh pr create` directly — the bot wrapper
     can hit the GraphQL `projectCards` deprecation path and fail. Use the
     REST API call above instead.
3. If PR already exists → update description and append implementation notes
4. Never create multiple PRs for the same Task branch
5. Never include multiple Tasks in one PR

---

## Next Action Rule

After PR creation or update:

→ **Human reviews the PR and leaves structured comments (Spec Change / Fix Request / Question).**
