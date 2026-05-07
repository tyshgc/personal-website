---
description: "Create a Pull Request from the current Story branch to main (e.g. /agile:story-pr)"
---

# Agile Command — story-pr

## Purpose

Create or update a Pull Request to merge the current **Story branch** into `main`.

A Story PR aggregates all completed Task PRs and represents a coherent,
shippable unit of work. It is created after all (or a meaningful subset of)
Task PRs have been merged into the Story branch.

---

## Preconditions

- A **Story branch is currently checked out**
- At least one Task PR has been merged into the Story branch
- The Story branch is up to date with `main` (rebase or merge)

---

## Inputs

- Story ID and Story Slug (derived from branch name)
- Epic name / GitHub Issue reference
- List of Task PRs included (auto-detected from git log)

---

## PR Title Rule

```template
[Epic:<epic-key>] Story:<story-key> <short-story-description>
```

Example:

```template
[Epic:service-operation] Story:S1 Admin Auth Foundation
```

---

## PR Description Template

````template
## Summary

Implements **Story {story-key}** ({short-story-description}) under **Epic {epic-key}**.

{1-3 sentence high-level summary of what this Story delivers}

## Included Tasks

| Task | PR | Description |
|------|----|-------------|
| T-1  | #XX | {short description} |
| B-1  | #XX | {short description} |
| ...  | ... | ... |

## RDRA Traceability

- BUC: {BUC name}
- Event Storming: docs/rdra/event-storming/{file}.md

## Key Design Decisions

- {Decision 1}: {rationale}
- {Decision 2}: {rationale}

## Out of Scope

- {Items explicitly deferred to future Stories}

## Test Plan

- [ ] All Task PRs passed CI individually
- [ ] Integration across Tasks verified on Story branch
- [ ] {Additional verification items}
````

---

## Behavior

1. Detect current branch name and verify it matches `story/*` pattern
2. Extract Epic key, Story key, and description from branch name
3. Run `git log main..HEAD --merges --oneline` to list merged Task PRs
4. For each merge commit, extract the original PR number via `gh pr list --search` or commit message
5. If PR does not exist → create PR targeting `main` with `--reviewer "tyshgc"`
6. If PR already exists → update description with latest Task list
7. Never include unmerged Task branches in the Task list

---

## Next Action Rule

After PR creation:

→ **Human reviews the Story PR for cross-Task integration and overall coherence.**
→ After merge, run `/rdra:snapshot` and `/rdra:refine` to feed implementation learnings back to RDRA.
