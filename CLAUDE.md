# Project Guidelines

## Package First

Always install an npm/expo package when one exists for the task. Do not reinvent functionality that a well-maintained package already provides — date pickers, form validation, animations, image handling, etc.

Check npm/expo ecosystem before writing custom logic. Prefer packages that are:
- Expo-compatible (expo-*, react-native-* with Expo support)
- Actively maintained
- Widely adopted

## Component Extraction

Always extract reusable components — especially when:
- A UI pattern appears more than once
- A screen section has self-contained logic (form state, data fetching, calculations, conditional rendering)
- A component would be independently testable

Place components in `components/ui/` for generic UI primitives, or `components/` subdirectories grouped by domain (e.g. `components/billing/`, `components/tenants/`).

Prefer small, focused components over large monolithic screens. If a screen file grows beyond ~200 lines, extract sections into sub-components.

## Tech Stack

- Expo Router (file-based routing)
- NativeWind / Tailwind CSS for styling
- Dark mode only — reference `references/` screenshots for visual targets
- Primary color: `#3B82F6` (blue)
- Bottom tab bar: 4 tabs
- Date formatting/manipulation: `dayjs` (not date-fns)

## Safe Area

Always wrap screen content in `<ScreenView>` from `components/ui`. It handles `bg-app`, `flex-1`, and safe-area insets automatically.

```tsx
import { ScreenView } from '../components/ui'

// Screen with AppHeader (top handled by native stack header):
<ScreenView edges={['bottom']}>
  ...
</ScreenView>

// Full-screen custom layout (no AppHeader — lock, onboarding, modals):
<ScreenView>   {/* defaults to edges={['top', 'bottom']} */}
  ...
</ScreenView>
```

For scrollable content inside `ScreenView`, still add `contentContainerStyle={{ paddingBottom: 120 }}` on FlatList/ScrollView to clear the floating tab bar — `ScreenView` only pads the gesture bar, not the tab bar.

**Do NOT use `<SafeAreaView>` from `react-native`** — it ignores the dark theme. Never call `useSafeAreaInsets()` directly in screen files; use `ScreenView` instead.

## Conventions

- TypeScript strict mode
- Functional components with hooks only
- No class components
- API calls go in `lib/api/`
- Shared types in `types/index.ts`
