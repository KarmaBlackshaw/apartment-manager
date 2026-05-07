import React from 'react'
import { useFormContext, Controller, FieldValues } from 'react-hook-form'
import { CameraCapture } from '~/components/ui/CameraCapture'

interface FormCameraCaptureProps {
  name: string
  label: string
  hint?: string
}

export function FormCameraCapture({ name, label, hint }: FormCameraCaptureProps) {
  const { control } = useFormContext<FieldValues>()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <CameraCapture
          label={label}
          onCapture={field.onChange}
          captured={field.value}
          hint={hint}
        />
      )}
    />
  )
}
