import React, { useState, useEffect } from 'react'
import { View, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { toast } from 'sonner-native'
import dayjs from 'dayjs'
import { useCreateTenant } from '~/hooks/useTenants'
import { useProperties } from '~/hooks/useProperties'
import { useUnits } from '~/hooks/useUnits'
import { useTabBarVisibility } from '~/context/TabBarVisibilityContext'
import { Input } from '~/components/ui/Input'
import { Button } from '~/components/ui/Button'
import { AppText } from '~/components/ui/AppText'
import { Select } from '~/components/ui/Select'
import { DateInput } from '~/components/ui/DateInput'
import { SegmentedControl } from '~/components/ui/SegmentedControl'
import { ProgressStepIndicator } from '~/components/ui/ProgressStepIndicator'
import { BottomCTABar } from '~/components/ui/BottomCTABar'
import { CameraCapture } from '~/components/ui/CameraCapture'
import { ScreenView } from '~/components/ui/ScreenView'
// ─── Constants ────────────────────────────────────────────────────────────────

const STEP_TITLES: Record<number, string> = {
  1: 'Personal Info',
  2: 'ID Capture',
  3: 'Emergency Contact',
  4: 'Unit Assignment',
  5: 'Billing Setup',
}

// SegmentedControl only accepts string[], not { label, value } objects.
// We store display labels and map back to our typed value on change.
const CONTRACT_OPTIONS = ['Month-to-month', 'Fixed term']

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function NewTenantScreen() {
  const router = useRouter()
  const { mutateAsync: createTenant, isPending } = useCreateTenant()
  const { setVisible } = useTabBarVisibility()

  useEffect(() => {
    setVisible(false)
    return () => setVisible(true)
  }, [])

  // ── Step ──────────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1)

  // ── Step 1 — Personal Info ────────────────────────────────────────────────
  const [fullName, setFullName] = useState('')
  const [nickname, setNickname] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [occupation, setOccupation] = useState('')
  const [homeProvince, setHomeProvince] = useState('')

  // ── Step 2 — ID Capture ───────────────────────────────────────────────────
  const [idFrontUri, setIdFrontUri] = useState<string | undefined>()
  const [idBackUri, setIdBackUri] = useState<string | undefined>()

  // ── Step 3 — Emergency Contact ────────────────────────────────────────────
  const [emergencyName, setEmergencyName] = useState('')
  const [emergencyRelation, setEmergencyRelation] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')

  // ── Step 4 — Unit Assignment ──────────────────────────────────────────────
  const [selectedPropertyId, setSelectedPropertyId] = useState('')
  const [selectedUnitId, setSelectedUnitId] = useState('')
  const [moveInDate, setMoveInDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [contractType, setContractType] = useState<'monthly' | 'fixed'>('monthly')
  const [contractEndDate, setContractEndDate] = useState('')

  // ── Step 5 — Billing Setup ────────────────────────────────────────────────
  const [monthlyRent, setMonthlyRent] = useState('')
  const [securityDeposit, setSecurityDeposit] = useState('')
  const [advance, setAdvance] = useState('')
  const [billingDay, setBillingDay] = useState('1')

  // ── Validation errors ─────────────────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: properties } = useProperties()
  const { data: units } = useUnits(selectedPropertyId)

  // ─── Navigation / Validation ─────────────────────────────────────────────

  function handleNext(skipValidation = false) {
    setErrors({})

    if (!skipValidation) {
      const errs: Record<string, string> = {}

      if (step === 1) {
        if (!fullName.trim()) errs.fullName = 'Name is required'
        if (!phone.trim()) errs.phone = 'Phone is required'
      }

      if (step === 3) {
        if (!emergencyName.trim()) errs.emergencyName = 'Contact name is required'
        if (!emergencyPhone.trim()) errs.emergencyPhone = 'Phone is required'
      }

      if (step === 4) {
        if (!selectedPropertyId) errs.selectedPropertyId = 'Select a property'
        if (!selectedUnitId) errs.selectedUnitId = 'Select a unit'
      }

      if (step === 5) {
        if (!monthlyRent.trim() || isNaN(parseFloat(monthlyRent))) {
          errs.monthlyRent = 'Enter rent amount'
        }
        const dd = parseInt(billingDay)
        if (isNaN(dd) || dd < 1 || dd > 28) {
          errs.billingDay = 'Enter a day between 1 and 28'
        }
      }

      if (Object.keys(errs).length > 0) {
        setErrors(errs)
        return
      }
    }

    if (step < 5) {
      setStep((s) => s + 1)
      return
    }

    void handleSubmit()
  }

  function handleBack() {
    if (step === 1) {
      router.back()
      return
    }
    setStep((s) => s - 1)
  }

  async function handleSubmit() {
    try {
      const created = await createTenant({
        unit_id: selectedUnitId,
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        billing_type: 'monthly',
        move_in_date: moveInDate,
        emergency_contact: `${emergencyName.trim()}${
          emergencyRelation ? ' (' + emergencyRelation + ')' : ''
        } — ${emergencyPhone.trim()}`,
        due_day: parseInt(billingDay),
      })
      toast.success('Tenant added successfully')
      router.replace({ pathname: '/tenants/[id]', params: { id: created.id } })
    } catch {
      toast.error('Could not save tenant. Please try again.')
    }
  }

  // ─── Step Renderers ───────────────────────────────────────────────────────

  function renderStep1() {
    return (
      <>
        <Input
          label="Full Name *"
          value={fullName}
          onChangeText={setFullName}
          autoFocus
          error={errors.fullName}
          placeholder="e.g. Maria Santos"
        />
        <Input
          label="Nickname"
          value={nickname}
          onChangeText={setNickname}
          placeholder="Optional"
        />
        <Input
          label="Phone *"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          error={errors.phone}
          placeholder="+63 912 345 6789"
        />
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Optional"
        />
        <Input
          label="Occupation"
          value={occupation}
          onChangeText={setOccupation}
          placeholder="Optional"
        />
        <Input
          label="Home Province"
          value={homeProvince}
          onChangeText={setHomeProvince}
          placeholder="Optional"
        />
      </>
    )
  }

  function renderStep2() {
    return (
      <>
        <AppText variant="caption" color="muted" className="mb-4">
          Accepted: UMID · Driver's License · Passport · PhilHealth · Voter's ID
        </AppText>
        <AppText variant="label" color="secondary" className="mb-2">
          Front of valid ID
        </AppText>
        <CameraCapture
          label="Tap to capture front of ID"
          onCapture={setIdFrontUri}
          captured={idFrontUri}
        />
        <View className="h-4" />
        <AppText variant="label" color="secondary" className="mb-2">
          Back of ID
        </AppText>
        <CameraCapture
          label="Tap to capture back of ID"
          onCapture={setIdBackUri}
          captured={idBackUri}
        />
        <Pressable onPress={() => handleNext(true)} className="items-center mt-4">
          <AppText color="muted" variant="caption">
            Skip (not recommended)
          </AppText>
        </Pressable>
      </>
    )
  }

  function renderStep3() {
    return (
      <>
        <Input
          label="Contact Name *"
          value={emergencyName}
          onChangeText={setEmergencyName}
          error={errors.emergencyName}
          placeholder="Full name"
        />
        <Input
          label="Relationship"
          value={emergencyRelation}
          onChangeText={setEmergencyRelation}
          placeholder="e.g. Spouse, Parent"
        />
        <Input
          label="Phone *"
          value={emergencyPhone}
          onChangeText={setEmergencyPhone}
          keyboardType="phone-pad"
          error={errors.emergencyPhone}
          placeholder="+63 912 345 6789"
        />
      </>
    )
  }

  function renderStep4() {
    const propertyOptions = (properties ?? []).map((p) => ({ value: p.id, label: p.name }))
    const unitOptions = (units ?? [])
      .filter((u) => u.status === 'available')
      .map((u) => ({
        value: u.id,
        label: `Unit ${u.unit_number}${
          u.monthly_rate != null ? ` — ₱${u.monthly_rate.toFixed(0)}/mo` : ''
        }`,
      }))

    return (
      <>
        <Select
          label="Property *"
          placeholder="Select property..."
          options={propertyOptions}
          value={selectedPropertyId}
          onChange={(v) => {
            setSelectedPropertyId(v)
            setSelectedUnitId('')
          }}
          error={errors.selectedPropertyId}
        />
        <Select
          label="Unit *"
          placeholder={selectedPropertyId ? 'Select unit...' : 'Select property first'}
          options={unitOptions}
          value={selectedUnitId}
          onChange={(v) => {
            setSelectedUnitId(v)
            const unit = units?.find((u) => u.id === v)
            if (unit?.monthly_rate) setMonthlyRent(unit.monthly_rate.toFixed(0))
          }}
          error={errors.selectedUnitId}
        />
        <DateInput label="Move-in Date *" value={moveInDate} onChange={setMoveInDate} />
        <AppText variant="label" color="secondary" className="mt-2 mb-2">
          Contract Type
        </AppText>
        <SegmentedControl
          options={CONTRACT_OPTIONS}
          selected={contractType === 'monthly' ? 'Month-to-month' : 'Fixed term'}
          onChange={(v) => setContractType(v === 'Fixed term' ? 'fixed' : 'monthly')}
        />
        {contractType === 'fixed' && (
          <View className="mt-3">
            <DateInput
              label="Contract End Date"
              value={contractEndDate}
              onChange={setContractEndDate}
            />
          </View>
        )}
      </>
    )
  }

  function renderStep5() {
    return (
      <>
        <Input
          label="Monthly Rent *"
          value={monthlyRent}
          onChangeText={setMonthlyRent}
          keyboardType="decimal-pad"
          error={errors.monthlyRent}
          placeholder="e.g. 3500"
        />
        <Input
          label="Security Deposit"
          value={securityDeposit}
          onChangeText={setSecurityDeposit}
          keyboardType="decimal-pad"
          placeholder="e.g. 3500"
        />
        <Input
          label="Advance Payment"
          value={advance}
          onChangeText={setAdvance}
          keyboardType="decimal-pad"
          placeholder="e.g. 3500"
        />
        <Input
          label="Billing Day (1–28)"
          value={billingDay}
          onChangeText={setBillingDay}
          keyboardType="number-pad"
          error={errors.billingDay}
          placeholder="1"
        />
      </>
    )
  }

  function renderStep() {
    switch (step) {
      case 1:
        return renderStep1()
      case 2:
        return renderStep2()
      case 3:
        return renderStep3()
      case 4:
        return renderStep4()
      case 5:
        return renderStep5()
      default:
        return null
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <ScreenView edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="px-4 pt-3 pb-2 bg-surface">
          <ProgressStepIndicator steps={5} current={step} />
          <AppText
            variant="caption"
            color="muted"
            className="mt-2 uppercase tracking-[0.5px]"
          >
            Step {step} of 5 — {STEP_TITLES[step]}
          </AppText>
        </View>

        <ScrollView contentContainerClassName="p-4 pb-[88px]">{renderStep()}</ScrollView>

        <BottomCTABar>
          <Button
            label={step === 5 ? 'Save Tenant' : `Next — ${STEP_TITLES[step + 1]}`}
            onPress={() => handleNext()}
            loading={isPending}
          />
          {step > 1 && (
            <Pressable onPress={handleBack} className="items-center mt-3">
              <AppText color="primary">
                Back
              </AppText>
            </Pressable>
          )}
        </BottomCTABar>
      </KeyboardAvoidingView>
    </ScreenView>
  )
}
