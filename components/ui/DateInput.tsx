import React, { useState } from 'react'
import { TouchableOpacity, View, Platform, Modal } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import Ionicons from '@expo/vector-icons/Ionicons'
import dayjs from 'dayjs'
import { AppText } from '~/components/ui/AppText'

interface DateInputProps {
  label?: string
  value: string // YYYY-MM-DD
  onChange: (value: string) => void
  error?: string
  minimumDate?: Date
  maximumDate?: Date
}

function toDate(yyyyMmDd: string): Date {
  return dayjs(yyyyMmDd).toDate()
}

function toYMD(d: Date): string {
  return dayjs(d).format('YYYY-MM-DD')
}

export function DateInput({ label, value, onChange, error, minimumDate, maximumDate }: DateInputProps) {
  const [show, setShow] = useState(false)
  const date = value ? toDate(value) : new Date()
  const displayValue = value
    ? dayjs(value).format('MMMM D, YYYY')
    : ''

  function handleChange(_: unknown, selected?: Date) {
    if (Platform.OS === 'android') setShow(false)
    if (selected) onChange(toYMD(selected))
  }

  return (
    <View className="mb-4">
      {label && <AppText variant="label" color="secondary" className="mb-2">{label}</AppText>}
      <TouchableOpacity
        onPress={() => setShow(true)}
        // @ts-ignore
        className={`flex-row items-center border rounded-xl px-4 py-4 bg-surface ${error ? 'border-danger' : 'border-[#2a2a2a]'}`}
        activeOpacity={0.7}
      >
        <AppText className="flex-1" color={value ? 'primary' : 'muted'}>
          {displayValue || 'Select date…'}
        </AppText>
        <Ionicons name="calendar-outline" size={18} color="#555555" />
      </TouchableOpacity>
      {error && <AppText variant="caption" color="danger" className="mt-1">{error}</AppText>}

      {Platform.OS === 'ios' && show && (
        <Modal transparent animationType="slide">
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ backgroundColor: '#1a1a1a', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 }}>
              <View className="flex-row justify-between items-center mb-2">
                <AppText variant="subheading">Select Date</AppText>
                <TouchableOpacity onPress={() => setShow(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <AppText color="primary">Done</AppText>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                // @ts-ignore — textColor is iOS-specific
                textColor="#f1f1f1"
                style={{ height: 200 }}
              />
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === 'android' && show && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  )
}
