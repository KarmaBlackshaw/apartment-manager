import { Text, TextProps } from 'react-native'
import { cn } from '~/lib/utils'

type Variant = 'display' | 'heading' | 'subheading' | 'body' | 'caption' | 'label'
type Color = 'primary' | 'secondary' | 'muted' | 'danger' | 'success' | 'warning'

interface AppTextProps extends TextProps {
  variant?: Variant
  color?: Color
  className?: string
}

const varCls: Record<Variant, string> = {
  display:    'text-3xl font-bold',
  heading:    'text-2xl font-semibold',
  subheading: 'text-lg font-semibold',
  body:       'text-base',
  caption:    'text-sm',
  label:      'text-xs font-medium uppercase tracking-widest',
}
const clrCls: Record<Color, string> = {
  primary:   'text-[#f1f1f1]',
  secondary: 'text-[#888888]',
  muted:     'text-[#555555]',
  danger:    'text-danger',
  success:   'text-success',
  warning:   'text-warning',
}

export function AppText({ variant = 'body', color = 'primary', className = '', ...props }: AppTextProps) {
  // @ts-ignore — className handled by NativeWind babel transform at runtime
  return <Text className={cn(varCls[variant], clrCls[color], className)} {...props} />
}
