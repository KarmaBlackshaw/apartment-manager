import React, { useEffect, useState } from 'react'
import { View, Alert, KeyboardAvoidingView, ScrollView, Platform, Pressable } from 'react-native'
import { UseFormReturn, SubmitHandler, FieldValues } from 'react-hook-form'
import { useNavigation } from 'expo-router'
import { ScreenHeader } from '~/components/ui/ScreenHeader'
import { ProgressStepIndicator } from '~/components/ui/ProgressStepIndicator'
import { BottomCTABar } from '~/components/ui/BottomCTABar'
import { Button } from '~/components/ui/Button'
import { AppText } from '~/components/ui/AppText'
import { SectionLabel } from '~/components/ui/SectionLabel'
import { ScreenView } from '~/components/ui/ScreenView'

export interface WizardStepDef<TForm extends FieldValues> {
  key: string
  title: string
  shortTitle: string
  fields: (keyof TForm)[]
  optional?: boolean
  render: () => React.ReactNode
}

interface WizardShellProps<TForm extends FieldValues> {
  form: UseFormReturn<TForm>
  steps: WizardStepDef<TForm>[]
  onSubmit: SubmitHandler<TForm>
  submitLabel?: string
  isSubmitting?: boolean
  discardConfirm?: { title: string; message: string }
  screenTitle?: (step: WizardStepDef<TForm>) => string
  backHrefOnFirstStep?: string
}

export function WizardShell<TForm extends FieldValues>({
  form,
  steps,
  onSubmit,
  submitLabel = 'Save',
  isSubmitting = false,
  discardConfirm,
  screenTitle,
  backHrefOnFirstStep,
}: WizardShellProps<TForm>) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const navigation = useNavigation()
  const currentStep = steps[currentIdx]
  const isFirstStep = currentIdx === 0
  const isLastStep = currentIdx === steps.length - 1

  const handleBack = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1)
    } else if (form.formState.isDirty) {
      Alert.alert(
        discardConfirm?.title ?? 'Discard changes?',
        discardConfirm?.message ?? 'Your changes will be lost.',
        [
          { text: 'Keep editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              navigation.goBack()
            },
          },
        ],
      )
    } else {
      navigation.goBack()
    }
  }

  const handleNext = async () => {
    const isValid = await form.trigger(currentStep.fields as any)
    if (!isValid) return

    if (isLastStep) {
      form.handleSubmit(onSubmit)()
    } else {
      setCurrentIdx(currentIdx + 1)
    }
  }

  const handleSkip = () => {
    currentStep.fields.forEach((field) => {
      form.clearErrors(field as any)
    })
    setCurrentIdx(currentIdx + 1)
  }

  // Handle navigation back
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (isFirstStep && !form.formState.isDirty) {
        return
      }
      if (!isFirstStep) {
        e.preventDefault()
        setCurrentIdx(currentIdx - 1)
        return
      }
      if (isFirstStep && form.formState.isDirty) {
        e.preventDefault()
        Alert.alert(
          discardConfirm?.title ?? 'Discard changes?',
          discardConfirm?.message ?? 'Your changes will be lost.',
          [
            { text: 'Keep editing', style: 'cancel' },
            {
              text: 'Discard',
              style: 'destructive',
              onPress: () => {
                navigation.dispatch(e.data.action)
              },
            },
          ],
        )
      }
    })

    return unsubscribe
  }, [navigation, isFirstStep, currentIdx, form.formState.isDirty])

  const title = screenTitle ? screenTitle(currentStep) : currentStep.title

  return (
    <ScreenView edges={[]}>
      <ScreenHeader title={title} left="back" onLeftPress={handleBack} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 py-4 pb-[88px]"
          scrollEnabled
        >
          <ProgressStepIndicator steps={steps.length} current={currentIdx + 1} />

          <SectionLabel>
            Step {currentIdx + 1} of {steps.length} — {currentStep.title}
          </SectionLabel>

          {currentStep.render()}
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomCTABar>
        <Button
          label={isLastStep ? submitLabel : `Next — ${currentStep.shortTitle}`}
          onPress={handleNext}
          disabled={isSubmitting}
          loading={isSubmitting}
        />
        {currentStep.optional && (
          <Pressable onPress={handleSkip} className="mt-3 items-center pb-2">
            <AppText variant="caption" color="secondary">
              Skip (not recommended)
            </AppText>
          </Pressable>
        )}
      </BottomCTABar>
    </ScreenView>
  )
}
