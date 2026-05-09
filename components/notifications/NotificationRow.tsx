import React from 'react'
import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '~/constants/theme'
import { Card } from '~/components/ui/Card'
import { AppText } from '~/components/ui/AppText'

type NotifType = 'overdue' | 'expiring' | 'vacant' | 'high-balance' | 'resolved'

interface NotificationRowProps {
  type: NotifType
  title: string
  subtitle: string
  timestamp: string
  onPress?: () => void
}

type IconConfig = {
  bg: string
  icon: React.ComponentProps<typeof Ionicons>['name']
  color: string
}

const TYPE_MAP: Record<NotifType, IconConfig> = {
  overdue:        { bg: colors.dangerBg,  icon: 'alert-circle-outline',    color: colors.dangerText  },
  'high-balance': { bg: colors.dangerBg,  icon: 'alert-circle-outline',    color: colors.dangerText  },
  expiring:       { bg: colors.warningBg, icon: 'time-outline',             color: colors.warningText },
  vacant:         { bg: colors.neutralBg, icon: 'home-outline',             color: colors.neutralText },
  resolved:       { bg: colors.successBg, icon: 'checkmark-circle-outline', color: colors.successText },
}

export function NotificationRow({
  type,
  title,
  subtitle,
  timestamp,
  onPress,
}: NotificationRowProps) {
  const { bg, icon, color } = TYPE_MAP[type]

  return (
    <Card onPress={onPress} accessibilityLabel={title}>
      <View className="flex-row items-start">
        <View
          className="w-[40px] h-[40px] rounded-[10px] items-center justify-center"
          style={{ backgroundColor: bg }}
        >
          <Ionicons name={icon} size={20} color={color} />
        </View>

        <View className="flex-1 ml-3 mr-2">
          <AppText className="text-[15px] font-semibold text-text-primary" numberOfLines={1}>
            {title}
          </AppText>
          <AppText className="text-[13px] text-text-secondary mt-[2px]" numberOfLines={2}>
            {subtitle}
          </AppText>
        </View>

        <AppText className="text-xs text-text-muted">{timestamp}</AppText>
      </View>
    </Card>
  )
}
