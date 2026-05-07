---
description: "Implement a single work item from the task-plan (e.g. /production:implement B-1)"
---

# production:implement

Execute implementation for a single approved work item from the task-plan artifact.

This command is implementation-oriented.
It may modify source files, configuration files, migrations, and tests inside the approved safe scope.

## Rules

### Input Rule

Primary inputs:

- `.claude/tmp/production/{epic-slug}/task-plan.md`
- a specific work item identifier, such as `B-1`, `S-1`, or `F-1`

Optional supporting inputs:

- `.claude/tmp/production/{epic-slug}/prepare.md`
- `.claude/tmp/epics/{epic-file}.md`
- `docs/rdra/snapshots/main.md`
- related conventions under `.claude/conventions/`
- ".claude/conventions/backend/functional-domain-driven-design.md" for domain-related work items
- existing repository implementation files

The command MUST identify the latest task-plan artifact under `.claude/tmp/production/`
unless a specific epic is explicitly provided by the user.

If the task-plan artifact is missing, stop and report that a task-plan artifact is required.
If the target work item is missing, stop and report that a concrete work item identifier is required.

### Work Item Scope Rule

- The command MUST implement only the single specified work item.
- The command MUST read `Out of Scope for This Implementation Step` and `Do Not Implement Yet` and respect them strictly.
- The command MUST NOT implement adjacent work items unless they are strictly required for coherence of the specified work item.
- If coherence requires touching another area, the command MUST keep the change minimal and explain why.

### Safe Slice Enforcement Rule

- The command MUST stay inside the Initial Safe Slice defined in `prepare.md` and `task-plan.md`.
- The command MUST NOT implement deferred, blocked, or future-slice concerns.
- If the requested work item conflicts with the Safe Start Boundary, the command MUST stop and report the conflict.

### Execution Behavior Rule

- The command MUST begin by reading the task-plan artifact and locating the specified work item.
- The command MUST use the `Implementation Entry Hint`, `Start With`, and `Why This Next Action` sections when available.
- The command MUST implement the smallest coherent code change that completes the specified work item.
- The command MUST preserve DDD, FSD, and project-specific conventions.
- For domain-related work items, the command MUST follow ".claude/conventions/backend/functional-domain-driven-design.md".
- The command MUST stop and report blockers instead of improvising structural shortcuts.

### Runtime Safety Rule

- The command MUST NOT run dev servers.
- The command MUST NOT run broad exploratory commands.
- The command MUST NOT run build, test, or lint automatically unless the user explicitly asks for verification.
- The command MAY inspect existing files and project structure as needed for safe implementation.

## Purpose

- execute a single approved work item from the task-plan artifact
- translate the selected work item into coherent repository changes
- preserve safe-slice boundaries and architectural constraints
- preserve FDDD modeling constraints for domain-related work items
- keep execution narrow enough that the human can review progress incrementally
- tell the human clearly what was changed and what to do next

## Process

1. Locate and read the target `.claude/tmp/production/{epic-slug}/task-plan.md`.
2. Locate the specified work item.
3. Confirm the implementation boundary using `Out of Scope for This Implementation Step` and `Do Not Implement Yet`.
4. Read the minimum relevant repository files.
5. Implement the specified work item with the minimum coherent code change.
6. Summarize changed files, key design decisions made during implementation, and any blocker or residual risk.

## Output Expectations

After implementation, the command should provide:

- a short summary of what was implemented
- the files changed
- any important constraint respected
- any blocker or follow-up item discovered
- the single most appropriate next action

## Auto Commit and Push Rule

After successful implementation, the command MUST automatically commit and push:

1. Stage changed files (specific files only, not `git add -A`)
1. Commit with message: `implement: {task-id} {short-description}` + Co-Authored-By trailer
1. Push to the current branch

Rules:
- Do NOT commit files that contain secrets (.env, credentials, .pem)
- If pre-commit hooks fail, fix the issue and create a new commit
- If push fails, report the error and stop
- The human reviews the code on the PR, not at commit time

## Final Behavior Rule

- If implementation succeeds, clearly state that the specified work item was implemented.
- For domain-related work items, clearly state whether the implementation remained aligned with the FDDD convention.
- If implementation is partial, clearly state what remains.
- If blocked, clearly state why implementation stopped.
- Always finish by telling the human the single most appropriate next action.
- The next action MUST be short, explicit, and actionable.
- The next action MUST NOT suggest another planning command unless the work item cannot be safely executed.

## Final Instruction

Start immediately.
Do not ask what to execute if the work item identifier is already given.
Do not propose repository scripts.
Do not ask broad exploratory questions.
Implement only the specified work item.
Do not go beyond the Initial Safe Slice.
When implementation completes, auto-commit and push, then summarize the changes and give one direct Next action sentence.
