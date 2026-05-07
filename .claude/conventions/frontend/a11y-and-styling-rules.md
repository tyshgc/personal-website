# Frontend a11y / styling implementation rules (Edge DevTools axe compliance)

Microsoft Edge DevTools' axe inspector and the `no-inline-styles` rule perform **static JSX analysis that does not understand React's SyntheticEvents or props abstraction**, so they often raise warnings on code that is correct in the actual DOM. This document is a set of rules for implementing correct a11y / styling without triggering those warnings.

When implementing new disclosure / select / dropdown / dialog / list / form etc. UI, **review this document before starting**.

---

## 1. ARIA boolean / enum attributes must be written as **literal `"true"` / `"false"`**

Targets: `aria-expanded` / `aria-selected` / `aria-pressed` / `aria-checked` / `aria-invalid` / `aria-busy` / `aria-disabled` / `aria-hidden` etc.

axe treats `aria-expanded={expr}`, `aria-expanded={expr ? "true" : "false"}`, and `{...spread}` propagation all as the invalid value `aria-expanded="{expression}"`.

```tsx
// Bad
<button aria-expanded={open}>...</button>
<button aria-expanded={open ? "true" : "false"}>...</button>

// Good — branch the element itself based on state
{open ? (
  <button aria-expanded="true" {...rest}>...</button>
) : (
  <button aria-expanded="false" {...rest}>...</button>
)}
```

---

## 2. Related ARIA components (listbox / option, tablist / tab, etc.) must be **inlined as literals in the same file**

axe's static JSX analysis verifies "a `role="option"` exists as a descendant of `role="listbox"`" and "a `role="listbox"` exists as an ancestor of `role="option"`". If you extract Option into a separate component, both sides will warn.

Targets: parent/child ARIA pairs such as listbox / option, tablist / tab / tabpanel, menu / menuitem, tree / treeitem, radiogroup / radio.

```tsx
// Bad — Option rendered as a separate component
<div role="listbox">
  {items.map((item) => <Option key={item.id} item={item} />)}
</div>

// Good — inlined as literals (branch the element to use literal "true" / "false")
<div role="listbox" aria-label="Candidates">
  {items.map((item) =>
    isSelected ? (
      <div key={item.id} role="option" aria-selected="true" ...>
        ...
      </div>
    ) : (
      <div key={item.id} role="option" aria-selected="false" ...>
        ...
      </div>
    ),
  )}
</div>
```

When the JSX gets complex, **inline render functions** (without a component call) are acceptable. Exporting helper components is forbidden.

---

## 3. Roles that require a name (`role="listbox"`, `role="dialog"` etc.) must have **`aria-label` (or `aria-labelledby`)**

axe `label` rule. Applies to listbox / dialog / region / form / search / banner / complementary / contentinfo / main / navigation / nav etc.

```tsx
// Bad
<div role="listbox">...</div>

// Good
<div role="listbox" aria-label="Candidates">...</div>
// or
<div role="listbox" aria-labelledby={triggerId}>...</div>
```

For Dialog, use the pattern where the Title registers an id and binds it to `aria-labelledby` via context (see `apps/pwa/src/shared/ui/dialog/`).

---

## 4. Forbid nested-interactive elements

Do not place interactive elements (`<button>`, `role="button"`, `<a>`, `<input>` etc.) inside a `<button>`. The same applies to placing a button inside `<li role="option">`.

```tsx
// Bad
<button>
  <span role="button" onClick={...}>×</span>
</button>

// Good — overlay as a sibling
<div className="relative">
  <button>...</button>
  <button className="absolute right-2" aria-label="...">×</button>
</div>
```

For option / menuitem / treeitem etc., make the element itself operable with **`tabIndex={0}` + `onClick` + `onKeyDown` (Enter/Space)** instead of placing a button inside.

---

## 5. Decorative SVG (lucide-react / inline SVG) needs **`aria-hidden="true"`**

Required when an icon inside a button or link only carries visual meaning and does not need to be read by a screen reader.

```tsx
<button aria-label="Close">
  <X aria-hidden="true" className="h-4 w-4" />
</button>
```

---

## 6. button discernible text

axe `button-name` rule. For dynamic text or icon-only buttons, axe treats the button as empty and warns.

```tsx
// Bad — text is an expression, axe cannot read it
<button>
  <span>{label ?? placeholder}</span>
</button>

// Good — combine with aria-label
<button aria-label={ariaLabel}>
  <span>{label ?? placeholder}</span>
</button>
```

Design the prop signature so callers must pass a literal `aria-label` (e.g., the `ariaLabel` required prop on the combobox `Trigger.tsx`).

---

## 7. `role="combobox"` requires `aria-controls` / `aria-expanded` / `aria-haspopup`

```tsx
{open ? (
  <button role="combobox" aria-haspopup="listbox" aria-controls={listboxId} aria-expanded="true">...</button>
) : (
  <button role="combobox" aria-haspopup="listbox" aria-controls={listboxId} aria-expanded="false">...</button>
)}
```

Generate the listbox id with `useId()`, and ensure the trigger's `aria-controls` matches the listbox's `id`.

---

## 8. **Do not write inline `style={...}`** — apply runtime values imperatively via `ref` + `useLayoutEffect`

axe `no-inline-styles` rule. `style={{...}}` is flagged regardless of whether the value is static or dynamic.

### Static case

Use Tailwind class names.

```tsx
// Bad
<div style={{ position: "fixed", margin: 0 }}>...</div>

// Good
<div className="fixed m-0">...</div>
```

### Dynamic case (runtime values needed for positioning, etc.)

Apply values imperatively to `element.style` via `ref` + `useLayoutEffect`. Do not write a `style` attribute in JSX.

```tsx
// Bad — inline style with runtime values
<div style={{ top: pos.top, left: pos.left }}>...</div>

// Good — apply imperatively via ref
const ref = useRef<HTMLDivElement>(null)
useLayoutEffect(() => {
  const el = ref.current
  if (!el) return
  el.style.top = `${pos.top}px`
  el.style.left = `${pos.left}px`
}, [pos])
return <div ref={ref} className="fixed">...</div>
```

`useLayoutEffect` runs synchronously before paint, so the first render does not flash at 0,0.

Reference implementation: `apps/pwa/src/shared/ui/combobox/Popup.tsx`

---

## 9. Declare modern browser targets explicitly via browserslist (both files are required)

When using newer Web standard APIs such as `Element.prototype.popover`, Edge Tools' `compat-api/html` warning fires (e.g. `'div[popover]' is not supported by Chrome < 114, Safari on iOS < 17`).

The Edge DevTools compat-api warning is driven by **webhint**, which does not read the `browserslist` field in `package.json`. You must declare the target in **`.hintrc`** at the repo root.

### Two files to configure

**`.hintrc` (repo root)** — for Edge DevTools / webhint:

```json
{
  "extends": ["development"],
  "browserslist": [
    "Chrome >= 114",
    "Edge >= 114",
    "Firefox >= 125",
    "Safari >= 17",
    "iOS >= 17"
  ]
}
```

**`apps/pwa/package.json` (or `apps/admin/package.json`)** — for Vite / autoprefixer / build tools:

```json
{
  "browserslist": [
    "Chrome >= 114",
    "Edge >= 114",
    "Firefox >= 125",
    "Safari >= 17",
    "iOS >= 17"
  ]
}
```

Both are required. With only `.hintrc`, the build cannot decide on polyfills. With only `package.json`, Edge DevTools keeps warning against an outdated baseline.

When adopting a new API, review and bump the minimum versions in both files as needed.

---

## Past incidents (rationale for this convention)

- 2026-05-03: Initial PWA combobox implementation triggered warnings matching all of rules 1, 4, 5, 6, 7
- 2026-05-03: During the Compound Pattern refactor, Option was extracted to a separate component, violating rule 2 (axe could not analyze the listbox/option relationship)
- 2026-05-04: Popup's inline style violated rule 8; adopting popover violated rule 9

---

## Related memory

- `feedback_aria_boolean_string.md` (a11y implementation rules with timeline of past incidents)
- `feedback_no_ambiguous_term.md`, `feedback_phase_is_long_span.md` (discussion / communication conventions)
