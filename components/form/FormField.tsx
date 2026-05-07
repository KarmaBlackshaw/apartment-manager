import React from 'react'
import { useFormContext, Controller, FieldValues } from 'react-hook-form'
import { Input } from '~/components/ui/Input'
import type { TextInputProps } from 'react-native'

interface FormFieldProps extends Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur'> {
  name: string
  label?: string
  hint?: string
  transform?: 'trim' | 'uppercase' | 'numeric'
}

export function FormField({ name, label, hint, transform, ...inputProps }: FormFieldProps) {
  const { control, formState: { errors } } = useFormContext<FieldValues>()
  const error = (errors as any)[name]?.message as string | undefined

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Input
          {...inputProps}
          label={label}
          hint={hint}
          error={error}
          value={field.value ?? ''}
          onChangeText={field.onChange}
          onBlur={() => {
            if (transform === 'trim' && typeof field.value === 'string') {
              field.onChange(field.value.trim())
            }
            field.onBlur()
          }}
        />
      )}
    />
  )
}
