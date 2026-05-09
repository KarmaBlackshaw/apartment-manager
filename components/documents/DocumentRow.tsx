import React from 'react'
import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '~/constants/theme'
import { Card } from '~/components/ui/Card'
import { AppText } from '~/components/ui/AppText'

export type DocCategory = 'contract' | 'photo' | 'permit' | 'gov-id' | 'other'

interface DocumentRowProps {
  title: string
  category: DocCategory
  date: string
  onPress: () => void
}

type CategoryConfig = {
  icon: React.ComponentProps<typeof Ionicons>['name']
  bg: string
}

const CATEGORY_MAP: Record<DocCategory, CategoryConfig> = {
  contract: { icon: 'document-outline', bg: colors.infoBg    },
  photo:    { icon: 'image-outline',    bg: colors.successBg  },
  permit:   { icon: 'ribbon-outline',   bg: colors.warningBg  },
  'gov-id': { icon: 'card-outline',     bg: colors.dangerBg   },
  other:    { icon: 'folder-outline',   bg: colors.neutralBg  },
}

export function DocumentRow({ title, category, date, onPress }: DocumentRowProps) {
  const { icon, bg } = CATEGORY_MAP[category]

  return (
    <Card onPress={onPress} accessibilityLabel={title}>
      <View className="flex-row items-center">
        <View
          className="w-[40px] h-[40px] rounded-[8px] items-center justify-center mr-3"
          style={{ backgroundColor: bg }}
        >
          <Ionicons name={icon} size={20} color={colors.textPrimary} />
        </View>

        <View className="flex-1 mr-2">
          <AppText className="text-[15px] font-semibold text-text-primary" numberOfLines={1}>
            {title}
          </AppText>
          <AppText className="text-[13px] text-text-secondary mt-[2px]" numberOfLines={1}>
            {category} · {date}
          </AppText>
        </View>

        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>
    </Card>
  )
}
