'use client'

import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { translateCity, translateServiceType, translateEthnicity } from '@/lib/i18n/translations'
import type { TranslationKey } from '@/lib/i18n/translations'

interface PriceEntry { type: string; amount: number; duration: string }

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
  videos?: string[]
  whatsapp?: string | null
  telegram?: string | null
  created_at?: string | null
  comments_count?: number
  address?: string | null
  services?: string[]
  price_table?: PriceEntry[]
  physical_params?: Record<string, string>
  languages?: string[]
  category?: string | null
  priority?: boolean
}

/* ── Param key → translation key mapping ─────────────── */
const PARAM_KEYS: Record<string, TranslationKey> = {
  height: 'param_height',
  weight: 'param_weight',
  breast_size: 'param_breast',
  hair_color: 'param_hair',
  eye_color: 'param_eyes',
  sexuality: 'param_sexuality',
}

const PARAM_ICONS: Record<string, string> = {
  height: '📏', weight: '⚖️', breast_size: '👙', hair_color: '💇',
  eye_color: '👁️', sexuality: '💜'
}

/* ── Infographic Slide ────────────────────────────────── */
function InfoSlide({
  nickname, age, city, address, service_type, price_min,
  services, price_table, physical_params, languages
}: Pick<ResultRowProps, 'nickname' | 'age' | 'city' | 'address' | 'service_type' | 'price_min' | 'services' | 'price_table' | 'physical_params' | 'languages'>) {
  const { t, locale } = useTranslation()
  const params = physical_params ?? {}
  const hasParams = Object.keys(params).length > 0
  const hasServices = (services ?? []).length > 0
  const hasPrices = (price_table ?? []).length > 0
  const hasLangs = (languages ?? []).length > 0

  const displayCity = city ? translateCity(city, locale) : null
  const displayLocation = address || displayCity

  return (
    <div className="w-full h-full bg-gradient-to-b from-[#111] via-[#0d0d0d] to-[#080808] flex flex-col p-5 overflow-y-auto">
      {/* Header */}
      <div className="mb-4">
        <h4 className="text-lg font-black text-white leading-tight">
          {nickname}
          {age ? <span className="text-white/30 font-medium text-sm ml-1">{age}</span> : null}
        </h4>
        {displayLocation && (
          <p className="text-xs text-white/40 mt-0.5">📍 {displayLocation}</p>
        )}
      </div>

      {/* Price Table */}
      {hasPrices && (
        <div className="mb-4">
          <div className="text-xs text-velvet-400/60 uppercase tracking-[0.2em] font-black mb-2">{t('info_prices')}</div>
          <div className="flex flex-col gap-1.5">
            {(price_table ?? []).map((p, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/30 uppercase font-bold">{p.type}</span>
                  <span className="text-xs text-white/60 font-bold">{p.duration}</span>
                </div>
                <span className="text-sm font-black text-velvet-300 tabular-nums">{p.amount} ₪</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Physical Params */}
      {hasParams && (
        <div className="mb-4">
          <div className="text-xs text-velvet-400/60 uppercase tracking-[0.2em] font-black mb-2">{t('info_details')}</div>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(params)
              .filter(([k]) => PARAM_KEYS[k])
              .map(([k, v]) => {
                const displayVal = (k === 'ethnicity' || k === 'nationality') ? translateEthnicity(v, locale) : v
                return (
                  <div key={k} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                    <span className="text-xs">{PARAM_ICONS[k] || '•'}</span>
                    <span className="text-xs text-white/50 font-bold truncate">{displayVal}</span>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Services */}
      {hasServices && (
        <div className="mb-4">
          <div className="text-xs text-velvet-400/60 uppercase tracking-[0.2em] font-black mb-2">{t('info_services')}</div>
          <div className="flex flex-wrap gap-1.5">
            {(services ?? []).slice(0, 8).map((s, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full bg-velvet-500/10 border border-velvet-500/15 text-xs text-velvet-300/80 font-bold">
                {s}
              </span>
            ))}
            {(services ?? []).length > 8 && (
              <span className="px-2.5 py-1 rounded-full bg-white/[0.04] text-xs text-white/30 font-bold">
                +{(services ?? []).length - 8}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Languages */}
      {hasLangs && (
        <div className="mb-2">
          <div className="text-xs text-velvet-400/60 uppercase tracking-[0.2em] font-black mb-2">{t('info_languages')}</div>
          <div className="flex gap-1.5">
            {(languages ?? []).map((l, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs text-white/50 font-bold">
                🗣️ {l}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Minimal fallback — when no detailed data is available */}
      {!hasPrices && !hasParams && !hasServices && !hasLangs && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center">
            <span className="text-2xl font-black text-white/30">{(nickname || '?').charAt(0).toUpperCase()}</span>
          </div>
          {price_min ? (
            <div className="text-center">
              <div className="text-xs text-white/25 uppercase tracking-[0.2em] font-black mb-1">{t('starting_at')}</div>
              <div className="text-3xl font-black text-velvet-300 tabular-nums">{price_min} ₪</div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-xs text-white/25 uppercase tracking-[0.2em] font-black mb-1">{t('price')}</div>
              <div className="text-lg font-black text-white/40">{t('price_on_request')}</div>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {service_type && (
              <span className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.06] text-xs text-white/40 font-bold uppercase">{translateServiceType(service_type, locale)}</span>
            )}
            {displayCity && (
              <span className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.06] text-xs text-white/40 font-bold">📍 {displayCity}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Contact Popup ────────────────────────────────────── */
function ContactPopup({
  nickname, whatsapp, phone, telegram, onClose
}: { nickname: string; whatsapp?: string | null; phone?: string | null; telegram?: string | null; onClose: () => void }) {
  const { t } = useTranslation()
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) onClose()
    }
    const escHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', escHandler)
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', escHandler) }
  }, [onClose])

  const waNum = (whatsapp || phone || '').replace(/\D/g, '')
  const waText = encodeURIComponent(t('wa_message'))

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div ref={popupRef} className="w-full max-w-sm mx-3 mb-3 sm:mb-0 rounded-2xl bg-[#1a1a1a] border border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h4 className="text-base font-black text-white">{nickname}</h4>
            <p className="text-[11px] text-white/40 mt-0.5">{t('contact_how')}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Options */}
        <div className="px-4 pb-4 flex flex-col gap-2">
          {/* WhatsApp */}
          {waNum && (
            <a
              href={`https://wa.me/${waNum}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 transition-all active:scale-[0.98] group"
            >
              <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-[#25D366]">WhatsApp</div>
                <div className="text-[11px] text-white/30 truncate">{t('contact_wa_sub')}</div>
              </div>
              <svg className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </a>
          )}

          {/* Phone Call */}
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-all active:scale-[0.98] group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-blue-400">{t('contact_call')}</div>
                <div className="text-[11px] text-white/30 truncate">{t('contact_call_sub')}</div>
              </div>
              <svg className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </a>
          )}

          {/* Telegram */}
          {telegram && (
            <a
              href={`https://t.me/${telegram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#2AABEE]/10 hover:bg-[#2AABEE]/20 border border-[#2AABEE]/20 transition-all active:scale-[0.98] group"
            >
              <div className="w-10 h-10 rounded-full bg-[#2AABEE] flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-[#2AABEE]">Telegram</div>
                <div className="text-[11px] text-white/30 truncate">@{telegram.replace('@', '')}</div>
              </div>
              <svg className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Main Card ────────────────────────────────────────── */
export const ResultRow = memo(function ResultRow({
  id, nickname, age, price_min, city, photos = [], videos = [], address,
  online_status, whatsapp, phone, telegram, service_type,
  services, price_table, physical_params, languages, category, priority
}: ResultRowProps) {
  const { t, locale } = useTranslation()

  // Slide order: VIDEOS first → PHOTOS → INFOGRAPHIC last
  const videoCount = videos.length
  const photoCount = photos.length
  const infoSlideIdx = videoCount + photoCount // last slide

  const [slideIdx, setSlideIdx] = useState(0)
  const [allMediaFailed, setAllMediaFailed] = useState(false)
  const [failedSlides, setFailedSlides] = useState<Set<number>>(new Set())
  const [showContact, setShowContact] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const touchDelta = useRef(0)
  const mediaRef = useRef<HTMLImageElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const isInfoSlide = slideIdx === infoSlideIdx
  const isVideoSlide = slideIdx < videoCount
  const isPhotoSlide = !isVideoSlide && slideIdx < videoCount + photoCount

  // Build list of valid indices
  const validIndices: number[] = []
  for (let i = 0; i < videoCount + photoCount; i++) {
    if (!failedSlides.has(i)) validIndices.push(i)
  }
  validIndices.push(infoSlideIdx) // infographic always valid

  const currentValidPos = validIndices.indexOf(slideIdx)

  const goNext = useCallback(() => {
    setSlideIdx(prev => {
      const curPos = validIndices.indexOf(prev)
      if (curPos < 0 || curPos >= validIndices.length - 1) return prev
      return validIndices[curPos + 1]
    })
  }, [validIndices])

  const goPrev = useCallback(() => {
    setSlideIdx(prev => {
      const curPos = validIndices.indexOf(prev)
      if (curPos <= 0) return prev
      return validIndices[curPos - 1]
    })
  }, [validIndices])

  // Auto-pause/play video when slide changes
  useEffect(() => {
    if (videoRef.current) {
      if (isVideoSlide) {
        videoRef.current.play().catch(() => {})
      } else {
        videoRef.current.pause()
      }
    }
  }, [slideIdx, isVideoSlide])

  // Preload next 2 photos for instant swipe
  useEffect(() => {
    const preloadCount = 2
    for (let i = 1; i <= preloadCount; i++) {
      const nextPos = currentValidPos + i
      if (nextPos >= validIndices.length) break
      const nextIdx = validIndices[nextPos]
      if (nextIdx >= videoCount && nextIdx < videoCount + photoCount) {
        const url = photos[nextIdx - videoCount]
        if (url) {
          const img = new Image()
          img.src = url
        }
      }
    }
  }, [slideIdx, validIndices, currentValidPos, videoCount, photoCount, photos])

  // Reset loaded state on slide change
  useEffect(() => {
    setImageLoaded(false)
  }, [slideIdx])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    touchDelta.current = 0
    if (mediaRef.current) mediaRef.current.style.transition = 'none'
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return
    touchDelta.current = e.touches[0].clientX - touchStart.current.x
    if (mediaRef.current) mediaRef.current.style.transform = `translateX(${touchDelta.current * 0.25}px)`
  }, [])

  const onTouchEnd = useCallback(() => {
    if (mediaRef.current) {
      mediaRef.current.style.transition = 'transform 0.2s ease-out'
      mediaRef.current.style.transform = 'translateX(0)'
    }
    if (Math.abs(touchDelta.current) > 40) {
      if (touchDelta.current < 0) goNext(); else goPrev()
    }
    touchStart.current = null
  }, [goNext, goPrev])

  const handleMediaError = useCallback((idx: number) => {
    const nf = new Set(failedSlides)
    nf.add(idx)
    setFailedSlides(nf)
    // Find next valid
    const totalMedia = videoCount + photoCount
    let nextFound = false
    for (let i = idx + 1; i < totalMedia; i++) {
      if (!nf.has(i)) { setSlideIdx(i); nextFound = true; break }
    }
    if (!nextFound) { setSlideIdx(infoSlideIdx); nextFound = true }
    if (!nextFound) setAllMediaFailed(true)
  }, [failedSlides, videoCount, photoCount, infoSlideIdx])

  if (allMediaFailed || validIndices.length === 0) return null

  // Get current media URL
  let currentUrl: string | null = null
  if (isVideoSlide) {
    currentUrl = videos[slideIdx] || null
  } else if (isPhotoSlide) {
    currentUrl = photos[slideIdx - videoCount] || null
  }

  const displayCity = city ? translateCity(city, locale) : null
  // Prefer translated city in current locale; fall back to raw address
  const displayLocation = displayCity || address

  return (
    <div className="relative rounded-3xl overflow-hidden bg-[#0d0d0d] border border-white/[0.06]">

      {/* ── Carousel ───────────────────────────────── */}
      <div
        className="relative w-full aspect-[3/4] overflow-hidden bg-white/5 select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {isInfoSlide ? (
          <InfoSlide
            nickname={nickname} age={age} city={city} address={address}
            service_type={service_type} price_min={price_min}
            services={services} price_table={price_table}
            physical_params={physical_params} languages={languages}
          />
        ) : isVideoSlide && currentUrl ? (
          /* Video slide */
          <video
            ref={videoRef}
            src={currentUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover will-change-transform"
            onError={() => handleMediaError(slideIdx)}
          />
        ) : currentUrl ? (
          /* Photo slide */
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-white/[0.03] animate-pulse z-[1]">
                <div className="w-full h-full bg-gradient-to-b from-white/[0.04] to-transparent" />
              </div>
            )}
            <img
              ref={mediaRef}
              src={currentUrl}
              alt={nickname}
              loading={priority ? 'eager' : 'lazy'}
              decoding={priority ? 'sync' : 'async'}
              fetchPriority={priority ? 'high' : undefined}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover will-change-transform transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              draggable={false}
              onLoad={() => setImageLoaded(true)}
              onError={() => handleMediaError(slideIdx)}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-white/10">
            {nickname.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Desktop click zones + center opens profile */}
        {validIndices.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); goPrev() }} className="absolute left-0 top-0 w-1/4 h-full opacity-0 cursor-pointer z-10" aria-label="Previous" />
            <a href={`/ad/${id}`} className="absolute left-1/4 top-0 w-1/2 h-full opacity-0 cursor-pointer z-10" aria-label="View profile" />
            <button onClick={(e) => { e.stopPropagation(); goNext() }} className="absolute right-0 top-0 w-1/4 h-full opacity-0 cursor-pointer z-10" aria-label="Next" />
          </>
        )}
        {/* Single media — center opens profile */}
        {validIndices.length <= 1 && !isInfoSlide && (
          <a href={`/ad/${id}`} className="absolute inset-0 opacity-0 cursor-pointer z-10" aria-label="View profile" />
        )}

        {/* Progress bar segments — cleaner than dots */}
        {validIndices.length > 1 && (
          <div className="absolute top-0 inset-x-0 flex gap-[2px] px-2 pt-2 z-20">
            {validIndices.map((vIdx, i) => {
              const isLast = i === validIndices.length - 1
              const isActive = i === currentValidPos
              const isVid = vIdx < videoCount
              return (
                <div
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setSlideIdx(vIdx) }}
                  className={`h-[3px] rounded-full flex-1 cursor-pointer transition-all duration-300 ${
                    isActive
                      ? isLast ? 'bg-velvet-400/90' : isVid ? 'bg-blue-400/90' : 'bg-white/90'
                      : isLast ? 'bg-velvet-400/25' : isVid ? 'bg-blue-400/20' : 'bg-white/20'
                  }`}
                />
              )
            })}
          </div>
        )}

        {/* Video badge */}
        {isVideoSlide && (
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold text-white/70 uppercase">Video</span>
          </div>
        )}

        {/* Online indicator */}
        {online_status && !isInfoSlide && (
          <div className="absolute top-3 left-3 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-black/50 shadow-lg shadow-green-500/50 animate-pulse z-20" />
        )}

        {/* Gradient overlay — only on photo/video slides */}
        {!isInfoSlide && (
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none z-10" />
        )}

        {/* Name + City + Price — only on photo/video slides */}
        {!isInfoSlide && (
          <div className="absolute inset-x-0 bottom-0 p-4 z-20">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-black text-white leading-tight truncate drop-shadow-lg">
                  {nickname}
                  {age ? <span className="text-white/40 font-medium text-sm ms-1">{age}</span> : null}
                </h3>
                {displayLocation && (
                  <p className="text-sm text-white/50 mt-0.5 truncate drop-shadow">📍 {displayLocation}</p>
                )}
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {service_type && (
                    <span className="inline-block px-2.5 py-0.5 rounded bg-white/10 text-xs text-white/60 font-bold uppercase">{translateServiceType(service_type, locale)}</span>
                  )}
                  {category && (
                    <span className="inline-block px-2.5 py-0.5 rounded bg-velvet-500/20 text-xs text-velvet-300/80 font-bold uppercase">
                      {category === 'individual' ? t('cat_individual') : category === 'agency' ? t('cat_agency') : category}
                    </span>
                  )}
                </div>
              </div>
              <div className="shrink-0" style={{ textAlign: 'end' }}>
                <div className="text-xs text-white/30 uppercase font-bold tracking-wider drop-shadow">{t('starting_at')}</div>
                <div className="text-xl font-black text-velvet-300 tabular-nums leading-tight drop-shadow-lg">
                  {price_min ? `${price_min} ₪` : t('price_on_request')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slide counter — bottom-left above gradient */}
        {validIndices.length > 1 && !isInfoSlide && (
          <div className="absolute bottom-16 z-20" style={{ insetInlineEnd: '12px' }}>
            <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[11px] text-white/50 font-bold tabular-nums">
              {currentValidPos + 1}/{validIndices.length}
            </span>
          </div>
        )}
      </div>

      {/* ── Contact CTA ─────────────────────────────────── */}
      <div className="p-3">
        <button
          onClick={(e) => { e.stopPropagation(); setShowContact(true) }}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-velvet-500 hover:bg-velvet-400 text-white font-black text-xs uppercase tracking-wider transition-all active:scale-[0.97] shadow-lg shadow-velvet-500/25"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
          </svg>
          {t('contact_btn')}
        </button>
      </div>

      {/* ── Contact Popup ─────────────────────────────── */}
      {showContact && (
        <ContactPopup
          nickname={nickname}
          whatsapp={whatsapp}
          phone={phone}
          telegram={telegram}
          onClose={() => setShowContact(false)}
        />
      )}
    </div>
  )
})
