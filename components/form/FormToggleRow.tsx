import React from 'react'
import { useFormContext, Controller, FieldValues } from 'react-hook-form'
import { Pressable, View } from 'react-native'
import { Toggle } from '~/components/ui/Toggle'
import { AppText } from '~/components/ui/AppText'

interface FormToggleRowProps {
  name: string
  label: string
  sublabel?: string
  disabled?: boolean
}

export function FormToggleRow({ name, label, sublabel, disabled }: FormToggleRowProps) {
  const { control } = useFormContext<FieldValues>()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Pressable
          onPress={() => {
            if (!disabled) field.onChange(!field.value)
          }}
          disabled={disabled}
          // @ts-ignore
          className="bg-elevated rounded-md py-3 px-4 mb-3 flex-row justify-between items-center"
        >
          <View className="flex-1">
            <AppText className="font-semibold text-text-primary">{label}</AppText>
            {sublabel && <AppText variant="caption" color="secondary" className="mt-1">{sublabel}</AppText>}
          </View>
          <Toggle value={field.value ?? false} onValueChange={field.onChange} disabled={disabled} />
        </Pressable>
      )}
    />
  )
}
