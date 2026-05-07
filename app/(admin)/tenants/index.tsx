import React, { useState, useMemo } from 'react'
import { View, FlatList, TextInput, Pressable } from 'react-native'
import { Text } from 'react-native'
import { useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import dayjs from 'dayjs'
import { useTabBarScrollHandler } from '../../../hooks/useTabBarScrollHandler'
import { useTenants } from '../../../hooks/useTenants'
import { useBills } from '../../../hooks/useBills'
import {
  FilterChipBar,
  ListRow,
  AvatarInitials,
  StatusChip,
  AmountText,
  LoadingSpinner,
  EmptyState,
  FAB,
  AppHeader,
  ScreenView,
} from '../../../components/ui'
import { colors } from '../../../constants/theme'
import type { ChipVariant } from '../../../components/ui'

export default function TenantsScreen() {
  const router = useRouter()
  const tabBarScroll = useTabBarScrollHandler()

  const [chipFilter, setChipFilter] = useState('all')
  const [search, setSearch] = useState('')

  // Derive API-level filters from chip selection
  const apiFilters = useMemo(() => {
    if (chipFilter === 'active') return { status: 'active' as const }
    if (chipFilter === 'overdue' || chipFilter === 'expiring') return { status: 'active' as const }
    return undefined
  }, [chipFilter])

  const { data: tenants = [], isLoading } = useTenants(apiFilters)
  const { data: allTenants = [] } = useTenants(undefined)
  const total = allTenants.length

  // Build per-tenant balance map from all bills
  const { data: allBills = [] } = useBills()
  const balanceMap = useMemo(() => {
    const map = new Map<string, { amount: number; hasOverdue: boolean; hasPending: boolean }>()
    for (const bill of allBills) {
      if (bill.status === 'paid') continue
      const prev = map.get(bill.tenant_id) ?? { amount: 0, hasOverdue: false, hasPending: false }
      prev.amount += bill.amount
      if (bill.status === 'overdue') prev.hasOverdue = true
      if (bill.status === 'pending') prev.hasPending = true
      map.set(bill.tenant_id, prev)
    }
    return map
  }, [allBills])

  // Client-side search filter
  const filtered = useMemo(() => {
    if (!search.trim()) return tenants
    const q = search.toLowerCase()
    return tenants.filter(
      (t) =>
        t.full_name.toLowerCase().includes(q) ||
        (t.phone ?? '').toLowerCase().includes(q) ||
        (t.unit?.unit_number ?? '').toLowerCase().includes(q),
    )
  }, [tenants, search])

  if (isLoading) return <LoadingSpinner />

  return (
    <ScreenView edges={['bottom']}>
      <AppHeader
        title="Tenants"
        right={
          <Pressable
            onPress={() => router.push('/notifications')}
            hitSlop={8}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.textSecondary} />
          </Pressable>
        }
      />
      {/* Search bar */}
      <View
        style={{
          marginHorizontal: 16,
          marginBottom: 8,
          backgroundColor: colors.elevated,
          borderRadius: 999,
          paddingHorizontal: 12,
          height: 44,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search name, unit, phone..."
          placeholderTextColor={colors.textMuted}
          style={{
            flex: 1,
            marginLeft: 8,
            color: colors.textPrimary,
            fontSize: 14,
          }}
        />
      </View>

      {/* Filter chips */}
      <FilterChipBar
        options={[
          { label: `All (${total})`, value: 'all' },
          { label: 'Active', value: 'active' },
          { label: 'Overdue', value: 'overdue' },
          { label: 'Expiring', value: 'expiring' },
        ]}
        selected={chipFilter}
        onChange={setChipFilter}
      />

      {/* Tenant list */}
      <FlatList
        data={filtered}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ paddingBottom: 128 }}
        {...tabBarScroll}
        renderItem={({ item: tenant }) => {
          const bal = balanceMap.get(tenant.id)
          const chipVariant: ChipVariant = tenant.status !== 'active'
            ? 'neutral'
            : bal?.hasOverdue ? 'danger'
            : bal?.hasPending ? 'warning'
            : 'success'
          const chipLabel = tenant.status !== 'active'
            ? 'INACTIVE'
            : bal?.hasOverdue ? 'OVERDUE'
            : bal?.hasPending ? 'PENDING'
            : 'PAID'
          const owed = bal?.amount ?? 0
          return (
            <ListRow
              leading={<AvatarInitials name={tenant.full_name} size="md" />}
              title={tenant.full_name}
              subtitle={
                tenant.unit
                  ? `Unit ${tenant.unit.unit_number} · Since ${dayjs(tenant.move_in_date).format('MMM YYYY')}`
                  : `No unit · Since ${dayjs(tenant.move_in_date).format('MMM YYYY')}`
              }
              trailingChip={<StatusChip variant={chipVariant} label={chipLabel} />}
              trailingAmount={<AmountText amount={owed} variant={owed > 0 ? 'owed' : 'zero'} />}
              onPress={() => router.push({ pathname: '/tenants/[id]', params: { id: tenant.id } })}
            />
          )
        }}
        ListEmptyComponent={<EmptyState title="No tenants" />}
      />

      <FAB onPress={() => router.push('/tenants/new')} />
    </ScreenView>
  )
}
