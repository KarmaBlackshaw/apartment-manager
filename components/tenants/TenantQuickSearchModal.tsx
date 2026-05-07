import React, { useState, useMemo } from 'react'
import {
  Modal, View, TextInput, ScrollView, Pressable, Text,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTenants } from '~/hooks/useTenants'
import { useBills } from '~/hooks/useBills'
import type { TenantWithUnit, BillWithTenant } from '~/types'

interface Props {
  visible: boolean
  onClose: () => void
}

const ACCENT_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#ef4444']
function tenantColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % ACCENT_COLORS.length
  return ACCENT_COLORS[h]
}

const STATUS_CHIP: Record<string, { bg: string; text: string }> = {
  paid:    { bg: 'rgba(34,197,94,0.15)',   text: '#22c55e' },
  overdue: { bg: 'rgba(239,68,68,0.15)',   text: '#ef4444' },
  pending: { bg: 'rgba(245,158,11,0.15)',  text: '#f59e0b' },
}

function ResultCard({
  tenant, bill, onView,
}: {
  tenant: TenantWithUnit
  bill?: BillWithTenant
  onView: () => void
}) {
  const initial = tenant.full_name.charAt(0).toUpperCase()
  const color = tenantColor(tenant.full_name)
  const hasBalance = !!bill && bill.status !== 'paid'
  const balanceColor = hasBalance ? '#ef4444' : '#22c55e'
  const balanceLabel = hasBalance
    ? `₱${bill!.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })} outstanding`
    : '₱0.00 paid in full'
  const chip = bill ? (STATUS_CHIP[bill.status] ?? STATUS_CHIP.pending) : null

  return (
    <Pressable
      className="bg-elevated rounded-md p-[14px] mb-2 border border-border"
      onPress={onView}
      accessibilityRole="button"
    >
      <View className="flex-row items-center gap-[10px] mb-[6px]">
        <View
          className="w-[36px] h-[36px] rounded-[8px] items-center justify-center"
          style={{ backgroundColor: color }}
        >
          <Text className="text-white font-bold text-sm">{initial}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-text-primary font-semibold text-[15px]">
            {tenant.full_name}
          </Text>
          <Text className="text-text-muted text-xs mt-[1px]">
            Unit {tenant.unit?.unit_number ?? '?'}
          </Text>
        </View>
        {chip && (
          <View
            className="px-2 py-[3px] rounded-sm"
            style={{ backgroundColor: chip.bg }}
          >
            <Text
              className="text-[10px] font-bold tracking-[0.5px]"
              style={{ color: chip.text }}
            >
              {bill!.status.toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <Text className="text-[13px] font-semibold" style={{ color: balanceColor }}>
        {balanceLabel}
      </Text>
    </Pressable>
  )
}

export function TenantQuickSearchModal({ visible, onClose }: Props) {
  const [query, setQuery] = useState('')
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { data: tenants } = useTenants({ status: 'active' })
  const { data: bills } = useBills()

  const latestUnpaidBill = useMemo(() => {
    const map = new Map<string, BillWithTenant>()
    if (!bills) return map
    for (const b of bills) {
      if (b.status !== 'paid') {
        const existing = map.get(b.tenant_id)
        if (!existing || b.due_date > existing.due_date) map.set(b.tenant_id, b)
      }
    }
    return map
  }, [bills])

  const results = useMemo(() => {
    if (!query.trim() || !tenants) return []
    const q = query.toLowerCase()
    return tenants.filter(
      (t) =>
        t.full_name.toLowerCase().includes(q) ||
        (t.unit?.unit_number ?? '').toLowerCase().includes(q) ||
        t.phone.includes(q)
    ).slice(0, 5)
  }, [query, tenants])

  if (!visible) return null

  function handleView(tenant: TenantWithUnit) {
    router.push(`/(admin)/tenants/${tenant.id}` as any)
    onClose()
    setQuery('')
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60 justify-start" onPress={onClose}>
        <Pressable
          className="bg-background px-4 pb-8 min-h-[200px] max-h-[80%]"
          style={{ paddingTop: insets.top + 16 }}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="flex-row items-center gap-2 mb-3">
            <TextInput
              className="flex-1 h-[48px] rounded-md border border-border bg-elevated px-4 text-[15px] text-text-primary"
              placeholder="Search tenants..."
              placeholderTextColor="#555555"
              value={query}
              onChangeText={setQuery}
              autoFocus
              returnKeyType="search"
            />
            <Pressable
              onPress={() => { onClose(); setQuery('') }}
              className="w-[40px] h-[40px] items-center justify-center"
              accessibilityLabel="Close search"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={20} color="#f1f1f1" />
            </Pressable>
          </View>

          <ScrollView
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {query.trim().length > 0 && results.length === 0 && (
              <Text className="text-text-muted text-center mt-6 text-sm">
                No tenants found
              </Text>
            )}
            {results.map((t) => (
              <ResultCard
                key={t.id}
                tenant={t}
                bill={latestUnpaidBill.get(t.id)}
                onView={() => handleView(t)}
              />
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
