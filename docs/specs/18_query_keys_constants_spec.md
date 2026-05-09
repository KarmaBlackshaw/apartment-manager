# TanStack Query Keys — Constants Verification

## TL;DR

CLAUDE.md rule: every query hook exports a `XXX_KEY` constant; never inline string-array keys. Audit shows **all 9 data hooks already comply**: `usePayments`, `useProperties`, `useTenants`, `useBills`, `useReports`, `useSettings`, `usePaymentsOverview`, `useUtilityReadings`, `useBillingOverview` each export their `_KEY`.

**No migration needed.** This spec just locks in the convention with a one-time audit + a CLAUDE.md cross-reference.

## Agent prompt

```
Implement docs/specs/18_query_keys_constants_spec.md exactly.

Trivial verification spec. No migration expected.

1. Confirm every hooks/*.ts data hook exports a *_KEY constant:
     grep -rln "_KEY" hooks/

2. Spot-check each hook follows the pattern (§2.1):
     grep -rEn "queryKey:\s*\[" hooks/ | grep -v "_KEY"
   Any literal-array queryKey hits → fix to use the constant.

3. Verify CLAUDE.md "TanStack Query keys" rule text exists. Add
   precedent example per §2.3 if missing.

Verify §4 acceptance. ~10 min. Do NOT commit.

After verification passes, mark this spec done:
  git mv docs/specs/18_query_keys_constants_spec.md docs/specs/18_DONE_query_keys_constants_spec.md
```

---

## 1. Audit result

```bash
grep -rln "_KEY" hooks/
```

Returns 9 files, matching the 9 data hooks. None missing.

## 2. Action

### 2.1 Verify each hook follows the same pattern

For each hook file, confirm:
- A top-level `export const XXX_KEY = [...] as const` (or similar) exists.
- Every `useQuery({ queryKey: [...] })` references the constant.
- Every `invalidateQueries({ queryKey: ... })` references the same constant.

Spot-check by running:
```bash
grep -rEn "queryKey:\\s*\\[" hooks/ | grep -v "_KEY" | head
```

Any hits where the queryKey is a literal `[...]` array (not the constant) are bugs to fix.

### 2.2 Document the convention in CLAUDE.md

The "Conventions" section already includes:

> **TanStack Query keys are exported constants.** Never inline a string array as a query key. Each hook file exports a `XYZ_KEY` constant.

Verify this text is present and unchanged. If missing, add it.

### 2.3 Add a tiny precedent example

In CLAUDE.md, append:

> Example: `hooks/useTenants.ts` exports `TENANTS_KEY = ['tenants'] as const`. All `useQuery` and `invalidateQueries` calls reference `TENANTS_KEY` (or `[...TENANTS_KEY, filter]` for filtered variants).

## 3. Implementation steps

| # | Task | Complexity |
|---|---|---|
| 1 | Spot-check each hook follows the pattern (§2.1) | S |
| 2 | If any inline-array query keys found, refactor to use the constant | XS–S |
| 3 | Verify CLAUDE.md text exists per §2.2; add precedent example per §2.3 | XS |

**Estimate:** ~10 minutes.

## 4. Acceptance

- [ ] `grep -rEn "queryKey:\\s*\\[" hooks/` only shows usages that reference a `_KEY` constant.
- [ ] CLAUDE.md "TanStack Query keys" rule is documented and includes a precedent example.

## 5. Out of scope

- Renaming any `_KEY` constant.
- Refactoring how mutations invalidate queries.
- Adding query key generators (e.g. `tenantsKeys.list(filters)` factories) — defer until project complexity demands it.
