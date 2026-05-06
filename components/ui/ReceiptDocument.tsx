import React from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { colors, radius } from '../../constants/theme'

interface ReceiptDocumentProps {
  buildingName: string
  address: string
  receiptNo: string
  tenantName: string
  unitName: string
  date: string
  forPeriod: string
  amountPaid: number
  balanceAfter: number
  receivedBy: string
}

function formatPHP(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function balanceLabel(balanceAfter: number): { text: string; color: string } {
  if (balanceAfter > 0) {
    return {
      text: `Balance: ${formatPHP(balanceAfter)}`,
      color: colors.danger,
    }
  }
  if (balanceAfter === 0) {
    return {
      text: 'Fully Paid',
      color: colors.success,
    }
  }
  return {
    text: `Credit: ${formatPHP(Math.abs(balanceAfter))}`,
    color: colors.primary,
  }
}

interface ReceiptInfoRowProps {
  label: string
  value: string
}

function ReceiptInfoRow({ label, value }: ReceiptInfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  )
}

export function ReceiptDocument({
  buildingName,
  address,
  receiptNo,
  tenantName,
  unitName,
  date,
  forPeriod,
  amountPaid,
  balanceAfter,
  receivedBy,
}: ReceiptDocumentProps) {
  const balance = balanceLabel(balanceAfter)

  return (
    <View style={styles.card}>
      {/* Header */}
      <Text style={styles.buildingName}>{buildingName}</Text>
      <Text style={styles.address}>{address}</Text>

      <View style={styles.divider} />

      {/* Info rows */}
      <ReceiptInfoRow label="Receipt No" value={receiptNo} />
      <ReceiptInfoRow label="Tenant"     value={tenantName} />
      <ReceiptInfoRow label="Unit"       value={unitName} />
      <ReceiptInfoRow label="Date"       value={date} />
      <ReceiptInfoRow label="Period"     value={forPeriod} />

      <View style={styles.divider} />

      {/* Amount */}
      <Text style={styles.amountLabel}>Amount Paid</Text>
      <Text style={styles.amountValue}>{formatPHP(amountPaid)}</Text>
      <Text style={[styles.balanceText, { color: balance.color }]}>
        {balance.text}
      </Text>

      <View style={styles.divider} />

      {/* Footer */}
      <Text style={styles.receivedBy}>Received by: {receivedBy}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: 20,
    marginHorizontal: 16,
  },
  buildingName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textInverse,
    textAlign: 'center',
  },
  address: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textInverse,
  },
  infoValue: {
    fontSize: 13,
    color: colors.textInverse,
    fontWeight: '500',
  },
  amountLabel: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textInverse,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
    marginTop: 4,
  },
  balanceText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
  receivedBy: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
})
