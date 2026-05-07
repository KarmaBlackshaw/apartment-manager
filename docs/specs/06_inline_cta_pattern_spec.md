# Inline CTA Pattern — Reverse the Sticky Migration

**Status:** Active. Supersedes the rejected sticky-CTA direction (former spec 05, now deleted).
**Trigger:** User reviewed the sticky `BottomCTABar` pattern, rejected it — "the CTA bar implementation is wrong, the plan is to move away from sticky bottom; we need to always follow the design spec." Spec 05's changes were **discarded before merge**, so the codebase is at its pre-spec-05 state; this spec applies directly.
**Audience:** Engineer agent.
**Skills consulted:** `using-superpowers`, `ui-ux-pro-max` (rules §5 `content-priority`, §8 `submit-feedback`, `multi-step-progress`, `primary-action`).

---

## 0. TL;DR

**Canonical pattern (new):** the primary submit/CTA flows **inline** at the end of the form's `ScrollView`. No `BottomCTABar`. No chromed footer bar. The button sits in normal document flow with `mt-4` (or step-spec-specified) gap above the last field. ScrollView keeps `pb-[88px]` to clear the floating pill nav.

**Why:** the locked design references (dark_07 Add Tenant, dark_08 Move-Out, etc.) show the CTA flowing with content. The chromed `bg-surface border-t border-border` bar that spec 05 introduced **does not exist** in the design. Engineering chose docked sticky for ergonomic reasons (rule §8 `submit-feedback`), but the user has overruled: **design wins.**

**Scope of reversal:**
- All 8 screens currently using `BottomCTABar` revert to inline.
- `BottomCTABar` is **deleted** (not just deprecated — there are no remaining valid consumers per the design).
- `WizardShell` (from `01_form_and_wizard_components_spec.md`) is reworked to render the wizard CTA inline at the end of step content, not in a docked bar.
- `CLAUDE.md` "Sticky CTA rule" is replaced with an "Inline CTA rule".
- Memory entry `feedback_sticky_cta.md` is replaced with `feedback_inline_cta.md`.

---

## 1. Why this reversal — design rationale

| Consideration | Outcome |
|---|---|
| **Design fidelity (highest priority).** Reference images for every form screen show the primary action flowing with content. There is no chromed footer bar in any reference. | Inline wins. |
| **Floating pill nav already at bottom.** A second persistent bar above the pill creates visual stacking ("which thing is the bottom of the screen?"). The pill IS the persistent chrome. | Inline wins. |
| **Rule §8 `submit-feedback`** (sticky reasoning). Inline buttons can scroll off-screen on long forms. | Mitigation: `pb-[88px]` keeps button reachable above the pill; long forms get programmatic scroll-to-button on submit attempt (§4.3). |
| **Rule §8 `multi-step-progress`** (wizards). Argued for sticky chrome with progress indicator. | Mitigation: wizard step indicator stays at top of scroll content (already does). The Next CTA is inline at end. Same UX, simpler chrome. |
| **Tab bar collision.** With the floating pill nav at `bottom-16`, a sticky `BottomCTABar` collides visually. Either you hide the pill (`useHideTabBar`) and replace it with the bar — losing nav — or stack them — visual mess. | Inline avoids the choice entirely; pill stays put. |

**Note:** when implementing spec 05, the engineer hid the tab bar (`useHideTabBar` inside `BottomCTABar`) on every CTA screen. Reverting to inline means the **tab bar stays visible** on form screens. Confirm this matches the reference behavior in spec 06's screen-by-screen reverification (§5).

---

## 2. Audit — what to revert

### 🔴 Currently using `BottomCTABar` — REVERT to inline

| # | Screen | File | Current | Target |
|---|---|---|---|---|
| 1 | Add Tenant (5-step wizard) | `app/(admin)/tenants/new.tsx` (via `WizardShell`) | Sticky bar | Wizard CTA at end of step scroll. **Requires WizardShell rework — see §4.** |
| 2 | Onboarding (4-step) | `app/onboarding.tsx` | Sticky bar with Next/Back | CTAs inline at end of step content |
| 3 | Move-Out | `app/(admin)/tenants/[id]/move-out.tsx` | Sticky Confirm + Cancel below | Inline Confirm at end of body; Cancel as text `Pressable` below it (still inline) |
| 4 | Utility Reading | `app/(admin)/billing/utility.tsx` | Sticky bar | Inline at end of form |
| 5 | Bill Detail | `app/(admin)/billing/[id].tsx` | Sticky Record Payment + Add Charge | Inline; both stack at end of body. Record Payment primary, Add Charge secondary |
| 6 | Generate Bills | `app/(admin)/billing/generate.tsx` | Sticky bar | Inline at end of form |
| 7 | Record Payment | `app/(admin)/billing/new.tsx` | Sticky bar | Inline at end of form |
| 8 | Payment Detail | `app/(admin)/billing/payments/[id].tsx` | Sticky View Receipt + Void Payment | Inline; both stack at end of body |

### 🟢 Already inline — NO CHANGE

Spec 05 would have migrated these to sticky, but its changes were discarded. They remain inline; no work needed beyond confirming the pattern matches §3.1.

| Screen | File |
|---|---|
| Settings General | `app/(admin)/settings/general.tsx` |
| Settings Rates | `app/(admin)/settings/rates.tsx` |
| Settings Add Unit | `app/(admin)/settings/units/new.tsx` |
| Add Property | `app/(admin)/properties/new.tsx` |
| Add Unit (property-scoped) | `app/(admin)/properties/[propertyId]/units/new.tsx` |
| Edit Property | `app/(admin)/properties/[propertyId]/edit.tsx` |

If a quick review reveals any of these now uses a different chrome (the user's discard
should have cleaned this up — verify via `grep -l "BottomCTABar" <file>` returning empty),
match §3.1 exactly. Otherwise, leave alone.

### Out of scope (no submit button — unchanged)

List screens, detail screens with card-level actions, settings index, app lock — unchanged from spec 05. FAB pattern stays for lists. Card actions stay on detail screens.

---

## 3. Canonical inline pattern

### 3.1 Single primary CTA (most common)

```tsx
return (
  <ScreenLayout title="…">
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1"
    >
      <ScrollView
        contentContainerClassName="px-4 pt-3 pb-[88px]"
        keyboardShouldPersistTaps="handled"
      >
        {/* form fields */}

        <Button
          label="Save"
          onPress={handleSubmit(onSubmit)}
          loading={isPending}
          className="mt-4"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  </ScreenLayout>
)
```

**Rules:**
- The CTA is the **last child of the ScrollView**, never outside it.
- `mt-4` (16dp) gap above. No more, no less. Consistent rhythm across all screens.
- `pb-[88px]` on `contentContainerClassName` — clears the floating pill nav and gives the button breathing room.
- `KeyboardAvoidingView` still wraps everything; on iOS the keyboard pushes the button up because it's part of the scroll content (the scroll grows above the keyboard).
- The button **scrolls with the content**. This is intentional. On long forms, the user fills fields top-to-bottom and reaches the button at the end.

### 3.2 Primary + secondary text action

```tsx
<Button label="Confirm Move-Out" onPress={handleConfirm} loading={isPending} className="mt-4" />
<Pressable onPress={handleCancel} className="items-center mt-3" accessibilityRole="button">
  <AppText variant="caption" color="muted">Cancel</AppText>
</Pressable>
```

Same shape as before — primary `Button` then secondary text `Pressable` below — but **inside the ScrollView**, not in `BottomCTABar`.

### 3.3 Two primary actions (Bill Detail, Payment Detail)

```tsx
<Button label="Record Payment" onPress={handleRecord} className="mt-4" />
<Button label="Add Charge"     onPress={handleAdd}    variant="secondary" className="mt-2" />
```

Stack vertically with `mt-2` between them. Both inside the ScrollView at end of body.

### 3.4 Wizards (Add Tenant, Onboarding)

```tsx
{/* inside the step's render */}
<View>
  {fields}
</View>
<Button
  label={step < total ? `Next — ${shortTitle}` : 'Save'}
  onPress={handleNext}
  loading={isPending}
  className="mt-4"
/>
{step > 1 && (
  <Pressable onPress={handleBack} className="items-center mt-3">
    <AppText variant="caption" color="muted">Back</AppText>
  </Pressable>
)}
{step.optional && (
  <Pressable onPress={handleSkip} className="items-center mt-3">
    <AppText variant="caption" color="muted">Skip (not recommended)</AppText>
  </Pressable>
)}
```

**The wizard CTA is no longer rendered by `WizardShell`'s footer dock — it's rendered inline at the end of each step's content area, owned by the shell but positioned in the scroll.** See §4 for `WizardShell` rework.

### 3.5 Destructive action (Edit Property — Delete)

Same as spec 05 §4.2 Option B (the design-spec direction was already correct here):

```tsx
{/* form fields */}

<Button label="Save Changes" onPress={handleSave} loading={updating} className="mt-4" />

<View className="mt-8 pt-4 border-t border-border">
  <AppText variant="caption" color="muted" className="mb-2">Danger zone</AppText>
  <Button label="Delete Property" variant="danger" onPress={handleDelete} loading={deleting} />
</View>
```

Save is the primary CTA. Delete is visually separated below a divider in a "Danger zone" group. Both inside the ScrollView.

---

## 4. `WizardShell` rework

`WizardShell` from `01_form_and_wizard_components_spec.md` currently (per its own §2.10) renders a `BottomCTABar` with the Next/Submit/Skip controls. **That section is now wrong and must be revised.**

### 4.1 New responsibility split

| Concern | Old (spec 01 v1) | New (after this spec) |
|---|---|---|
| Step state machine | `WizardShell` | `WizardShell` (unchanged) |
| Per-step validation | `WizardShell` | `WizardShell` (unchanged) |
| Back nav / discard guard | `WizardShell` | `WizardShell` (unchanged) |
| Progress indicator | `WizardShell` | `WizardShell` (unchanged, top of step) |
| Tab bar hide | `WizardShell` (via `BottomCTABar`'s `useHideTabBar`) | **Removed** — pill nav stays visible during wizard |
| CTA layout (Next / Skip / Back) | `WizardShell` rendered in `BottomCTABar` | `WizardShell` renders **inline at end of step's scroll content**, no chrome |
| Safe-area bottom inset | `BottomCTABar` | `pb-[88px]` on `ScrollView` (built into `WizardShell`'s scroll wrapper) |

### 4.2 Updated `WizardShell` render skeleton

```tsx
return (
  <ScreenLayout title={screenTitle(currentStep)}>
    <KeyboardAvoidingView behavior={…} className="flex-1">
      <ScrollView contentContainerClassName="px-4 pt-3 pb-[88px]" keyboardShouldPersistTaps="handled">
        <SectionLabel>{`Step ${idx+1} of ${steps.length} — ${currentStep.title}`}</SectionLabel>
        <ProgressStepIndicator steps={steps.length} current={idx+1} />

        {currentStep.render()}

        {/* CTAs inline at end of scroll content */}
        <Button
          label={isLast ? submitLabel : `Next — ${steps[idx+1].shortTitle}`}
          onPress={handleNext}
          loading={isSubmitting}
          className="mt-4"
        />
        {currentStep.optional && (
          <Pressable onPress={handleSkip} className="items-center mt-3">
            <AppText variant="caption" color="muted">Skip (not recommended)</AppText>
          </Pressable>
        )}
        {/* Back is in the screen header, not here — already implemented via headerLeft override */}
      </ScrollView>
    </KeyboardAvoidingView>
  </ScreenLayout>
)
```

No `BottomCTABar`. No `useHideTabBar`. The pill nav remains visible — `pb-[88px]` ensures the Next button isn't covered by it.

### 4.3 Knock-on effect on `01_form_and_wizard_components_spec.md`

That spec must be edited:

- **§1 inventory:** drop `BottomCTABar` from the dependency list of `WizardShell`. Keep `ProgressStepIndicator`, `Button`, `ScreenLayout`, `useDiscardGuard`.
- **§2.10 `WizardShell` body:** replace the "renders inside `BottomCTABar`" paragraph with the §4.2 skeleton above.
- **§4 build order:** confirm `WizardShell` no longer depends on `BottomCTABar`. Removes one dep edge.
- **§9 file tree:** remove `BottomCTABar` from the consumer list.

### 4.4 Slim consumer (`02_add_tenant_wizard_spec.md` §15)

The `tenants/new.tsx` skeleton in spec 02 §15 references `WizardShell` — no consumer-side change needed; the shell's internals shift but its API (`steps`, `onSubmit`, `submitLabel`, etc.) is unchanged.

---

## 5. Migration steps (one PR, sequential)

| # | Task | Complexity | Files |
|---|---|---|---|
| 1 | Revise `01_form_and_wizard_components_spec.md` per §4.3 above | XS | spec file |
| 2 | Rework `WizardShell` per §4.2 — remove `BottomCTABar`, render CTAs inline | S | `components/form/WizardShell.tsx` |
| 3 | Migrate Add Tenant via the WizardShell rework — no consumer changes needed | XS | none (auto via WizardShell) |
| 4 | Migrate Onboarding — replace `BottomCTABar` with inline `Button` + Back/Skip per §3.4 | S | `app/onboarding.tsx` |
| 5 | Migrate Move-Out — Confirm + Cancel inline at end of scroll per §3.2 | S | `app/(admin)/tenants/[id]/move-out.tsx` |
| 6 | Migrate Utility Reading — single primary inline | S | `app/(admin)/billing/utility.tsx` |
| 7 | Migrate Bill Detail — two primaries stacked inline per §3.3 | S | `app/(admin)/billing/[id].tsx` |
| 8 | Migrate Generate Bills — single primary inline | S | `app/(admin)/billing/generate.tsx` |
| 9 | Migrate Record Payment — single primary inline | S | `app/(admin)/billing/new.tsx` |
| 10 | Migrate Payment Detail — two primaries stacked inline | S | `app/(admin)/billing/payments/[id].tsx` |
| 11 | Delete `components/ui/BottomCTABar.tsx` | XS | 1 file |
| 12 | Delete `hooks/useHideTabBar.ts` if it has no other callers (verify with grep) | XS | maybe 1 file |
| 13 | Update `CLAUDE.md` "Sticky CTA rule" → "Inline CTA rule" per §6 | XS | `CLAUDE.md` |
| 14 | Replace memory entry `feedback_sticky_cta.md` → `feedback_inline_cta.md` per §7 | XS | memory + `MEMORY.md` |
| 15 | `npx tsc --noEmit` clean | XS | — |
| 16 | Smoke test — every migrated screen on iOS + Android: keyboard open + closed, long-form scroll, pill nav visible throughout | M | — |

**Estimate:** ~60 minutes.

---

## 6. CLAUDE.md rule replacement

**Find** the existing "Sticky CTA rule" section (added by spec 05) and **replace** with:

> ### Inline CTA rule
>
> Primary submit/save/confirm actions render **inline** at the end of the form's
> `ScrollView`, with `mt-4` above the button. The button is the last child of the
> ScrollView. No `BottomCTABar`, no chromed footer.
>
> Floating pill nav stays visible. ScrollView uses `contentContainerClassName="px-4 pt-3 pb-[88px]"`
> to clear the pill.
>
> **Two-action footer (e.g. Save + Cancel):** primary `Button` then secondary
> `Pressable` text below with `mt-3`. Both inside the ScrollView.
>
> **Two primary actions (e.g. Record Payment + Add Charge):** stack vertically with
> `mt-2` between. Both inside the ScrollView.
>
> **Destructive action (Delete):** placed in a "Danger zone" group below the primary
> Save, separated by `border-t border-border` and `mt-8 pt-4`. Inside the ScrollView.
>
> **Wizards:** `WizardShell` renders the Next/Skip controls inline at the end of each
> step's content. No docked footer.
>
> **Forbidden:**
> - `BottomCTABar` — deleted from the codebase. Do not reintroduce.
> - Header-right submit buttons (iOS-style "Save" in the top-right) — design uses
>   inline body buttons exclusively.
> - Side-by-side primaries.

Also delete the prior "Sticky CTA rule" wording in its entirety. The "Header ownership rule" (from spec 04) stays unchanged.

---

## 7. Memory replacement

Delete `feedback_sticky_cta.md`. Add `feedback_inline_cta.md`:

```markdown
---
name: Inline CTA pattern
description: Primary CTAs flow inline at end of ScrollView, no BottomCTABar. Floating pill nav stays visible.
type: feedback
---

Primary submit/save/confirm actions render inline at the end of the form's ScrollView with `mt-4` above. ScrollView padding is `px-4 pt-3 pb-[88px]` to clear the floating pill nav. The pill stays visible during forms.

**Why:** User reviewed the implemented `BottomCTABar` sticky pattern (spec 05) and rejected it 2026-05-08 — the chromed footer bar conflicts with the locked design references. Spec 06 reverses the migration.

**How to apply:**
- Form screens: button is the last child of ScrollView. No `BottomCTABar`.
- Two actions: stack vertically inside the scroll (primary first, secondary as text Pressable or `variant="secondary"` Button below).
- Destructive: bottom of body in a "Danger zone" group, separated by `border-t border-border`.
- Wizards: WizardShell renders Next/Skip inline at end of each step (no docked footer).
- BottomCTABar component is deleted; do not reintroduce it.
```

Update `MEMORY.md`:
```
- [Inline CTA pattern](feedback_inline_cta.md) — Primary CTAs inline at end of ScrollView. No BottomCTABar. Pill nav stays visible. Replaces the rejected sticky pattern (2026-05-08).
```

(Remove the previous `feedback_sticky_cta.md` line if it was added.)

---

## 8. Acceptance criteria

- [ ] All 8 🔴 screens in §2 use inline CTAs at the end of their ScrollView.
- [ ] All 6 🟢 screens still inline (no chrome regressions from spec 05's discard).
- [ ] `components/ui/BottomCTABar.tsx` deleted; zero remaining imports (`grep -r BottomCTABar app/ components/ hooks/ layouts/` returns empty).
- [ ] `hooks/useHideTabBar.ts` deleted if unused elsewhere.
- [ ] `WizardShell` renders Next/Skip inline at end of step scroll; tab bar visible during wizards.
- [ ] On every form screen, opening the keyboard pushes the button up (still visible).
- [ ] On every form screen, the floating pill nav is visible and does not overlap the button (thanks to `pb-[88px]`).
- [ ] Spec `01_form_and_wizard_components_spec.md` revised per §4.3 — `BottomCTABar` removed from `WizardShell`'s dependency list.
- [ ] `CLAUDE.md` "Sticky CTA rule" replaced by "Inline CTA rule" per §6.
- [ ] Memory file `feedback_sticky_cta.md` (if present) removed; `feedback_inline_cta.md` added.
- [ ] `MEMORY.md` index updated.
- [ ] `npx tsc --noEmit` clean.
- [ ] No raw hex; no `style={{ ... }}`; existing engineering rules carry over.

---

## 9. Open questions / verification

1. **`useHideTabBar` deletion:** verify no caller besides `BottomCTABar` exists. If something else uses it (e.g. App Lock, a future modal), keep the hook but stop calling it from form screens.
2. **Long-form keyboard behavior:** on a form longer than 8–10 fields, Android `behavior={undefined}` may need `behavior="height"` so the inline button is reachable when the keyboard is open. Engineer to verify on real device, not just emulator.
3. **Settings screens** that may have been migrated to sticky in spec 05 — engineer must `grep BottomCTABar app/(admin)/settings/` to confirm scope.
4. **`darkStackOptions` / `app.json`:** `windowSoftInputMode` = `adjustResize` is still desired; no change needed. Verify it's set.

---

## 10. Lessons learned (for future planning)

This reversal happened because spec 05 prioritized an **engineering ergonomics argument** (rule §8 `submit-feedback`) over the **locked design references**. The `ui-ux-pro-max` rule set is a **secondary input** when it conflicts with the design audit — design wins.

Going forward:
- Cross-screen pattern specs ("standardize all submit buttons") **must** verify the canonical pattern against ≥3 reference screenshots from `docs/screenshots/dark/` before recommending. If the chrome shown in the spec isn't in any screenshot, that's the signal to abandon that direction.
- When a `ui-ux-pro-max` rule contradicts the design, cite the design and skip the rule, or open a separate discussion before finalizing.
- The "Header ownership" pattern (spec 04) was correct on first try because it solved a literal bug (two visible headers), not a stylistic preference. Stylistic specs need stronger design grounding.

This note is for the planner's reference, not a CLAUDE.md rule. Keep it on this spec.
