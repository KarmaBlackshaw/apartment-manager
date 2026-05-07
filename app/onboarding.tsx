import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import { nanoid } from 'nanoid/non-secure'

import { colors, radius, spacing } from '../constants/theme'
import { ProgressStepIndicator } from '../components/ui/ProgressStepIndicator'
import { BottomCTABar } from '../components/ui/BottomCTABar'
import { Button } from '../components/ui/Button'
import { db } from '../db'
import { properties } from '../db/schema'
import { updateSetting } from '../lib/api/settings'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  propertyName: string
  address: string
  city: string
  totalUnits: string
  ownerName: string
  ownerPhone: string
  billingDay: string
  lateFee: string
  gracePeriod: string
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function FieldLabel({ children }: { children: string }) {
  return (
    <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 4 }}>
      {children}
    </Text>
  )
}

function FieldNote({ children }: { children: string }) {
  return (
    <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>
      {children}
    </Text>
  )
}

const inputStyle = {
  backgroundColor: colors.surface,
  borderRadius: radius.md,
  borderCurve: 'continuous' as const,
  borderWidth: 1,
  borderColor: colors.border,
  padding: 14,
  color: colors.textPrimary,
  fontSize: 16,
} as const

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  note,
}: {
  label: string
  value: string
  onChangeText: (v: string) => void
  placeholder?: string
  keyboardType?: React.ComponentProps<typeof TextInput>['keyboardType']
  note?: string
}) {
  return (
    <View>
      <FieldLabel>{label}</FieldLabel>
      <TextInput
        style={inputStyle}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        autoCorrect={false}
      />
      {note ? <FieldNote>{note}</FieldNote> : null}
    </View>
  )
}

// ─── Step screens ─────────────────────────────────────────────────────────────

function StepProperty({ form, setForm }: { form: FormState; setForm: React.Dispatch<React.SetStateAction<FormState>> }) {
  return (
    <View style={{ gap: 16 }}>
      <View style={{ gap: 4 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 }}>
          Set Up Your Property
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 15 }}>
          Tell us about the property you manage.
        </Text>
      </View>

      <Field
        label="Property Name"
        value={form.propertyName}
        onChangeText={(v) => setForm((f) => ({ ...f, propertyName: v }))}
        placeholder="Sunset Apartments"
      />
      <Field
        label="Address"
        value={form.address}
        onChangeText={(v) => setForm((f) => ({ ...f, address: v }))}
        placeholder="123 Main St"
      />
      <Field
        label="City / Province"
        value={form.city}
        onChangeText={(v) => setForm((f) => ({ ...f, city: v }))}
        placeholder="Quezon City"
      />
      <Field
        label="Total Units"
        value={form.totalUnits}
        onChangeText={(v) => setForm((f) => ({ ...f, totalUnits: v }))}
        placeholder="20"
        keyboardType="number-pad"
      />
    </View>
  )
}

function StepOwner({ form, setForm }: { form: FormState; setForm: React.Dispatch<React.SetStateAction<FormState>> }) {
  return (
    <View style={{ gap: 16 }}>
      <View style={{ gap: 4 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 }}>
          Your Profile
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 15 }}>
          Let tenants and records know who's managing this property.
        </Text>
      </View>

      <Field
        label="Your Name"
        value={form.ownerName}
        onChangeText={(v) => setForm((f) => ({ ...f, ownerName: v }))}
        placeholder="Juan Dela Cruz"
      />
      <Field
        label="Phone Number"
        value={form.ownerPhone}
        onChangeText={(v) => setForm((f) => ({ ...f, ownerPhone: v }))}
        placeholder="+63 912 345 6789"
        keyboardType="phone-pad"
      />
    </View>
  )
}

function StepBilling({ form, setForm }: { form: FormState; setForm: React.Dispatch<React.SetStateAction<FormState>> }) {
  return (
    <View style={{ gap: 16 }}>
      <View style={{ gap: 4 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 }}>
          Billing Settings
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 15 }}>
          These defaults apply to all new billing cycles.
        </Text>
      </View>

      <Field
        label="Billing Day of Month"
        value={form.billingDay}
        onChangeText={(v) => setForm((f) => ({ ...f, billingDay: v }))}
        placeholder="1"
        keyboardType="number-pad"
        note="Day of the month rent is due (1–28)"
      />
      <Field
        label="Late Fee %"
        value={form.lateFee}
        onChangeText={(v) => setForm((f) => ({ ...f, lateFee: v }))}
        placeholder="10"
        keyboardType="number-pad"
        note="Percentage charged after grace period"
      />
      <Field
        label="Grace Period"
        value={form.gracePeriod}
        onChangeText={(v) => setForm((f) => ({ ...f, gracePeriod: v }))}
        placeholder="3"
        keyboardType="number-pad"
        note="Days before late fee applies"
      />
    </View>
  )
}

function StepDone() {
  return (
    <View style={{ gap: 24, alignItems: 'center', paddingTop: 32 }}>
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: `${colors.success}22`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="checkmark-circle" size={64} color={colors.success} />
      </View>

      <View style={{ gap: 8, alignItems: 'center' }}>
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 26,
            fontWeight: '800',
            letterSpacing: -0.5,
            textAlign: 'center',
          }}
        >
          You're all set! 🎉
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 22 }}>
          Your property is configured. Start adding tenants and tracking rent.
        </Text>
      </View>
    </View>
  )
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

const TOTAL_STEPS = 4

export default function OnboardingScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>({
    propertyName: '',
    address: '',
    city: '',
    totalUnits: '',
    ownerName: '',
    ownerPhone: '',
    billingDay: '1',
    lateFee: '10',
    gracePeriod: '3',
  })

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1))
  const goBack = () => setStep((s) => Math.max(s - 1, 0))

  const handleComplete = async () => {
    if (saving) return
    setSaving(true)
    try {
      const city = form.city.trim()
      const addressFull = city
        ? `${form.address.trim()}, ${city}`
        : form.address.trim()

      await db.insert(properties).values({
        id: nanoid(),
        name: form.propertyName.trim() || 'My Property',
        address: addressFull || 'Not specified',
        description: form.totalUnits.trim() ? `${form.totalUnits.trim()} units` : null,
      })

      await updateSetting('apartment_name', form.propertyName.trim() || 'My Property')
      await updateSetting('owner_name', form.ownerName.trim())
      await updateSetting('owner_phone', form.ownerPhone.trim())
      await updateSetting('billing_day', form.billingDay || '1')
      await updateSetting('late_fee_rate', form.lateFee || '10')
      await updateSetting('grace_period_days', form.gracePeriod || '3')

      router.replace('/(admin)')
    } catch (e) {
      console.error('Onboarding save error:', e)
      setSaving(false)
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ flex: 1 }}>
          {/* Top area: safe inset + back button + progress bar */}
          <View style={{ paddingTop: insets.top + 12, paddingHorizontal: spacing[5], gap: 16 }}>
            {/* Back button row — visible on steps 1, 2 (not 0 or 3) */}
            <View style={{ height: 36, justifyContent: 'center' }}>
              {step > 0 && step < TOTAL_STEPS - 1 ? (
                <Pressable
                  onPress={goBack}
                  hitSlop={12}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' }}
                >
                  <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
                  <Text style={{ color: colors.textSecondary, fontSize: 15 }}>Back</Text>
                </Pressable>
              ) : null}
            </View>

            <ProgressStepIndicator steps={TOTAL_STEPS} current={step + 1} />
          </View>

          {/* Scrollable step content */}
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: spacing[5], gap: 16, paddingBottom: 32 }}
          >
            {step === 0 && <StepProperty form={form} setForm={setForm} />}
            {step === 1 && <StepOwner form={form} setForm={setForm} />}
            {step === 2 && <StepBilling form={form} setForm={setForm} />}
            {step === 3 && <StepDone />}
          </ScrollView>

          {/* Bottom CTA */}
          <BottomCTABar>
            {step < TOTAL_STEPS - 1 ? (
              <View style={{ gap: 10 }}>
                <Button label="Next" variant="primary" onPress={goNext} />
                {step > 0 ? (
                  <Button label="Back" variant="ghost" onPress={goBack} />
                ) : null}
              </View>
            ) : (
              <Button
                label={saving ? 'Saving…' : 'Get Started'}
                variant="primary"
                onPress={handleComplete}
                disabled={saving}
                loading={saving}
              />
            )}
          </BottomCTABar>
        </View>
      </KeyboardAvoidingView>
    </>
  )
}
