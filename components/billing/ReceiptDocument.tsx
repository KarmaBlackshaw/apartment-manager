import React from 'react'
import { Text, View } from 'react-native'
import { colors } from '../../constants/theme'

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
    <View className="flex-row justify-between my-0.5">
      <Text className="text-[13px]" style={{ color: colors.textInverse }}>{label}</Text>
      <Text className="text-[13px] font-medium" style={{ color: colors.textInverse }}>{value}</Text>
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
    <View className="rounded-md p-5 mx-4" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Header */}
      <Text className="text-base font-bold text-center" style={{ color: colors.textInverse }}>
        {buildingName}
      </Text>
      <Text className="text-xs text-center mt-0.5" style={{ color: '#64748B' }}>
        {address}
      </Text>

      <View className="h-px my-3" style={{ backgroundColor: '#E2E8F0' }} />

      {/* Info rows */}
      <ReceiptInfoRow label="Receipt No" value={receiptNo} />
      <ReceiptInfoRow label="Tenant"     value={tenantName} />
      <ReceiptInfoRow label="Unit"       value={unitName} />
      <ReceiptInfoRow label="Date"       value={date} />
      <ReceiptInfoRow label="Period"     value={forPeriod} />

      <View className="h-px my-3" style={{ backgroundColor: '#E2E8F0' }} />

      {/* Amount */}
      <Text className="text-[11px] text-center uppercase tracking-wider" style={{ color: '#64748B' }}>
        Amount Paid
      </Text>
      <Text
        className="text-[28px] font-bold text-center mt-1"
        style={{ color: colors.textInverse, fontVariant: ['tabular-nums'] }}
      >
        {formatPHP(amountPaid)}
      </Text>
      <Text className="text-[13px] text-center mt-1" style={{ color: balance.color }}>
        {balance.text}
      </Text>

      <View className="h-px my-3" style={{ backgroundColor: '#E2E8F0' }} />

      {/* Footer */}
      <Text className="text-xs text-center" style={{ color: '#64748B' }}>
        Received by: {receivedBy}
      </Text>
    </View>
  )
}
