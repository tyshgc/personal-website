---
description: "Generate implementation tasks from the Safe Slice in prepare.md (e.g. /production:task-plan)"
---

# production:task-plan

Generate a task-planning artifact from a prepared production artifact.

This command is documentation-only.
It does not implement code, execute shell commands, or validate runtime behavior.

## Purpose

- Translate only the Initial Safe Slice into implementation-ready task items.
- Identify task order, dependencies, and safe parallelization boundaries.
- Define concrete task scopes for backend, frontend, shared, and test-support concerns.
- Identify critic checkpoints that should be applied during or after implementation.
- Make deferred or out-of-scope areas explicit so over‑implementation does not occur.
- Tell the human clearly what to do next.

## Rules

### Execution Constraint

- Documentation-only command.
- MUST NOT execute shell commands.
- MUST NOT start servers or run build/test/lint.
- MUST only read repository files and generate/update documentation artifacts.

### Safe Slice Enforcement

- MUST plan implementation only for the Initial Safe Slice defined in `prepare.md`.
- MUST NOT generate work items for deferred, blocked, or out‑of‑scope areas.
- If the Safe Start Boundary is unclear, stop and report that `prepare.md` requires clarification.

### Input

Primary input:

- `.claude/tmp/production/{epic-slug}/prepare.md`

Optional supporting inputs:

- `.claude/tmp/epics/{epic-file}.md`
- `docs/rdra/snapshots/main.md`
- `docs/rdra/snapshots/meta.json`
- `.claude/conventions/`

If the required prepare artifact is missing, stop and report the requirement.

### CLI Guidance

- MUST present a short execution summary.
- MUST include:
  - Start with
  - If working in parallel
  - Do not implement yet
  - Next action
- MUST explicitly guide execution of `production:implement {work-item}` when safe.
- MUST NOT ask for confirmation when implementation can begin.

### Executable Specification Integration

- SHOULD generate Acceptance Criteria (Gherkin) per work item when observable behavior exists.
- MUST describe domain/application outcomes (not UI rendering).
- SHOULD attach domain scenarios to Test Support work items.
- If not possible, MUST state the reason.

### Attribute Coverage Matrix Rule

- When the Initial Safe Slice involves one or more RDRA information models or value models,
  the Task Plan MUST include an Attribute Coverage Matrix that maps every RDRA-defined
  attribute of those models to the Task(s) that deliver it, or to an explicit out-of-scope
  classification with a reason.
- The matrix MUST be sourced from `docs/rdra/snapshots/information-models.md` and/or
  `docs/rdra/snapshots/value-models.md`.
- Implicit omission of an attribute is forbidden. Every attribute defined in the referenced
  information/value model MUST appear in the matrix with exactly one of three
  classifications: `✓` (covered), `✗` (out of scope), or `?` (pending decision).
- Every `✗` entry MUST have a reason in the Notes column, chosen from:
  - **Data source unavailable**: required data source (DB schema, external API, storage)
    is not integrated yet
  - **Deferred to future Story**: intentionally postponed for priority or sequencing reasons
  - **Domain-irrelevant**: the attribute exists in RDRA but is not required for this product
- Every `?` entry MUST have a reason in the Notes column that describes:
  - what decision is pending
  - who should decide (human / stakeholder / architecture review)
  - what blocks the decision (missing information, unresolved architecture point, etc.)
- A `?` classification signals a planning risk: the Task Plan MUST list each `?` attribute
  in the Task Planning Risks section so it is not forgotten during execution.
- Leaving an attribute as `?` at implementation start is acceptable only if the Safe Slice
  can proceed without resolving it. Otherwise the decision must be escalated before
  implementation begins.
- When the Safe Slice does not involve information/value models (e.g. infrastructure-only,
  configuration-only), the matrix section MAY be omitted with an explicit note stating so.

### Domain Test‑First Ordering

- When domain modeling work exists, executable specification SHOULD be ordered first.
- If a test work item exists (e.g. T‑1), it MUST precede implementation (e.g. B‑1).
- Ordering MUST be reflected consistently in:
  - Ordering Guidance
  - Start With
  - Implementation Entry Hint
  - Immediate Next Action
- MUST NOT invent test‑first ordering if no executable specification exists.

## Process

1. Locate and read the target `.claude/tmp/production/[epic-slug]/prepare.md`.
2. Extract the Initial Safe Slice and the current Safe Start Boundary.
3. Confirm which areas are safe to implement now and which areas are deferred.
4. Convert only the safe slice into concrete implementation work items.
5. Separate work into backend, frontend, shared, and test-support scopes where appropriate.
6. Identify ordering constraints and safe parallelization boundaries inside the safe slice.
7. Define critic checkpoints for the risky areas identified in `prepare.md`.
8. Identify RDRA information models and value models touched by the Safe Slice, then
   build the Attribute Coverage Matrix by cross-referencing
   `docs/rdra/snapshots/information-models.md` and `docs/rdra/snapshots/value-models.md`.
   Every attribute MUST be classified as covered (`✓`), out of scope (`✗` with a reason),
   or pending decision (`?` with pending-decision context). Every `?` entry MUST also be
   echoed into Task Planning Risks.
9. Write the task-planning artifact.

### Domain Test-First Ordering Rule

- When the Initial Safe Slice contains domain modeling work (e.g. Aggregate, Domain Service, Policy, Value Object lifecycle),
  the command MUST prefer executable specification / domain tests as the first implementation step if such work items exist.
- If a Test Support work item defines executable specification (e.g. T‑1) for a domain work item (e.g. B‑1),
  the task ordering MUST place the test work item before the domain implementation work item.
- The command MUST reflect this ordering consistently in:
  - Ordering Guidance
  - Implementation Entry Hint
  - Start With
  - Immediate Next Action
  - Next Action Sentence
- The command MUST NOT recommend starting domain implementation first when executable specification work items are already defined.
- If domain implementation has already partially occurred, the command MAY recommend:
  - critic review first
  - then executable specification
  - then continuation of implementation.
- The command MUST NOT invent test‑first ordering if no executable specification work item exists.

## Readiness Criteria

Implementation planning can proceed only if all of the following are sufficiently present:

- Readiness Assessment exists
- Safe Implementation Direction exists
- Initial Safe Slice is defined
- Safe Start Boundary is defined
- Critical blocking decisions for the Initial Safe Slice are resolved or explicitly excluded from scope
- Deferred or blocked areas are distinguishable from the Initial Safe Slice

## Output Template

````template
# Production Task Plan — {Epic Name}

## Source

- Prepare: `.claude/tmp/production/{epic-slug}/prepare.md`
- Epic: `.claude/tmp/epics/{epic-file}.md` (optional)
- Snapshot: `docs/rdra/snapshots/main.md` (optional)

## Task Planning Target

- Target slice: {Initial Safe Slice name}
- Goal: {short goal}
- Scope boundary: {short boundary summary}

## Out of Scope for This Implementation Step

- {deferred area}
- {blocked area}

## Attribute Coverage Matrix

For each RDRA information model or value model touched by the Safe Slice, map every
defined attribute to the Task that delivers it, or mark it as out of scope with a reason.

Source: `docs/rdra/snapshots/information-models.md`, `docs/rdra/snapshots/value-models.md`.

Every attribute MUST appear with exactly one of `✓` (covered), `✗` (out of scope),
or `?` (pending decision). `✗` and `?` MUST have a reason in Notes.

### {Information Model / Value Model Name}

| RDRA Attribute | Task | Coverage | Notes |
| --- | --- | --- | --- |
| {attribute 1} | {task id} | ✓ | {short note, if any} |
| {attribute 2} | {task ids, comma-separated} | ✓ | {short note, if any} |
| {attribute 3} | (out of scope) | ✗ | Data source unavailable: {specific reason} |
| {attribute 4} | (out of scope) | ✗ | Deferred to future Story: {reason} |
| {attribute 5} | (out of scope) | ✗ | Domain-irrelevant: {reason} |
| {attribute 6} | (pending decision) | ? | Pending decision: {what decision is pending, who decides, what blocks it} |

### Classification of ✗ Entries

Allowed reasons for out-of-scope classification:

- **Data source unavailable**: required data source (DB schema, external API, storage)
  is not integrated yet
- **Deferred to future Story**: intentionally postponed for priority or sequencing reasons
- **Domain-irrelevant**: attribute exists in RDRA but is not required for this product

### Classification of ? Entries (Pending Decision)

Use `?` when the attribute cannot yet be firmly classified as `✓` or `✗`. The Notes column
MUST describe:

- what decision is pending (include, exclude, defer, reshape the attribute, etc.)
- who should decide (human / stakeholder / architecture review)
- what blocks the decision (missing information, unresolved architecture point, etc.)

Every `?` entry MUST also be echoed into **Task Planning Risks** so the pending decision
is not lost during execution.

If no information/value model is touched by the Safe Slice, replace this section with:

> _Not applicable: the Safe Slice does not touch any RDRA information/value model._

## Implementation Order

A numbered list that defines the exact sequence in which tasks should be implemented.
This order is authoritative for automated implementation pipelines (e.g. `production:implement`).

| # | Task ID | Title | Depends on | Parallelizable with |
|---|---------|-------|------------|---------------------|
| 1 | {id}    | {title} | —        | —                   |
| 2 | {id}    | {title} | 1        | —                   |
| 3 | {id}    | {title} | 1        | 2                   |
| ...| ...    | ...    | ...       | ...                 |

- The `#` column defines the implementation order.
- `Depends on` lists which `#` steps must be completed before this step can begin.
- `Parallelizable with` lists which `#` steps can safely run concurrently with this step.
- Automated pipelines MUST follow this order and MUST NOT skip steps.

## Task Items

Each work item MAY include an `Acceptance Criteria` block when executable behavior can be defined.

### Backend

1. {work item}

#### Acceptance Criteria

```gherkin
Feature: {short feature name}

  Scenario: {primary success case}
    Given {initial domain or system state}
    When {command / action occurs}
    Then {observable domain or system outcome}
```

2. {work item}

### Frontend

1. {work item}

#### Acceptance Criteria

```gherkin
Feature: {short feature name}

  Scenario: {primary success case}
    Given {initial domain or system state}
    When {command / action occurs}
    Then {observable domain or system outcome}
```

2. {work item}

### Shared / Cross-Cutting

1. {work item}

#### Acceptance Criteria

```gherkin
Feature: {short feature name}

  Scenario: {primary success case}
    Given {initial domain or system state}
    When {command / action occurs}
    Then {observable domain or system outcome}
```

2. {work item}

### Test Support

1. {work item}

#### Acceptance Criteria

```gherkin
Feature: {short feature name}

  Scenario: {primary success case}
    Given {initial domain or system state}
    When {command / action occurs}
    Then {observable domain or system outcome}
```

2. {work item}

## Ordering Guidance

1. {executable specification step — if domain modeling work item exists}
2. {first implementation step}
3. {second implementation step}
4. {next implementation step}
5. {first critic checkpoint timing}

- When Acceptance Criteria (Gherkin) exist for a work item, the ordering MUST prefer implementing or refining those executable specifications before or alongside production code.

## Safe Parallelization

- {what can run in parallel}
- {what must not run in parallel yet}

## Critic Checkpoints

- {checkpoint and what should be reviewed}

## Task Planning Risks

- {implementation-specific risk}

## Implementation Entry Hint

- Open first: {directory / module / file to open first}
- If domain modeling: prefer opening the test-support location first when executable specification exists
- Start by implementing: {first responsibility to implement}
- First completion target: {smallest coherent outcome}

## Start With

- {the first concrete implementation step to begin now}
- For domain modeling slices: this SHOULD normally be the executable specification work item
- Entry hint: {reference the concrete path / module / responsibility to open first}

## If Working in Parallel

- {additional safe work item that may be started simultaneously}
- {additional safe work item that may be started simultaneously}
- These are optional parallel starts, not required before beginning the Start With item.

## Immediate Next Action

- {single best next action, explicitly phrased so the human can either implement manually now or run `production:implement {work-item}` for AI-assisted implementation}

## Next Action Sentence

- {one direct imperative sentence in the form: "Next action: run production:implement {work-item} to start implementing {responsibility} from {path}."}

````

## Final Behavior Rule

- Always finish by telling the human the single most appropriate next action.
- If the Initial Safe Slice is ready, recommend starting implementation by opening the concrete entry point named in Implementation Entry Hint / Start With and implementing that responsibility first while staying strictly inside the safe slice.
- If task planning cannot proceed safely, recommend updating prepare.md first.
- Do NOT recommend another planning command when the artifact already supports safe implementation start.
- Do NOT present multiple equally weighted next steps without a recommendation.
- Keep the next-action guidance short and explicit.
- The next-action guidance MUST be phrased as a direct imperative sentence that tells the human exactly what to do next.
- If implementation can begin safely, recommend `production:implement {work-item}` explicitly as the default AI-assisted next step.
- The CLI summary MUST end with a direct Next action sentence that names the exact `production:implement {work-item}` command, the concrete path to start from, and the responsibility to implement first.

## Final Instruction

Start immediately.
Do not ask what to execute.
Do not propose repository scripts.
Do not ask broad exploratory questions.
Always finish by telling the human the most appropriate next action.
Also provide a short CLI execution summary using Start with / If working in parallel / Do not implement yet / Next action.
Do not generate implementation tasks beyond the Initial Safe Slice.
When implementation can begin safely, explicitly tell the human what to open first and what to implement first.
Also end the CLI summary with one direct Next action sentence that names the exact `production:implement {work-item}` command, the concrete path to start from, and the responsibility to implement first.
