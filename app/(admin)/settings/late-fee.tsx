import React, { useEffect } from 'react'
import { Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { ScreenLayout } from '~/layouts/ScreenLayout'
import { Input } from '~/components/ui/Input'
import { Button } from '~/components/ui/Button'
import { AppText } from '~/components/ui/AppText'
import { useSettings, useUpdateSetting } from '~/hooks/useSettings'
import { lateFeeSchema, LateFeeFormData } from './_late-fee.schema'

export default function LateFeeScreen() {
  const router = useRouter()
  const { data: settings } = useSettings()
  const { mutateAsync: save, isPending } = useUpdateSetting()

  const { control, handleSubmit, formState: { errors }, reset } = useForm<LateFeeFormData>({
    resolver: zodResolver(lateFeeSchema),
    defaultValues: { amount: '', graceDays: '' },
  })

  useEffect(() => {
    if (settings) {
      reset({
        amount: String(settings.late_fee_amount),
        graceDays: String(settings.late_fee_grace_days),
      })
    }
  }, [settings, reset])

  async function onSubmit(values: LateFeeFormData) {
    try {
      await save({ key: 'late_fee_amount', value: String(parseFloat(values.amount)) })
      await save({ key: 'late_fee_grace_days', value: String(parseInt(values.graceDays, 10)) })
      router.replace('/(admin)/settings')
    } catch {
      Alert.alert('Error', 'Could not save. Try again.')
    }
  }

  return (
    <ScreenLayout title="Late Fee" backHref="/(admin)/settings">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerClassName="px-4 pt-3 pb-[88px]" keyboardShouldPersistTaps="handled">
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <Input
                label="Late fee amount (₱)"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={errors.amount?.message}
                placeholder="200"
                keyboardType="decimal-pad"
                autoFocus
              />
            )}
          />
          <Controller
            control={control}
            name="graceDays"
            render={({ field }) => (
              <Input
                label="Grace period (days)"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={errors.graceDays?.message}
                placeholder="5"
                keyboardType="number-pad"
                maxLength={2}
              />
            )}
          />
          <AppText variant="caption" color="muted" className="-mt-2">
            Charged once after the grace period. Set amount to 0 to disable.
          </AppText>
          <Button label="Save" onPress={handleSubmit(onSubmit)} loading={isPending} className="mt-4" />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenLayout>
  )
}
