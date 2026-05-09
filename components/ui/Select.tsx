import React, { useRef, useState, useMemo } from 'react'
import { View, Pressable } from 'react-native'
import { BottomSheetModal, BottomSheetFlatList, BottomSheetTextInput, BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import Ionicons from '@expo/vector-icons/Ionicons'
import { AppText } from '~/components/ui/AppText'

export interface SelectOption {
  label: string
  value: string
}

interface SelectProps {
  label?: string
  placeholder?: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  error?: string
  searchable?: boolean
}

export function Select({
  label,
  placeholder = 'Select…',
  options,
  value,
  onChange,
  error,
  searchable = true,
}: SelectProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const [query, setQuery] = useState('')

  const selected = options.find((o) => o.value === value)
  const filtered = useMemo(
    () =>
      query
        ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
        : options,
    [options, query],
  )

  function handleOpen() {
    setQuery('')
    bottomSheetRef.current?.present()
  }

  function handleClose() {
    bottomSheetRef.current?.dismiss()
  }

  function handleSelect(val: string) {
    onChange(val)
    bottomSheetRef.current?.dismiss()
  }

  return (
    <View className="mb-4">
      {label && <AppText variant="label" color="secondary" className="mb-2">{label}</AppText>}
      <Pressable
        onPress={handleOpen}
        // @ts-ignore
        className={`border rounded-xl px-4 py-4 flex-row justify-between items-center bg-surface ${error ? 'border-danger' : 'border-[#2a2a2a]'}`}
      >
        <AppText className={selected ? 'text-[#f1f1f1]' : 'text-[#555555]'}>
          {selected ? selected.label : placeholder}
        </AppText>
        <Ionicons name="chevron-down" size={18} color="#888888" />
      </Pressable>
      {error && <AppText variant="caption" color="danger" className="mt-1">{error}</AppText>}

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={['60%', '90%']}
        enablePanDownToClose
        onDismiss={() => setQuery('')}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} pressBehavior="close" />
        )}
        backgroundStyle={{ backgroundColor: '#1a1a1a' }}
        handleIndicatorStyle={{ backgroundColor: '#555555' }}
      >
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-[#2a2a2a]">
          <AppText variant="subheading">{label ?? 'Select'}</AppText>
          <Pressable
            onPress={handleClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={24} color="#888888" />
          </Pressable>
        </View>

        {searchable && (
          <View className="px-4 pt-3 pb-2">
            {/* @ts-ignore */}
            <View className="flex-row items-center bg-surface border border-[#2a2a2a] rounded-xl px-4 py-3 gap-3">
              <Ionicons name="search" size={18} color="#555555" />
              <BottomSheetTextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search…"
                placeholderTextColor="#555555"
                style={{ flex: 1, fontSize: 16, color: '#f1f1f1' }}
              />
              {query.length > 0 && (
                <Pressable
                  onPress={() => setQuery('')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="Clear search"
                >
                  <Ionicons name="close-circle" size={18} color="#555555" />
                </Pressable>
              )}
            </View>
          </View>
        )}

        <BottomSheetFlatList
          data={filtered}
          keyExtractor={(o) => o.value}
          contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
          renderItem={({ item }) => {
            const isSelected = item.value === value
            return (
              <Pressable
                onPress={() => handleSelect(item.value)}
                // @ts-ignore
                className={`flex-row items-center justify-between px-4 py-4 rounded-xl mb-2 ${isSelected ? 'bg-primary' : 'bg-elevated'}`}
              >
                <AppText className={isSelected ? 'text-white font-semibold flex-1 mr-3' : 'flex-1 mr-3'} numberOfLines={2}>
                  {item.label}
                </AppText>
                {isSelected && <Ionicons name="checkmark" size={20} color="#ffffff" />}
              </Pressable>
            )
          }}
          ListEmptyComponent={
            <AppText color="muted" className="text-center py-8">No options found</AppText>
          }
        />
      </BottomSheetModal>
    </View>
  )
}
