import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import Ionicons from '@expo/vector-icons/Ionicons'

const ACCENT_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#ef4444']
function tenantColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % ACCENT_COLORS.length
  return ACCENT_COLORS[h]
}

export interface SwipeablePaymentRowProps {
  tenantName: string
  unitNumber: string | null
  amount: number
  statusLabel: string
  statusColor: string
  statusBg: string
  onRecordPayment: () => void
  onPress: () => void
}

function LeftAction({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      className="w-[120px] justify-center items-center gap-1"
      style={{ backgroundColor: '#f59e0b' }}
      onPress={onPress}
    >
      <Ionicons name="cash-outline" size={20} color="#000" />
      <Text className="text-[10px] font-bold text-center" style={{ color: '#000' }}>
        Record{'\n'}Payment
      </Text>
    </Pressable>
  )
}

export function SwipeablePaymentRow({
  tenantName, unitNumber, amount, statusLabel, statusColor, statusBg,
  onRecordPayment, onPress,
}: SwipeablePaymentRowProps) {
  const initial = tenantName.charAt(0).toUpperCase()
  const color = tenantColor(tenantName)

  return (
    <Swipeable
      renderLeftActions={() => <LeftAction onPress={onRecordPayment} />}
      overshootLeft={false}
    >
      <Pressable
        onPress={onPress}
        className="flex-row items-center px-4 py-[14px] gap-3 border-b border-[#2a2a2a]"
        style={{ backgroundColor: '#171717' }}
      >
        <View
          className="w-10 h-10 rounded-[10px] items-center justify-center"
          style={{ backgroundColor: color }}
        >
          <Text className="font-bold text-[15px]" style={{ color: '#fff' }}>{initial}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-semibold" style={{ color: '#f1f1f1' }}>{tenantName}</Text>
          <Text className="text-xs mt-0.5" style={{ color: '#888888' }}>Unit {unitNumber ?? '?'}</Text>
        </View>
        <View className="items-end gap-1">
          <Text className="text-sm font-semibold" style={{ color: '#f1f1f1' }}>
            ₱{amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </Text>
          <View className="px-2 py-[3px] rounded-[6px]" style={{ backgroundColor: statusBg }}>
            <Text className="text-[10px] font-bold tracking-wider" style={{ color: statusColor }}>
              {statusLabel}
            </Text>
          </View>
        </View>
      </Pressable>
    </Swipeable>
  )
}
