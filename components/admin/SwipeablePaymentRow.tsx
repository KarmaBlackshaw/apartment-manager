import React from 'react'
import { Pressable, Text, View, StyleSheet } from 'react-native'
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
    <Pressable style={styles.swipeAction} onPress={onPress}>
      <Ionicons name="cash-outline" size={20} color="#000" />
      <Text style={styles.swipeActionText}>Record{'\n'}Payment</Text>
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
      <Pressable onPress={onPress} style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: color }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.rowInfo}>
          <Text style={styles.rowName}>{tenantName}</Text>
          <Text style={styles.rowUnit}>Unit {unitNumber ?? '?'}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.amount}>
            ₱{amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </Text>
          <View style={[styles.chip, { backgroundColor: statusBg }]}>
            <Text style={[styles.chipText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>
      </Pressable>
    </Swipeable>
  )
}

const styles = StyleSheet.create({
  swipeAction: {
    width: 120,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  swipeActionText: { color: '#000', fontSize: 10, fontWeight: '700', textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#171717',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
    gap: 12,
  },
  avatar: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 15, fontWeight: '600', color: '#f1f1f1' },
  rowUnit: { fontSize: 12, color: '#888888', marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 4 },
  amount: { fontSize: 14, fontWeight: '600', color: '#f1f1f1' },
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  chipText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
})
