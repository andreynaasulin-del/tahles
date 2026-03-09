export const SHEETS = [
  { id: 'all',      label: 'All',      icon: '🔥' },
  { id: 'verified', label: 'Verified', icon: '✅' },
  { id: 'vip',      label: 'VIP',      icon: '👑' },
  { id: 'under25',  label: 'Under 25', icon: '🌟' },
  { id: '40plus',   label: '40+',      icon: '💎' },
  { id: 'outcall',  label: 'Outcall',  icon: '🚗' },
  { id: 'nearme',   label: 'Near Me',  icon: '📍' },
] as const

export type SheetId = (typeof SHEETS)[number]['id']

export const CATEGORIES = [
  { slug: 'individual', name: 'Individual',   icon: '🌺' },
  { slug: 'agency',     name: 'Agency',       icon: '🏢' },
] as const

export type CategorySlug = (typeof CATEGORIES)[number]['slug']

export const ORIGINS = [
  { id: 'european',         label: 'European',        icon: '🌍' },
  { id: 'eastern_european', label: 'East European',   icon: '🇷🇺' },
  { id: 'israeli',          label: 'Israeli',         icon: '🇮🇱' },
  { id: 'latina',           label: 'Latina',          icon: '🔥' },
  { id: 'asian',            label: 'Asian',           icon: '🌸' },
  { id: 'ethiopian',        label: 'Ethiopian',       icon: '🇪🇹' },
] as const

export type OriginId = (typeof ORIGINS)[number]['id']

export const PRESETS = [
  {
    id: 'mfw',
    label: 'Men for Women & Couples',
    filter: { gender: 'male', target_audience: ['women', 'couples'] },
  },
  {
    id: 'mfm',
    label: 'Men for Men',
    filter: { gender: 'male', target_audience: ['men'] },
  },
  {
    id: 'russian',
    label: 'Russian Girls',
    filter: { language: ['russian'] },
  },
  {
    id: 'latina',
    label: 'Chicas Latinas',
    filter: { language: ['spanish'] },
  },
] as const

export type PresetId = (typeof PRESETS)[number]['id']

export const UNLOCK_PRICE_CENTS = parseInt(
  process.env.UNLOCK_PRICE_EUR_CENTS ?? '1000'
)

export const DEFAULT_PAGE_SIZE = 24
