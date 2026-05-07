import React from 'react'
import { View, Text } from 'react-native'
import Svg, { Rect, G } from 'react-native-svg'
import { colors } from '~/constants/theme'

interface MonthBar {
  month: string
  pct: number
}

interface OccupancyBarChartProps {
  data: MonthBar[]
  activeMonth?: string
}

const CHART_HEIGHT = 80
const BAR_SLOT = 40
const BAR_WIDTH = 24
const INACTIVE_BAR_COLOR = '#1D4ED8'

export function OccupancyBarChart({ data, activeMonth }: OccupancyBarChartProps) {
  const totalWidth = data.length * BAR_SLOT

  return (
    <View className="items-center">
      <Svg width={totalWidth} height={CHART_HEIGHT}>
        {data.map((item, i) => {
          const barHeight = Math.max(2, Math.round((item.pct * CHART_HEIGHT) / 100))
          const isActive = item.month === activeMonth
          const x = i * BAR_SLOT + (BAR_SLOT - BAR_WIDTH) / 2
          const y = CHART_HEIGHT - barHeight
          return (
            <G key={item.month}>
              <Rect
                x={x}
                y={y}
                width={BAR_WIDTH}
                height={barHeight}
                rx={4}
                fill={isActive ? colors.primary : INACTIVE_BAR_COLOR}
              />
            </G>
          )
        })}
      </Svg>
      <View className="flex-row justify-around mt-1" style={{ width: totalWidth }}>
        {data.map((item) => (
          <Text key={item.month} className="text-[11px] text-text-secondary w-10 text-center">
            {item.month}
          </Text>
        ))}
      </View>
    </View>
  )
}
