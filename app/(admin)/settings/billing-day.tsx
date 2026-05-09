import React, { useEffect } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { ScreenLayout } from '~/layouts/ScreenLayout'
import { Input } from '~/components/ui/Input'
import { Button } from '~/components/ui/Button'
import { AppText } from '~/components/ui/AppText'
import { useSettings, useUpdateSetting } from '~/hooks/useSettings'
import { billingDaySchema, BillingDayFormData } from './_billing-day.schema'

export default function BillingDayScreen() {
  const router = useRouter()
  const { data: settings } = useSettings()
  const { mutateAsync: save, isPending } = useUpdateSetting()

  const { control, handleSubmit, formState: { errors }, reset } = useForm<BillingDayFormData>({
    resolver: zodResolver(billingDaySchema),
    defaultValues: { billingDay: '' },
  })

  useEffect(() => {
    if (settings) reset({ billingDay: String(settings.billing_day) })
  }, [settings, reset])

  async function onSubmit(values: BillingDayFormData) {
    await save({
      key: 'billing_day',
      value: String(parseInt(values.billingDay, 10)),
    })
    router.replace('/(admin)/settings')
  }

  return (
    <ScreenLayout title="Billing Day" backHref="/(admin)/settings">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerClassName="px-4 pt-3 pb-[88px]" keyboardShouldPersistTaps="handled">
          <Controller
            control={control}
            name="billingDay"
            render={({ field }) => (
              <Input
                label="Billing day"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={errors.billingDay?.message}
                placeholder="1"
                keyboardType="number-pad"
                maxLength={2}
                autoFocus
              />
            )}
          />
          <AppText variant="caption" color="muted" className="-mt-2">
            Used as the default billing day for new units. Range 1–28 to avoid month-end edge cases.
          </AppText>
          <Button label="Save" onPress={handleSubmit(onSubmit)} loading={isPending} className="mt-4" />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenLayout>
  )
}
