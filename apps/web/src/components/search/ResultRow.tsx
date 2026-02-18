'use client'

import { useTranslation } from '@/lib/i18n/useTranslation'

interface ResultRowProps {
  id: string
  nickname: string
  age: number | null
  verified: boolean
  vip_status: boolean
  online_status: boolean
  price_min: number | null
  price_max: number | null
  city: string | null
  gender: string | null
  service_type: string | null
  rank: number
  views_today?: number | null
  last_seen_min?: number | null
  is_new?: boolean
  phone?: string | null
}

function formatLastSeen(min: number): string {
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

const SERVICE_STYLES: Record<string, { emoji: string; label: string }> = {
  escort:     { emoji: '💎', label: 'Escort' },
  massage:    { emoji: '💆', label: 'Massage' },
  striptease: { emoji: '🩰', label: 'Striptease' },
  domina:     { emoji: '👠', label: 'Domina' },
  kinky:      { emoji: '🔥', label: 'Kinky' },
}

export function ResultRow({
  id: _id, nickname, age, verified, vip_status, online_status,
  price_min, price_max, city, gender: _gender, service_type,
  rank: _rank, views_today, last_seen_min, is_new, phone,
}: ResultRowProps) {
  const { t } = useTranslation()
  const isHot = (views_today ?? 0) >= 300

  function formatPrice(min: number | null, max: number | null) {
    if (!min && !max) return t('price_on_request')
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} ₪`
    if (min) return `${t('from_price')} ${min.toLocaleString()} ₪`
    return `${t('up_to_price')} ${max!.toLocaleString()} ₪`
  }

  const service = service_type ? SERVICE_STYLES[service_type] : null

  return (
    <div className={`
      relative rounded-xl p-4 sm:p-5 transition-all duration-200 cursor-pointer group animate-card-in
      bg-white/[0.04] border border-white/[0.08]
      hover:bg-white/[0.07] hover:border-white/[0.15] hover:shadow-lg hover:shadow-velvet-500/5
      ${isHot ? 'animate-glow-pulse' : ''}
    `}>

      {/* Top row: avatar + name + badges */}
      <div className="flex items-center gap-3 mb-3">
        {/* Avatar circle */}
        <div className={`
          relative w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold shrink-0
          ${vip_status
            ? 'bg-gradient-to-br from-velvet-400 to-velvet-600 text-white'
            : 'bg-white/10 text-white/60'}
        `}>
          {nickname.charAt(0).toUpperCase()}
          {/* Online indicator */}
          {online_status && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-[#0a0a0a]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white group-hover:text-velvet-300 transition-colors truncate">
              {nickname}
            </span>
            {age && <span className="text-xs text-white/30">{age}</span>}
          </div>
          {/* Badges */}
          <div className="flex items-center gap-1.5 mt-0.5">
            {is_new && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">
                NEW
              </span>
            )}
            {vip_status && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-velvet-500/20 text-velvet-300 font-medium">
                👑 VIP
              </span>
            )}
            {verified && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-medium">
                ✓ {t('badge_verified')}
              </span>
            )}
          </div>
        </div>

        {/* Price — top right */}
        <div className="text-right shrink-0">
          <div className="text-sm font-bold text-velvet-300 tabular-nums">
            {formatPrice(price_min, price_max)}
          </div>
        </div>
      </div>

      {/* Details row */}
      <div className="flex items-center gap-3 flex-wrap text-xs text-white/35">
        {city && (
          <span className="flex items-center gap-1">
            <span className="text-white/20">📍</span> {city}
          </span>
        )}
        {service && (
          <span className="flex items-center gap-1">
            {service.emoji} {service.label}
          </span>
        )}
        {online_status ? (
          <span className="text-green-400 font-medium">{t('badge_online')}</span>
        ) : last_seen_min != null && last_seen_min > 0 ? (
          <span>{formatLastSeen(last_seen_min)} ago</span>
        ) : null}
        {views_today != null && views_today > 0 && (
          <span className={isHot ? 'text-velvet-400 font-medium' : ''}>
            {isHot && '🔥'} {views_today} {t('views_today')}
          </span>
        )}
      </div>

      {/* Phone row */}
      {phone && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.06]">
          <span className="text-xs font-mono text-white/30 tabular-nums">
            {phone.slice(0, Math.ceil(phone.length / 2))}
          </span>
          <span
            className="text-xs font-mono text-white/30 tabular-nums select-none"
            style={{ filter: 'blur(4px)', userSelect: 'none' }}
            aria-hidden="true"
          >
            {phone.slice(Math.ceil(phone.length / 2))}
          </span>
          <button
            onClick={(e) => e.stopPropagation()}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-velvet-500/20 text-velvet-300 text-[11px] font-medium hover:bg-velvet-500/30 transition-colors"
          >
            🔓 {t('unlock_phone')}
          </button>
        </div>
      )}
    </div>
  )
}
