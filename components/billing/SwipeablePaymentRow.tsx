import React from 'react'
import { View, Pressable } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import Ionicons from '@expo/vector-icons/Ionicons'
import { colors } from '~/constants/theme'
import { Card } from '~/components/ui/Card'
import { AppText } from '~/components/ui/AppText'

const ACCENT_COLORS = [
  colors.primary,  // '#3B82F6' (replaces '#3b82f6')
  colors.purple,   // '#8B5CF6' (replaces '#8b5cf6')
  colors.purple,   // '#ec4899' pink — no pink token, closest is purple
  colors.warning,  // '#F59E0B' (replaces '#f59e0b')
  colors.success,  // '#10B981' (replaces '#22c55e')
  colors.danger,   // '#EF4444' (replaces '#ef4444')
]

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
      style={{ backgroundColor: colors.warning }}
      onPress={onPress}
    >
      <Ionicons name="cash-outline" size={20} color={colors.textInverse} />
      <AppText className="text-[10px] font-bold text-center" style={{ color: colors.textInverse }}>
        Record{'\n'}Payment
      </AppText>
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
      <Card onPress={onPress} size="md" accessibilityLabel={tenantName}>
        <View className="flex-row items-center gap-3">
          <View
            className="w-10 h-10 rounded-[10px] items-center justify-center"
            style={{ backgroundColor: color }}
          >
            <AppText className="font-bold text-[15px]" style={{ color: colors.textInverse }}>{initial}</AppText>
          </View>
          <View className="flex-1">
            <AppText className="text-[15px] font-semibold" style={{ color: colors.textPrimary }}>{tenantName}</AppText>
            <AppText className="text-xs mt-0.5" style={{ color: colors.textMuted }}>Unit {unitNumber ?? '?'}</AppText>
          </View>
          <View className="items-end gap-1">
            <AppText className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
              ₱{amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </AppText>
            <View className="px-2 py-[3px] rounded-[6px]" style={{ backgroundColor: statusBg }}>
              <AppText className="text-[10px] font-bold tracking-wider" style={{ color: statusColor }}>
                {statusLabel}
              </AppText>
            </View>
          </View>
        </View>
      </Card>
    </Swipeable>
  )
}
