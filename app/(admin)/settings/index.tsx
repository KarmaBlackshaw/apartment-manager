import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AvatarInitials, SectionHeader, SettingsRow } from '../../../components/ui'
import { useSettings, useUpdateSetting } from '../../../hooks/useSettings'
import { colors, radius, spacing } from '../../../constants/theme'

const cardStyle = {
  backgroundColor: colors.surface,
  borderRadius: radius.lg,
  borderCurve: 'continuous' as const,
  overflow: 'hidden' as const,
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets()
  const { data: settings } = useSettings()
  const { mutate: updateSetting } = useUpdateSetting()

  const ownerName     = settings?.owner_name      ?? ''
  const ownerPhone    = settings?.owner_phone     ?? ''
  const apartmentName = settings?.apartment_name  ?? ''

  const rentReminders  = (settings?.notif_rent_reminders  ?? '1') === '1'
  const contractExpiry = (settings?.notif_contract_expiry ?? '1') === '1'
  const vacancyAlerts  = (settings?.notif_vacancy_alerts  ?? '1') === '1'

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingTop: insets.top + spacing[5],
        paddingHorizontal: spacing[4],
        paddingBottom: spacing[12],
      }}
    >
      {/* Screen title */}
      <Text
        style={{
          fontSize: 28,
          fontWeight: '700',
          color: colors.textPrimary,
          marginBottom: spacing[5],
        }}
      >
        Settings
      </Text>

      {/* Profile card */}
      <View
        style={{
          ...cardStyle,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing[4],
          padding: spacing[5],
          marginBottom: spacing[3],
        }}
      >
        <AvatarInitials name={ownerName || 'Owner'} size="lg" />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.textPrimary,
              marginBottom: 2,
            }}
            numberOfLines={1}
          >
            {ownerName || 'Set owner name'}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>
            {ownerPhone ? `${ownerPhone} · Owner` : 'Owner'}
          </Text>
        </View>
      </View>

      {/* Section: Apartment */}
      <SectionHeader title="Apartment" />
      <View style={{ ...cardStyle, marginBottom: spacing[3] }}>
        <SettingsRow
          label="Apartment Name"
          type="navigate"
          value={apartmentName || undefined}
          onPress={() => {}}
        />
        <SettingsRow
          label="Address"
          type="navigate"
          value="Not set"
          onPress={() => {}}
        />
      </View>

      {/* Section: Billing Defaults */}
      <SectionHeader title="Billing Defaults" />
      <View style={{ ...cardStyle, marginBottom: spacing[3] }}>
        <SettingsRow
          label="Billing Day"
          type="navigate"
          value="1st of month"
          onPress={() => {}}
        />
        <SettingsRow
          label="Late Fee"
          type="navigate"
          value="10%"
          onPress={() => {}}
        />
      </View>

      {/* Section: Notifications */}
      <SectionHeader title="Notifications" />
      <View style={{ ...cardStyle, marginBottom: spacing[3] }}>
        <SettingsRow
          label="Rent Reminders"
          type="toggle"
          isEnabled={rentReminders}
          onToggle={(val: boolean) =>
            updateSetting({ key: 'notif_rent_reminders', value: val ? '1' : '0' })
          }
        />
        <SettingsRow
          label="Contract Expiry Alerts"
          type="toggle"
          isEnabled={contractExpiry}
          onToggle={(val: boolean) =>
            updateSetting({ key: 'notif_contract_expiry', value: val ? '1' : '0' })
          }
        />
        <SettingsRow
          label="Vacancy Alerts"
          type="toggle"
          isEnabled={vacancyAlerts}
          onToggle={(val: boolean) =>
            updateSetting({ key: 'notif_vacancy_alerts', value: val ? '1' : '0' })
          }
        />
        <SettingsRow
          label="Quiet Hours"
          type="navigate"
          value="10pm – 7am"
          onPress={() => {}}
        />
      </View>

      {/* Section: Security */}
      <SectionHeader title="Security" />
      <View style={{ ...cardStyle, marginBottom: spacing[3] }}>
        <SettingsRow
          label="App Lock"
          type="toggle"
          isEnabled={false}
        />
      </View>

      {/* Section: Data */}
      <SectionHeader title="Data" />
      <View style={{ ...cardStyle, marginBottom: spacing[3] }}>
        <SettingsRow
          label="Last Backup"
          type="info"
          value="Never"
          valueColor={colors.textMuted}
        />
        <SettingsRow
          label="Back Up Now"
          type="navigate"
          onPress={() => {}}
        />
      </View>

      {/* Section: About */}
      <SectionHeader title="About" />
      <View style={{ ...cardStyle, marginBottom: spacing[3] }}>
        <SettingsRow
          label="Version"
          type="info"
          value="1.0.0"
        />
      </View>
    </ScrollView>
  )
}
