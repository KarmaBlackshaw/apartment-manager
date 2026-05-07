import React from 'react'
import { useFormContext, Controller, FieldValues } from 'react-hook-form'
import { DateInput } from '~/components/ui/DateInput'

interface FormDateInputProps {
  name: string
  label?: string
  minimumDate?: Date
  maximumDate?: Date
}

export function FormDateInput({
  name,
  label,
  minimumDate,
  maximumDate,
}: FormDateInputProps) {
  const { control, formState: { errors } } = useFormContext<FieldValues>()
  const error = (errors as any)[name]?.message as string | undefined

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <DateInput
          label={label}
          value={field.value ?? ''}
          onChange={field.onChange}
          error={error}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    />
  )
}
