---
description: "Review a work item for scope, convention conformance, and risks (e.g. /production:critic B-1)"
---

# Production Critic — Implementation Review

## Purpose

Review the implementation result of a specific Production Work Item and evaluate whether it:

- Conforms to the approved `task-plan`
- Respects scope boundaries
- Follows domain / architecture conventions (e.g. FDDD)
- Is safe for the next step (test / integration / next slice)

This command **does NOT implement or refactor code**.
It only performs structured evaluation and produces a clear judgment.

---

## Required Input

- Target Work Item ID (e.g. `B-1`, `F-3`, `S-1`)
- Related task-plan document path
- Implementation diff / changed files

If the Work Item cannot be identified → stop and report.

---

## Review Dimensions

### 1. Scope Conformance

- Does the implementation stay strictly inside the Work Item scope?
- Are any out-of-scope capabilities introduced?
- Are any required elements missing?

### 2. Convention Conformance

Check alignment with Functional Domain Driven Design conventions:

- Domain state is immutable data
- Behaviour is expressed via decision functions
- Events are explicit discriminated unions
- Apply functions are pure state transitions
- Repository is interface-only in domain layer
- No infrastructure leakage into domain

### 3. Structural Quality

- File placement matches architecture boundaries
- Naming aligns with RDRA / Event Storming / task-plan language
- Public API exposure is intentional and minimal

### 4. Risk Detection

Identify risks such as:

- Hidden coupling
- premature generalization
- incorrect lifecycle modelling
- inconsistent event semantics

### 5. Readiness Judgment

Provide one of:

- PASS — safe to continue
- PASS WITH NOTES — continue but record risks
- REWORK REQUIRED — must fix before next step

---

## Output Format

Produce:

- Short summary of what was reviewed
- Judgment (PASS / PASS WITH NOTES / REWORK REQUIRED)
- Structured findings list (see below)
- One direct Next Action sentence

### Findings Format

Each finding that requires a code change MUST be tagged with `[FIX]` and structured as follows:

```template
### [FIX] {title}

- **Category**: scope | convention | structure | risk
- **Severity**: must-fix | should-fix
- **Location**: {file path}:{line range}
- **Description**: {what is wrong and why}
- **Suggested Fix**: {concrete recommended action}
```

Findings that are informational only (no code change needed) use `[NOTE]` instead of `[FIX]`.

### Next Action Guidance

When the judgment is **PASS WITH NOTES** or **REWORK REQUIRED** and `[FIX]` findings exist:

```template
## Next Action

[FIX] が {count} 件あります。対応方法を選んでください:

A. ローカルで即座に修正する（軽微な修正・すぐ対応可能な場合）
   → 修正内容を指示してください。この場で修正 → commit → push します。

B. GitHub Issues に登録して追跡する（複数の修正・後で対応したい場合）
   → /agile:critic-issues
```

When the judgment is **PASS**:

```template
## Next Action

Implementation is ready for the next step.
```

---

## Behavior Rules

- Do not generate implementation tasks.
- Do not redesign the slice.
- Do not expand scope.
- Focus only on the evaluated Work Item.
- Be decisive — avoid vague language.

---

## Final Instruction

Start review immediately once inputs are available.
If inputs are incomplete, report what is missing and stop.
