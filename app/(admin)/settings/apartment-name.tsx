import React, { useEffect } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { ScreenLayout } from '~/layouts/ScreenLayout'
import { Input } from '~/components/ui/Input'
import { Button } from '~/components/ui/Button'
import { useSettings, useUpdateSetting } from '~/hooks/useSettings'

const schema = z.object({
  apartmentName: z.string().trim().min(1, 'Required').max(60),
})
type FormData = z.infer<typeof schema>

export default function ApartmentNameScreen() {
  const router = useRouter()
  const { data: settings } = useSettings()
  const { mutateAsync: save, isPending } = useUpdateSetting()

  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { apartmentName: '' },
  })

  useEffect(() => {
    if (settings) reset({ apartmentName: settings.apartment_name })
  }, [settings, reset])

  async function onSubmit(values: FormData) {
    await save({ key: 'apartment_name', value: values.apartmentName.trim() })
    router.replace('/(admin)/settings')
  }

  return (
    <ScreenLayout title="Apartment Name" backHref="/(admin)/settings">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerClassName="px-4 pt-3 pb-[88px]" keyboardShouldPersistTaps="handled">
          <Controller
            control={control}
            name="apartmentName"
            render={({ field }) => (
              <Input
                label="Apartment Name"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={errors.apartmentName?.message}
                placeholder="My Apartment"
                autoCapitalize="words"
                autoFocus
              />
            )}
          />
          <Button label="Save" onPress={handleSubmit(onSubmit)} loading={isPending} className="mt-4" />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenLayout>
  )
}
