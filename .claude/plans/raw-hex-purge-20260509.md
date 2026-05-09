# Plan: Purge raw hex / rgba literals from app/, components/, layouts/

## Goal
Eliminate all 144 raw `#RRGGBB` / `#RGB` / `rgba(...)` literals from `app/`, `components/`, and `layouts/` (excluding `tailwind.config.js` and `components/illustrations/**`), routing every color through either a NativeWind class (preferred) or a `colors.*` token from `constants/theme.ts` (only where NativeWind cannot reach: Ionicons `color`, Switch `thumbColor`/`trackColor`, BottomSheet `backgroundStyle`, `placeholderTextColor`, SVG `fill`, `shadowColor`, `ActivityIndicator color`).

## Context

### Token mapping (actual codebase values)

| Concept | Actual hex in code | Token | NativeWind class |
|---|---|---|---|
| primary | `#3b82f6` / `#3B82F6` | `colors.primary` | `text-primary` / `bg-primary` |
| success | `#22C98A` / `#22c55e` / `#10B981` | `colors.success` | `text-success` / `bg-success` |
| danger | `#FF5C6A` / `#ef4444` | `colors.danger` | `text-danger` / `bg-danger` |
| warning | `#FFB020` / `#f59e0b` | `colors.warning` | `text-warning` / `bg-warning` |
| purple | `#9B6FFF` | `colors.purple` | `text-purple` / `bg-purple` |
| teal | `#18C9C9` | `colors.teal` | `text-teal` / `bg-teal` |
| text-primary | `#f1f1f1` / `#F1F5F9` / `#F0F3FF` | `colors.textPrimary` | `text-text-primary` |
| text-secondary | `#94A3B8` / `#888888` | `colors.textSecondary` | `text-text-secondary` |
| text-muted | `#64748B` / `#555555` | `colors.textMuted` | `text-text-muted` |
| text-tertiary | `#424860` | `colors.textTertiary` (NEW) | `text-text-tertiary` |
| background | `#0C0E14` / `#0d0d0d` | `colors.background` | `bg-background` |
| surface | `#13161F` / `#171717` / `#1a1a1a` | `colors.surface` | `bg-surface` |
| surface2 | `#191D28` | `colors.surface2` | `bg-surface-2` |
| surface3 | `#1F2433` / `#1F1F1F` | `colors.surface3` | `bg-surface-3` |
| border | `#252A38` / `#2a2a2a` | `colors.border` | `border-border` |
| border2 | `#2E3448` | `colors.border2` | `border-border-2` |
| white | `#fff` / `#ffffff` / `#FFFFFF` | `colors.white` (NEW) | `text-white` / `bg-white` |
| black | `#000` / `#000000` | `colors.black` (NEW) | `text-black` / `bg-black` |
| successSubtle | `rgba(34,201,138,0.12)` | `colors.successSubtle` (NEW) | `bg-success-subtle` |
| dangerSubtle | `rgba(255,92,106,0.12)` | `colors.dangerSubtle` (NEW) | `bg-danger-subtle` |
| warningSubtle | `rgba(255,176,32,0.12)` | `colors.warningSubtle` (NEW) | `bg-warning-subtle` |
| infoSubtle | `rgba(75,123,255,0.12)` | `colors.infoSubtle` (NEW) | `bg-info-subtle` |
| accentSubtle | `rgba(155,111,255,0.12)` | `colors.accentSubtle` (NEW) | `bg-accent-subtle` |
| tealSubtle | `rgba(24,201,201,0.12)` | `colors.tealSubtle` (NEW) | `bg-teal-subtle` |
| neutralSubtle | `rgba(100,100,100,0.15)` | `colors.neutralSubtle` (NEW) | `bg-neutral-subtle` |
| overlay50 | `rgba(0,0,0,0.5)` | `colors.overlay50` (NEW) | — |
| chartBarInactive | `#1D4ED8` | `colors.chartBarInactive` (NEW) | — |
| avatarPalette | 8-color seed array | `colors.avatarPalette` (NEW) | — |
| documentBg | 5-color icon-bg map | `colors.documentBg` (NEW) | — |
| receiptPaper | `#FFFFFF` | `colors.receiptPaper` (NEW) | — |
| receiptDivider | `#E2E8F0` | `colors.receiptDivider` (NEW) | — |
| receiptText | `#64748B` | `colors.receiptText` (NEW alias of textMuted) | — |

### Rule: when to use className vs colors.*
- **Prefer className** (`text-primary`, `bg-surface`, etc.) — NativeWind handles it at build time.
- **Use `colors.*` only** for props with no className equivalent: Ionicons `color`, Switch `trackColor`/`thumbColor`, BottomSheet `backgroundStyle`/`handleIndicatorStyle`, `placeholderTextColor`, `ActivityIndicator color`, SVG `fill`/`stroke`, `shadowColor`, `style` animation values.
- Import path: `import { colors } from '~/constants/theme'`

### Exempt
- `tailwind.config.js` (it IS the tokens)
- `components/illustrations/**`

---

## Phase A — Token expansion (foundation)

**1. [low]** Add missing tokens to `constants/theme.ts`

Add to `colors` export:
```ts
// New subtle/tint tokens
successSubtle: 'rgba(34,201,138,0.12)',
dangerSubtle:  'rgba(255,92,106,0.12)',
warningSubtle: 'rgba(255,176,32,0.12)',
infoSubtle:    'rgba(75,123,255,0.12)',
accentSubtle:  'rgba(155,111,255,0.12)',
tealSubtle:    'rgba(24,201,201,0.12)',
neutralSubtle: 'rgba(100,100,100,0.15)',
overlay50:     'rgba(0,0,0,0.5)',
// Basic
white: '#FFFFFF',
black: '#000000',
// Text
textTertiary: '#424860',
// Specialized
chartBarInactive: '#1D4ED8',
receiptPaper:   '#FFFFFF',
receiptDivider: '#E2E8F0',
receiptText:    '#64748B',
// Palette arrays (decorative, not semantic)
avatarPalette: ['#1E3A5F','#1A3A2A','#3A1A1A','#2A1A3A','#1A2A3A','#3A2A1A','#1A3A3A','#2D2D1A'] as const,
documentBg: {
  contract: '#1E3A5F',
  photo:    '#1A3A2A',
  permit:   '#2A2A1A',
  govId:    '#2A1A2A',
  other:    '#1E2533',
} as const,
```

Verify: `cd /Users/admin/Documents/personal/apartment-manager && npx tsc --noEmit`

**2. [low]** Mirror new scalar tokens in `tailwind.config.js`

Under `extend.colors`, add:
- `white: '#FFFFFF'`
- `black: '#000000'`
- `text.tertiary: '#424860'` (alongside existing `text.primary`, `text.secondary`, `text.muted`)
- `success.subtle: 'rgba(34,201,138,0.12)'`
- `danger.subtle: 'rgba(255,92,106,0.12)'`
- `warning.subtle: 'rgba(255,176,32,0.12)'`
- `info.subtle: 'rgba(75,123,255,0.12)'`
- `accent.subtle: 'rgba(155,111,255,0.12)'`
- `teal.subtle: 'rgba(24,201,201,0.12)'`
- `neutral.subtle: 'rgba(100,100,100,0.15)'`

Do NOT add `chartBarInactive`, `receiptPaper`, `overlay50`, `avatarPalette`, `documentBg` — JS-only, no NativeWind class needed.

Verify: `cd /Users/admin/Documents/personal/apartment-manager && npx tsc --noEmit`

---

## Phase B — NativeWind arbitrary value purge (className context only)

Replace every `text-[#hex]`, `bg-[#hex]`, `border-[#hex]` with named class. Use mapping table above.

**3. [low]** `components/ui/Card.tsx` — `border-[#2a2a2a]` → `border-border`

**4. [low]** `components/ui/AppText.tsx` — `text-[#f1f1f1]` → `text-text-primary`, `text-[#888888]` → `text-text-secondary`, `text-[#555555]` → `text-text-muted`

**5. [low]** `components/ui/Input.tsx` — `text-[#f1f1f1]` → `text-text-primary`, `border-[#2a2a2a]` → `border-border`; `placeholderTextColor="#555555"` → `placeholderTextColor={colors.textMuted}` (import colors)

**6. [low]** `components/ui/Badge.tsx` — replace all arbitrary color classes with named equivalents from mapping table; verify each token exists in tailwind.config.js first

**7. [low]** `components/ui/Button.tsx` — arbitrary classes → named; JS hex handled in Phase C step 18

**8. [low]** `components/ui/DateInput.tsx` — `border-[#2a2a2a]` → `border-border`; remaining JS hex → Phase C step 19

**9. [low]** `components/ui/Select.tsx` — arbitrary classes (`border-[#2a2a2a]`, `text-[#f1f1f1]`, `text-[#555555]`) → named; JS hex → Phase C step 20

**10. [low]** `components/navigation/FloatingTabBar.tsx` — arbitrary classes → named; JS hex → Phase C step 36

**11. [low]** `components/billing/SwipeablePaymentRow.tsx` — `border-[#2a2a2a]` → `border-border`; JS hex → Phase C step 30

**12. [low]** `components/billing/CollectionProgressBar.tsx` — `text-[#22C98A]` → `text-success`, `text-[#FFB020]` → `text-warning`, `text-[#FF5C6A]` → `text-danger`; style hex → Phase C step 29

**13. [low]** `app/(system)/lock.tsx` — `text-[#f1f1f1]` → `text-text-primary`, `text-[#888888]` → `text-text-secondary`, `border-[#2a2a2a]` → `border-border` (all occurrences)

**14. [low]** `app/(system)/setup-pin.tsx` — same substitutions as step 13

**15. [low]** `app/(tabs)/index.tsx` — `border-b-[#1a1a1a]` → `border-b-surface`, `text-[#22c55e]` → `text-success`; JS hex → Phase C step 42

**16. [low]** Interim audit — arbitrary classes only:
```bash
cd /Users/admin/Documents/personal/apartment-manager
grep -rEn '\[#[0-9a-fA-F]{3,6}\]' app/ components/ layouts/ | grep -v 'tailwind.config\|illustrations'
```
Must return 0 lines.

---

## Phase C — Non-className hex purge (JS value props)

For each file: import `colors` from `'~/constants/theme'`, replace every `'#hex'` literal.

**17. [low]** `components/ui/LoadingSpinner.tsx` — `color="#3b82f6"` → `color={colors.primary}`

**18. [med]** `components/ui/Button.tsx` — replace `iconColor` map entries (`'#fff'`→`colors.white`, `'#f1f1f1'`→`colors.textPrimary`, `'#3b82f6'`→`colors.primary`, `'#000'`→`colors.black`) and `ActivityIndicator color` ternary

**19. [med]** `components/ui/DateInput.tsx` — Ionicons `color="#555555"` → `colors.textMuted`; overlay `'rgba(0,0,0,0.5)'` → `colors.overlay50`; `backgroundColor: '#1a1a1a'` → `colors.surface`; `textColor="#f1f1f1"` → `colors.textPrimary`

**20. [med]** `components/ui/Select.tsx` — Ionicons colors → `colors.textMuted`/`colors.textSecondary`/`colors.white`; BottomSheet `backgroundStyle.backgroundColor: '#1a1a1a'` → `colors.surface`; `handleIndicatorStyle.backgroundColor: '#555555'` → `colors.textMuted`; `placeholderTextColor` → `colors.textMuted`; TextInput inline `color: '#f1f1f1'` → `color: colors.textPrimary` (keep other style props)

**21. [low]** `components/ui/FAB.tsx` — `shadowColor: '#000'` → `colors.black`; `color="#FFFFFF"` → `colors.white`

**22. [med]** `components/ui/Avatar.tsx` — replace inline `AVATAR_COLORS` array with `colors.avatarPalette`; add `// FIXME(v2): CLAUDE.md says Avatar must use neutral Surface3 bg — replace palette with single colors.surface3`

**23. [low]** `components/settings/SettingsRow.tsx` — `thumbColor="#FFFFFF"` → `colors.white`

**24. [med]** `components/home/UnitCell.tsx` — `'#22C98A'` → `colors.success`; `'#FF5C6A'` → `colors.danger`; `'#424860'` → `colors.textTertiary`

**25. [low]** `components/home/AttentionRow.tsx` — `'#FF5C6A'` → `colors.danger`; `'#FFB020'` → `colors.warning`

**26. [med]** `components/home/OccupancyBarChart.tsx` — `INACTIVE_BAR_COLOR = '#1D4ED8'` → `colors.chartBarInactive`

**27. [med]** `components/home/QuickActionBar.tsx` — Ionicons `color="#fff"` → `colors.white`; move `style={{ color: '#fff' }}` / `style={{ color: '#64748B' }}` on Text to className (`text-white` / `text-text-muted`); keep non-color style props inline

**28. [low]** `components/home/VacantRow.tsx` — `style={{ color: '#FF5C6A' }}` → className `text-danger` (combine with existing className)

**29. [low]** `components/billing/CollectionProgressBar.tsx` — `style={{ width: ..., backgroundColor: '#22C98A' }}` → keep `width` inline, change color to `colors.success`

**30. [high]** `components/billing/SwipeablePaymentRow.tsx` — `ACCENT_COLORS` array → `colors.accentPalette` if exists, else add to theme.ts; `'#f59e0b'` → `colors.warning`; `'#000'` → `colors.black`; `'#171717'` → `colors.surface`; Text colors → className or `colors.*`

**31. [high]** `components/tenants/TenantQuickSearchModal.tsx` — consolidate `ACCENT_COLORS` with step 30 (same shared source); status map `rgba(...)` → subtle tokens; text colors → `colors.*`; `placeholderTextColor` → `colors.textMuted`; Ionicons → `colors.textPrimary`

**32. [low]** `components/properties/PropertySelector.tsx` — BottomSheet `backgroundStyle.backgroundColor: '#1a1a1a'` → `colors.surface`; `handleIndicatorStyle.backgroundColor: '#555555'` → `colors.textMuted`; Ionicons `color="#ffffff"` → `colors.white`

**33. [low]** `components/reports/ReportMenuCard.tsx` — Ionicons `color="#FFFFFF"` → `colors.white`

**34. [med]** `components/tenants/DocumentRow.tsx` — replace inline color map with `colors.documentBg.*`; Ionicons `color="#FFFFFF"` → `colors.white`

**35. [med]** `components/billing/ReceiptDocument.tsx` — replace all white-paper hex with `colors.receiptPaper`, `colors.receiptText`, `colors.receiptDivider`

**36. [low]** `components/navigation/FloatingTabBar.tsx` — Ionicons `color={focused ? '#3b82f6' : '#64748B'}` → `colors.primary : colors.textMuted`; search icon `color="#4a4a4a"` → `colors.textMuted`

**37. [low]** `app/_layout.tsx` — `backgroundColor: '#0d0d0d'` → `colors.background` (keep via style if SafeAreaProvider doesn't accept className)

**38. [low]** `app/billing/_layout.tsx` — `headerStyle.backgroundColor: '#111111'` → `colors.surface`; `headerTintColor: '#f1f1f1'` → `colors.textPrimary`

**39. [low]** `app/(system)/_layout.tsx` — `backgroundColor: '#0d0d0d'` → `colors.background`

**40. [low]** `app/settings/security.tsx` — Switch `trackColor={{ true: '#3b82f6', false: '#2a2a2a' }}` → `colors.primary : colors.border`; `thumbColor="#f1f1f1"` → `colors.textPrimary`

**41. [low]** `app/(system)/onboarding.tsx` — `placeholderTextColor` → `colors.textMuted`; Ionicons → `colors.success`/`colors.textSecondary`

**42. [high]** `app/(tabs)/index.tsx` — status map rgba → subtle tokens; `color: '#22c55e'` etc. → `colors.*`; `ACCENT_COLORS` → shared palette; Ionicons + ActivityIndicator → `colors.*`

**43. [high]** Remaining screens batch — read each file, apply same substitutions:
- `app/(tabs)/billing.tsx`
- `app/billing/[billId].tsx`
- `app/billing/receipt.tsx`
- `app/billing/record-payment.tsx`
- `app/billing/utility-reading.tsx`
- `app/properties/[id].tsx`
- `app/reports/annual-summary.tsx`
- `app/reports/maintenance-costs.tsx`
- `app/reports/monthly-collection.tsx`
- `app/reports/occupancy.tsx`
- `app/reports/outstanding-balances.tsx`
- `app/reports/per-unit-income.tsx`
- `app/tenants/[id].tsx`
- `app/tenants/add.tsx`
- `components/billing/BillCard.tsx`
- `components/billing/BillingRow.tsx`
- `components/billing/PaymentRow.tsx`
- `components/billing/ReceiptView.tsx`

Process one file per edit; run `npx tsc --noEmit` after each or every 3 files.

---

## Phase D — Final verification

**44. [low]** Final hex/rgba audit:
```bash
cd /Users/admin/Documents/personal/apartment-manager
grep -rEn "#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}\b|rgba\(" app/ components/ layouts/ 2>/dev/null \
  | grep -v "tailwind.config\|illustrations"
```
Must return **0 lines**.

**45. [low]** Final arbitrary-class audit:
```bash
grep -rEn '\[#[0-9a-fA-F]{3,6}\]' app/ components/ layouts/ 2>/dev/null \
  | grep -v 'tailwind.config\|illustrations'
```
Must return **0 lines**.

**46. [low]** Type-check clean:
```bash
cd /Users/admin/Documents/personal/apartment-manager && npx tsc --noEmit
```
Must return **0 errors**.

**47. [med]** Manual smoke test — boot app, visually verify against `docs/screenshots/dark/`:
- Home screen — KPI cards, attention rows, unit cells, quick actions
- Tenants list + detail
- Billing list + bill detail + record payment + receipt
- Properties list + property detail (unit grid colors: success/danger/vacant)
- All 6 reports
- Lock screen + setup PIN
- Onboarding wizard
- Settings → Security (Switch states)
- Floating tab bar (active/inactive)
- BottomSheets (Select, PropertySelector, DateInput — handle + bg)
- OccupancyBarChart (inactive bar color)
- ReceiptDocument (white paper inside dark app)
- Avatar initials

**48. [low]** Mark spec done:
```bash
cd /Users/admin/Documents/personal/apartment-manager
git mv docs/specs/15_raw_hex_purge_spec.md docs/specs/15_DONE_raw_hex_purge_spec.md
```
Do NOT commit.

---

## Risks
- **Visual drift on rogue hex.** `UnitCell` uses `#22C98A`/`#FF5C6A` but `colors.success`/`danger` are `#10B981`/`#EF4444`. Collapsing changes rendered color — smoke test step 47 gates this.
- **Avatar palette is decorative, not semantic.** Label in theme.ts; leave `// FIXME(v2)` per CLAUDE.md intent.
- **ReceiptDocument is intentionally white.** Keep semantic tokens (`receiptPaper`, not `white`) to prevent future "dark mode fix" from breaking the receipt.
- **`ACCENT_COLORS` used in 2+ files.** Steps 30+31+42 must share the same source — add `accentPalette` to `constants/theme.ts` in Phase A if needed.
- **className on non-NativeWind components.** `SafeAreaProvider`, `BottomSheet`, `Switch`, `ActivityIndicator` don't accept `className` — always use `style={{ X: colors.Y }}` for these.
