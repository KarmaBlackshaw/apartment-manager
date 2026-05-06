export const colors = {
  primary:         '#3B82F6',
  primaryPressed:  '#2563EB',
  primarySubtle:   '#0C1A3D',

  background: '#0D0D0D',
  surface:    '#171717',
  elevated:   '#1F1F1F',
  muted:      '#242424',
  border:     '#2A2A2A',

  textPrimary:   '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted:     '#64748B',
  textInverse:   '#0F172A',
  textLink:      '#3B82F6',

  success:     '#10B981',
  successBg:   '#052E16',
  successText: '#6EE7B7',

  warning:     '#F59E0B',
  warningBg:   '#1C1005',
  warningText: '#FCD34D',

  danger:     '#EF4444',
  dangerBg:   '#200C0C',
  dangerText: '#FCA5A5',

  info:     '#3B82F6',
  infoBg:   '#0C1A3D',
  infoText: '#93C5FD',

  neutral:     '#64748B',
  neutralBg:   '#1E2533',
  neutralText: '#94A3B8',

  balanceZero:   '#10B981',
  balanceOwed:   '#EF4444',
  balanceCredit: '#3B82F6',
} as const

export const shadows = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2,  elevation: 1 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,  elevation: 3 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8,  elevation: 6 },
} as const

export const radius = {
  sm:   6,
  md:   12,
  lg:   16,
  xl:   24,
  pill: 999,
} as const

export const spacing = {
  1: 4,  2: 8,  3: 12, 4: 16,
  5: 20, 6: 24, 8: 32, 10: 40, 12: 48,
} as const
