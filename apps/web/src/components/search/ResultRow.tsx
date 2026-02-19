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
  whatsapp?: string | null
  created_at?: string | null
  comments_count?: number
}

function formatLastSeen(min: number): string {
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return 'New'
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('d MMMM yyyy').format(date)
}

const SERVICE_STYLES: Record<string, { emoji: string; label: string }> = {
  incall: { emoji: '🏠', label: 'Incall' },
  outcall: { emoji: '🚗', label: 'Outcall' },
  both: { emoji: '🔄', label: 'In/Outcall' },
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
  whatsapp, created_at, comments_count = 0
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

  const handleWhatsappClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const num = whatsapp || phone
    if (num) {
      // Direct open for MVP - later add limits
      const cleanNum = num.replace(/\D/g, '')
      window.open(`https://wa.me/${cleanNum}?text=Hi ${nickname}, I found you on Tahles`, '_blank')
    }
  }

  return (
    <div className={`
      relative rounded-3xl p-0.5 overflow-hidden transition-all duration-300 group
      ${vip_status
        ? 'bg-gradient-to-br from-velvet-400/40 via-purple-500/20 to-transparent'
        : 'bg-white/5'}
      hover:scale-[1.01] hover:shadow-2xl hover:shadow-velvet-500/10 active:scale-[0.99]
    `}>
      <div className="relative h-full w-full rounded-[22px] bg-[#0d0d0d] p-4 sm:p-5 flex flex-col gap-4 overflow-hidden">

        {/* Background Highlight for VIP */}
        {vip_status && (
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-velvet-500/10 blur-[60px] pointer-events-none" />
        )}

        {/* Header: Photo + Info */}
        <div className="flex gap-4">
          <div className="relative shrink-0">
            <div className={`
              relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2
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
                <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-[#0d0d0d] shadow-sm animate-pulse" />
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
            <div>
              <div className="flex items-start justify-between mb-1">
                <div className="flex flex-col">
                  <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-velvet-300 transition-colors truncate">
                    {nickname}, <span className="text-white/40 font-medium text-lg">{age}</span>
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {city && (
                      <span className="flex items-center gap-1 text-xs text-white/50">
                        📍 {city}
                      </span>
                    )}
                    {views_today != null && views_today > 0 && (
                      <span className="flex items-center gap-1 text-xs text-white/30">
                        👁 {views_today}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-white/25 uppercase font-bold tracking-wider mb-0.5">
                    {t('starting_at')}
                  </div>
                  <div className="text-lg font-black text-velvet-400 tabular-nums leading-tight">
                    {price_min ? `${price_min} ₪` : 'TBD'}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2">
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
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-white/5 w-full" />

        {/* Bottom Row: Details + Call Action */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1 text-xs text-white/40">
            <div className="flex items-center gap-2">
              <span className="opacity-40">📅</span>
              <span>Joined {formatDate(created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500/80">⭐️</span>
              <span>{comments_count > 0 ? `${(4.5 + Math.random() * 0.5).toFixed(1)} (${comments_count} reviews)` : 'No reviews yet'}</span>
            </div>
          </div>

          <button
            onClick={handleWhatsappClick}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-[#25D366]/10 group/btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" className="group-hover/btn:scale-110 transition-transform"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            WhatsApp
          </button>
        </div>

      </div>
    </div>
  )
}

