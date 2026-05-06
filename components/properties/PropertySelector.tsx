import React, { useRef, useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { BottomSheetModal, BottomSheetFlatList, BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet'
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
  const [query, setQuery] = useState('')
  const { data: properties = [] } = useProperties()

  const selectedProperty = properties.find((p) => p.id === selectedId)
  const label = selectedProperty?.name ?? 'All properties'

  function handleOpen() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    sheetRef.current?.present()
  }

  function handleDismiss() {
    sheetRef.current?.dismiss()
    setQuery('')
  }

  function handleSelect(id: string) {
    onChange(id === ALL_ID ? undefined : id)
    handleDismiss()
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const filtered = query.trim()
    ? properties.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.address?.toLowerCase().includes(query.toLowerCase())
      )
    : properties

  const listData: Array<{ id: string; name: string; subtitle?: string }> = [
    ...(query.trim() ? [] : [{ id: ALL_ID, name: 'All properties' }]),
    ...filtered.map((p) => ({ id: p.id, name: p.name, subtitle: p.address })),
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
        <Text className="text-xs text-text-secondary font-medium flex-shrink" numberOfLines={1}>{label}</Text>
        <Ionicons name="chevron-down" size={12} color={colors.textSecondary} />
      </Pressable>

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={['92%']}
        enableDynamicSizing={false}
        enablePanDownToClose
        onDismiss={() => setQuery('')}
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
            onPress={handleDismiss}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Search bar */}
        <View className="px-4 py-3 border-b border-border">
          <View className="flex-row items-center bg-elevated rounded-xl px-3 gap-2">
            <Ionicons name="search" size={16} color={colors.textMuted} />
            <BottomSheetTextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search properties…"
              placeholderTextColor={colors.textMuted}
              returnKeyType="search"
              clearButtonMode="while-editing"
              style={{
                flex: 1,
                height: 40,
                color: colors.textPrimary,
                fontSize: 15,
              }}
            />
          </View>
        </View>

        {/* Property list */}
        <BottomSheetFlatList
          data={listData}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
          ListEmptyComponent={
            <View className="items-center py-10">
              <Text className="text-text-muted text-sm">No properties found</Text>
            </View>
          }
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
