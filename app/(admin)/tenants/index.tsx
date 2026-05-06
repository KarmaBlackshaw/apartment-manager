import React, { useState, useMemo, useLayoutEffect } from 'react'
import { View, FlatList, TextInput, Pressable } from 'react-native'
import { Text } from 'react-native'
import { useRouter } from 'expo-router'
import { useNavigation } from '@react-navigation/native'
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
} from '../../../components/ui'
import { colors } from '../../../constants/theme'
import type { ChipVariant } from '../../../components/ui'

export default function TenantsScreen() {
  const router = useRouter()
  const navigation = useNavigation()
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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => router.push('/(admin)/notifications' as any)}
          style={{ padding: 4, marginRight: 8 }}
          hitSlop={8}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.textSecondary} />
        </Pressable>
      ),
    })
  }, [navigation])

  if (isLoading) return <LoadingSpinner />

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Property selector row */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Pressable
          style={{
            backgroundColor: colors.elevated,
            borderRadius: 999,
            paddingHorizontal: 14,
            paddingVertical: 8,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Ionicons name="home-outline" size={14} color={colors.textSecondary} />
          <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '500' }}>
            All properties ▾
          </Text>
        </Pressable>
        <View style={{ flex: 1 }} />
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>{total} tenants</Text>
      </View>

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
              onPress={() => router.push(`/(admin)/tenants/${tenant.id}` as any)}
            />
          )
        }}
        ListEmptyComponent={
          <EmptyState
            title="No tenants"
            actionLabel="New tenant"
            onAction={() => router.push('/(admin)/tenants/new' as any)}
          />
        }
      />
    </View>
  )
}
