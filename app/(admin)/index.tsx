import React, { useMemo } from 'react'
import { View, ScrollView, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import dayjs from 'dayjs'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTabBarScrollHandler } from '../../hooks/useTabBarScrollHandler'
import { useBills } from '../../hooks/useBills'
import { useUnitStatusCounts, useVacantUnits } from '../../hooks/useUnits'
import {
  useMonthlyCollection,
  useOutstandingBalances,
  useMaintenanceCosts,
  usePerUnitIncome,
  useAnnualSummary,
} from '../../hooks/useReports'
import {
  AppHeader,
  ScreenView,
  KPICard,
  SectionHeader,
  QuickActionBar,
  AttentionRow,
  VacantRow,
  UnitCell,
  ReportCard,
  CollectionProgressBar,
} from '../../components/ui'
import { formatPHP } from '../../lib/format'

export default function HomeScreen() {
  const router = useRouter()
  const tabBarScroll = useTabBarScrollHandler()

  const today = dayjs()
  const monthPrefix = today.format('YYYY-MM')
  const currentYear = today.year()

  const { data: bills } = useBills()
  const { data: unitCounts } = useUnitStatusCounts()
  const { data: vacantUnits } = useVacantUnits()

  const monthlyCollection = useMonthlyCollection(monthPrefix)
  const outstandingBalances = useOutstandingBalances()
  const maintenanceCosts = useMaintenanceCosts(monthPrefix)
  const perUnitIncome = usePerUnitIncome(monthPrefix)
  const annualSummary = useAnnualSummary(currentYear)

  const monthlyStats = monthlyCollection.data?.stats
  const collectionPct =
    monthlyStats && monthlyStats.totalBilled > 0
      ? Math.round((monthlyStats.totalCollected / monthlyStats.totalBilled) * 100)
      : 0

  const occupied = unitCounts?.occupied ?? 0
  const available = unitCounts?.available ?? 0
  const maintenance = unitCounts?.maintenance ?? 0
  const total = occupied + available + maintenance
  const occupancyPct = total > 0 ? Math.round((occupied / total) * 100) : 0

  const outstanding = outstandingBalances.data
  const lostPerMonth = (vacantUnits ?? []).reduce(
    (s, u) => s + (u.monthly_rate ?? 0),
    0
  )

  const attentionList = useMemo(
    () =>
      (bills ?? [])
        .filter((b) => b.status === 'overdue' || b.status === 'pending')
        .sort((a, b) => a.due_date.localeCompare(b.due_date))
        .slice(0, 2),
    [bills]
  )

  const vacantList = (vacantUnits ?? []).slice(0, 2)

  const unitCells = useMemo(() => {
    const vacant = (vacantUnits ?? []).slice(0, 4).map((u) => ({
      unitNumber: u.unit_number,
      tenantName: null as string | null,
      status: 'vacant' as const,
    }))
    const overdue = (bills ?? [])
      .filter((b) => b.status === 'overdue')
      .slice(0, Math.max(0, 4 - vacant.length))
      .map((b) => ({
        unitNumber: '—',
        tenantName: b.tenant.full_name,
        status: 'occupied-overdue' as const,
      }))
    return [...vacant, ...overdue].slice(0, 4)
  }, [vacantUnits, bills])

  const reportCards = useMemo(() => {
    const mc = monthlyCollection.data?.stats
    const mcPct =
      mc && mc.totalBilled > 0
        ? Math.round((mc.totalCollected / mc.totalBilled) * 100)
        : 0
    const ob = outstandingBalances.data
    const maint = maintenanceCosts.data
    const pui = perUnitIncome.data
    const bestUnitIncome = pui
      ? Math.max(0, ...pui.entries.map((e) => e.collected))
      : 0
    const ann = annualSummary.data
    const occ = unitCounts?.occupied ?? 0
    const avail = unitCounts?.available ?? 0
    const maintCt = unitCounts?.maintenance ?? 0
    const tot = occ + avail + maintCt
    const occPct = tot > 0 ? Math.round((occ / tot) * 100) : 0

    return [
      {
        label: 'Monthly Collection',
        value: formatPHP(mc?.totalCollected ?? 0),
        sub: `${mcPct}% collected`,
        iconName: 'wallet-outline' as const,
        iconBg: 'rgba(34,201,138,0.12)',
        iconColor: '#22C98A',
        route: '/(admin)/reports/monthly-collection',
      },
      {
        label: 'Occupancy',
        value: `${occPct}%`,
        sub: `${occ} / ${tot} units`,
        iconName: 'home-outline' as const,
        iconBg: 'rgba(75,123,255,0.12)',
        iconColor: '#4B7BFF',
        route: '/(admin)/reports/occupancy',
      },
      {
        label: 'Outstanding',
        value: formatPHP(ob?.totalOutstanding ?? 0),
        sub: `${ob?.tenantCount ?? 0} tenants`,
        iconName: 'alert-circle-outline' as const,
        iconBg: 'rgba(255,92,106,0.12)',
        iconColor: '#FF5C6A',
        route: '/(admin)/reports/outstanding-balances',
      },
      {
        label: 'Maintenance',
        value: formatPHP(maint?.thisMonthCost ?? 0),
        sub: 'this month',
        iconName: 'construct-outline' as const,
        iconBg: 'rgba(255,176,32,0.12)',
        iconColor: '#FFB020',
        route: '/(admin)/reports/maintenance-costs',
      },
      {
        label: 'Per-Unit Income',
        value: formatPHP(bestUnitIncome),
        sub: 'best unit',
        iconName: 'stats-chart-outline' as const,
        iconBg: 'rgba(155,111,255,0.12)',
        iconColor: '#9B6FFF',
        route: '/(admin)/reports/per-unit-income',
      },
      {
        label: 'Annual Summary',
        value: formatPHP(ann?.ytdIncome ?? 0),
        sub: 'YTD income',
        iconName: 'calendar-outline' as const,
        iconBg: 'rgba(24,201,201,0.12)',
        iconColor: '#18C9C9',
        route: '/(admin)/reports/annual-summary',
      },
    ]
  }, [
    monthlyCollection.data,
    outstandingBalances.data,
    maintenanceCosts.data,
    perUnitIncome.data,
    annualSummary.data,
    unitCounts,
  ])

  return (
    <ScreenView edges={['bottom']}>
      <AppHeader
        title="Home"
        right={
          <View className="flex-row gap-1">
            <Pressable
              className="p-1.5"
              onPress={() => router.push('/(admin)/notifications' as any)}
            >
              <Ionicons name="notifications-outline" size={22} color="#94A3B8" />
            </Pressable>
            <Pressable
              className="p-1.5"
              onPress={() => router.push('/(admin)/settings' as any)}
            >
              <Ionicons name="settings-outline" size={22} color="#94A3B8" />
            </Pressable>
          </View>
        }
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: 14,
          paddingHorizontal: 16,
          paddingBottom: 88,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
        {...tabBarScroll}
      >
        <View className="gap-2">
          <View className="flex-row gap-2">
            <View className="flex-1">
              <KPICard
                label="Monthly income"
                value={formatPHP(monthlyStats?.totalCollected ?? 0)}
                subtitle={`of ${formatPHP(monthlyStats?.totalBilled ?? 0)} · ${collectionPct}%`}
                accentColor="#22C98A"
              />
            </View>
            <View className="flex-1">
              <KPICard
                label="Occupancy"
                value={`${occupancyPct}%`}
                subtitle={`${occupied} / ${total} units`}
                accentColor="#4B7BFF"
              />
            </View>
          </View>
          <View className="flex-row gap-2">
            <View className="flex-1">
              <KPICard
                label="Outstanding"
                value={formatPHP(outstanding?.totalOutstanding ?? 0)}
                subtitle={`${outstanding?.tenantCount ?? 0} tenants`}
                accentColor="#FF5C6A"
              />
            </View>
            <View className="flex-1">
              <KPICard
                label="Vacancies"
                value={`${available} units`}
                subtitle={`~${formatPHP(lostPerMonth)}/mo lost`}
                accentColor="#FFB020"
              />
            </View>
          </View>
        </View>

        <QuickActionBar />

        <View
          className="bg-surface rounded-[16px] overflow-hidden px-4 py-[14px]"
        >
          <CollectionProgressBar
            monthLabel={`${dayjs(monthPrefix).format('MMMM YYYY')} collection`}
            collectedAmount={monthlyStats?.totalCollected ?? 0}
            billedAmount={monthlyStats?.totalBilled ?? 0}
            pct={collectionPct}
            paid={monthlyStats?.paidCount ?? 0}
            partial={monthlyStats?.partialCount ?? 0}
            unpaid={monthlyStats?.unpaidCount ?? 0}
            total={
              (monthlyStats?.paidCount ?? 0) +
              (monthlyStats?.partialCount ?? 0) +
              (monthlyStats?.unpaidCount ?? 0)
            }
            showCounts
          />
        </View>

        {attentionList.length > 0 && (
          <>
            <SectionHeader
              title={`Attention (${attentionList.length})`}
              onViewAll={() => router.push('/(admin)/payments' as any)}
            />
            <View className="gap-2">
              {attentionList.map((b) => (
                <AttentionRow
                  key={b.id}
                  tenantName={b.tenant.full_name}
                  status={b.status === 'overdue' ? 'overdue' : 'pending'}
                  amount={b.amount}
                  onPress={() => router.push(`/(admin)/billing/${b.id}` as any)}
                />
              ))}
            </View>
          </>
        )}

        {(vacantUnits ?? []).length > 0 && (
          <>
            <SectionHeader
              title={`Vacant (${(vacantUnits ?? []).length})`}
              onViewAll={() => router.push('/(admin)/properties' as any)}
            />
            <View className="gap-2">
              {vacantList.map((u) => (
                <VacantRow
                  key={u.id}
                  unitName={u.unit_number}
                  propertyName={u.property_name}
                  daysVacant={dayjs().diff(dayjs(u.created_at), 'day')}
                  monthlyRate={u.monthly_rate}
                  onPress={() => router.push('/(admin)/properties' as any)}
                />
              ))}
            </View>
          </>
        )}

        {unitCells.length > 0 && (
          <>
            <SectionHeader
              title="Units"
              onViewAll={() => router.push('/(admin)/properties' as any)}
            />
            <View className="flex-row flex-wrap gap-2">
              {unitCells.map((c, i) => (
                <View key={`${c.status}-${c.unitNumber}-${i}`} className="w-[48.5%]">
                  <UnitCell
                    unitNumber={c.unitNumber}
                    tenantName={c.tenantName}
                    status={c.status}
                    onPress={() => router.push('/(admin)/properties' as any)}
                  />
                </View>
              ))}
            </View>
          </>
        )}

        <SectionHeader
          title="Reports"
          onViewAll={() => router.push('/(admin)/reports' as any)}
          actionLabel="See all"
        />
        <View className="flex-row flex-wrap gap-2">
          {reportCards.map((card) => (
            <View key={card.route} className="w-[48.5%]">
              <ReportCard
                label={card.label}
                value={card.value}
                sub={card.sub}
                iconName={card.iconName}
                iconBg={card.iconBg}
                iconColor={card.iconColor}
                onPress={() => router.push(card.route as any)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenView>
  )
}
