import React, { useMemo } from 'react'
import { useFormContext, Controller, FieldValues } from 'react-hook-form'
import { View } from 'react-native'
import { SegmentedControl } from '~/components/ui/SegmentedControl'
import { AppText } from '~/components/ui/AppText'

interface SegmentedOption<V extends string> {
  value: V
  label: string
}

interface FormSegmentedControlProps<V extends string = string> {
  name: string
  label?: string
  options: SegmentedOption<V>[]
  fullWidth?: boolean
}

export function FormSegmentedControl<V extends string = string>({
  name,
  label,
  options,
  fullWidth,
}: FormSegmentedControlProps<V>) {
  const { control, formState: { errors } } = useFormContext<FieldValues>()
  const error = (errors as any)[name]?.message as string | undefined

  const optionLabels = useMemo(() => options.map((o) => o.label), [options])

  return (
    <View className="mb-4">
      {label && <AppText variant="label" color="secondary" className="mb-2">{label}</AppText>}
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const currentLabel = options.find((o) => o.value === field.value)?.label ?? optionLabels[0]
          const currentIndex = optionLabels.indexOf(currentLabel)

          return (
            <>
              <SegmentedControl
                options={optionLabels}
                selected={currentLabel}
                onChange={(label) => {
                  const option = options.find((o) => o.label === label)
                  if (option) field.onChange(option.value)
                }}
                fullWidth={fullWidth}
              />
              {error && <AppText variant="caption" color="danger" className="mt-1">{error}</AppText>}
            </>
          )
        }}
      />
    </View>
  )
}
