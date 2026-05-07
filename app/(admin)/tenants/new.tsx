import React from 'react'
import { View } from 'react-native'
import { useRouter } from 'expo-router'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner-native'
import dayjs from 'dayjs'
import { useCreateTenant } from '~/hooks/useTenants'
import { useProperties } from '~/hooks/useProperties'
import { useUnits } from '~/hooks/useUnits'
import { useSettings } from '~/hooks/useSettings'
import { WizardShell, WizardStepDef } from '~/components/form/WizardShell'
import { FormField } from '~/components/form/FormField'
import { FormSelect } from '~/components/form/FormSelect'
import { FormDateInput } from '~/components/form/FormDateInput'
import { FormSegmentedControl } from '~/components/form/FormSegmentedControl'
import { FormToggleRow } from '~/components/form/FormToggleRow'
import { FormCameraCapture } from '~/components/form/FormCameraCapture'
import { SectionLabel } from '~/components/ui/SectionLabel'
import { InfoNote } from '~/components/ui/InfoNote'

const schema = z.object({
  fullName: z.string().min(2, 'Name required'),
  nickname: z.string(),
  phone: z.string().min(7, 'Phone required'),
  email: z.string(),
  occupation: z.string(),
  homeProvince: z.string(),
  idFrontUri: z.string().nullable(),
  idBackUri: z.string().nullable(),
  emergencyName: z.string().min(2, 'Contact required'),
  emergencyRelation: z.string(),
  emergencyPhone: z.string().min(7, 'Phone required'),
  propertyId: z.string().min(1, 'Select property'),
  unitId: z.string().min(1, 'Select unit'),
  moveInDate: z.string(),
  contractType: z.enum(['monthly', 'fixed']),
  contractEndDate: z.string(),
  billingType: z.enum(['monthly', 'daily']),
  monthlyRent: z.string(),
  dailyRate: z.string(),
  numberOfDays: z.string(),
  securityDeposit: z.string(),
  advance: z.string(),
  billingDay: z.string(),
  includeInternet: z.boolean(),
  waterReading: z.string(),
  electricityReading: z.string(),
})

type FormData = z.infer<typeof schema>

const defaults: FormData = {
  fullName: '', nickname: '', phone: '', email: '', occupation: '', homeProvince: '',
  idFrontUri: null, idBackUri: null,
  emergencyName: '', emergencyRelation: '', emergencyPhone: '',
  propertyId: '', unitId: '', moveInDate: dayjs().format('YYYY-MM-DD'),
  contractType: 'monthly', contractEndDate: '',
  billingType: 'monthly', monthlyRent: '', dailyRate: '', numberOfDays: '',
  securityDeposit: '', advance: '', billingDay: dayjs().format('D'),
  includeInternet: false, waterReading: '', electricityReading: '',
}

export default function NewTenantScreen() {
  const router = useRouter()
  const { mutateAsync: createTenant, isPending } = useCreateTenant()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
    mode: 'onTouched',
  })

  async function onSubmit(values: FormData) {
    try {
      const tenant = await createTenant({
        unit_id: values.unitId,
        full_name: values.fullName.trim(),
        nickname: values.nickname.trim() || undefined,
        email: values.email.trim(),
        phone: values.phone.trim(),
        occupation: values.occupation.trim() || undefined,
        billing_type: values.billingType as 'monthly' | 'daily',
        move_in_date: values.moveInDate,
        address: values.homeProvince.trim() || undefined,
        emergency_contact: JSON.stringify({
          name: values.emergencyName.trim(),
          relation: values.emergencyRelation.trim() || null,
          phone: values.emergencyPhone.trim(),
        }),
        water_reading: values.waterReading ? parseFloat(values.waterReading) : undefined,
        electricity_reading: values.electricityReading ? parseFloat(values.electricityReading) : undefined,
        due_day: values.billingType === 'monthly' ? parseInt(values.billingDay, 10) : undefined,
        include_internet: values.billingType === 'monthly' && values.includeInternet,
      })
      toast.success('Tenant added')
      router.replace({ pathname: '/(admin)/tenants/[id]', params: { id: tenant.id } })
    } catch (e) {
      console.error('createTenant failed', e)
      toast.error('Could not save tenant. Please try again.')
    }
  }

  const steps: WizardStepDef<FormData>[] = [
    {
      key: 'personal',
      title: 'New Tenant',
      shortTitle: 'ID Capture',
      fields: ['fullName', 'phone', 'email'] as const,
      render: () => <PersonalInfoStep />,
    },
    {
      key: 'id',
      title: 'Capture ID',
      shortTitle: 'Emergency Contact',
      fields: [] as const,
      optional: true,
      render: () => <IdCaptureStep />,
    },
    {
      key: 'emergency',
      title: 'Emergency Contact',
      shortTitle: 'Unit Assignment',
      fields: ['emergencyName', 'emergencyPhone'] as const,
      render: () => <EmergencyContactStep />,
    },
    {
      key: 'unit',
      title: 'Assign Unit',
      shortTitle: 'Billing Setup',
      fields: ['propertyId', 'unitId', 'moveInDate'] as const,
      render: () => <UnitAssignmentStep />,
    },
    {
      key: 'billing',
      title: 'Billing Setup',
      shortTitle: '',
      fields: ['billingType', 'monthlyRent', 'dailyRate', 'numberOfDays', 'billingDay'] as const,
      render: () => <BillingStep />,
    },
  ]

  return (
    <FormProvider {...form}>
      <WizardShell
        form={form}
        steps={steps}
        onSubmit={onSubmit}
        submitLabel="Save Tenant"
        isSubmitting={isPending}
        discardConfirm={{ title: 'Discard new tenant?', message: 'Your changes will be lost.' }}
      />
    </FormProvider>
  )
}

function PersonalInfoStep() {
  return (
    <View>
      <FormField name="fullName" label="Full Name *" placeholder="e.g. Maria Santos" autoCapitalize="words" autoComplete="name" transform="trim" autoFocus />
      <FormField name="nickname" label="Nickname" placeholder="Optional" />
      <FormField name="phone" label="Phone *" placeholder="+63 912 345 6789" keyboardType="phone-pad" autoComplete="tel" />
      <FormField name="email" label="Email" placeholder="Optional" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
      <FormField name="occupation" label="Occupation" placeholder="e.g. Teacher" />
      <FormField name="homeProvince" label="Home Province" placeholder="e.g. Pampanga" />
    </View>
  )
}

function IdCaptureStep() {
  return (
    <View>
      <InfoNote>Accepted: UMID · Driver's License · Passport · PhilHealth · Voter's ID</InfoNote>
      <SectionLabel className="mt-2">Front of valid ID</SectionLabel>
      <FormCameraCapture name="idFrontUri" label="Tap to capture front of ID" />
      <View className="h-4" />
      <SectionLabel>Back of ID</SectionLabel>
      <FormCameraCapture name="idBackUri" label="Tap to capture back of ID" />
    </View>
  )
}

function EmergencyContactStep() {
  return (
    <View>
      <FormField name="emergencyName" label="Contact Name *" placeholder="Full name" transform="trim" />
      <FormField name="emergencyRelation" label="Relationship" placeholder="e.g. Spouse, Parent" />
      <FormField name="emergencyPhone" label="Phone *" placeholder="+63 912 345 6789" keyboardType="phone-pad" />
    </View>
  )
}

function UnitAssignmentStep() {
  const { watch, setValue } = useFormContext<FormData>()
  const propertyId = watch('propertyId')
  const contractType = watch('contractType')
  const { data: properties } = useProperties()
  const { data: units } = useUnits(propertyId)

  const propertyOptions = (properties ?? []).map((p) => ({ value: p.id, label: p.name }))
  const unitOptions = (units ?? [])
    .filter((u) => u.status === 'available')
    .map((u) => ({
      value: u.id,
      label: `Unit ${u.unit_number}${u.monthly_rate != null ? ` — ₱${u.monthly_rate.toFixed(0)}/mo` : ''}`,
    }))

  return (
    <View>
      <FormSelect name="propertyId" label="Property *" placeholder="Select property…" options={propertyOptions} onChange={() => setValue('unitId', '')} />
      <FormSelect name="unitId" label="Unit *" placeholder={propertyId ? 'Select unit…' : 'Select property first'} options={unitOptions} disabled={!propertyId} />
      <FormDateInput name="moveInDate" label="Move-in Date *" />
      <FormSegmentedControl name="contractType" label="Contract Type" options={[{ value: 'monthly', label: 'Month-to-month' }, { value: 'fixed', label: 'Fixed term' }]} />
      {contractType === 'fixed' && <FormDateInput name="contractEndDate" label="Contract End Date *" />}
    </View>
  )
}

function BillingStep() {
  const { watch } = useFormContext<FormData>()
  const billingType = watch('billingType')
  const { data: settings } = useSettings()
  const internetRate = settings?.internet_rate ?? 0

  return (
    <View>
      <FormSegmentedControl name="billingType" label="Billing Type" options={[{ value: 'monthly', label: 'Monthly' }, { value: 'daily', label: 'Daily' }]} />
      {billingType === 'monthly' ? (
        <>
          <FormField name="monthlyRent" label="Monthly Rent *" keyboardType="decimal-pad" placeholder="e.g. 3500" />
          <FormField name="securityDeposit" label="Security Deposit" keyboardType="decimal-pad" />
          <FormField name="advance" label="Advance Payment" keyboardType="decimal-pad" />
          <FormField name="billingDay" label="Billing Day (1–28) *" keyboardType="number-pad" />
          <FormToggleRow name="includeInternet" label={`Include Internet (₱${internetRate.toFixed(0)}/mo)`} sublabel="Adds a flat charge to each monthly bill" />
          <SectionLabel>Initial Meter Readings (optional)</SectionLabel>
          <FormField name="waterReading" label="Water Reading (cu.m)" keyboardType="decimal-pad" />
          <FormField name="electricityReading" label="Electricity Reading (kWh)" keyboardType="decimal-pad" />
        </>
      ) : (
        <>
          <FormField name="dailyRate" label="Daily Rate *" keyboardType="decimal-pad" />
          <FormField name="numberOfDays" label="Number of Days *" keyboardType="number-pad" />
          <FormField name="securityDeposit" label="Security Deposit" keyboardType="decimal-pad" />
          <FormField name="advance" label="Advance Payment" keyboardType="decimal-pad" />
        </>
      )}
    </View>
  )
}
