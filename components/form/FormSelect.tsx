import React from 'react'
import { useFormContext, Controller, FieldValues } from 'react-hook-form'
import { Select, SelectOption } from '~/components/ui/Select'

interface FormSelectProps {
  name: string
  label?: string
  placeholder?: string
  options: SelectOption[]
  searchable?: boolean
  disabled?: boolean
  onChange?: (value: string) => void
}

export function FormSelect({
  name,
  label,
  placeholder,
  options,
  searchable,
  disabled,
  onChange,
}: FormSelectProps) {
  const { control, formState: { errors } } = useFormContext<FieldValues>()
  const error = (errors as any)[name]?.message as string | undefined

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Select
          label={label}
          placeholder={placeholder}
          options={options}
          value={field.value ?? ''}
          onChange={(value) => {
            field.onChange(value)
            onChange?.(value)
          }}
          error={error}
          searchable={searchable}
        />
      )}
    />
  )
}
