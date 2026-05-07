import dayjs from 'dayjs'
import type { UnitDetail } from '~/types'
import { formatPHP } from './format'

export function getBalanceBreakdown(unit: UnitDetail, today: dayjs.Dayjs = dayjs()): string {
  const balance = unit.balance

  if (balance < 0) {
    return `${formatPHP(Math.abs(balance))} credit`
  }

  if (balance === 0) {
    return 'All paid'
  }

  // balance > 0: show current month rent + due/overdue info
  const currentMonth = today.format('MMMM')

  // For now, show generic message. In future, can fetch the actual bill's due_date
  // to calculate days overdue more accurately.
  const dueDateString = today.add(5, 'day').format('MMM D')

  return `${currentMonth} rent · due ${dueDateString}`
}
