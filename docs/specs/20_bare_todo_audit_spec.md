# Bare `// TODO:` Audit

## TL;DR

CLAUDE.md "Conventions" rule: every `TODO` needs an issue link, version marker (`FIXME(v2)`), or removal date. Bare `// TODO:` rots into ambiguity.

Audit: **1 bare TODO** in the entire codebase — `app/(admin)/billing/[id].tsx:102`. Either fix the underlying functionality (waive late fee mutation) or convert the TODO to a versioned `FIXME(v2)` marker.

**Trivial spec.** ~5 minutes of work.

## Agent prompt

```
Implement docs/specs/20_bare_todo_audit_spec.md exactly.

One bare TODO in the codebase:
  app/(admin)/billing/[id].tsx:102 — `// TODO: implement waive late
  fee mutation`

Apply Option B (recommended): change to `// FIXME(v2): implement
waive late fee mutation`. Don't build the feature in this spec.

Verify section 5 acceptance:
  grep -rEn "^\s*//\s*TODO[^\(]" app/ components/ lib/ hooks/ types/
  → must return empty.

~2 min. Do NOT commit.

After verification passes, mark this spec done:
  git mv docs/specs/20_bare_todo_audit_spec.md docs/specs/20_DONE_bare_todo_audit_spec.md
```

---

## 1. Audit result

```bash
grep -rEn "^\\s*//\\s*TODO[^\\(]" app/ components/ lib/ hooks/ types/
```

Hit:
- `app/(admin)/billing/[id].tsx:102` — `// TODO: implement waive late fee mutation`

## 2. Action

Two options for the single hit:

### Option A — implement the feature
Build the `waiveLateFee` mutation:
- New API helper in `lib/api/bills.ts` (set `late_fee = 0` and recalculate `amount`)
- New mutation hook in `hooks/useBills.ts`
- Wire to the existing "Waive Late Fee" button on Bill Detail

If feasible in v1, do this. Removes the TODO entirely.

### Option B — version-gate it
Replace the bare TODO with the project's canonical pattern:

```tsx
// FIXME(v2): implement waive late fee mutation
```

Per CLAUDE.md: `FIXME(v2)` defers cleanly to v2 with intent documented.

**Recommendation: Option B.** Late-fee waiving is a billing-policy feature that probably needs design/UX decisions beyond the scope of an immediate fix. Defer.

## 3. CLAUDE.md cross-reference

The "Conventions → No bare `// TODO:` comments" section already documents the rule:

> Every TODO needs either:
> - A linked issue: `// TODO(#123): ...`
> - A future-version marker: `// FIXME(v2): ...`
> - A removal date: `// TODO(2026-06-01): ...`

No change needed.

## 4. Implementation steps

| # | Task | Complexity |
|---|---|---|
| 1 | Edit `app/(admin)/billing/[id].tsx:102` — change `// TODO:` to `// FIXME(v2):` (Option B) | XS |
| 2 | Run the audit grep again — must return empty | XS |
| 3 | (Optional) add to PR checklist | XS |

**Estimate:** ~2 minutes.

## 5. Acceptance

- [ ] `grep -rEn "^\\s*//\\s*TODO[^\\(]" app/ components/ lib/ hooks/ types/` returns empty.
- [ ] Existing FIXME / version-gated TODOs remain untouched.

## 6. Out of scope

- Implementing the waive-late-fee feature itself (Option A).
- Auditing `// FIXME` comments — those are version-gated by design.
- Adding a lint rule — defer until ESLint is set up.
