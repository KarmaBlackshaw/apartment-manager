import React, { useState, useMemo } from 'react'
import { View, Modal, FlatList, TouchableOpacity, TextInput, SafeAreaView } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { AppText } from './AppText'

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
  const [open, setOpen] = useState(false)
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
    setOpen(true)
  }

  function handleSelect(val: string) {
    onChange(val)
    setOpen(false)
  }

  return (
    <View className="mb-4">
      {label && <AppText variant="label" color="secondary" className="mb-2">{label}</AppText>}
      <TouchableOpacity
        onPress={handleOpen}
        activeOpacity={0.7}
        // @ts-ignore
        className={`border rounded-xl px-4 py-4 flex-row justify-between items-center bg-surface ${error ? 'border-danger' : 'border-[#2a2a2a]'}`}
      >
        <AppText className={selected ? 'text-[#f1f1f1]' : 'text-[#555555]'}>
          {selected ? selected.label : placeholder}
        </AppText>
        <Ionicons name="chevron-down" size={18} color="#888888" />
      </TouchableOpacity>
      {error && <AppText variant="caption" color="danger" className="mt-1">{error}</AppText>}

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        {/* @ts-ignore */}
        <SafeAreaView className="flex-1 bg-app">
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-[#2a2a2a]">
            <AppText variant="subheading">{label ?? 'Select'}</AppText>
            <TouchableOpacity onPress={() => setOpen(false)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="close" size={24} color="#888888" />
            </TouchableOpacity>
          </View>

          {searchable && (
            <View className="px-4 pt-3 pb-2">
              {/* @ts-ignore */}
              <View className="flex-row items-center bg-surface border border-[#2a2a2a] rounded-xl px-4 py-3 gap-3">
                <Ionicons name="search" size={18} color="#555555" />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search…"
                  placeholderTextColor="#555555"
                  autoFocus
                  // @ts-ignore
                  className="flex-1 text-base text-[#f1f1f1]"
                />
                {query.length > 0 && (
                  <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close-circle" size={18} color="#555555" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          <FlatList
            data={filtered}
            keyExtractor={(o) => o.value}
            contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
            renderItem={({ item }) => {
              const isSelected = item.value === value
              return (
                <TouchableOpacity
                  onPress={() => handleSelect(item.value)}
                  activeOpacity={0.7}
                  // @ts-ignore
                  className={`flex-row items-center justify-between px-4 py-4 rounded-xl mb-2 ${isSelected ? 'bg-primary' : 'bg-elevated'}`}
                >
                  <AppText className={isSelected ? 'text-white font-semibold flex-1 mr-3' : 'flex-1 mr-3'} numberOfLines={2}>
                    {item.label}
                  </AppText>
                  {isSelected && <Ionicons name="checkmark" size={20} color="#ffffff" />}
                </TouchableOpacity>
              )
            }}
            ListEmptyComponent={
              <AppText color="muted" className="text-center py-8">No options found</AppText>
            }
          />
        </SafeAreaView>
      </Modal>
    </View>
  )
}
