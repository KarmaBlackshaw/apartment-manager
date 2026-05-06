# Session 01 — Foundation: Tab Bar + Token Unification

**Prerequisites:** none — this session must ship first. Everything else depends on it.

---

## Locked Design Decisions

- **Always follow `references/dark/` images** — they override MASTER.md where they conflict.
- **Dark mode only.** No light-mode tokens.
- **Primary color:** `#3B82F6` (blue, from references).
- **Tab bar:** `Home | Tenants | Billing | Reports | [Search icon]` — 4 tabs + search. No Properties tab, no Payments tab.

---

## Task 0.1 — Restructure Tab Bar

**File:** `app/(admin)/_layout.tsx`  
**Complexity:** M

Current code registers 7 screens (5 visible tabs + billing hidden + settings hidden). Reference images show 4 tabs + a search icon on the right.

Changes needed:
1. Remove `properties` and `payments` from the visible tab list.
2. Promote `billing` from `href: null` to a visible tab.
3. Tab order must be: `index` (Home) → `tenants` → `billing` → `reports`.
4. `settings` stays hidden (`href: null`).
5. The search icon lives inside `FloatingTabBar` on the far right — tapping it calls `useTenantSearch().open()` which already exists via `TenantSearchContext`.

**Reference:** every screenshot's tab bar — dark_01, dark_05, dark_09, dark_13 are clearest.

Tab icons (Ionicons, from MASTER.md §10):
| Tab | Inactive icon | Active icon |
|-----|--------------|-------------|
| Home | `home-outline` | `home` |
| Tenants | `people-outline` | `people` |
| Billing | `card-outline` | `card` |
| Reports | `bar-chart-outline` | `bar-chart` |
| Search (not a tab) | `search-outline` | — |

Active tab icon + label color: `#3B82F6`. Inactive: `#64748B`.

**File:** `components/admin/FloatingTabBar.tsx`

Update to render exactly 4 tab buttons + 1 search icon button. Search icon `onPress` → `useTenantSearch().open()`.

Tab bar spec (from references):
```
backgroundColor: #171717
borderTopWidth: 1, borderTopColor: #2A2A2A
height: 60 + safeAreaBottom
```

---

## Task 0.2 — Move Properties Under Tenants Stack

**File:** `app/(admin)/tenants/_layout.tsx`

Properties screens (`properties/`, `properties/[id].tsx`, `properties/[propertyId]/units/...`) must be reachable from the Tenants tab stack, not a separate tab. In the reference, navigating to a property or unit keeps the Tenants tab active.

Steps:
1. Check if `app/(admin)/tenants/_layout.tsx` uses `createNativeStackNavigator` or Expo Router's `<Stack>`. If it uses a `<Stack>`, add the property-related routes as additional stack screens (or confirm deep linking still works).
2. Remove `app/(admin)/properties/_layout.tsx` as a tab-level entry point — keep the directory and files, just ensure they're reachable as pushed screens from within the Tenants stack.
3. Any navigation call like `router.push('/(admin)/properties/...')` continues to work as-is since Expo Router handles cross-stack navigation.

---

## Task 1.1 — Decision Checkpoint (no code)

Before writing tokens: confirm `primary = #3B82F6` (blue). Already decided — proceed.

---

## Task 1.2 — Rewrite `tailwind.config.js`

Replace the entire file with the following. All existing token names (`app`, `surface`, `elevated`, `border`, `primary`, `success`, `warning`, `danger`) are superseded by the new structure.

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brand
        primary: {
          DEFAULT: '#3B82F6',
          pressed: '#2563EB',
          muted:   '#1D4ED8',
          subtle:  '#0C1A3D',
        },

        // Surfaces
        background: '#0D0D0D',
        surface:    '#171717',
        elevated:   '#1F1F1F',
        overlay:    'rgba(0,0,0,0.6)',
        muted:      '#242424',

        // Borders
        border:         '#2A2A2A',
        'border-focus': '#3B82F6',

        // Text
        text: {
          primary:   '#F1F5F9',
          secondary: '#94A3B8',
          muted:     '#64748B',
          inverse:   '#0F172A',
          link:      '#3B82F6',
        },

        // Status
        success: { DEFAULT: '#10B981', bg: '#052E16', text: '#6EE7B7' },
        warning: { DEFAULT: '#F59E0B', bg: '#1C1005', text: '#FCD34D' },
        danger:  { DEFAULT: '#EF4444', bg: '#200C0C', text: '#FCA5A5' },
        info:    { DEFAULT: '#3B82F6', bg: '#0C1A3D', text: '#93C5FD' },
        neutral: { DEFAULT: '#64748B', bg: '#1E2533', text: '#94A3B8' },

        // Balance states
        balance: {
          zero:   '#10B981',
          owed:   '#EF4444',
          credit: '#3B82F6',
        },
      },

      fontSize: {
        'screen-title':   ['24px', { lineHeight: '29px', letterSpacing: '-0.5px' }],
        'section-header': ['18px', { lineHeight: '24px', letterSpacing: '-0.3px' }],
        'card-title':     ['16px', { lineHeight: '22px', letterSpacing: '-0.2px' }],
        'body':           ['15px', { lineHeight: '22px', letterSpacing: '0px'    }],
        'label':          ['13px', { lineHeight: '18px', letterSpacing: '0.2px'  }],
        'caption':        ['12px', { lineHeight: '16px', letterSpacing: '0.1px'  }],
        'amount-large':   ['28px', { lineHeight: '34px', letterSpacing: '-0.5px' }],
        'amount-medium':  ['20px', { lineHeight: '26px', letterSpacing: '-0.3px' }],
        'amount-small':   ['15px', { lineHeight: '20px', letterSpacing: '0px'    }],
        'chip-label':     ['11px', { lineHeight: '14px', letterSpacing: '0.5px'  }],
        'tab-label':      ['10px', { lineHeight: '13px', letterSpacing: '0.3px'  }],
      },

      spacing: {
        1: '4px',  2: '8px',  3: '12px', 4: '16px',
        5: '20px', 6: '24px', 8: '32px', 10: '40px', 12: '48px',
      },

      borderRadius: {
        sm:   '6px',
        md:   '12px',
        lg:   '16px',
        xl:   '24px',
        pill: '999px',
      },

      fontWeight: {
        regular: '400', medium: '500', semibold: '600',
        bold: '700', extrabold: '800',
      },
    },
  },
}
```

---

## Task 1.3 — Update `constants/theme.ts`

Replace with dark-mode values matching `tailwind.config.js`. This file is used by JS code that can't use NativeWind classes (e.g. Reanimated animated styles, shadow objects, chart colors).

```ts
export const colors = {
  primary:         '#3B82F6',
  primaryPressed:  '#2563EB',
  primarySubtle:   '#0C1A3D',

  background: '#0D0D0D',
  surface:    '#171717',
  elevated:   '#1F1F1F',
  muted:      '#242424',
  border:     '#2A2A2A',

  textPrimary:   '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted:     '#64748B',
  textInverse:   '#0F172A',
  textLink:      '#3B82F6',

  success:     '#10B981',
  successBg:   '#052E16',
  successText: '#6EE7B7',

  warning:     '#F59E0B',
  warningBg:   '#1C1005',
  warningText: '#FCD34D',

  danger:     '#EF4444',
  dangerBg:   '#200C0C',
  dangerText: '#FCA5A5',

  info:     '#3B82F6',
  infoBg:   '#0C1A3D',
  infoText: '#93C5FD',

  neutral:     '#64748B',
  neutralBg:   '#1E2533',
  neutralText: '#94A3B8',

  balanceZero:   '#10B981',
  balanceOwed:   '#EF4444',
  balanceCredit: '#3B82F6',
} as const

export const shadows = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2,  elevation: 1 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,  elevation: 3 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8,  elevation: 6 },
} as const

export const radius = {
  sm:   6,
  md:   12,
  lg:   16,
  xl:   24,
  pill: 999,
} as const

export const spacing = {
  1: 4,  2: 8,  3: 12, 4: 16,
  5: 20, 6: 24, 8: 32, 10: 40, 12: 48,
} as const
```

---

## Done Criteria

- [ ] App launches with 4-tab bar: Home | Tenants | Billing | Reports
- [ ] Search icon visible on right of tab bar; tapping opens TenantQuickSearchModal
- [ ] No Properties or Payments tab visible
- [ ] Navigating to a property screen keeps Tenants tab active
- [ ] `tailwind.config.js` — no old token names (`app`, old `surface` string) remain
- [ ] `constants/theme.ts` — all values match dark-mode spec above
- [ ] TypeScript compiles with no new errors
