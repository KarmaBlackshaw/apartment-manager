# Plan: Add Properties & Units as 5th Visible Tab

## Goal
Promote the existing `properties` route group from hidden (`href: null`) to a visible 5th tab in the FloatingTabBar, inserted between Billing and Reports.

## Steps

1. [low] Reorder and unhide Properties tab — `app/(admin)/_layout.tsx`
   - Move `properties` `<Tabs.Screen>` registration to after `billing` and before `reports`
   - Remove `href: null` from its options
   - Final form: `<Tabs.Screen name="properties" options={{ title: 'Properties' }} />`
   - Leave `payments`, `settings`, `notifications` untouched (still href: null)

2. [low] Add `properties` to FloatingTabBar ICONS map — `components/navigation/FloatingTabBar.tsx`
   - Add entry: `properties: { on: 'business', off: 'business-outline' }`
   - Place between `billing` and `reports` entries to mirror tab order
   - No other changes needed — flex-1 layout handles resize automatically

## Risks
- **Label overflow on narrow devices** — "Properties" is longest label. Fallback: rename to `'Property'` via `options={{ title: 'Property' }}` if clipping observed.
- **Tab order change** — inserted between Billing/Reports. Pre-launch so muscle-memory cost is negligible.
