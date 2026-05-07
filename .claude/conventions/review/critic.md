---
name: prd-critic
description: This skill provides guidelines and best practices for evaluating code and documents implemented based on a PRD (Product Requirements Document). A PRD is a document that clearly defines product features, requirements, user stories, and more within the product development process. This skill provides procedures and considerations for assessing whether the implementation conforms to the PRD content and meets quality standards.
---

# Production Critic Skill

## Purpose

Evaluate implementation outputs against the active architectural and domain conventions.

This skill ensures that generated or human‑written implementations conform to:

- Functional Domain‑Driven Design (FDDD) conventions
- RDRA scope boundaries
- Task‑plan implementation scope
- Structural and layering constraints
- Import resolution and bundling conventions

The critic MUST focus on **structural correctness and convention conformance**, not stylistic preferences.

---

## FDDD Conformance Review

When the work item belongs to the **domain layer**, the critic MUST verify:

- Domain state is modeled as **immutable plain data (readonly types / value objects)**
- No class‑based entities or mutation‑centric lifecycle logic is introduced
- Behaviour is expressed via **decision functions (decide\*)**
- State transitions are applied via **pure apply functions (apply\*)**
- Domain events are modeled as **discriminated unions**
- Commands are explicit domain input types
- Repository definitions are **interface‑only inside the domain package**
- No infrastructure or framework concepts leak into domain types

If violations are detected, the critic MUST:

- Explicitly name the violated convention
- Explain architectural impact
- Suggest the minimal corrective direction

---

## Executable Specification Review (Tests)

The critic MUST evaluate whether tests:

- Express domain behaviour as **executable specification**
- Cover invariant enforcement and allowed transitions
- Avoid implementation‑detail coupling
- Reflect the decision → event → apply lifecycle

Missing behavioural coverage should be reported as **risk**, not failure, unless it blocks safe evolution.

---

## Import Resolution Convention Review

For repository source files that are intended to be **bundled (frontend or backend)**:

- Relative imports MUST be **extensionless**
  - Correct: `./account.types`
  - Incorrect: `./account.types.js` or `./account.types.ts`

The critic MUST flag extension‑based relative imports as:

> Runtime‑oriented resolution leakage into bundled source design.

This is considered a **structural convention violation**, not merely stylistic.

---

## Scope Boundary Enforcement

The critic MUST verify that the implementation:

- Does not include features marked _Out of Scope_ in task‑plan
- Does not prematurely implement future slices
- Does not introduce cross‑context behaviour
- Does not solve unresolved architectural decisions implicitly

If detected, mark as:

> Scope Drift Risk

---

## Judgment Format

The critic output MUST follow:

- Judgment: PASS / PASS WITH NOTES / FAIL
- Scope Conformance
- Convention Conformance
- Structural Quality
- Risk Detection
- Findings
- Next Action

The critic MUST always end with **one clear next action** aligned with the production flow.
