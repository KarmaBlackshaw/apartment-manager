import React from 'react'
import { View, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { ScreenView } from '~/components/ui/ScreenView'
import { AppText } from '~/components/ui/AppText'
import { Avatar } from '~/components/ui/Avatar'
import { SettingsCard } from '~/components/cards/SettingsCard'
import { useSettings } from '~/hooks/useSettings'
import { formatPHP } from '~/lib/format'

export default function SettingsScreen() {
  const router = useRouter()
  const { data: settings } = useSettings()

  const ownerName     = settings?.owner_name      ?? ''
  const ownerPhone    = settings?.owner_phone     ?? ''
  const apartmentName = settings?.apartment_name  ?? ''
  const address       = settings?.address         ?? ''
  const billingDay    = settings?.billing_day
  const lateFeeAmount = settings?.late_fee_amount
  const lateFeeGrace  = settings?.late_fee_grace_days

  return (
    <ScreenView>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="px-4 pt-5 pb-[88px] gap-3"
        showsVerticalScrollIndicator={false}
      >
        {/* Screen title */}
        <AppText variant="heading" className="mb-1">Settings</AppText>

        {/* Profile header — NOT in a card per design */}
        <View className="flex-row items-center gap-4 py-2">
          <Avatar name={ownerName || 'Owner'} size="lg" />
          <View className="flex-1">
            <AppText className="text-[14px] font-bold text-text-primary" numberOfLines={1}>
              {ownerName || 'Set owner name'}
            </AppText>
            <AppText className="text-[11px] text-text-secondary mt-[2px]">
              {ownerPhone ? `${ownerPhone} · Owner` : 'Owner'}
            </AppText>
          </View>
        </View>

        {/* Apartment */}
        <SettingsSectionLabel>Apartment</SettingsSectionLabel>
        <View className="gap-1.5">
          <SettingsCard
            label="Apartment Name"
            value={apartmentName || 'Not set'}
            chevron
            onPress={() => router.push('/(admin)/settings/apartment-name')}
          />
          <SettingsCard
            label="Address"
            value={address || 'Not set'}
            chevron
            onPress={() => router.push('/(admin)/settings/address')}
          />
        </View>

        {/* Billing defaults */}
        <SettingsSectionLabel>Billing defaults</SettingsSectionLabel>
        <View className="gap-1.5">
          <SettingsCard
            label="Billing day"
            value={formatBillingDay(billingDay)}
            chevron
            onPress={() => router.push('/(admin)/settings/billing-day')}
          />
          <SettingsCard
            label="Late fee"
            value={formatLateFee(lateFeeAmount, lateFeeGrace)}
            chevron
            onPress={() => router.push('/(admin)/settings/late-fee')}
          />
        </View>

        {/* Security */}
        <SettingsSectionLabel>Security</SettingsSectionLabel>
        <View className="gap-1.5">
          {/* FIXME(v2): route to app lock screen */}
          <SettingsCard label="App lock" value="Biometric" chevron onPress={() => {}} />
        </View>

        {/* Data */}
        <SettingsSectionLabel>Data</SettingsSectionLabel>
        <View className="gap-1.5">
          <SettingsCard label="Last backup" value="Today 8:00am" valueColor="success" />
          {/* FIXME(v2): route to backup screen */}
          <SettingsCard label="Back up now" chevron onPress={() => {}} />
          {/* FIXME(v2): route to restore screen */}
          <SettingsCard label="Restore from backup" chevron onPress={() => {}} />
        </View>

        {/* About */}
        <SettingsSectionLabel>About</SettingsSectionLabel>
        <View className="gap-1.5">
          <SettingsCard label="Version" value="1.0.0 (42)" valueMono />
        </View>
      </ScrollView>
    </ScreenView>
  )
}

function SettingsSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <AppText className="text-[11px] font-semibold text-text-secondary px-1 pt-2">
      {children}
    </AppText>
  )
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function formatBillingDay(day: number | null | undefined): string {
  if (day == null) return 'Not set'
  return `${ordinal(day)} of month`
}

function formatLateFee(
  amount: number | null | undefined,
  graceDays: number | null | undefined,
): string {
  if (amount == null || amount === 0) return 'Not set'
  const grace = graceDays != null && graceDays > 0 ? ` · ${graceDays} days` : ''
  return `${formatPHP(amount)}${grace}`
}
