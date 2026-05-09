import React from 'react'
import { useFormContext, Controller, FieldValues } from 'react-hook-form'
import { View } from 'react-native'
import { Card } from '~/components/ui/Card'
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
        <Card
          onPress={() => { if (!disabled) field.onChange(!field.value) }}
          className="bg-elevated mb-3 flex-row justify-between items-center"
          size="md"
          accessibilityLabel={label}
        >
          <View className="flex-1">
            <AppText className="font-semibold text-text-primary">{label}</AppText>
            {sublabel && <AppText variant="caption" color="secondary" className="mt-1">{sublabel}</AppText>}
          </View>
          <Toggle value={field.value ?? false} onValueChange={field.onChange} disabled={disabled} />
        </Card>
      )}
    />
  )
}
