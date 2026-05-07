import React, { useMemo } from 'react'
import { ReportMenuCard } from '../../components/reports/ReportMenuCard'
import { ScrollView, View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTabBarScrollHandler } from '../../hooks/useTabBarScrollHandler'
import { useBills } from '../../hooks/useBills'
import { useUnitCounts, useVacantUnits } from '../../hooks/useUnits'
import { useSettings } from '../../hooks/useSettings'
import { useTenantSearch } from '../../context/TenantSearchContext'
import {
  AppHeader,
  KPICard,
  SectionHeader,
  CollectionProgressBar,
  SwipeablePaymentRow,
} from '../../components/ui'
import { colors, radius, spacing } from '../../constants/theme'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

function formatPHP(n: number) {
  return `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
}

// ─── Quick action button ──────────────────────────────────────────────────────
function QuickAction({ label, icon, color, onPress }: {
  label: string; icon: IoniconName; color: string; onPress: () => void
}) {
  return (
    <Pressable
      style={{ flex: 1, alignItems: 'center', gap: 6 }}
      onPress={onPress}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: radius.lg,
          borderCurve: 'continuous',
          backgroundColor: `${color}22`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={{ fontSize: 10, fontWeight: '600', color: colors.textSecondary, textAlign: 'center' }}>
        {label}
      </Text>
    </Pressable>
  )
}

const REPORT_CARDS = [
  { label: 'Monthly Collection', icon: 'briefcase-outline',    iconBg: '#052E16', route: '/(admin)/reports/monthly-collection' },
  { label: 'Outstanding',        icon: 'alert-circle-outline', iconBg: '#200C0C', route: '/(admin)/reports/outstanding-balances' },
  { label: 'Occupancy',          icon: 'home-outline',         iconBg: '#0C1A3D', route: '/(admin)/reports/occupancy' },
  { label: 'Per-unit Income',    icon: 'stats-chart-outline',  iconBg: '#1A1040', route: '/(admin)/reports/per-unit-income' },
  { label: 'Annual Summary',     icon: 'calendar-outline',     iconBg: '#052E16', route: '/(admin)/reports/annual-summary' },
  { label: 'Maintenance',        icon: 'construct-outline',    iconBg: '#2A1A00', route: '/(admin)/reports/maintenance-costs' },
] as const

// ─── Home Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter()
  const tabBarScroll = useTabBarScrollHandler()
  const { open: openSearch } = useTenantSearch()

  const { data: bills } = useBills()
  const { data: unitCounts } = useUnitCounts()
  const { data: vacantUnits } = useVacantUnits()
  const { data: settings } = useSettings()

  const today = new Date()
  const yyyy = String(today.getFullYear())
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const monthPrefix = `${yyyy}-${mm}`

  const aptName = settings?.apartment_name ?? 'Apartment Manager'

  // ─── KPI calculations
  const kpis = useMemo(() => {
    const occupied = unitCounts?.occupied ?? 0
    const available = unitCounts?.available ?? 0
    const maintenance = unitCounts?.maintenance ?? 0
    const totalUnits = occupied + available + maintenance

    const collectedThisMonth = bills
      ?.filter((b) => b.paid_at?.startsWith(monthPrefix))
      .reduce((s, b) => s + b.amount, 0) ?? 0

    const outstanding = bills
      ?.filter((b) => b.status === 'pending' || b.status === 'overdue')
      .reduce((s, b) => s + b.amount, 0) ?? 0

    const occupancyPct = totalUnits > 0 ? Math.round((occupied / totalUnits) * 100) : 0

    return {
      income: collectedThisMonth,
      occupancy: `${occupancyPct}%`,
      outstanding,
      vacancies: available,
      occupied,
    }
  }, [bills, unitCounts, monthPrefix])

  // ─── Alert strip data
  const overdueBills = useMemo(
    () => bills?.filter((b) => b.status === 'overdue') ?? [],
    [bills]
  )

  // ─── Collection progress (bill counts for CollectionProgressBar)
  const collectionCounts = useMemo(() => {
    const monthBills = bills?.filter((b) => b.due_date.startsWith(monthPrefix)) ?? []
    const paid = monthBills.filter((b) => b.status === 'paid').length
    const partial = monthBills.filter((b) => (b.status as string) === 'partial').length
    const unpaid = monthBills.filter((b) => b.status === 'pending' || b.status === 'overdue').length
    const total = monthBills.length
    return { paid, partial, unpaid, total }
  }, [bills, monthPrefix])

  // ─── Attention list (overdue + pending, sorted by due_date asc, max 5)
  const attentionList = useMemo(() => {
    if (!bills) return []
    return bills
      .filter((b) => b.status === 'overdue' || b.status === 'pending')
      .sort((a, b) => a.due_date.localeCompare(b.due_date))
      .slice(0, 5)
  }, [bills])

  const billStatusStyle = (s: string) => {
    if (s === 'overdue') return { bg: `${colors.danger}26`, color: colors.danger, label: 'OVERDUE' }
    return { bg: `${colors.warning}26`, color: colors.warning, label: 'PENDING' }
  }

  return (
    <>
      <AppHeader
        title="Home"
        right={
          <View style={{ flexDirection: 'row', gap: 4 }}>
            <Pressable
              style={{ padding: 6 }}
              onPress={() => router.push('/(admin)/notifications' as any)}
              accessibilityLabel="Notifications"
            >
              <Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />
            </Pressable>
            <Pressable
              style={{ padding: 6 }}
              onPress={() => router.push('/(admin)/settings' as any)}
              accessibilityLabel="Settings"
            >
              <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>
        }
      />

      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ paddingBottom: 128 }}
        contentInsetAdjustmentBehavior="automatic"
        {...tabBarScroll}
      >
        {/* Alert strip */}
        {(overdueBills.length > 0 || kpis.vacancies > 0) && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ maxHeight: 44 }}
            contentContainerStyle={{ paddingHorizontal: spacing[4], gap: 8, paddingBottom: 8 }}
          >
            {overdueBills.length > 0 && (
              <Pressable
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: radius.pill,
                  borderCurve: 'continuous',
                  backgroundColor: `${colors.danger}26`,
                }}
                onPress={() => router.push('/(admin)/payments' as any)}
              >
                <Ionicons name="alert-circle" size={14} color={colors.danger} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.danger }}>
                  {overdueBills.length} overdue
                </Text>
              </Pressable>
            )}
            {kpis.vacancies > 0 && (
              <Pressable
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: radius.pill,
                  borderCurve: 'continuous',
                  backgroundColor: `${colors.warning}26`,
                }}
                onPress={() => router.push('/(admin)/properties' as any)}
              >
                <Ionicons name="home-outline" size={14} color={colors.warning} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.warning }}>
                  {kpis.vacancies} vacant
                </Text>
              </Pressable>
            )}
          </ScrollView>
        )}

        {/* KPI 2×2 grid */}
        <View style={{ paddingHorizontal: spacing[4], marginTop: 16, gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <KPICard
                label="Occupied"
                value={String(kpis.occupied)}
                accentColor={colors.success}
              />
            </View>
            <View style={{ flex: 1 }}>
              <KPICard
                label="Monthly Revenue"
                value={formatPHP(kpis.income)}
                accentColor={colors.primary}
              />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <KPICard
                label="Overdue"
                value={formatPHP(kpis.outstanding)}
                accentColor={colors.danger}
              />
            </View>
            <View style={{ flex: 1 }}>
              <KPICard
                label="Vacancies"
                value={String(kpis.vacancies)}
                accentColor={colors.warning}
              />
            </View>
          </View>
        </View>

        {/* Quick actions */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: spacing[4],
            marginTop: 20,
            justifyContent: 'space-between',
          }}
        >
          <QuickAction
            label="Record Payment"
            icon="cash-outline"
            color={colors.success}
            onPress={openSearch}
          />
          <QuickAction
            label="Add Tenant"
            icon="person-add-outline"
            color={colors.primary}
            onPress={() => router.push('/(admin)/tenants/new' as any)}
          />
          <QuickAction
            label="Log Issue"
            icon="construct-outline"
            color={colors.warning}
            onPress={() => router.push('/(admin)/maintenance/new' as any)}
          />
          <QuickAction
            label="Reports"
            icon="bar-chart-outline"
            color="#8b5cf6"
            onPress={() => router.push('/(admin)/reports' as any)}
          />
        </View>

        {/* Reports */}
        <View style={{ marginTop: 20 }}>
          <SectionHeader title="Reports" onViewAll={() => router.push('/(admin)/reports' as any)} />
          <View style={{ paddingHorizontal: spacing[4] }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {REPORT_CARDS.map((card) => (
                <View key={card.route} style={{ width: '47%' }}>
                  <ReportMenuCard
                    icon={card.icon}
                    iconBg={card.iconBg}
                    label={card.label}
                    onPress={() => router.push(card.route as any)}
                  />
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Collection section */}
        <View style={{ marginTop: 20 }}>
          <SectionHeader title="Collection" />
          <View
            style={{
              marginHorizontal: spacing[4],
              backgroundColor: colors.surface,
              borderRadius: radius.md,
              borderCurve: 'continuous',
              padding: spacing[4],
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <CollectionProgressBar
              paid={collectionCounts.paid}
              partial={collectionCounts.partial}
              unpaid={collectionCounts.unpaid}
              total={collectionCounts.total}
              showCounts
            />
          </View>
        </View>

        {/* Tenants requiring attention */}
        {attentionList.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <SectionHeader
              title="Requires Attention"
              count={attentionList.length}
              onViewAll={() => router.push('/(admin)/payments' as any)}
            />
            <View
              style={{
                marginHorizontal: spacing[4],
                backgroundColor: colors.surface,
                borderRadius: radius.md,
                borderCurve: 'continuous',
                borderWidth: 1,
                borderColor: colors.border,
                overflow: 'hidden',
              }}
            >
              {attentionList.map((b) => {
                const st = billStatusStyle(b.status)
                return (
                  <SwipeablePaymentRow
                    key={b.id}
                    tenantName={b.tenant.full_name}
                    unitNumber={null}
                    amount={b.amount}
                    statusLabel={st.label}
                    statusColor={st.color}
                    statusBg={st.bg}
                    onRecordPayment={() =>
                      router.push({ pathname: '/(admin)/billing/new', params: { tenantId: b.tenant_id } } as any)
                    }
                    onPress={() => router.push(`/(admin)/billing/${b.id}` as any)}
                  />
                )
              })}
            </View>
          </View>
        )}

        {/* Vacant units */}
        {(vacantUnits?.length ?? 0) > 0 && (
          <View style={{ marginTop: 20 }}>
            <SectionHeader
              title="Vacant Units"
              onViewAll={() => router.push('/(admin)/properties' as any)}
            />
            <View
              style={{
                marginHorizontal: spacing[4],
                backgroundColor: colors.surface,
                borderRadius: radius.md,
                borderCurve: 'continuous',
                borderWidth: 1,
                borderColor: colors.border,
                overflow: 'hidden',
              }}
            >
              {(vacantUnits ?? []).slice(0, 3).map((u) => (
                <View
                  key={u.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingHorizontal: spacing[4],
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: radius.sm,
                      borderCurve: 'continuous',
                      backgroundColor: `${colors.warning}26`,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="home-outline" size={16} color={colors.warning} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
                      Unit {u.unit_number}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>
                      {(u as any).property_name}
                    </Text>
                  </View>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: radius.sm,
                      borderCurve: 'continuous',
                      backgroundColor: colors.muted,
                    }}
                  >
                    <Text
                      style={{ fontSize: 10, fontWeight: '700', color: colors.textSecondary, letterSpacing: 0.5 }}
                    >
                      VACANT
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recent activity */}
        {(bills?.length ?? 0) > 0 && (
          <View style={{ marginTop: 20 }}>
            <SectionHeader title="Recent Activity" />
            <View
              style={{
                marginHorizontal: spacing[4],
                backgroundColor: colors.surface,
                borderRadius: radius.md,
                borderCurve: 'continuous',
                borderWidth: 1,
                borderColor: colors.border,
                overflow: 'hidden',
              }}
            >
              {(bills ?? [])
                .slice()
                .sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
                .slice(0, 5)
                .map((b) => (
                  <Pressable
                    key={b.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      paddingHorizontal: spacing[4],
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    }}
                    onPress={() => router.push(`/(admin)/billing/${b.id}` as any)}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: radius.pill,
                        backgroundColor: colors.primary,
                      }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textPrimary }}>
                        {b.tenant.full_name}
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>
                        {b.billing_type} · {formatPHP(b.amount)}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>
                      {b.due_date}
                    </Text>
                  </Pressable>
                ))}
            </View>
          </View>
        )}
      </ScrollView>
    </>
  )
}
