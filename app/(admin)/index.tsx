import React, { useMemo } from 'react'
import { View, ScrollView, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import dayjs from 'dayjs'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTabBarScrollHandler } from '~/hooks/useTabBarScrollHandler'
import { useBills } from '~/hooks/useBills'
import { useUnitStatusCounts, useVacantUnits } from '~/hooks/useUnits'
import {
  useMonthlyCollection,
  useOutstandingBalances,
  useMaintenanceCosts,
  usePerUnitIncome,
  useAnnualSummary,
} from '~/hooks/useReports'
import { SectionHeader } from '~/components/ui/SectionHeader'
import { QuickActionBar } from '~/components/home/QuickActionBar'
import { AttentionRow } from '~/components/home/AttentionRow'
import { VacantRow } from '~/components/home/VacantRow'
import { UnitCell } from '~/components/home/UnitCell'
import { ReportCard } from '~/components/home/ReportCard'
import { CollectionProgressBar } from '~/components/billing/CollectionProgressBar'
import { ScreenLayout } from '~/layouts/ScreenLayout'
import { formatPHP } from '~/lib/format'
import { colors } from '~/constants/theme'

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
        iconBg: colors.successSubtle,
        iconColor: colors.success,
        route: '/(admin)/reports/monthly-collection',
      },
      {
        label: 'Occupancy',
        value: `${occPct}%`,
        sub: `${occ} / ${tot} units`,
        iconName: 'home-outline' as const,
        iconBg: colors.infoSubtle,
        iconColor: colors.info,
        route: '/(admin)/reports/occupancy',
      },
      {
        label: 'Outstanding',
        value: formatPHP(ob?.totalOutstanding ?? 0),
        sub: `${ob?.tenantCount ?? 0} tenants`,
        iconName: 'alert-circle-outline' as const,
        iconBg: colors.dangerSubtle,
        iconColor: colors.danger,
        route: '/(admin)/reports/outstanding-balances',
      },
      {
        label: 'Maintenance',
        value: formatPHP(maint?.thisMonthCost ?? 0),
        sub: 'this month',
        iconName: 'construct-outline' as const,
        iconBg: colors.warningSubtle,
        iconColor: colors.warning,
        route: '/(admin)/reports/maintenance-costs',
      },
      {
        label: 'Per-Unit Income',
        value: formatPHP(bestUnitIncome),
        sub: 'best unit',
        iconName: 'stats-chart-outline' as const,
        iconBg: colors.purpleSubtle,
        iconColor: colors.purple,
        route: '/(admin)/reports/per-unit-income',
      },
      {
        label: 'Annual Summary',
        value: formatPHP(ann?.ytdIncome ?? 0),
        sub: 'YTD income',
        iconName: 'calendar-outline' as const,
        iconBg: colors.tealSubtle,
        iconColor: colors.teal,
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
    <ScreenLayout
      headerLeft={null}
      headerRight={
        <View className="flex-row gap-1">
          <Pressable
            className="p-1.5"
            onPress={() => router.push('/(admin)/notifications' as any)}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />
          </Pressable>
          <Pressable
            className="p-1.5"
            onPress={() => router.push('/(admin)/settings' as any)}
          >
            <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>
      }
    >

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
      </ScrollView>
    </ScreenLayout>
  )
}
