import React, { useEffect } from 'react'
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner-native'
import { useTabBarScrollHandler } from '../../../hooks/useTabBarScrollHandler'
import { useSettings, useUpdateSetting } from '../../../hooks/useSettings'
import { Input, Button, LoadingSpinner, ScreenView } from '../../../components/ui'

const schema = z.object({
  waterRate: z
    .string()
    .refine(
      (v) => {
        const n = parseFloat(v)
        return !isNaN(n) && n > 0
      },
      'Must be a positive number'
    ),
  elecRate: z
    .string()
    .refine(
      (v) => {
        const n = parseFloat(v)
        return !isNaN(n) && n > 0
      },
      'Must be a positive number'
    ),
  internetRate: z
    .string()
    .refine(
      (v) => {
        const n = parseFloat(v)
        return !isNaN(n) && n >= 0
      },
      'Must be 0 or more'
    ),
})

type FormData = z.infer<typeof schema>

export default function RatesSettingsScreen() {
  const tabBarScroll = useTabBarScrollHandler()
  const { data: settings, isLoading } = useSettings()
  const { mutateAsync: save, isPending } = useUpdateSetting()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      waterRate: '',
      elecRate: '',
      internetRate: '',
    },
  })

  useEffect(() => {
    if (!settings) return
    reset({
      waterRate: String(settings.water_rate),
      elecRate: String(settings.electricity_rate),
      internetRate: String(settings.internet_rate),
    })
  }, [settings, reset])

  const onSubmit = async (data: FormData) => {
    try {
      const wr = parseFloat(data.waterRate)
      const er = parseFloat(data.elecRate)
      const ir = parseFloat(data.internetRate)

      await save({ key: 'water_rate', value: String(wr) })
      await save({ key: 'electricity_rate', value: String(er) })
      await save({ key: 'internet_rate', value: String(ir) })

      toast.success('Rates updated')
    } catch {
      toast.error('Could not save rates')
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <ScreenView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerClassName="p-4 pb-32" {...tabBarScroll}>
          <Controller
            control={control}
            name="waterRate"
            render={({ field }) => (
              <Input
                label="Water Rate (PHP / cu.m)"
                value={field.value}
                onChangeText={field.onChange}
                keyboardType="decimal-pad"
                error={errors.waterRate?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="elecRate"
            render={({ field }) => (
              <Input
                label="Electricity Rate (PHP / kWh)"
                value={field.value}
                onChangeText={field.onChange}
                keyboardType="decimal-pad"
                error={errors.elecRate?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="internetRate"
            render={({ field }) => (
              <Input
                label="Internet Rate (PHP / mo)"
                value={field.value}
                onChangeText={field.onChange}
                keyboardType="decimal-pad"
                error={errors.internetRate?.message}
              />
            )}
          />

          <Button
            label="Save Rates"
            onPress={handleSubmit(onSubmit)}
            loading={isPending}
            className="mt-4"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenView>
  )
}
