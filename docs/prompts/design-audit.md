# Design Audit Prompt — Cross-Check references/dark vs Codebase

## Purpose

Audit the app against 35 dark-mode reference screenshots. Identify missing screens,
partial implementations, token mismatches, and missing shared components. Output a
complete build plan with NativeWind token spec and shared component inventory.

---

## STEP 1 — Read context first

Read these files before anything else:

- `design-system/apartment-manager/MASTER.md` — design system spec
- `constants/theme.ts` — current JS tokens
- `tailwind.config.js` — current NativeWind tokens
- `global.css` — NativeWind base styles
- `components/ui/index.ts` — shared UI exports
- `app/(admin)/_layout.tsx` — tab structure

Then run `ctx_tree("app/(admin)", depth=4)` to map all existing routes.

---

## STEP 2 — View all 35 reference images

Load each image in `references/dark/` in order (`dark_01` through `dark_35`). For each screen, note:

1. Screen name / route path
2. Key UI sections visible
3. Unique components needed
4. Color tokens used (note exact dark-mode shades)
5. Does a corresponding route file exist in `app/`?

---

## STEP 3 — Gap analysis

Produce a table:

| # | Image | Screen Name | Route | Status | Missing Components |
|---|-------|-------------|-------|--------|--------------------|

**Status values:**

- ✅ Built — route exists, visually close to reference
- 🟡 Partial — route exists but missing UI sections
- ❌ Missing — no route file at all

**Known existing routes to check against:**

| Route file | Reference screen |
|------------|-----------------|
| `app/(admin)/index.tsx` | `dark_01_home_dashboard` |
| `app/(admin)/tenants/index.tsx` | `dark_05_tenant_list` |
| `app/(admin)/tenants/[id].tsx` | `dark_06_tenant_detail` |
| `app/(admin)/tenants/new.tsx` | `dark_07_add_tenant` |
| `app/(admin)/billing/index.tsx` | `dark_09_billing_overview` |
| `app/(admin)/billing/[id].tsx` | `dark_29_bill_detail` |
| `app/(admin)/billing/new.tsx` | possibly `dark_10_record_payment` |
| `app/(admin)/payments/index.tsx` | possibly `dark_27_payment_history` |
| `app/(admin)/properties/index.tsx` | `dark_18_property_list` |
| `app/(admin)/properties/[id].tsx` | `dark_19_property_detail` |
| `app/(admin)/properties/[propertyId]/units/[id].tsx` | `dark_20_unit_detail` |
| `app/(admin)/properties/[propertyId]/units/new.tsx` | `dark_21_add_edit_unit` |
| `app/(admin)/reports/index.tsx` | `dark_13_report_menu` |
| `app/(admin)/settings/index.tsx` | `dark_03_settings` |
| `app/lock.tsx` | `dark_16_app_lock` |
| `app/setup-pin.tsx` | possibly `dark_17_onboarding` |
| `components/admin/TenantQuickSearchModal.tsx` | `dark_04_quick_search` |

---

## STEP 4 — Token audit

Compare colors visible in the dark reference images against:

1. `MASTER.md §2` color system (light-mode spec)
2. `tailwind.config.js` current custom colors (dark-mode only, no semantic names)
3. `constants/theme.ts` (light-mode JS values)

**Known mismatches to verify:**

- `constants/theme.ts` has `primary: '#2563EB'` (blue) but `MASTER.md` says `primary: '#0F766E'` (teal)
- `tailwind.config.js` surface tokens (`app: '#0d0d0d'`, `surface: '#171717'`) have no semantic names matching `MASTER.md`
- No dark-mode variants defined for status colors, text, or surfaces anywhere

**Find:**

- Which MASTER.md tokens have no dark-mode equivalent
- Which `tailwind.config.js` keys don't map to MASTER.md semantic names
- Missing token groups: status colors, financial balance colors, typography scale, spacing scale, shadow scale, border-radius scale

---

## STEP 5 — NativeWind token spec

Design a complete token system for `tailwind.config.js` that covers both light and dark modes.
Extract exact hex values from the dark reference images for dark-mode variants.
Cross-check against `MASTER.md` light-mode values for consistency.

Target structure:

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      // Brand
      primary: { DEFAULT: '', dark: '', light: '' },
      accent:  { DEFAULT: '', light: '' },

      // Surfaces
      background: { DEFAULT: '', dark: '' },
      surface: {
        DEFAULT: '', raised: '',
        dark: '', 'dark-raised': '',
      },
      muted:  { DEFAULT: '', dark: '' },
      border: { DEFAULT: '', dark: '' },

      // Text
      text: {
        primary: '', secondary: '', muted: '', inverse: '',
        'dark-primary': '', 'dark-secondary': '', 'dark-muted': '',
      },

      // Status — each needs light + dark bg/text variants
      success: { DEFAULT: '', bg: '', text: '', 'dark-bg': '', 'dark-text': '' },
      warning: { DEFAULT: '', bg: '', text: '', 'dark-bg': '', 'dark-text': '' },
      danger:  { DEFAULT: '', bg: '', text: '', 'dark-bg': '', 'dark-text': '' },
      info:    { DEFAULT: '', bg: '', text: '', 'dark-bg': '', 'dark-text': '' },
      neutral: { DEFAULT: '', bg: '', text: '', 'dark-bg': '', 'dark-text': '' },
    },

    fontSize: {
      // From MASTER.md §3 — map each role to [size, { lineHeight, letterSpacing }]
      'screen-title':   ['24px', { lineHeight: '29px', letterSpacing: '-0.5px' }],
      'section-header': ['18px', { lineHeight: '24px', letterSpacing: '-0.3px' }],
      'card-title':     ['16px', { lineHeight: '22px', letterSpacing: '-0.2px' }],
      body:             ['15px', { lineHeight: '22px' }],
      label:            ['13px', { lineHeight: '18px', letterSpacing: '0.2px' }],
      caption:          ['12px', { lineHeight: '16px', letterSpacing: '0.1px' }],
      'amount-large':   ['28px', { lineHeight: '34px', letterSpacing: '-0.5px' }],
      'amount-medium':  ['20px', { lineHeight: '26px', letterSpacing: '-0.3px' }],
      'amount-small':   ['15px', { lineHeight: '20px' }],
      'chip-label':     ['11px', { lineHeight: '14px', letterSpacing: '0.5px' }],
      'tab-label':      ['10px', { lineHeight: '13px', letterSpacing: '0.3px' }],
    },

    spacing: {
      // From MASTER.md §4 — all multiples of 4
      1:  '4px',
      2:  '8px',
      3:  '12px',
      4:  '16px',
      5:  '20px',
      6:  '24px',
      8:  '32px',
      10: '40px',
      12: '48px',
    },

    borderRadius: {
      // From MASTER.md §5
      sm:   '6px',
      md:   '12px',
      lg:   '16px',
      xl:   '24px',
      pill: '999px',
    },
  }
}
```

Fill all empty string values from image inspection + MASTER.md.

---

## STEP 6 — Shared component inventory

From the gap analysis and all 35 images, identify every reusable UI primitive.

Output table:

| Component | File path | Props interface (key props only) | Used in screens | Priority |
|-----------|-----------|----------------------------------|-----------------|----------|

**Priority tiers:**

- **P0** — Used on 5+ screens or blocks other builds
- **P1** — Used on 2–4 screens
- **P2** — Screen-specific but worth isolating (complex enough to reuse)

**Known candidates to verify/expand:**

- `StatusChip` — variant (success/warning/danger/info/neutral), label — P0
- `KPICard` — label, value, accent color, icon — P0 (Home, Reports)
- `SectionHeader` — title, onSeeAll — P0
- `AmountText` — amount (number), variant (owed/credit/paid) — P0
- `ListRow` — avatar, title, subtitle, trailing, onPress — P0
- `BottomCTABar` — wraps primary button above safe area — P0
- `ReceiptCard` — receipt number, tenant, amount, date — P1
- `BedSlotCard` — bed label, status — P1 (bed map screen)
- `DocumentRow` — filename, type, date, onView — P1
- `MaintenanceRow` — issue, status, date, cost — P1
- `UtilityReadingRow` — utility type, previous/current reading, amount — P1

Extend this list from image inspection.

---

## STEP 7 — Missing route specs

For each ❌ Missing or 🟡 Partial screen, provide a spec block:

```
Screen: dark_XX_name
Route file: app/(admin)/path/to/screen.tsx
Navigation: how to reach this screen (tab / pushed from X / modal / sheet)
Key sections:
  - List each major UI section visible in the reference image
Unique components needed:
  - ComponentName (P0/P1/P2 — reason)
Reused components:
  - ComponentName (from components/ui/)
Hooks/data needed:
  - useXxx — describe what data it must supply
New DB columns/tables needed (if any):
  - describe schema changes
```

Cover all ❌ Missing and 🟡 Partial screens.

---

## STEP 8 — Build sequence

Output a prioritized list in dependency order. Nothing should appear before its dependencies.

Sections:

1. **Token unification** — `tailwind.config.js` + `constants/theme.ts` sync (blocks everything)
2. **P0 shared components** — list each, mark file path, complexity S/M/L
3. **P1 shared components** — list each
4. **Missing screens** — leaf screens first, then parent screens
5. **Partial screen fixes** — for each, list exactly which sections to add

For each item include:

- File path(s)
- Complexity: S (< 1hr) / M (1–3hr) / L (3hr+)
- Blocking: what it unblocks

---

## Output format

Deliver sections in this order:

1. Gap analysis table (Step 3)
2. Token mismatch findings (Step 4)
3. Full `tailwind.config.js` token spec with all values filled (Step 5)
4. Shared component inventory table (Step 6)
5. Missing/partial route specs (Step 7)
6. Build sequence (Step 8)

Be exhaustive. This is a planning document — missed items become rework.
