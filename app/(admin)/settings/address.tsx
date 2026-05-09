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
  address: z.string().trim().max(200),
})
type FormData = z.infer<typeof schema>

export default function AddressScreen() {
  const router = useRouter()
  const { data: settings } = useSettings()
  const { mutateAsync: save, isPending } = useUpdateSetting()

  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { address: '' },
  })

  useEffect(() => {
    if (settings) reset({ address: settings.address })
  }, [settings, reset])

  async function onSubmit(values: FormData) {
    await save({ key: 'address', value: values.address.trim() })
    router.replace('/(admin)/settings')
  }

  return (
    <ScreenLayout title="Address" backHref="/(admin)/settings">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerClassName="px-4 pt-3 pb-[88px]" keyboardShouldPersistTaps="handled">
          <Controller
            control={control}
            name="address"
            render={({ field }) => (
              <Input
                label="Address"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={errors.address?.message}
                placeholder="123 Main St, Quezon City"
                autoCapitalize="sentences"
                multiline
                numberOfLines={3}
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
