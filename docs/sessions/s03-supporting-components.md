# Session 03 — P1 + P2 Supporting Components

**Prerequisites:** Session 01 (tokens), Session 02 (P0 components — these are dependencies for some P1/P2 components).

**Output:** 20 components in `components/ui/`. All exported from `components/ui/index.ts`.

---

## Locked Design Decisions

- Dark mode only. Use `colors.*` from `constants/theme.ts`. No hardcoded hex.
- `Pressable` + Reanimated scale(0.97). Never `TouchableOpacity`.
- Ionicons only. Touch targets ≥ 44×44dp.
- Always follow `references/dark/` images for visual details.

---

## P1 Components

### 3.1 — `MonthTabSelector`

**File:** `components/ui/MonthTabSelector.tsx`

```ts
interface MonthTabSelectorProps {
  months: string[]       // e.g. ['Feb', 'Mar', 'Apr', 'May', 'Jun']
  selected: string
  onChange: (month: string) => void
}
```

Horizontal `ScrollView`, no scrollbar. Each tab: text `colors.textSecondary`, fontSize 14. Selected tab: text `colors.textPrimary`, `backgroundColor: colors.primary`, rounded pill, `paddingHorizontal: 16`, `paddingVertical: 8`. `gap: 8`.

Reference: dark_09, dark_14, dark_31, dark_33, dark_34, dark_35.

---

### 3.2 — `SegmentedControl`

**File:** `components/ui/SegmentedControl.tsx`

```ts
interface SegmentedControlProps {
  options: string[]
  selected: string
  onChange: (value: string) => void
  fullWidth?: boolean   // default true — divides equally
}
```

Row of options in a `colors.elevated` container, `borderRadius: 12`, `padding: 4`. Selected option: `backgroundColor: colors.primary`, `borderRadius: 8`, text white. Unselected: transparent, text `colors.textSecondary`.

Reference: dark_21 (unit type: Studio/1BR/2BR/Bedspacer), dark_31 (scope: All properties / Building only).

---

### 3.3 — `PropertyCard`

**File:** `components/ui/PropertyCard.tsx`

```ts
interface PropertyChip { label: string; variant: 'neutral' | 'success' | 'danger' }

interface PropertyCardProps {
  name: string
  address: string
  chips: PropertyChip[]           // e.g. [{label:'16 units'}, {label:'14 occupied', variant:'success'}, {label:'2 vacant', variant:'danger'}]
  monthlyIncome: number           // ₱42,000
  occupancyPct: number            // 0–100
  onPress: () => void
}
```

Visual spec: `backgroundColor: colors.surface`, `borderRadius: 12`, `padding: 16`, `marginBottom: 12`. Property name bold (fontSize 16, weight 700). Address: `colors.textSecondary` small. Chips row (small rounded chips). Full-width progress bar (height 4, success color). Monthly income: `colors.textSecondary` caption.

Reference: dark_18.

---

### 3.4 — `FloorTabSelector`

**File:** `components/ui/FloorTabSelector.tsx`

```ts
interface FloorTabSelectorProps {
  floors: number[]     // [1, 2, 3]
  selected: number
  onChange: (floor: number) => void
}
```

Same visual style as `FilterChipBar` but with "Floor N" labels. Horizontal scroll. Selected: `colors.primary` bg. Unselected: `colors.surface` with border.

Reference: dark_19 (Floor 1 | Floor 2 | Floor 3 tabs).

---

### 3.5 — `UnitGridCard`

**File:** `components/ui/UnitGridCard.tsx`

```ts
type UnitStatus = 'paid' | 'overdue' | 'vacant' | 'partial'

interface UnitGridCardProps {
  unitName: string        // "Unit 1A"
  tenantName?: string     // "Santos, Jose" — absent if vacant
  status: UnitStatus
  onPress: () => void
}
```

Visual spec: `backgroundColor: colors.surface`, `borderRadius: 10`, `padding: 12`. **Left border strip:** `borderLeftWidth: 3`, color by status (`paid`→`#10B981`, `overdue`→`#EF4444`, `partial`→`#F59E0B`, `vacant`→`#64748B`). Unit name: fontSize 14, weight 600. Tenant name: fontSize 12, `colors.textSecondary`. `StatusChip` below tenant name.

Grid layout: 2-column, `gap: 8`, driven by parent FlatList with `numColumns={2}`.

Reference: dark_19.

---

### 3.6 — `DocumentRow`

**File:** `components/ui/DocumentRow.tsx`

```ts
type DocCategory = 'contract' | 'photo' | 'permit' | 'gov-id' | 'other'

interface DocumentRowProps {
  title: string
  category: DocCategory
  date: string             // "Mar 1, 2024"
  onPress: () => void
}
```

Left icon: category-specific color bg square (borderRadius 8, 40×40), icon inside. Title: fontSize 15, weight 600. Subtitle: `${category} · ${date}`, `colors.textSecondary`. Chevron right on the trailing edge.

Category icon + color:
- contract: `document-outline`, bg `#1E3A5F`
- photo: `image-outline`, bg `#1A3A2A`
- permit: `ribbon-outline`, bg `#2A2A1A`
- gov-id: `card-outline`, bg `#2A1A2A`
- other: `folder-outline`, bg `#1E2533`

Reference: dark_25, dark_28.

---

### 3.7 — `MaintenanceRow`

**File:** `components/ui/MaintenanceRow.tsx`

```ts
type MaintenanceStatus = 'reported' | 'in-progress' | 'resolved'

interface MaintenanceRowProps {
  title: string          // "Leaking faucet — Unit 1A"
  category: string       // "Plumbing"
  date: string
  status: MaintenanceStatus
  cost?: number          // shown if resolved
  onPress?: () => void
}
```

Left: colored dot (8dp circle). `reported`→`#F59E0B`, `in-progress`→`#EF4444`, `resolved`→`#10B981`. Title: fontSize 15, weight 600. Subtitle: `${category} · ${date}`. `StatusChip` on trailing right. Cost below chip if resolved.

Reference: dark_23.

---

### 3.8 — `SettingsRow`

**File:** `components/ui/SettingsRow.tsx`

```ts
type SettingsRowType = 'navigate' | 'toggle' | 'info'

interface SettingsRowProps {
  label: string
  value?: string          // trailing label (for navigate rows)
  type: SettingsRowType
  onPress?: () => void
  isEnabled?: boolean     // for toggle rows
  onToggle?: (val: boolean) => void
  valueColor?: string     // e.g. success color for "Today 8:00am"
}
```

`backgroundColor: colors.surface`, `paddingHorizontal: 16`, `paddingVertical: 16`. Divider `colors.border` 1dp at bottom (within group). Label: `colors.textPrimary`. Value: `colors.textSecondary` (or `valueColor` override). Navigate rows: chevron-forward icon. Toggle rows: `Switch` with `trackColor={{ true: colors.primary }}`.

Group sections: group rows in a card container `borderRadius: 12` with section label above (`colors.textMuted`, uppercase caption).

Reference: dark_03.

---

### 3.9 — `NotificationRow`

**File:** `components/ui/NotificationRow.tsx`

```ts
type NotifType = 'overdue' | 'expiring' | 'vacant' | 'high-balance' | 'resolved'

interface NotificationRowProps {
  type: NotifType
  title: string      // "Unit 3B — Rent overdue"
  subtitle: string   // "Jose Santos · ₱3,500 · Day 12"
  timestamp: string  // "2h"
  onPress?: () => void
}
```

Left: 40×40 rounded square icon. Colors by type: `overdue`→danger bg+icon, `expiring`→warning, `vacant`→neutral, `high-balance`→danger, `resolved`→success. Title: fontSize 15, weight 600. Subtitle: fontSize 13, `colors.textSecondary`. Timestamp: fontSize 12, `colors.textMuted`, top-right.

Reference: dark_02.

---

### 3.10 — `InfoRow`

**File:** `components/ui/InfoRow.tsx`

```ts
interface InfoRowProps {
  label: string
  value: string
  valueColor?: string    // default colors.textPrimary
  bold?: boolean         // bolds both label and value (for totals)
  showDivider?: boolean  // default true
}
```

Two-column row: label left (`colors.textSecondary`, fontSize 14), value right (fontSize 14, weight 500). Divider `colors.border` 1dp at bottom. `bold` variant: both sides weight 700.

Reference: dark_29 (bill breakdown), dark_30 (payment info table).

---

### 3.11 — `AmenityChipSelector`

**File:** `components/ui/AmenityChipSelector.tsx`

```ts
const AMENITIES = ['Aircon', 'WiFi', 'Private CR', 'Furnished', 'Parking', 'Water included']

interface AmenityChipSelectorProps {
  selected: string[]
  onToggle: (amenity: string) => void
  options?: string[]   // defaults to AMENITIES
}
```

Wrapping flex row of toggleable chips. Selected: `colors.primary` bg, white text. Unselected: `colors.surface` bg, `colors.border` border, `colors.textSecondary` text. Chip padding: `paddingHorizontal: 14`, `paddingVertical: 8`, `borderRadius: pill`.

Reference: dark_21.

---

### 3.12 — `ReportMenuCard`

**File:** `components/ui/ReportMenuCard.tsx`

```ts
interface ReportMenuCardProps {
  icon: string          // Ionicons name
  iconBg: string        // background color for icon square
  label: string
  onPress: () => void
}
```

`backgroundColor: colors.surface`, `borderRadius: 12`, `padding: 16`. Icon square: 48×48, `borderRadius: 12`, icon 24dp white. Label: fontSize 13, weight 500, `colors.textSecondary`, below icon, `marginTop: 8`. Press: scale(0.96).

Icon + bg from dark_13:
| Report | Icon | Bg |
|--------|------|----|
| Monthly collection | `briefcase-outline` | `#052E16` |
| Outstanding balances | `alert-circle-outline` | `#200C0C` |
| Occupancy rate | `home-outline` | `#0C1A3D` |
| Per-unit income | `stats-chart-outline` | `#1A1040` |
| Annual summary | `calendar-outline` | `#052E16` |
| Maintenance costs | `construct-outline` | `#2A1A00` |
| Deposit summary | `wallet-outline` | `#1E2533` |

Reference: dark_13.

---

### 3.13 — `WarningBanner`

**File:** `components/ui/WarningBanner.tsx`

```ts
type BannerVariant = 'warning' | 'danger' | 'info'

interface WarningBannerProps {
  message: string
  variant?: BannerVariant   // default 'warning'
}
```

Full-width, `padding: 12`, `borderRadius: 8`, `marginHorizontal: 16`. Warning variant: `backgroundColor: colors.warningBg`, text `colors.warningText`. Danger: `dangerBg` / `dangerText`. Info: `infoBg` / `infoText`. fontSize 13.

Reference: dark_08 (amber warning), dark_31 (info banner).

---

### 3.14 — `SettlementRow`

**File:** `components/ui/SettlementRow.tsx`

```ts
type SettlementVariant = 'deduction' | 'credit' | 'neutral' | 'total'

interface SettlementRowProps {
  label: string
  amount: number
  variant: SettlementVariant
}
```

Full-width row `paddingVertical: 12`, `paddingHorizontal: 16`, bg `colors.elevated`. Label: `colors.textSecondary`. Amount: right-aligned. `deduction`→red with `−₱` prefix, `credit`→green with `+₱`, `neutral`→`colors.textPrimary`. `total` variant: `backgroundColor: colors.surface`, bolder, larger text.

Reference: dark_08.

---

## P2 Components

### 4.1 — `ProgressStepIndicator`

**File:** `components/ui/ProgressStepIndicator.tsx`

```ts
interface ProgressStepIndicatorProps {
  steps: number
  current: number   // 1-based
}
```

Row of `steps` horizontal bars. Completed/current: `colors.primary`. Future: `colors.border`. Height 3, gap 4, `borderRadius: pill`. Full width.

Reference: dark_07 (5 steps), dark_17 (4 steps).

---

### 4.2 — `BedSlotCard`

**File:** `components/ui/BedSlotCard.tsx`

```ts
type BedStatus = 'paid' | 'overdue' | 'vacant'

interface BedSlotCardProps {
  bedLabel: string        // "Bed A1"
  tenantName?: string     // surname only, e.g. "Santos"
  status: BedStatus
  onPress?: () => void
}
```

Square card `borderRadius: 8`, `padding: 10`. bg by status: `paid`→`#052E16`, `overdue`→`#200C0C`, `vacant`→`#1E2533`. Bed label: fontSize 12, weight 600, `colors.textPrimary`. Tenant name or "Vacant": fontSize 11, `colors.textSecondary`.

Reference: dark_22.

---

### 4.3 — `ReceiptDocument`

**File:** `components/ui/ReceiptDocument.tsx`

```ts
interface ReceiptDocumentProps {
  buildingName: string
  address: string
  receiptNo: string         // "A-2026-05-0018"
  tenantName: string
  unitName: string
  date: string              // "May 5, 2026 · 2:34 PM"
  forPeriod: string         // "Rent — May 2026"
  amountPaid: number
  balanceAfter: number
  receivedBy: string        // "Ernie Flores (Owner)"
}
```

White card on dark screen. `backgroundColor: '#FFFFFF'`, `borderRadius: 12`, `padding: 20`, `marginHorizontal: 16`. All text: `colors.textInverse` (`#0F172A`). Building name: centered, bold. Dividers: `#E2E8F0`. Amount: fontSize 28, weight 700, centered. Balance after: colored (positive=`#EF4444`, zero=`#10B981`). Font: Inter (bundled TTF — do not load from CDN).

Reference: dark_11.

---

### 4.4 — `PINKeypad`

**File:** `components/ui/PINKeypad.tsx`

```ts
interface PINKeypadProps {
  enteredLength: number    // 0–4 — drives dot indicator display
  onDigit: (digit: string) => void
  onBackspace: () => void
  onBiometric?: () => void
}
```

3×4 grid of keys (1–9, then 0 + backspace). Key: 72×72, `borderRadius: 12`, `backgroundColor: colors.elevated`, fontSize 24, weight 500. Active press: `backgroundColor: colors.surface`. 4-dot indicator above keypad (filled dots = `colors.primary`, empty = `colors.border`). "Use Biometrics" button below: `colors.textLink`, Ionicons `finger-print` icon.

Reference: dark_16.

---

### 4.5 — `OccupancyBarChart`

**File:** `components/ui/OccupancyBarChart.tsx`

```ts
interface MonthBar { month: string; pct: number }

interface OccupancyBarChartProps {
  data: MonthBar[]          // 6 entries
  activeMonth?: string      // highlighted bar
}
```

Use `react-native-svg` (or `victory-native` if already in deps — check `package.json`). 6 vertical bars, equal width, gap between. Active bar: `colors.primary` `#3B82F6`. Other bars: slightly muted blue `#1D4ED8`. Month label below bar. Height of bar proportional to `pct`. No grid lines — clean dark chart.

Reference: dark_32.

---

### 4.6 — `CameraCapture`

**File:** `components/ui/CameraCapture.tsx`

```ts
interface CameraCaptureProps {
  label: string               // "Front of valid ID"
  onCapture: () => void
  captured?: string           // URI if already captured
  hint?: string               // optional note below zone
}
```

Dashed-border rectangle zone `borderRadius: 8`, `borderWidth: 1.5`, `borderStyle: 'dashed'`, `borderColor: colors.primary`, `backgroundColor: colors.elevated`. Height 140. Camera icon (`camera-outline`) centered, `colors.primary`. Tap zone calls `onCapture`. If `captured`: shows thumbnail. Hint text: fontSize 12, `colors.textMuted`.

Reference: dark_26.

---

## Export All New Components

Append to `components/ui/index.ts`:

```ts
export { MonthTabSelector } from './MonthTabSelector'
export { SegmentedControl } from './SegmentedControl'
export { PropertyCard } from './PropertyCard'
export { FloorTabSelector } from './FloorTabSelector'
export { UnitGridCard } from './UnitGridCard'
export { DocumentRow } from './DocumentRow'
export { MaintenanceRow } from './MaintenanceRow'
export { SettingsRow } from './SettingsRow'
export { NotificationRow } from './NotificationRow'
export { InfoRow } from './InfoRow'
export { AmenityChipSelector } from './AmenityChipSelector'
export { ReportMenuCard } from './ReportMenuCard'
export { WarningBanner } from './WarningBanner'
export { SettlementRow } from './SettlementRow'
export { ProgressStepIndicator } from './ProgressStepIndicator'
export { BedSlotCard } from './BedSlotCard'
export { ReceiptDocument } from './ReceiptDocument'
export { PINKeypad } from './PINKeypad'
export { OccupancyBarChart } from './OccupancyBarChart'
export { CameraCapture } from './CameraCapture'
```

---

## Done Criteria

- [ ] All 20 components exist and are exported
- [ ] No hardcoded hex values
- [ ] `OccupancyBarChart` — confirm chart library available (check `package.json`); if not, note which package to add
- [ ] `ReceiptDocument` — uses bundled Inter TTF, not CDN
- [ ] `PINKeypad` — 4-dot indicator updates correctly
- [ ] TypeScript compiles clean
