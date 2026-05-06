import React, { useRef } from 'react'
import { View, Text, Pressable } from 'react-native'
import { BottomSheetModal, BottomSheetFlatList, BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import Ionicons from '@expo/vector-icons/Ionicons'
import * as Haptics from 'expo-haptics'
import { colors } from '../../constants/theme'
import { useProperties } from '../../hooks/useProperties'

interface PropertySelectorProps {
  selectedId: string | undefined
  onChange: (id: string | undefined) => void
}

const ALL_ID = '__all__'

export function PropertySelector({ selectedId, onChange }: PropertySelectorProps) {
  const sheetRef = useRef<BottomSheetModal>(null)
  const { data: properties = [] } = useProperties()

  const selectedProperty = properties.find((p) => p.id === selectedId)
  const label = selectedProperty?.name ?? 'All properties'

  function handleOpen() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    sheetRef.current?.present()
  }

  function handleSelect(id: string) {
    onChange(id === ALL_ID ? undefined : id)
    sheetRef.current?.dismiss()
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const listData: Array<{ id: string; name: string; subtitle?: string }> = [
    { id: ALL_ID, name: 'All properties' },
    ...properties.map((p) => ({ id: p.id, name: p.name, subtitle: p.address })),
  ]

  const activeId = selectedId ?? ALL_ID

  return (
    <>
      <Pressable
        onPress={handleOpen}
        style={({ pressed }) => pressed ? { opacity: 0.7 } : undefined}
        hitSlop={4}
        accessibilityRole="button"
        accessibilityLabel={`Property filter: ${label}`}
        className="flex-row items-center gap-[5px] bg-elevated rounded-full px-3 py-[7px] max-w-[180px]"
      >
        <Ionicons name="business-outline" size={12} color={colors.textSecondary} />
        <Text className="text-xs text-text-secondary font-medium flex-shrink" numberOfLines={1}>{label}</Text>
        <Ionicons name="chevron-down" size={12} color={colors.textSecondary} />
      </Pressable>

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={['45%', '75%']}
        enablePanDownToClose
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            pressBehavior="close"
            opacity={0.6}
          />
        )}
        backgroundStyle={{ backgroundColor: '#1a1a1a' }}
        handleIndicatorStyle={{ backgroundColor: '#555555' }}
      >
        {/* Sheet header */}
        <View className="flex-row items-center justify-between px-5 py-[14px] border-b border-border">
          <Text className="text-base font-bold text-text-primary">Select property</Text>
          <Pressable
            onPress={() => sheetRef.current?.dismiss()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Property list */}
        <BottomSheetFlatList
          data={listData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
          renderItem={({ item }) => {
            const isSelected = item.id === activeId
            return (
              <Pressable
                onPress={() => handleSelect(item.id)}
                style={({ pressed }) => pressed ? { opacity: 0.75 } : undefined}
                className={`flex-row items-center px-4 py-[14px] rounded-md mb-1 min-h-[52px] ${
                  isSelected ? 'bg-primary' : 'bg-elevated'
                }`}
                accessibilityRole="menuitem"
                accessibilityState={{ selected: isSelected }}
              >
                <View className="flex-1 mr-2">
                  <Text className={`text-[15px] font-medium ${isSelected ? 'text-white font-semibold' : 'text-text-primary'}`}>
                    {item.name}
                  </Text>
                  {item.subtitle && (
                    <Text className="text-xs text-text-muted mt-[2px]" numberOfLines={1}>{item.subtitle}</Text>
                  )}
                </View>
                {isSelected && (
                  <Ionicons name="checkmark" size={18} color="#ffffff" />
                )}
              </Pressable>
            )
          }}
        />
      </BottomSheetModal>
    </>
  )
}
