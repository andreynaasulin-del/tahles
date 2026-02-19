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
  photos?: string[]
}

function formatLastSeen(min: number): string {
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

const SERVICE_STYLES: Record<string, { emoji: string; label: string }> = {
  escort: { emoji: '💎', label: 'Escort' },
  massage: { emoji: '💆', label: 'Massage' },
  striptease: { emoji: '🩰', label: 'Striptease' },
  domina: { emoji: '👠', label: 'Domina' },
  kinky: { emoji: '🔥', label: 'Kinky' },
}

export function ResultRow({
  id: _id, nickname, age, verified, vip_status, online_status,
  price_min, price_max, city, gender: _gender, service_type,
  rank: _rank, views_today, last_seen_min, is_new, phone, photos = [],
}: ResultRowProps) {
  const { t } = useTranslation()
  const isHot = (views_today ?? 0) >= 300
  const mainPhoto = photos?.[0]

  function formatPrice(min: number | null, max: number | null) {
    if (!min && !max) return t('price_on_request')
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} ₪`
    if (min) return `${t('from_price')} ${min.toLocaleString()} ₪`
    return `${t('up_to_price')} ${max!.toLocaleString()} ₪`
  }

  const service = service_type ? SERVICE_STYLES[service_type] : null

  return (
    <div className={`
      relative rounded-2xl p-0.5 overflow-hidden transition-all duration-300 group
      ${vip_status
        ? 'bg-gradient-to-br from-velvet-400/40 via-purple-500/20 to-transparent'
        : 'bg-white/5'}
      hover:scale-[1.01] hover:shadow-2xl hover:shadow-velvet-500/10 active:scale-[0.99]
    `}>
      <div className="relative h-full w-full rounded-[14px] bg-[#0d0d0d] p-4 sm:p-5 flex flex-col gap-4 overflow-hidden">

        {/* Background Highlight for VIP */}
        {vip_status && (
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-velvet-500/10 blur-[60px] pointer-events-none" />
        )}

        {/* Header: Photo + Info */}
        <div className="flex gap-4">
          <div className="relative shrink-0">
            <div className={`
              relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2
              ${vip_status ? 'border-velvet-400/50' : 'border-white/10'}
              bg-white/5 shadow-inner
            `}>
              {mainPhoto ? (
                <img
                  src={mainPhoto}
                  alt={nickname}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white/20">
                  {nickname.charAt(0)}
                </div>
              )}
              {/* Online indicator */}
              {online_status && (
                <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-[#0d0d0d] shadow-sm animate-pulse" />
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-velvet-300 transition-colors truncate">
                {nickname}
              </h3>
              {age && <span className="text-xs text-white/30 font-medium">({age})</span>}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {is_new && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold tracking-tight">
                  NEW
                </span>
              )}
              {vip_status && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-velvet-500/20 text-velvet-300 font-bold tracking-tight shadow-sm shadow-velvet-500/5">
                  👑 VIP
                </span>
              )}
              {verified && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-400 font-bold tracking-tight">
                  ✓ {t('badge_verified')}
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[11px] text-white/25 uppercase font-bold tracking-wider mb-1">
              {t('starting_at')}
            </div>
            <div className="text-base sm:text-lg font-black text-velvet-400 tabular-nums">
              {price_min ? `${price_min} ₪` : 'TBD'}
            </div>
          </div>
        </div>

        {/* Footer info grid */}
        <div className="flex items-center justify-between border-t border-white/5 pt-3">
          <div className="flex items-center gap-4 text-[11px] font-medium text-white/40">
            {city && (
              <span className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-white/5 border border-white/5">
                <span className="opacity-50">📍</span> {city}
              </span>
            )}
            {service && (
              <span className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-white/5 border border-white/5">
                {service.emoji} {service.label}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {views_today != null && views_today > 0 && (
              <span className={`text-[11px] flex items-center gap-1 ${isHot ? 'text-velvet-400 font-bold' : 'text-white/20'}`}>
                {isHot && '🔥'} {views_today}
              </span>
            )}
            <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
            <span className="text-[10px] text-white/20 font-mono">
              #{_id.slice(-4).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Phone Action Area */}
        {phone && (
          <div className="mt-2 group/phone relative overflow-hidden rounded-xl bg-velvet-400/5 hover:bg-velvet-400/10 transition-colors p-3 flex items-center justify-between border border-velvet-400/10">
            <div className="flex flex-col">
              <span className="text-[10px] text-white/20 uppercase font-black tracking-[0.15em] mb-0.5">{t('contacts')}</span>
              <div className="flex items-center gap-1 font-mono text-sm tracking-widest text-white/50">
                <span>{phone.slice(0, 3)}</span>
                <span className="text-white/10">• • •</span>
                <span className="blur-[3px] select-none opacity-20">{phone.slice(-3)}</span>
              </div>
            </div>
            <button
              onClick={(e) => e.stopPropagation()}
              className="px-4 py-2 rounded-lg bg-velvet-500 text-white text-[11px] font-black uppercase tracking-wider hover:bg-velvet-400 transition-all active:scale-95 shadow-lg shadow-velvet-600/20"
            >
              🔓 {t('unlock')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

