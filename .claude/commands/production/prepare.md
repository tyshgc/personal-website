---
description: "Prepare Safe Slice, risk analysis, and implementation direction from an Epic (e.g. /production:prepare)"
---

# production:prepare

Prepare a production entry artifact from an approved Epic artifact.

This command is planning-only.
It does not implement, execute, or verify runtime behavior.

## Rules

### Execution Constraint Rule

- This command is documentation-only.
- The command MUST NOT execute any shell command.
- The command MUST NOT start development servers.
- The command MUST NOT run build, test, lint, or runtime verification processes.
- The command MUST only read repository files and generate or update documentation artifacts.
- If runtime validation seems useful, the command MUST instead ask the user explicitly before proposing any execution action.

### Input Rule

Read the approved Epic artifact first.

Primary input:

- `.claude/tmp/epics/[epic-file].md`

Optional supporting inputs:

- `docs/rdra/snapshots/main.md`
- `docs/rdra/snapshots/meta.json`
- related conventions under `.claude/conventions/`

If the Epic artifact is missing, stop and report that an Epic file under `.claude/tmp/epics/` is required.

The command MUST identify the latest Epic artifact under `.claude/tmp/epics/`
unless a specific file is explicitly provided by the user.

### Purpose

Transform the Epic artifact into a production entry artifact that:

- evaluates architectural execution risk in addition to structural readiness
- identifies unresolved blocking decisions and architecture risk clusters
- clarifies the safe implementation starting boundary to reduce human hesitation
- proposes a risk‑aware initial implementation direction (not a full task breakdown)
- highlights uncertainty zones that may impact implementation sequencing or domain integrity
- defines dependency‑aware sequencing guidance at a strategic level
- prepares focused input for implementation, critic, and documentation stages
- explicitly guides the human toward the single most appropriate next action

### Output Rule

Write the result to:

- `.claude/tmp/production/[epic-slug]/prepare.md`
- The epic slug MUST be derived from the Epic filename.
- The command MUST create the directory if it does not exist.
- Overwrite `prepare.md` if it already exists.

## Process

1. Locate and read the target Epic artifact under `.claude/tmp/epics/`.
2. Evaluate structural readiness and architectural execution risk.
3. Detect blocking decision points and group them into architecture risk clusters.
4. Identify uncertainty zones affecting domain model integrity, transaction boundaries, or external integrations.
5. Define the safe implementation starting boundary instead of full work package planning.
6. Identify high‑level sequencing constraints and possible safe parallelization windows.
7. Define what should be passed to implementation, critic, and documentation stages.
8. Write the production entry artifact.

## Readiness Criteria

Production can start only if all of the following are sufficiently present:

- Epic Summary
- RDRA Scope Reference
- Conceptual Flow
- Structural considerations
- Test viewpoints
- Architecture decision points or an explicit statement that none remain
- Story Projection section exists and defines at least one executable Story unit

If major blockers remain, do not fail silently.
Report them clearly in the output.

## Output Template

```template
# Production Prepare — [Epic Name]

## Source

- Epic: `.claude/tmp/epics/[epic-file].md`
- Snapshot: `docs/rdra/snapshots/main.md` (optional)

## Readiness Assessment

- Status: Ready | Conditionally Ready | Not Ready
- Summary: [short assessment]

## Blocking Decision Points

- [decision point or "None"]

## Architecture Risk Clusters

- [cluster name]: [short explanation]

## Non-Blocking Open Points

- [open point or "None"]

## Uncertainty Zones

- [area that may require exploration or spike]

## Safe Implementation Direction

### Initial Safe Slice

- Goal:
- Scope:
- Main concerns:
- Depends on:
- Parallel safety:

### Next Expansion Slice (Conditional)

- Preconditions:
- Scope:
- Architecture risks introduced:

## Risk‑Aware Sequencing Guidance

1. [high-level suggested step]
2. [high-level suggested step]

## Implementation Input

- [what implementation stage should receive]

## Critic Input

- [what critic stage should inspect]

## Documentation Input

- [what documentation stage should produce or update]

## Notes

- [important constraints, risks, or assumptions]

## What You Should Do Now

Follow the single most appropriate next action suggested below.
Do not attempt to perform multiple next steps simultaneously.

## Immediate Decisions Required

- [list blocking decision points or "None"]

## Safe Start Boundary

- [implementation area that is safe to start now]
- [implementation area that is NOT safe to start yet]

## Suggested Human Workflow

1. Read the Blocking Decision Points and Safe Start Boundary.
2. Decide whether to resolve decisions now with AI or take this document into refinement.
3. Record decisions directly in the Epic or in architecture notes.
4. Re-run `production:prepare` for the same epic to reduce uncertainty.

## Execution Gate Logic

- If Status = Ready, implementation planning may proceed.
- If Status = Conditionally Ready, resolve listed decisions or limit work to the Safe Start Boundary.
- If Status = Not Ready, return to Epic refinement or domain clarification.
```

## Command Intent Clarification

This command is an architecture risk detection and implementation‑entry guidance step.
It intentionally does NOT generate a full execution plan or task breakdown.
Its purpose is to reduce ambiguity and enable a confident first implementation move.

## Final Instruction

Start immediately.
Do not ask what to execute.
Do not propose repository scripts.
Do not ask broad exploratory questions.

If required input is missing, report the missing artifact explicitly.
Otherwise, generate `.claude/tmp/production/[epic-slug]/prepare.md` directly.
