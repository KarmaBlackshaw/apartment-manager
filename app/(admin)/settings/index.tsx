import React from 'react'
import { View, ScrollView, Switch } from 'react-native'
import { ScreenView } from '~/components/ui/ScreenView'
import { AppText } from '~/components/ui/AppText'
import { Avatar } from '~/components/ui/Avatar'
import { SettingsCard } from '~/components/cards/SettingsCard'
import { colors } from '~/constants/theme'
import { useSettings, useUpdateSetting } from '~/hooks/useSettings'

export default function SettingsScreen() {
  const { data: settings } = useSettings()
  const { mutate: updateSetting } = useUpdateSetting()

  const ownerName     = settings?.owner_name      ?? ''
  const ownerPhone    = settings?.owner_phone     ?? ''
  const apartmentName = settings?.apartment_name  ?? ''

  const rentReminders  = (settings?.notif_rent_reminders  ?? '1') === '1'
  const contractExpiry = (settings?.notif_contract_expiry ?? '1') === '1'
  const vacancyAlerts  = (settings?.notif_vacancy_alerts  ?? '1') === '1'

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
          <SettingsCard label="Apartment Name" value={apartmentName || 'Not set'} chevron onPress={() => {}} />
          {/* FIXME(v2): route to address edit screen */}
          <SettingsCard label="Address" value="Not set" chevron onPress={() => {}} />
        </View>

        {/* Billing defaults */}
        <SettingsSectionLabel>Billing defaults</SettingsSectionLabel>
        <View className="gap-1.5">
          {/* FIXME(v2): route to billing day picker */}
          <SettingsCard label="Billing day" value="1st of month" chevron onPress={() => {}} />
          {/* FIXME(v2): route to late fee screen */}
          <SettingsCard label="Late fee" value="₱200 · 5 days" chevron onPress={() => {}} />
        </View>

        {/* Notifications */}
        <SettingsSectionLabel>Notifications</SettingsSectionLabel>
        <View className="gap-1.5">
          <SettingsCard
            label="Rent reminders"
            right={
              <Switch
                value={rentReminders}
                onValueChange={(v) => updateSetting({ key: 'notif_rent_reminders', value: v ? '1' : '0' })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="white"
                ios_backgroundColor={colors.border}
              />
            }
          />
          <SettingsCard
            label="Contract expiry"
            right={
              <Switch
                value={contractExpiry}
                onValueChange={(v) => updateSetting({ key: 'notif_contract_expiry', value: v ? '1' : '0' })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="white"
                ios_backgroundColor={colors.border}
              />
            }
          />
          <SettingsCard
            label="Vacancy alerts"
            right={
              <Switch
                value={vacancyAlerts}
                onValueChange={(v) => updateSetting({ key: 'notif_vacancy_alerts', value: v ? '1' : '0' })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="white"
                ios_backgroundColor={colors.border}
              />
            }
          />
          {/* FIXME(v2): route to quiet hours screen */}
          <SettingsCard label="Quiet hours" value="10pm–7am" chevron onPress={() => {}} />
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
