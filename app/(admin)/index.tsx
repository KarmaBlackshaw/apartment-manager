import React, { useMemo } from 'react'
import { ScrollView, View, Text, Pressable, StyleSheet, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTabBarScrollHandler } from '../../hooks/useTabBarScrollHandler'
import { useBills } from '../../hooks/useBills'
import { useUnitCounts, useVacantUnits } from '../../hooks/useUnits'
import { useSettings } from '../../hooks/useSettings'
import { useTenantSearch } from '../../context/TenantSearchContext'
import { SwipeablePaymentRow } from '../../components/admin/SwipeablePaymentRow'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

function formatPHP(n: number) {
  return `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ label, value, accent, icon }: {
  label: string; value: string; accent: string; icon: IoniconName
}) {
  return (
    <View style={[styles.kpiCard, { flex: 1 }]}>
      <View style={[styles.kpiIcon, { backgroundColor: `${accent}22` }]}>
        <Ionicons name={icon} size={18} color={accent} />
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  )
}

// ─── Quick action button ──────────────────────────────────────────────────────
function QuickAction({ label, icon, color, onPress }: {
  label: string; icon: IoniconName; color: string; onPress: () => void
}) {
  return (
    <Pressable style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </Pressable>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <Pressable onPress={onSeeAll}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      )}
    </View>
  )
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
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
    }
  }, [bills, unitCounts, monthPrefix])

  // ─── Alert strip data
  const overdueBills = useMemo(
    () => bills?.filter((b) => b.status === 'overdue') ?? [],
    [bills]
  )

  // ─── Collection progress
  const progress = useMemo(() => {
    const monthBills = bills?.filter((b) => b.due_date.startsWith(monthPrefix)) ?? []
    const total = monthBills.reduce((s, b) => s + b.amount, 0)
    const collected = monthBills.filter((b) => b.status === 'paid').reduce((s, b) => s + b.amount, 0)
    return { total, collected, pct: total > 0 ? (collected / total) * 100 : 0 }
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
    if (s === 'overdue') return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: 'OVERDUE' }
    return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'PENDING' }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 128 }}
      {...tabBarScroll}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{aptName}</Text>
        <View style={styles.headerIcons}>
          <Pressable style={styles.headerIcon} accessibilityLabel="Notifications">
            <Ionicons name="notifications-outline" size={22} color="#888888" />
          </Pressable>
          <Pressable
            style={styles.headerIcon}
            onPress={() => router.push('/(admin)/settings' as any)}
            accessibilityLabel="Settings"
          >
            <Ionicons name="settings-outline" size={22} color="#888888" />
          </Pressable>
        </View>
      </View>

      {/* Alert strip */}
      {(overdueBills.length > 0 || kpis.vacancies > 0) && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.alertScroll}
          contentContainerStyle={styles.alertContent}
        >
          {overdueBills.length > 0 && (
            <Pressable
              style={[styles.alertChip, { backgroundColor: 'rgba(239,68,68,0.15)' }]}
              onPress={() => router.push('/(admin)/payments' as any)}
            >
              <Ionicons name="alert-circle" size={14} color="#ef4444" />
              <Text style={[styles.alertText, { color: '#ef4444' }]}>
                {overdueBills.length} overdue
              </Text>
            </Pressable>
          )}
          {kpis.vacancies > 0 && (
            <Pressable
              style={[styles.alertChip, { backgroundColor: 'rgba(245,158,11,0.15)' }]}
              onPress={() => router.push('/(admin)/properties' as any)}
            >
              <Ionicons name="home-outline" size={14} color="#f59e0b" />
              <Text style={[styles.alertText, { color: '#f59e0b' }]}>
                {kpis.vacancies} vacant
              </Text>
            </Pressable>
          )}
        </ScrollView>
      )}

      {/* KPI 2×2 grid */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiRow}>
          <KPICard label="Monthly Income" value={formatPHP(kpis.income)}     accent="#22c55e" icon="trending-up-outline" />
          <View style={{ width: 12 }} />
          <KPICard label="Occupancy"      value={kpis.occupancy}              accent="#3b82f6" icon="home-outline" />
        </View>
        <View style={[styles.kpiRow, { marginTop: 12 }]}>
          <KPICard label="Outstanding"    value={formatPHP(kpis.outstanding)} accent="#ef4444" icon="alert-circle-outline" />
          <View style={{ width: 12 }} />
          <KPICard label="Vacancies"      value={String(kpis.vacancies)}      accent="#f59e0b" icon="business-outline" />
        </View>
      </View>

      {/* Quick actions */}
      <View style={styles.quickActions}>
        <QuickAction label="Record Payment" icon="cash-outline"       color="#22c55e" onPress={openSearch} />
        <QuickAction label="Add Tenant"     icon="person-add-outline" color="#3b82f6" onPress={() => router.push('/(admin)/tenants/new' as any)} />
        <QuickAction label="Add Unit"       icon="home-outline"       color="#8b5cf6" onPress={() => router.push('/(admin)/properties' as any)} />
        <QuickAction label="Log Issue"      icon="construct-outline"  color="#f59e0b" onPress={() => Alert.alert('Coming Soon', 'Maintenance logging is coming in a future update.')} />
      </View>

      {/* Collection progress */}
      <View style={styles.section}>
        <SectionHeader title="Collection Progress" />
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>
              {formatPHP(progress.collected)} of {formatPHP(progress.total)}
            </Text>
            <Text style={[styles.progressPct, { color: progress.pct >= 80 ? '#22c55e' : '#f59e0b' }]}>
              {progress.pct.toFixed(0)}%
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(progress.pct, 100)}%` as any,
                  backgroundColor: progress.pct >= 80 ? '#22c55e' : '#f59e0b',
                },
              ]}
            />
          </View>
          <Text style={styles.progressSub}>
            {bills?.filter((b) => b.due_date.startsWith(monthPrefix) && b.status === 'paid').length ?? 0} of{' '}
            {bills?.filter((b) => b.due_date.startsWith(monthPrefix)).length ?? 0} bills paid this month
          </Text>
        </View>
      </View>

      {/* Tenants requiring attention */}
      {attentionList.length > 0 && (
        <View style={styles.section}>
          <SectionHeader
            title="Requires Attention"
            onSeeAll={() => router.push('/(admin)/payments' as any)}
          />
          <View style={styles.card}>
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
        <View style={styles.section}>
          <SectionHeader
            title="Vacant Units"
            onSeeAll={() => router.push('/(admin)/properties' as any)}
          />
          <View style={styles.card}>
            {(vacantUnits ?? []).slice(0, 3).map((u) => (
              <View key={u.id} style={styles.vacantRow}>
                <View style={styles.vacantIcon}>
                  <Ionicons name="home-outline" size={16} color="#f59e0b" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.vacantUnit}>Unit {u.unit_number}</Text>
                  <Text style={styles.vacantProp}>{(u as any).property_name}</Text>
                </View>
                <View style={styles.vacantChip}>
                  <Text style={styles.vacantChipText}>VACANT</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Recent activity */}
      {(bills?.length ?? 0) > 0 && (
        <View style={styles.section}>
          <SectionHeader title="Recent Activity" />
          <View style={styles.card}>
            {(bills ?? [])
              .slice()
              .sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
              .slice(0, 5)
              .map((b) => (
                <Pressable
                  key={b.id}
                  style={styles.activityRow}
                  onPress={() => router.push(`/(admin)/billing/${b.id}` as any)}
                >
                  <View style={styles.activityDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.activityName}>{b.tenant.full_name}</Text>
                    <Text style={styles.activityMeta}>
                      {b.billing_type} · {formatPHP(b.amount)}
                    </Text>
                  </View>
                  <Text style={styles.activityDate}>{b.due_date}</Text>
                </Pressable>
              ))}
          </View>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0d0d0d' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, marginBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#f1f1f1', letterSpacing: -0.5 },
  headerIcons: { flexDirection: 'row', gap: 4 },
  headerIcon: { padding: 6 },
  alertScroll: { maxHeight: 44 },
  alertContent: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  alertChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  alertText: { fontSize: 12, fontWeight: '600' },
  kpiGrid: { paddingHorizontal: 16, marginTop: 8 },
  kpiRow: { flexDirection: 'row' },
  kpiCard: {
    backgroundColor: '#171717', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  kpiIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  kpiValue: { fontSize: 20, fontWeight: '700', color: '#f1f1f1', letterSpacing: -0.3 },
  kpiLabel: { fontSize: 11, color: '#888888', marginTop: 2 },
  quickActions: {
    flexDirection: 'row', paddingHorizontal: 16, marginTop: 16,
    justifyContent: 'space-between',
  },
  quickAction: { flex: 1, alignItems: 'center', gap: 6 },
  quickActionIcon: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  quickActionLabel: { fontSize: 10, fontWeight: '600', color: '#888888', textAlign: 'center' },
  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#888888', letterSpacing: 0.5 },
  seeAll: { fontSize: 12, color: '#3b82f6', fontWeight: '600' },
  card: {
    backgroundColor: '#171717', borderRadius: 12,
    borderWidth: 1, borderColor: '#2a2a2a', overflow: 'hidden',
  },
  progressCard: {
    backgroundColor: '#171717', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { fontSize: 14, fontWeight: '600', color: '#f1f1f1' },
  progressPct: { fontSize: 16, fontWeight: '800' },
  progressBarBg: { height: 8, backgroundColor: '#2a2a2a', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: 8, borderRadius: 4 },
  progressSub: { fontSize: 11, color: '#888888', marginTop: 8 },
  vacantRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#2a2a2a',
  },
  vacantIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: 'rgba(245,158,11,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  vacantUnit: { fontSize: 14, fontWeight: '600', color: '#f1f1f1' },
  vacantProp: { fontSize: 11, color: '#888888', marginTop: 1 },
  vacantChip: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    backgroundColor: 'rgba(100,100,100,0.15)',
  },
  vacantChipText: { fontSize: 10, fontWeight: '700', color: '#888888', letterSpacing: 0.5 },
  activityRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#2a2a2a',
  },
  activityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3b82f6' },
  activityName: { fontSize: 13, fontWeight: '600', color: '#f1f1f1' },
  activityMeta: { fontSize: 11, color: '#888888', marginTop: 1 },
  activityDate: { fontSize: 11, color: '#555555' },
})
