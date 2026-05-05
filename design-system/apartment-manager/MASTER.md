# Design System Master File — Apartment Manager

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Apartment Manager  
**Updated:** 2026-05-05  
**Stack:** React Native · Expo · NativeWind · SQLite · Offline-First  
**Target:** Filipino solo landlords on Android (low-end to mid-range) + iOS  
**Style:** Enterprise SaaS Mobile + Flat Design Touch-First  

---

## 1. Design Philosophy

This is a **data-entry and data-retrieval tool for non-technical users**. Every design decision prioritizes:

1. **Speed over beauty** — landlord records a payment in under 30 seconds
2. **Clarity over cleverness** — status must be readable at a glance
3. **Trust over delight** — financial data must feel serious and accurate
4. **Offline-first** — zero dependency on internet for any core action
5. **Low-end Android safe** — no GPU-heavy effects (no blur, no glassmorphism)

---

## 2. Color System

### Brand Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#0F766E` | Brand teal — headers, active tabs, primary buttons |
| `primary-dark` | `#0D9488` | Pressed state of primary |
| `primary-light` | `#CCFBF1` | Primary tint — backgrounds, selected states |
| `accent` | `#0369A1` | CTA blue — links, secondary actions |
| `accent-light` | `#DBEAFE` | Accent tint |

### Surface Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#F8FAFC` | Screen background (all screens) |
| `surface` | `#FFFFFF` | Cards, list items, input fields |
| `surface-raised` | `#FFFFFF` | Modals, bottom sheets (with shadow) |
| `muted` | `#F1F5F9` | Dividers, disabled backgrounds, skeleton base |
| `border` | `#E2E8F0` | Card borders, input borders, dividers |

### Text Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `text-primary` | `#0F172A` | Headings, primary labels |
| `text-secondary` | `#475569` | Secondary labels, metadata |
| `text-muted` | `#94A3B8` | Placeholder text, disabled labels |
| `text-inverse` | `#FFFFFF` | Text on colored backgrounds |

### Status / Semantic Colors (CRITICAL — use exactly)

These drive the core UX of the app. Never deviate.

| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#10B981` | PAID, Occupied, Resolved |
| `success-bg` | `#D1FAE5` | PAID chip background |
| `success-text` | `#065F46` | PAID chip text |
| `warning` | `#F59E0B` | PARTIAL, Notice Period, Expiring, Pending |
| `warning-bg` | `#FEF3C7` | Warning chip background |
| `warning-text` | `#92400E` | Warning chip text |
| `danger` | `#DC2626` | OVERDUE, HIGH BALANCE, Critical, Destructive |
| `danger-bg` | `#FEE2E2` | Danger chip background |
| `danger-text` | `#991B1B` | Danger chip text |
| `info` | `#3B82F6` | Informational alerts, CREDIT balance |
| `info-bg` | `#DBEAFE` | Info chip background |
| `info-text` | `#1E40AF` | Info chip text |
| `neutral` | `#64748B` | VACANT, Inactive, Under Repair |
| `neutral-bg` | `#F1F5F9` | Neutral chip background |
| `neutral-text` | `#334155` | Neutral chip text |

### Financial Balance Colors (CRITICAL)

| State | Color | Usage |
|-------|-------|-------|
| Balance = 0 | `#10B981` (success) | "Fully Paid" |
| Balance > 0 (owes) | `#DC2626` (danger) | "₱X,XXX owed" |
| Balance < 0 (credit) | `#0369A1` (accent) | "₱X,XXX credit" |

Always accompany with a label (never raw number alone). See edge case §9.11 in spec.

---

## 3. Typography

**Font family: Inter only.** Single family across all weights. Bundled in app assets (not loaded from CDN) to support offline receipt generation per spec §4.2 and §9.13.

```
Inter-Regular.ttf     → weight 400
Inter-Medium.ttf      → weight 500
Inter-SemiBold.ttf    → weight 600
Inter-Bold.ttf        → weight 700
Inter-ExtraBold.ttf   → weight 800
```

Expo: `expo-font` + `@expo-google-fonts/inter` or bundle TTFs directly.

### Type Scale (React Native)

| Role | Size | Weight | Line Height | Letter Spacing | Usage |
|------|------|--------|-------------|----------------|-------|
| `screen-title` | 24 | 800 | 29 | -0.5 | Screen headers (PropertyList title) |
| `section-header` | 18 | 700 | 24 | -0.3 | Card section headers |
| `card-title` | 16 | 600 | 22 | -0.2 | Card primary label, tenant name |
| `body` | 15 | 400 | 22 | 0 | Descriptions, notes |
| `label` | 13 | 500 | 18 | 0.2 | Field labels, metadata |
| `caption` | 12 | 400 | 16 | 0.1 | Timestamps, secondary meta |
| `amount-large` | 28 | 700 | 34 | -0.5 | Balance display, receipt amount |
| `amount-medium` | 20 | 600 | 26 | -0.3 | KPI card values |
| `amount-small` | 15 | 600 | 20 | 0 | List row amounts |
| `chip-label` | 11 | 600 | 14 | 0.5 | Status chips (ALL CAPS) |
| `tab-label` | 10 | 500 | 13 | 0.3 | Bottom tab labels |

**Tabular numerals**: For all financial figures, rent amounts, and dates in tables, use `fontVariant: ['tabular-nums']` to prevent layout shift.

---

## 4. Spacing System

Base unit: **8dp**. All spacing must be a multiple of 4.

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4dp | Icon-to-text gap, chip internal padding |
| `space-2` | 8dp | Between related items (icon + label) |
| `space-3` | 12dp | Input internal vertical padding |
| `space-4` | 16dp | Card internal padding, list item padding |
| `space-5` | 20dp | Section top padding |
| `space-6` | 24dp | Between card sections |
| `space-8` | 32dp | Screen top padding (below header) |
| `space-10` | 40dp | Major section separation |
| `space-12` | 48dp | Screen bottom padding (above tab bar) |

---

## 5. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 6 | Chips, badges, small tags |
| `radius-md` | 12 | Cards, list items |
| `radius-lg` | 16 | Bottom sheets, modals |
| `radius-xl` | 24 | Large modal headers |
| `radius-pill` | 999 | Pill buttons (primary CTA), rounded inputs |

---

## 6. Shadows (React Native)

Low-end Android safe. Use `elevation` only, keep values small.

```typescript
const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
};
```

Cards use `shadows.md`. Bottom sheets use `shadows.lg`. List items use no shadow (use border instead).

---

## 7. Component Specifications

### 7.1 Status Chip

The most frequently rendered component. Chips convey occupancy, payment, and alert states.

```typescript
// Always ALL CAPS label. Never use emoji. Use @expo/vector-icons for icons.
type ChipVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const chipStyles = {
  success: { bg: '#D1FAE5', text: '#065F46', border: '#10B981' },
  warning: { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' },
  danger:  { bg: '#FEE2E2', text: '#991B1B', border: '#DC2626' },
  info:    { bg: '#DBEAFE', text: '#1E40AF', border: '#3B82F6' },
  neutral: { bg: '#F1F5F9', text: '#334155', border: '#E2E8F0' },
};

// Dimensions
const chip = {
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 6,
  borderWidth: 1,
  fontSize: 11,
  fontWeight: '600',
  letterSpacing: 0.5,
  textTransform: 'uppercase',
};
```

**Status mapping:**
- PAID → `success`
- PARTIAL → `warning`
- UNPAID → `neutral` (not danger — overdue is danger)
- OVERDUE → `danger`
- CREDIT → `info`
- OCCUPIED → `success`
- VACANT → `neutral`
- NOTICE → `warning`
- BLACKLISTED → `danger`

### 7.2 KPI Card (Home Screen 2×2 Grid)

```typescript
const kpiCardColors = {
  income:      { accent: '#10B981', accentBg: '#D1FAE5' }, // Monthly Income
  occupancy:   { accent: '#0369A1', accentBg: '#DBEAFE' }, // Occupancy
  outstanding: { accent: '#DC2626', accentBg: '#FEE2E2' }, // Outstanding
  vacancy:     { accent: '#F59E0B', accentBg: '#FEF3C7' }, // Vacancies
};

// Left color bar: 4dp wide, full card height, rounded-left
// Primary value: amount-medium (₱XX,XXX)
// Secondary value: caption, text-secondary
// Touch target: entire card
```

### 7.3 Primary Button

Full-width at bottom of screens. Pill shape.

```typescript
const primaryButton = {
  height: 56,
  borderRadius: 999,
  backgroundColor: '#0F766E',
  paddingHorizontal: 24,
  // Text: 16px, weight 700, white
};
// Press: scale(0.97) + haptic Medium, 150ms spring
// Loading: ActivityIndicator replaces label, disabled
// Minimum touch: 56dp height ✓ (exceeds 44dp minimum)
```

### 7.4 Bottom Sheet (Modal Sheets)

Used for: Record Payment, Add Tenant quick action, Add Unit, Log Issue.

```typescript
// Library: @gorhom/bottom-sheet
const bottomSheet = {
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  backgroundColor: '#FFFFFF',
  handleStyle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginTop: 8,
  },
  // Scrim: rgba(0,0,0,0.5) — never less, preserves legibility
};
// Swipe-down to dismiss ✓
// Close button (X) top-right ✓
```

### 7.5 Swipe-Right Row Action (Quick Payment)

Used on two surfaces: **PaymentsOverview rows** (per spec §6.10) and **Home "Tenants Requiring Attention" rows**.

```typescript
// Library: react-native-gesture-handler (Swipeable)
const swipeAction = {
  // Revealed panel: amber bg, white "Record Payment" label + cash icon
  backgroundColor: '#F59E0B',
  width: 120,
  justifyContent: 'center',
  alignItems: 'center',
  // Icon: cash-outline 20dp white
  // Label: "Record" 12dp 600 white (keep short — panel is narrow)
};
// On swipe reveal → onPress → RecordPaymentScreen pre-filled:
//   tenancy_id, tenant name, unit, current balance, today's date
// Threshold: 40dp horizontal translation before action reveals
// Haptic: ImpactFeedbackStyle.Medium on full reveal
```

**Where swipe-right appears:**
- `PaymentsOverviewScreen` — all tenant rows (spec §6.10, already defined)
- `HomeScreen` "Requires Attention" section rows — **new, added here**

Do NOT add swipe-right to `TenantListScreen` (that list is for navigation, not action).

### 7.6 List Row (Tenant / Payment rows)

```typescript
const listRow = {
  height: 72,              // Minimum. Taller for 2-line content
  paddingHorizontal: 16,
  paddingVertical: 12,
  backgroundColor: '#FFFFFF',
  borderBottomWidth: 1,
  borderBottomColor: '#F1F5F9',
  // Press: backgroundColor '#F8FAFC', 100ms
  // No elevation on list rows — use border only
};
// Touch target: full row width × height ✓ (72 >> 44 minimum)
```

### 7.7 Form Inputs

```typescript
const input = {
  height: 52,              // ≥44dp minimum ✓
  borderRadius: 8,
  borderWidth: 1.5,
  borderColor: '#E2E8F0',
  backgroundColor: '#FFFFFF',
  paddingHorizontal: 16,
  fontSize: 15,
  fontWeight: '400',
  color: '#0F172A',
  // Focus: borderColor '#0F766E', ring shadow rgba(15,118,110,0.15)
  // Error: borderColor '#DC2626'
};

// Numeric inputs (ALL payment/amount fields):
// keyboardType="numeric" + inputMode="numeric"
// fontVariant: ['tabular-nums']
// Prefix label "₱" in-field, not placeholder

// Phone inputs: keyboardType="phone-pad", prefix "+63" shown
```

### 7.7 Alert Chip (Home Screen Strip)

```typescript
// Horizontal scroll row, only shown when alerts exist
const alertChip = {
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 20,
  // Critical (overdue/high balance): bg '#FEE2E2', border '#DC2626', text '#991B1B'
  // Warning (expiring/vacancy): bg '#FEF3C7', border '#F59E0B', text '#92400E'
  // Info: bg '#DBEAFE', border '#3B82F6', text '#1E40AF'
  gap: 6,  // between icon and text
  marginRight: 8, // between chips
};
// Icon: 14dp from @expo/vector-icons/Ionicons
```

### 7.8 TenantQuickSearchModal

Floating search accessible from **every screen** via the search icon. Primary use: "what does this tenant owe me?" answered in under 3 taps from anywhere.

**Trigger:** Floating search icon (bottom-right, above tab bar) on all screens except modal sheets.

**Layout:**
```
[ Search input — autofocused on open          ]
─────────────────────────────────────────────
  [Avatar] Juan dela Cruz          Room 3B
           ₱2,400.00 outstanding   OVERDUE
           [  Record Payment  ]  [  View  ]
─────────────────────────────────────────────
  [Avatar] Maria Santos            Bed A-2
           ₱0.00 paid in full      PAID
           [  View  ]
```

**Interaction rules:**
- Opens as a full-screen modal with `backgroundColor: 'rgba(0,0,0,0.6)'`
- TextInput autofocuses on open — keyboard appears immediately
- Search triggers on first keystroke, filters by: full name, unit number, phone number
- Results render as cards (max 5 visible, scrollable)
- Each result card shows: tenant name, unit/bed, balance (color-coded), status chip
- **"Record Payment" button** appears inline on each result card **only when balance > 0 or status is PARTIAL/OVERDUE**
  - Tapping it: dismisses search → opens `RecordPaymentScreen` pre-filled with that tenant
  - Total taps from any screen: search icon → type name → tap "Record Payment" = **3 taps**
- "View" button always present → navigates to `TenantDetailScreen`
- Empty state: "No tenants found" — not shown until after first keystroke
- Dismiss: tap scrim or swipe-down

```typescript
const quickSearchResult = {
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    ...shadows.md,
  },
  recordPaymentBtn: {
    // Only shown when balance > 0
    backgroundColor: '#0F766E',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    // Label: "Record Payment" 13dp 600 white
    // Minimum height 36dp (secondary action, not primary CTA)
  },
  viewBtn: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    // Label: "View" 13dp 600 text-secondary
  },
};
```

---

## 8. Navigation

### Bottom Tab Bar

5 tabs per spec. No more, no less.

```
Home | Properties | Tenants | Payments | Reports
```

```typescript
const tabBar = {
  height: 60 + safeAreaBottom, // Always respect safe area
  backgroundColor: '#FFFFFF',
  borderTopWidth: 1,
  borderTopColor: '#E2E8F0',
  // Active icon + label: '#0F766E' (primary teal)
  // Inactive icon: '#94A3B8' (text-muted)
  // Inactive label: '#94A3B8'
  // Label size: 10dp, weight 500
  // Icon size: 24dp
  // No floating tab bar — solid bottom, flush with safe area
};
```

**Badge**: Notification bell only. Tab badges never shown on bottom nav itself (per spec — notification is in header bell icon).

### Stack Navigator per Tab

- Use `createNativeStackNavigator` — hardware-accelerated, platform-native transitions
- `headerShown: false` on all screens (custom header inside each screen)
- Back gesture: preserve default platform behavior (iOS swipe-back, Android back button)
- `gestureEnabled: true` on all stack screens

### Header Bar (custom, each root screen)

```
[Property Selector ▾]    [Screen Title]    [🔔 Badge] [⚙]
```

- Height: 56dp + safeAreaTop
- backgroundColor: `#FFFFFF`
- borderBottom: 1dp `#E2E8F0`
- Property selector: 14dp medium, `#0F172A`, chevron-down icon right
- Title: 18dp weight 700, `#0F172A`, centered
- Icons: 24dp, `#475569` (secondary text)

---

## 9. Animation & Interaction

### Press Feedback (ALL interactive elements)

```typescript
// Pressable with Reanimated 2
const pressScale = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: pressScale.value }],
}));

// onPressIn: scale to 0.97, spring { mass: 1, damping: 20, stiffness: 300 }
// onPressOut: scale to 1.0, same spring
// Haptic: Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) on press
```

Timing: 150–300ms for all micro-interactions.  
Never animate `width`, `height`, `top`, `left` — transform/opacity only.

### Skeleton Loading

For all SQLite queries expected to take >100ms:

```typescript
// Skeleton pulse: opacity 0.4 → 1.0 → 0.4, 1200ms loop
// Color: '#E2E8F0' on '#F8FAFC' background
// Shape: match the real component shape exactly
```

Home screen KPI cards, tenant list, payment history all use skeleton on load.

### Scroll

- `scrollIndicatorInsets` set to account for bottom tab bar
- Pull-to-refresh on Home screen triggers full SQLite re-query
- No horizontal carousels on Home screen (spec §7.1 — all content vertical)
- Empty sections removed from DOM entirely (not empty placeholders)

---

## 10. Icons

**Library:** `@expo/vector-icons/Ionicons` (Ionicons v7, bundled with Expo).  
**NEVER** use emoji as icons. **NEVER** mix icon sets.

| Context | Icon Name | Size |
|---------|-----------|------|
| Tab: Home | `home-outline` / `home` | 24 |
| Tab: Properties | `business-outline` / `business` | 24 |
| Tab: Tenants | `people-outline` / `people` | 24 |
| Tab: Payments | `cash-outline` / `cash` | 24 |
| Tab: Reports | `bar-chart-outline` / `bar-chart` | 24 |
| Notification bell | `notifications-outline` | 24 |
| Settings | `settings-outline` | 24 |
| Record Payment (CTA) | `cash-outline` | 22 |
| Add Tenant | `person-add-outline` | 22 |
| Add Unit | `home-outline` | 22 |
| Log Issue | `construct-outline` | 22 |
| Alert: overdue | `alert-circle` | 14 |
| Alert: expiring | `time-outline` | 14 |
| Alert: vacancy | `home-outline` | 14 |
| Search | `search-outline` | 22 |
| Chevron right | `chevron-forward` | 16 |
| Check (paid) | `checkmark-circle` | 16 |
| Close | `close` | 20 |
| Back | `arrow-back` | 24 |
| Camera | `camera-outline` | 22 |
| Share | `share-outline` | 22 |

Outline icons for inactive/secondary; filled for active tab + PAID status.

---

## 11. Safe Area & Platform Requirements

```typescript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Every root screen wraps content:
// paddingTop: insets.top  (or header absorbs it)
// paddingBottom: insets.bottom + 60  (60 = tab bar height)

// Fixed CTAs at bottom of detail screens:
// paddingBottom: insets.bottom + 16
// width: '100%', paddingHorizontal: 16

// Keyboard avoiding: KeyboardAvoidingView behavior='padding' on all form screens
```

Never place tappable content within 8dp of screen edges (accounts for gesture zones).

---

## 12. Financial Data Display Rules

1. **Always prefix ₱** — `₱1,500.00` not `1500`
2. **Always show 2 decimal places** — use `toLocaleString('en-PH', { minimumFractionDigits: 2 })`
3. **Color + label for balance** — never raw number. Show: `₱2,400.00 outstanding` or `₱0.00 paid in full` or `₱500.00 credit`
4. **Receipt numbers** — monospace font, `PROPCODE-YYYY-MM-0001` format
5. **Dates** — `MMM D, YYYY` (e.g., "May 5, 2026") for display; ISO 8601 for storage
6. **Tabular numerals** — `fontVariant: ['tabular-nums']` on ALL amount columns

---

## 13. Offline-First UX Patterns

- All screens must render from SQLite with zero network dependency
- Network error states: never shown (app is local-only)
- Loading state: skeleton (not spinner) for queries taking >100ms
- Receipt generation: fully offline PNG via react-native-view-shot or canvas
- Receipt font: Inter bundled TTF (not loaded from CDN)
- Backup warning: shown on Home if `backup_last_at` > 14 days ago — amber banner below header

---

## 14. Anti-Patterns (FORBIDDEN)

- ❌ Glassmorphism / blur effects (GPU-heavy on low-end Android)
- ❌ Gradients on functional surfaces (use solid colors only)
- ❌ Emoji as icons (use Ionicons exclusively)
- ❌ Absolute font sizes below 12 (use type scale tokens)
- ❌ Touch targets below 44×44dp
- ❌ Horizontal scroll carousels on Home screen
- ❌ Empty state placeholders for hidden sections (remove from DOM)
- ❌ Internet-dependent receipt generation
- ❌ Absolute file paths for stored images (use relative paths — spec §9.9)
- ❌ Raw hex colors in component files (use design token constants)
- ❌ `TouchableOpacity` (use `Pressable` + Reanimated)
- ❌ `console.log` in production components
- ❌ Platform-checking for visual styles (use platform-adaptive approach)
- ❌ Showing balance as raw positive/negative without a label (spec §9.11)

---

## 15. Pre-Delivery Checklist

### Visual
- [ ] Status chips use exact color mapping from §2 (no ad-hoc colors)
- [ ] Balance amounts color-coded (green=zero/credit, red=owed, blue=credit)
- [ ] All icons from Ionicons only, no emoji
- [ ] ₱ prefix on all monetary values
- [ ] Tabular numerals on all amount columns

### Interaction
- [ ] All Pressables use scale(0.97) + haptic on press
- [ ] Touch targets ≥ 44×44dp verified
- [ ] Amount inputs: keyboardType="numeric" + inputMode="numeric"
- [ ] Phone inputs: keyboardType="phone-pad"
- [ ] Loading state: skeleton (not spinner) for data queries

### Layout
- [ ] Safe area insets applied to all root screens
- [ ] Bottom CTA bars clear safe area bottom
- [ ] ScrollView content clears tab bar (paddingBottom: 60+insets.bottom)
- [ ] No horizontal scroll on any screen
- [ ] Empty sections removed entirely (not empty placeholder)

### Offline / Data
- [ ] Receipt generation uses bundled Inter TTF
- [ ] Image paths stored relative (not absolute)
- [ ] SQLite queries tested with 1000+ records for Home screen
- [ ] Backup warning shown if >14 days since last backup

### Accessibility
- [ ] accessibilityLabel on all icon-only buttons
- [ ] accessibilityRole on interactive elements
- [ ] Color not the only status indicator (always accompany with text)
- [ ] Dynamic Type not breaking layout at largest size
