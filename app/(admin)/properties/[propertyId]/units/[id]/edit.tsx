import React, { useEffect } from 'react'
import { View, ScrollView, KeyboardAvoidingView, Platform, Pressable, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUnitDetail, useUpdateUnit, useDeleteUnit } from '~/hooks/useUnits'
import { useProperty } from '~/hooks/useProperties'
import { ScreenLayout } from '~/layouts/ScreenLayout'
import { Input } from '~/components/ui/Input'
import { Button } from '~/components/ui/Button'
import { AppText } from '~/components/ui/AppText'
import { Avatar } from '~/components/ui/Avatar'
import { Chip } from '~/components/ui/Chip'
import { LoadingSpinner } from '~/components/ui/LoadingSpinner'
import { editUnitSchema, EditUnitFormData } from './edit.schema'
import { colors } from '~/constants/theme'

export default function EditUnitScreen() {
  const { propertyId, id } = useLocalSearchParams<{ propertyId: string; id: string }>()
  const router = useRouter()
  const { data: unit, isLoading } = useUnitDetail(id)
  const { data: property } = useProperty(propertyId)
  const { mutateAsync: update, isPending: isSaving } = useUpdateUnit(propertyId)
  const { mutateAsync: remove, isPending: isDeleting } = useDeleteUnit(propertyId)

  const { control, handleSubmit, reset, formState: { errors } } = useForm<EditUnitFormData>({
    resolver: zodResolver(editUnitSchema),
    defaultValues: { unit_number: '', monthly_rate: '', billing_day: '', notes: '' },
  })

  useEffect(() => {
    if (!unit) return
    reset({
      unit_number: unit.unit_number,
      monthly_rate: unit.monthly_rate != null ? String(unit.monthly_rate) : '',
      billing_day: unit.billing_day != null ? String(unit.billing_day) : '',
      notes: unit.notes ?? '',
    })
  }, [unit, reset])

  const isOccupied = unit ? (unit.status === 'occupied' && unit.tenant != null) : false

  async function onSubmit(data: EditUnitFormData) {
    try {
      await update({
        id,
        input: {
          unit_number: data.unit_number.trim(),
          monthly_rate: parseFloat(data.monthly_rate),
          billing_day: data.billing_day ? parseInt(data.billing_day, 10) : 1,
          notes: data.notes.trim() || null,
        },
      })
      router.back()
    } catch {
      Alert.alert('Error', 'Could not update unit. Please try again.')
    }
  }

  function handleDelete() {
    if (isOccupied) {
      Alert.alert('Cannot delete unit', 'This unit has an active tenant. Move them out first, then delete.', [{ text: 'OK' }])
      return
    }
    Alert.alert('Delete unit?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await remove(id)
          router.replace(`/(admin)/properties/${propertyId}` as never)
        } catch {
          Alert.alert('Error', 'Could not delete unit. Please try again.')
        }
      }},
    ])
  }

  if (isLoading) return <LoadingSpinner />
  if (!unit) {
    return (
      <View className="flex-1 items-center justify-center p-8 bg-background">
        <AppText className="text-danger">Unit not found.</AppText>
      </View>
    )
  }

  return (
    <ScreenLayout
      title="Edit Unit"
      backHref={`/(admin)/properties/${propertyId}/units/${id}`}
      headerRight={
        <Pressable onPress={handleDelete} disabled={isDeleting} hitSlop={8}
          accessibilityLabel="Delete unit" accessibilityRole="button"
          className="flex-row items-center gap-1 px-2 h-[44px] justify-center"
        >
          <Ionicons name="trash-outline" size={18} color={colors.dangerText} />
          <AppText className="text-danger-text font-semibold text-sm">Delete</AppText>
        </Pressable>
      }
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerClassName="px-4 pt-3 pb-[88px]"
          keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive"
        >
          <View className="rounded-xl bg-surface p-4 flex-row items-center mb-4">
            <Avatar name={unit.unit_number} size="md" />
            <View className="ml-3 flex-1">
              <AppText variant="body" className="font-semibold">Unit {unit.unit_number}</AppText>
              {property && (
                <AppText variant="caption" color="muted" className="mt-0.5">
                  {property.name}{property.address ? ` — ${property.address}` : ''}
                </AppText>
              )}
            </View>
            <Chip variant={isOccupied ? 'success' : 'neutral'} label={isOccupied ? 'OCCUPIED' : 'VACANT'} />
          </View>

          <Controller control={control} name="unit_number" render={({ field }) => (
            <Input label="Unit number / name" value={field.value} onChangeText={field.onChange}
              error={errors.unit_number?.message} placeholder="Unit 1A" />
          )} />

          <Controller control={control} name="monthly_rate" render={({ field }) => (
            <Input label="Monthly rent (₱)" value={field.value} onChangeText={field.onChange}
              keyboardType="decimal-pad" placeholder="3500" error={errors.monthly_rate?.message} />
          )} />

          <Controller control={control} name="billing_day" render={({ field }) => (
            <Input label="Billing day" value={field.value} onChangeText={field.onChange}
              keyboardType="number-pad" placeholder="1" error={errors.billing_day?.message}
              hint="Day of month (1–31)" />
          )} />

          <Controller control={control} name="notes" render={({ field }) => (
            <Input label="Notes (optional)" value={field.value} onChangeText={field.onChange}
              multiline numberOfLines={3} className="text-align-vertical-top h-24" />
          )} />

          <Button label="Save Changes" onPress={handleSubmit(onSubmit)} loading={isSaving} className="mt-6" />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenLayout>
  )
}
