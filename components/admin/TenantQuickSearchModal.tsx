import React, { useState, useMemo } from 'react'
import {
  Modal, View, TextInput, ScrollView, Pressable, Text, StyleSheet,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTenants } from '../../hooks/useTenants'
import { useBills } from '../../hooks/useBills'
import type { TenantWithUnit, BillWithTenant } from '../../types'

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
    <Pressable style={styles.card} onPress={onView} accessibilityRole="button">
      <View style={styles.cardRow}>
        <View style={[styles.avatar, { backgroundColor: color }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.tenantName}>{tenant.full_name}</Text>
          <Text style={styles.unitText}>Unit {tenant.unit?.unit_number ?? '?'}</Text>
        </View>
        {chip && (
          <View style={[styles.chip, { backgroundColor: chip.bg }]}>
            <Text style={[styles.chipText, { color: chip.text }]}>
              {bill!.status.toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.balanceText, { color: balanceColor }]}>{balanceLabel}</Text>
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
      <Pressable style={styles.scrim} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingTop: insets.top + 16 }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search tenants..."
              placeholderTextColor="#555555"
              value={query}
              onChangeText={setQuery}
              autoFocus
              returnKeyType="search"
            />
            <Pressable
              onPress={() => { onClose(); setQuery('') }}
              style={styles.closeBtn}
              accessibilityLabel="Close search"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={20} color="#f1f1f1" />
            </Pressable>
          </View>

          <ScrollView
            style={styles.results}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {query.trim().length > 0 && results.length === 0 && (
              <Text style={styles.emptyText}>No tenants found</Text>
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

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-start',
  },
  sheet: {
    backgroundColor: '#0d0d0d',
    paddingHorizontal: 16,
    paddingBottom: 32,
    minHeight: 200,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    backgroundColor: '#171717',
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#f1f1f1',
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  results: { flex: 1 },
  emptyText: {
    color: '#555555',
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
  },
  card: {
    backgroundColor: '#171717',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  cardInfo: { flex: 1 },
  tenantName: { color: '#f1f1f1', fontWeight: '600', fontSize: 15 },
  unitText: { color: '#888888', fontSize: 12, marginTop: 1 },
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  chipText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  balanceText: { fontSize: 13, fontWeight: '600' },
})
