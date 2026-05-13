# `console.log` Purge

## TL;DR

CLAUDE.md "Engineering Discipline" rule: **no `console.log` in committed code**. `console.error` allowed only inside `catch` blocks where the error would otherwise be swallowed.

Audit: **0 `console.log` calls** in `app/`, `components/`, `lib/`, `hooks/`. Already clean.

This spec is a **one-time grep audit + a precaution to prevent regression.** No migration work today.

## Agent prompt

```
Implement docs/specs/19_console_log_purge_spec.md exactly.

Trivial. No migration expected.

1. Run audit grep:
     grep -rln "console\.log" app/ components/ lib/ hooks/
   Expected: empty.

2. Verify console.error callers are inside catch blocks:
     grep -rEn "console\.error" app/ components/ lib/ hooks/
   Each hit should be inside try/catch.

3. (Optional) add the audit command to a PR checklist file.

Verify section 6 acceptance. ~5 min. Do NOT commit.

After verification passes, delete this spec:
  rm docs/specs/19_console_log_purge_spec.md
```

---

## 1. Audit result

```bash
grep -rln "console\\.log" app/ components/ lib/ hooks/
```

Returns empty.

## 2. Verify `console.error` usage is gated

```bash
grep -rEn "console\\.error" app/ components/ lib/ hooks/
```

Each hit should be inside a `try { ... } catch (e) { console.error(...); ... }` block. Quick spot-check: open each file, verify the `console.error` is inside a `catch`.

If any `console.error` is at the top level of a function or hook body, replace with proper error handling (toast, logger, throw) or remove.

## 3. CLAUDE.md cross-reference

The "Engineering Discipline" section already documents:

> **No `console.log` in committed code.** `console.log` is for local debugging only. Strip before committing. `console.error` is acceptable for actual error paths (e.g. inside a `catch` block where the error is otherwise swallowed). `console.warn` only for genuine deprecation warnings.

No change needed.

## 4. Prevention

### 4.1 Manual review

Add to your PR checklist (or a `.github/PULL_REQUEST_TEMPLATE.md` if you adopt one):

> Run: `grep -rn "console\\.log" app/ components/ lib/ hooks/` — must return empty.

### 4.2 Lint rule (defer)

When ESLint config is added, enable `no-console` with `{ allow: ['error', 'warn'] }`. Until then, manual audit suffices given the codebase is currently clean.

## 5. Implementation steps

| # | Task | Complexity |
|---|---|---|
| 1 | Run the audit grep — confirm empty | XS |
| 2 | Verify `console.error` callers per section 2 | XS |
| 3 | (Optional) add the audit to a PR checklist file | XS |

**Estimate:** ~5 minutes.

## 6. Acceptance

- [ ] `grep -rln "console\\.log" app/ components/ lib/ hooks/` returns empty.
- [ ] All `console.error` calls are inside `catch` blocks.

## 7. Out of scope

- Adding ESLint or Biome — separate spec.
- Building a logger abstraction — defer; `console.error` is sufficient for an offline app.
