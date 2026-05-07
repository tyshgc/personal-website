# Frontend Feature-Sliced Design Convention

## Purpose

This document defines the project-specific Feature-Sliced Design convention for frontend development.
It is a human-defined implementation convention, not a generated artifact.

This convention exists to:

- keep frontend structure predictable
- reduce ambiguity in Claude Code and human implementation
- adapt general FSD ideas to project-specific practical needs

## Position

This document is a local convention.
It may intentionally differ from common community examples of Feature-Sliced Design.

When general FSD guidance conflicts with this document,
this document must win for this project.

## Scope

This document defines:

- layer usage expectations
- slice and sub-slice rules
- segment naming rules
- `model` and `hooks` separation rules
- `utils` usage rules

This document does NOT define:

- detailed UI design rules
- backend architecture rules
- domain modeling rules outside frontend implementation

## Base FSD Layers

The frontend should use the following layers as needed:

- `app`
- `pages`
- `widgets`
- `features`
- `entities`
- `shared`

### Layer Intent

- `app`: application bootstrap, providers, routing, top-level configuration
- `pages`: route-level composition
- `widgets`: large UI composition blocks used by pages
- `features`: user-meaningful interactions and actions
- `entities`: domain object presentation and related frontend behavior
- `shared`: reusable technical and UI foundations

### Practical Boundary Rules (widgets / features / entities)

To reduce ambiguity when choosing between these layers:

- `widgets` must NOT contain domain decision logic.
- `widgets` are either:
  - compositions of multiple `features` and/or `entities`, or
  - explicitly layout-oriented blocks (structural UI sections).

- `features` should be defined by user actions or system capabilities.
  RDRA System Use Cases (SUC) are recommended as a primary reference.
  Do NOT define `features` purely by screen boundaries.

- `entities` represent shared domain-facing frontend building blocks.
  They may include:
  - reusable entity UI parts
  - value-object-like logic
  - shared validation logic
  - entity-related state helpers

`entities` should support `features`, not replace them.

## Slice Rules

### Standard Rule

A slice should represent a meaningful frontend responsibility.
Do NOT create slices only because files increase.

Create a slice only when at least one of the following is true:

- the responsibility has a distinct user-facing purpose
- the responsibility changes independently
- the responsibility has its own state or interaction logic
- separating it improves readability of boundaries

### Slice Naming (Verb-Based)

Slice names must describe behavior (a verb / use case), not UI shape.
UI-shape names like `detail` / `list` / `form` describe how something LOOKS,
not what it DOES. Verb-based names align with the Practical Boundary Rule
above (slices are defined by RDRA System Use Cases / user actions).

#### Good examples

- `features/account-reports/view-detail` (see detail)
- `features/account-reports/view-list` (see list)
- `features/account-reports/update-status` (change status)
- `features/session-record/create`
- `features/session-record/edit`

#### Bad examples

- `features/account-reports/detail` — UI shape, behavior unreadable
- `features/account-reports/list` — same
- `features/account-reports/form` — behavior ambiguous (create? edit?)

#### One Screen, Multiple Slices

A single screen may compose multiple SUCs. When that happens, split each SUC
into its own sibling slice instead of bundling them under one UI-shape slice.

Example: a report detail screen that also allows status change.

- `features/account-reports/view-detail` — read-only view of the report
- `features/account-reports/update-status` — status change use case

Compose them at the route (`pages` / route file) layer via slots, not by
importing one feature slice from another. Cross-feature imports violate
FSD isolation and are discouraged.

### Sub-Slice Rule

Sub-slices are allowed.
However, they are restricted to improve readability.

Rules:

- sub-slices may be used only when a slice contains clearly separable internal responsibilities
- maximum nesting depth is 2 levels inside a slice
- sub-slices must represent responsibility boundaries, not arbitrary file grouping
- if deeper nesting feels necessary, reconsider the parent slice design

#### Acceptable Example

- `features/session-record/create`
- `features/session-record/edit`

#### Unacceptable Direction

- deeply nested trees created only for file count reduction
- grouping by implementation detail instead of responsibility

## Segment Rules

### Preferred Segments

Use only the segments that are structurally necessary.
Typical examples include:

- `ui`
- `model`
- `hooks`
- `api`
- `utils`
- `config`
- `types`

Do NOT introduce segments mechanically.
If a segment has no clear responsibility, do not create it.

### model and types Pragmatic Rule

In many real frontend codebases, `model` effectively degenerates into `types` only.
This project allows two operating modes:

- Strict mode (AI-heavy implementation):
  - keep `model` and `types` separated
  - `model` contains behavior-oriented pure functions
  - `types` contains structural type definitions only

- Pragmatic mode (human-heavy implementation):
  - it is acceptable to colocate types inside `model`
  - avoid creating an empty or purely formal `types` segment

Choose the mode intentionally per slice.
Avoid mechanical directory creation.

### utils over lib

This project prefers `utils` instead of `lib`.

Reason:

- `lib` tends to become a vague catch-all directory
- `utils` more clearly implies implementation support helpers
- it improves predictability for both humans and AI

#### utils Rules

`utils` should contain only narrow supporting logic such as:

- pure transformation functions
- formatting helpers
- mapping helpers
- parsing helpers
- small local calculation helpers

`utils` must NOT contain:

- stateful logic
- React hooks
- API communication
- business rules that define the main responsibility of the slice
- broad utility dumping grounds

If logic grows important enough to shape behavior or state ownership,
it should move to `model`, `hooks`, or another clearer segment.

## model and hooks Separation

This project does NOT place React hooks inside `model` by default.

### model

`model` should contain frontend state and behavior logic such as:

- state definitions
- reducers or state transitions
- selectors
- derived state logic
- action-level state manipulation
- non-hook frontend behavior logic

### hooks

`hooks` should contain React-specific usage entry points such as:

- `useXxxForm`
- `useXxxController`
- `useXxxFilters`
- `useXxxEffects`
- React integration logic around model or UI behavior

### Separation Rule

Use `hooks` when the logic:

- depends on React hook lifecycle
- coordinates UI usage of state and effects
- is primarily consumed through `use...` APIs

Use `model` when the logic:

- expresses slice behavior or state ownership
- should stay understandable without React component usage details
- is not primarily a hook-oriented interface

Do NOT use `model` as a mixed directory for all state, hook, and UI coordination logic.

## Segment Responsibility Guidance

### ui

Use for presentational and interaction components belonging to the slice.
Keep components close to the responsibility they serve.

#### shared/ui Component Structure

Components in the `shared` layer's `ui` segment must be organized by component group (slice),
not placed flat.

```text
shared/
  ui/
    buttons/
      Button.tsx
      index.ts
    cards/
      Card.tsx
      index.ts
    inputs/
      Input.tsx
      index.ts
```

Do NOT place components flat like `shared/ui/button.tsx`.

#### Cross-App Shared UI

UI components reusable across multiple apps (e.g. PWA and Admin) must be placed in
`packages/shared/src/ui/`, not in app-local `src/shared/ui/`.

App-local `apps/{app}/src/shared/ui/` is the correct location for components that are
specific to one app's context. For example, admin-only data tables, filters, and empty
states belong in `apps/admin/src/shared/ui/`, not in `packages/shared/src/ui/`.
This prevents leaking app-specific UI concerns to unrelated apps.

#### Compound Pattern (required for packages/shared)

When a component in `packages/shared` has sub-components (e.g. Card with Header, Content, Footer),
this project **requires** the Compound Pattern for namespace-based composition.

App-local components (e.g. `apps/pwa/src/shared/ui/`) should be migrated to Compound Pattern
when they are next modified or moved to `packages/shared`. Existing app-local named exports
(e.g. `CardHeader`) are tolerated until migration.

Required usage:

```tsx
<Card>
  <Card.Header>...</Card.Header>
  <Card.Content>...</Card.Content>
  <Card.Footer>...</Card.Footer>
</Card>
```

This improves:

- readability through explicit semantic structure
- code organization by co-locating related sub-components
- discoverability via IDE auto-completion on the namespace

##### File Structure

Each sub-component MUST be in its own file. The assembly file (`Card.tsx`) only
imports and composes them via `Object.assign`.

```text
cards/
  Root.tsx        # root wrapper component
  Header.tsx      # layout wrapper
  Title.tsx       # parts
  Description.tsx # parts
  Action.tsx      # parts
  Content.tsx     # layout wrapper
  Footer.tsx      # layout wrapper
  Card.tsx        # compound assembly (Object.assign)
  index.ts        # public export
```

##### Implementation

Use `Object.assign` to attach sub-components to the root component.
The root component function is named `Root` (not `CardRoot`).

```tsx
// Root.tsx
export function Root({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("...", className)} {...props} />;
}

// Header.tsx
export function Header({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("...", className)} {...props} />;
}

// Card.tsx (assembly)
import { Root } from "./Root"
import { Header } from "./Header"

export const Card = Object.assign(Root, {
  Header,
  Content,
  Footer,
});
```

##### Context API in Compound Pattern

When sub-components need to share state (e.g. open/closed, variant, disabled),
the Root component should provide a React Context:

```tsx
// context.ts
import { createContext, useContext } from "react"

type CardContextValue = {
  readonly variant: "default" | "bordered"
}

const CardContext = createContext<CardContextValue | null>(null)

export const CardProvider = CardContext.Provider

export function useCardContext(): CardContextValue {
  const ctx = useContext(CardContext)
  if (!ctx) throw new Error("Card sub-component must be used within <Card>")
  return ctx
}
```

Rules for Context usage:
- Create a `context.ts` file within the component directory
- The Root component wraps children with the Provider
- Sub-components consume via a custom hook (`useCardContext`)
- Context is optional — only add when sub-components need shared state
- Do NOT add Context preemptively. Add it when the first use case arises.

##### Polymorphic `as` Prop

Sub-components that may need different HTML elements depending on context
(e.g. `<section>` vs `<div>`, `<header>` vs `<div>`, `<h1>` vs `<h2>`)
should accept an `as` prop using TypeScript generics:

```tsx
type TitleProps<T extends React.ElementType = "h1"> = {
  as?: T
} & React.ComponentProps<T>

export function Title<T extends React.ElementType = "h1">({
  as,
  className,
  ...props
}: TitleProps<T>) {
  const Comp = as ?? "h1"
  return <Comp className={cn("...", className)} {...props} />
}
```

Usage: `<Card.Title as="h2">...` or `<Card as="div">...`

Apply `as` prop to structural wrappers (Root, Header, Footer, Title) where
the semantic element varies by usage context. Pure presentational parts
(Content, Description, Action) typically stay as `div`.

##### Rules

- Sub-component function names MUST be short (`Header`, not `CardHeader`).
  The namespace provides context (`Card.Header`).
- The root component function MUST be named `Root`.
- Each sub-component MUST be in its own file.
- The assembly file (`Card.tsx`) only imports and composes via `Object.assign`.
- The index file exports only the compound object: `export { Card } from "./Card";`
- Do NOT export sub-components individually (e.g. `CardHeader`, `CardContent`).
  Consumers always access them via the namespace.
- When adding shadcn/ui components, immediately convert to Compound Pattern.
  Do NOT leave flat named exports (e.g. `CardHeader`) as-is.

##### When to apply

Apply Compound Pattern when a component has **2 or more** sub-components that
form a structural relationship (e.g. layout wrappers, semantic parts).

Do NOT apply to single-purpose components without sub-components (e.g. `Button`, `Input`, `Label`).

#### Variant Organization

When a component has multiple visual styles, define them as variants
using `class-variance-authority` (cva) or equivalent.

Keep variant definitions co-located with the component.
Do NOT scatter style variations across separate files.

### api

Use for slice-local transport and request adaptation logic such as:

- endpoint wrappers
- request builders
- response mappers
- error normalization

If a code generator (e.g. OpenAPI / orval) already produces React hooks,
API interaction may live primarily inside `hooks`.

In such cases:

- do NOT artificially duplicate an `api` segment
- keep transport details close to the generated hook usage boundary
- NEVER treat raw request/response DTOs as `model`

### types

Use only when types are local to the slice and improve clarity.
Avoid empty or purely mechanical `types` segments.

### config

Use only for slice-local configuration that is stable and clearly scoped.
Do not hide business logic in configuration files.

Constants may be colocated here when they represent stable configuration-like values.
However, purely textual templates or small UI literals may instead live in a `constants` file
inside the slice when that improves readability.
Avoid over-centralizing trivial strings.

## Dependency Direction

Follow normal FSD dependency direction.
Higher-level layers may depend on lower-level layers.
Lower-level layers must not depend on higher-level layers.

When in doubt:

- `pages` may use `widgets`, `features`, `entities`, `shared`
- `widgets` may use `features`, `entities`, `shared`
- `features` may use `entities`, `shared`
- `entities` may use `shared`
- `shared` must not depend on upper layers

## Practical Decision Rules

When implementing frontend structure, prefer the following order of judgment:

1. responsibility clarity
2. future readability
3. predictable dependency direction
4. minimal necessary segmentation
5. community convention only when not conflicting with this document

## Convention Enforcement

This document must be treated as a primary structural convention for all frontend implementation.

- Planning agents must read this document before proposing frontend task decomposition.
- Implementation agents must follow this document before applying generic Feature‑Sliced Design examples.
- Review agents must validate structure against this document.

If any generated or human‑written frontend structure conflicts with this convention,
this convention takes precedence unless an explicit architectural decision record states otherwise.

This document is intended to reduce structural drift during AI‑assisted development.

## Guidance for Claude Code and Other AI Implementers

When generating or editing frontend code for this project:

- follow this document before generic FSD examples
- allow sub-slices, but never beyond 2 levels
- prefer `utils` over `lib`
- separate `hooks` from `model`
- do not create directories mechanically
- prefer responsibility-driven structure over pattern imitation

## Review Heuristics

A frontend structure is likely wrong when:

- `lib` appears instead of `utils`
- `model` contains many React hooks
- slices are nested too deeply
- segments exist without real responsibility
- a directory structure exists only because "FSD usually does this"
- boundaries are based on file volume rather than meaning
- slice names are UI shapes (`detail`, `list`, `form`) instead of verbs / SUCs
- one slice bundles multiple SUCs (e.g. a `detail` slice that also handles
  update actions) instead of splitting into sibling verb-based slices

## Change Policy

This convention may evolve.
However, changes should be made intentionally and applied consistently.

Do NOT casually mix multiple FSD interpretations in the same project.
