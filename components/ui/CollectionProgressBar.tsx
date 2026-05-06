import React from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { colors, radius } from '../../constants/theme'

interface CollectionProgressBarProps {
  paid: number
  partial: number
  unpaid: number
  total: number
  showCounts?: boolean
}

export function CollectionProgressBar({
  paid,
  partial,
  unpaid,
  total,
  showCounts = true,
}: CollectionProgressBarProps) {
  const isEmpty = total === 0

  return (
    <View>
      <View style={styles.track}>
        {isEmpty ? (
          <View style={[styles.segment, { flex: 1, backgroundColor: colors.muted }]} />
        ) : (
          <>
            {paid > 0 && (
              <View
                style={[
                  styles.segment,
                  { flex: paid / total, backgroundColor: colors.success },
                ]}
              />
            )}
            {partial > 0 && (
              <View
                style={[
                  styles.segment,
                  { flex: partial / total, backgroundColor: colors.warning },
                ]}
              />
            )}
            {unpaid > 0 && (
              <View
                style={[
                  styles.segment,
                  { flex: unpaid / total, backgroundColor: colors.danger },
                ]}
              />
            )}
          </>
        )}
      </View>

      {showCounts && !isEmpty && (
        <View style={styles.counts}>
          <View style={styles.countItem}>
            <View style={[styles.dot, { backgroundColor: colors.success }]} />
            <Text style={styles.countText}>Paid: {paid}</Text>
          </View>
          <View style={styles.countItem}>
            <View style={[styles.dot, { backgroundColor: colors.warning }]} />
            <Text style={styles.countText}>Partial: {partial}</Text>
          </View>
          <View style={styles.countItem}>
            <View style={[styles.dot, { backgroundColor: colors.danger }]} />
            <Text style={styles.countText}>Unpaid: {unpaid}</Text>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: radius.pill,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  segment: {
    height: 6,
  },
  counts: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  countItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  countText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
})
