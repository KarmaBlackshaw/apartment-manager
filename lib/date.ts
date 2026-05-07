import dayjs from 'dayjs'

export function formatDate(dateString: string, format: string = 'MMM D, YYYY'): string {
  return dayjs(dateString).format(format)
}
