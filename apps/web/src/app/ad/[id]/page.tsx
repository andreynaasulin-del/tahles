'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { translateCity, translateServiceType, translateEthnicity } from '@/lib/i18n/translations'
import type { TranslationKey } from '@/lib/i18n/translations'

/* ── Param key → translation key ──────────────────────────── */
const PARAM_KEYS: Record<string, TranslationKey> = {
  ethnicity: 'param_ethnicity',
  nationality: 'param_nationality',
  sexuality: 'param_sexuality',
  eye_color: 'param_eyes',
  hair_color: 'param_hair',
  height: 'param_height',
  weight: 'param_weight',
  breast_size: 'param_breast',
}

/* ── Contact Popup (profile page version) ──────────────────── */
function ProfileContactPopup({
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
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h4 className="text-base font-black text-white">{nickname}</h4>
            <p className="text-[11px] text-white/40 mt-0.5">{t('contact_how')}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="px-4 pb-4 flex flex-col gap-2">
          {waNum && (
            <a href={`https://wa.me/${waNum}?text=${waText}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 transition-all active:scale-[0.98] group">
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
          {phone && (
            <a href={`tel:${phone}`}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-all active:scale-[0.98] group">
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
          {telegram && (
            <a href={`https://t.me/${telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#2AABEE]/10 hover:bg-[#2AABEE]/20 border border-[#2AABEE]/20 transition-all active:scale-[0.98] group">
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

interface PriceRow {
  duration: string
  type: string
  amount: number
}

interface AdProfile {
  id: string
  nickname: string
  description: string | null
  age: number | null
  city: string | null
  address: string | null
  photos: string[]
  verified: boolean
  vip_status: boolean
  online_status: boolean
  service_type: string | null
  price_min: number | null
  price_max: number | null
  rating_avg: number | null
  rating_count: number | null
  created_at: string | null
  source: string | null
  phone: string | null
  whatsapp: string | null
  telegram: string | null
  comments: any[]
  videos: string[]
  priceTable: PriceRow[]
  physicalParams: Record<string, string>
  services: string[]
  shortDescription: string | null
  payments: string | null
  parking: string | null
  region: string | null
  registrationDate: string | null
  showsCount: number | null
  commentsCount: number
}

interface MediaItem {
  type: 'photo' | 'video'
  url: string
}

function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void, threshold = 50) {
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const touchDelta = useRef(0)
  const imgRef = useRef<HTMLImageElement | null>(null)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    touchDelta.current = 0
    if (imgRef.current) imgRef.current.style.transition = 'none'
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return
    const dx = e.touches[0].clientX - touchStart.current.x
    touchDelta.current = dx
    if (imgRef.current) imgRef.current.style.transform = `translateX(${dx * 0.3}px)`
  }, [])

  const onTouchEnd = useCallback(() => {
    const dx = touchDelta.current
    if (imgRef.current) {
      imgRef.current.style.transition = 'transform 0.2s ease-out'
      imgRef.current.style.transform = 'translateX(0)'
    }
    if (Math.abs(dx) > threshold) {
      if (dx < 0) onSwipeLeft()
      else onSwipeRight()
    }
    touchStart.current = null
  }, [onSwipeLeft, onSwipeRight, threshold])

  return { onTouchStart, onTouchMove, onTouchEnd, imgRef }
}

export default function AdProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { t, locale } = useTranslation()
  const [ad, setAd] = useState<AdProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeMedia, setActiveMedia] = useState(0)
  const [showContact, setShowContact] = useState(false)

  useEffect(() => {
    if (!params.id) return
    setLoading(true)
    fetch(`/api/ad/${params.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setAd(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [params.id])

  const mediaItems: MediaItem[] = []
  if (ad) {
    if (ad.photos.length > 0) mediaItems.push({ type: 'photo', url: ad.photos[0] })
    for (const v of ad.videos) mediaItems.push({ type: 'video', url: v })
    for (let i = 1; i < ad.photos.length; i++) mediaItems.push({ type: 'photo', url: ad.photos[i] })
  }

  const goNext = useCallback(() => {
    setActiveMedia(prev => (prev < mediaItems.length - 1 ? prev + 1 : prev))
  }, [mediaItems.length])

  const goPrev = useCallback(() => {
    setActiveMedia(prev => (prev > 0 ? prev - 1 : prev))
  }, [])

  const { onTouchStart, onTouchMove, onTouchEnd, imgRef } = useSwipe(goNext, goPrev)

  useEffect(() => {
    const preload = (idx: number) => {
      if (idx >= 0 && idx < mediaItems.length && mediaItems[idx].type === 'photo') {
        const img = new Image()
        img.referrerPolicy = 'no-referrer'
        img.src = mediaItems[idx].url
      }
    }
    preload(activeMedia + 1)
    preload(activeMedia + 2)
    preload(activeMedia - 1)
  }, [activeMedia, mediaItems])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-velvet-400/30 border-t-velvet-400 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!ad) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-30">404</div>
          <button onClick={() => router.push('/')} className="px-6 py-2 rounded-xl bg-velvet-500/20 text-velvet-400 font-bold text-sm">
            ← Tahles
          </button>
        </div>
      </div>
    )
  }

  const hasPhysicalParams = Object.keys(ad.physicalParams).length > 0
  const currentMedia = mediaItems[activeMedia]
  const displayCity = ad.city ? translateCity(ad.city, locale) : null
  const displayLocation = ad.address || displayCity
  const displayRegion = ad.region ? translateCity(ad.region, locale) : null

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 glass">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-[900px] mx-auto">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <span className="text-sm font-bold">Tahles</span>
          </button>
        </div>
      </header>

      <main className="max-w-[900px] mx-auto px-4 sm:px-6 pb-32">

        {/* Swipeable Media Gallery */}
        <section className="pt-4 mb-6">
          <div
            className="relative w-full aspect-[3/4] max-h-[600px] rounded-3xl overflow-hidden bg-white/5 mb-3 select-none"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {mediaItems.length > 0 && currentMedia ? (
              currentMedia.type === 'video' ? (
                <video
                  key={currentMedia.url}
                  src={currentMedia.url}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <img
                  ref={imgRef}
                  src={currentMedia.url}
                  alt={ad.nickname}
                  className="w-full h-full object-cover will-change-transform"
                  draggable={false}
                  loading="eager"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const img = e.currentTarget
                    if (!img.dataset.retried) {
                      img.dataset.retried = '1'
                      img.src = currentMedia.url + (currentMedia.url.includes('?') ? '&' : '?') + 'r=1'
                    }
                  }}
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-white/10">
                {ad.nickname.charAt(0)}
              </div>
            )}

            {/* Online badge */}
            {ad.online_status && (
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-500/30">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-bold text-green-400">{t('online')}</span>
              </div>
            )}

            {/* Progress dots */}
            {mediaItems.length > 1 && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {mediaItems.map((item, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === activeMedia ? 'w-6 bg-white/80' : 'w-1.5 bg-white/20'
                    } ${item.type === 'video' ? 'bg-velvet-400/60' : ''}`}
                  />
                ))}
              </div>
            )}

            {/* Media counter */}
            {mediaItems.length > 1 && (
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                {currentMedia?.type === 'video' && (
                  <span className="px-2 py-1 rounded-md bg-velvet-500/30 text-velvet-300 text-[10px] font-bold uppercase">Video</span>
                )}
                <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-xs text-white/70 font-bold">
                  {activeMedia + 1} / {mediaItems.length}
                </span>
              </div>
            )}

            {/* Desktop click navigation */}
            <button onClick={(e) => { e.stopPropagation(); goPrev() }} className="absolute left-0 top-0 w-1/3 h-full opacity-0 cursor-pointer" aria-label="Previous" />
            <button onClick={(e) => { e.stopPropagation(); goNext() }} className="absolute right-0 top-0 w-1/3 h-full opacity-0 cursor-pointer" aria-label="Next" />
          </div>

          {/* Thumbnails */}
          {mediaItems.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {mediaItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setActiveMedia(i)}
                  className={`relative shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                    i === activeMedia ? 'border-velvet-400 scale-105' : 'border-white/10 opacity-50 hover:opacity-100'
                  }`}
                >
                  {item.type === 'video' ? (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white" opacity="0.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                  ) : (
                    <img src={item.url} alt="" className="w-full h-full object-cover" draggable={false} loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Name + Core Info */}
        <section className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            {ad.nickname}
            {ad.age && <span className="text-white/30 font-medium text-2xl ml-2">{ad.age}</span>}
          </h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-white/40">
            {displayLocation && <span className="flex items-center gap-1">📍 {displayLocation}</span>}
            {displayRegion && displayRegion !== displayCity && <span className="flex items-center gap-1">🏙️ {displayRegion}</span>}
            {ad.service_type && (
              <span className="px-2 py-0.5 rounded-md bg-white/5 text-white/50 text-xs font-bold uppercase">
                {translateServiceType(ad.service_type, locale)}
              </span>
            )}
          </div>
        </section>

        {/* Short Description */}
        {ad.shortDescription && (
          <section className="mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-sm text-white/60 italic">{ad.shortDescription}</p>
          </section>
        )}

        {/* About / Description */}
        {ad.description && (
          <section className="mb-8">
            <h2 className="text-xs font-black text-white/20 uppercase tracking-[0.2em] mb-3">{t('section_about')}</h2>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-sm text-white/60 leading-relaxed whitespace-pre-line">{ad.description}</p>
            </div>
          </section>
        )}

        {/* Physical Parameters */}
        {hasPhysicalParams && (
          <section className="mb-8">
            <h2 className="text-xs font-black text-white/20 uppercase tracking-[0.2em] mb-3">{t('info_details')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(ad.physicalParams).map(([key, val]) => {
                const displayVal = (key === 'ethnicity' || key === 'nationality') ? translateEthnicity(val, locale) : val
                return (
                  <div key={key} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="text-[10px] text-white/20 uppercase tracking-wider font-bold mb-1">
                      {PARAM_KEYS[key] ? t(PARAM_KEYS[key]) : key}
                    </div>
                    <div className="text-sm text-white/70 font-medium">{displayVal}</div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Services */}
        {ad.services.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-black text-white/20 uppercase tracking-[0.2em] mb-3">{t('info_services')}</h2>
            <div className="flex flex-wrap gap-2">
              {ad.services.map((s, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full bg-velvet-500/10 border border-velvet-500/20 text-velvet-300 text-xs font-bold">
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Price Table */}
        {ad.priceTable.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-black text-white/20 uppercase tracking-[0.2em] mb-3">{t('info_prices')}</h2>
            <div className="rounded-2xl overflow-hidden border border-white/[0.06]">
              {ad.priceTable.map((row, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-4 py-3 ${
                    i > 0 ? 'border-t border-white/[0.04]' : ''
                  } ${i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-white/[0.01]'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white/60">{row.duration}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/30 uppercase font-bold">{row.type}</span>
                  </div>
                  <span className="text-sm font-black text-velvet-400">{row.amount.toLocaleString()} ₪</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Price fallback */}
        {ad.priceTable.length === 0 && ad.price_min && (
          <section className="mb-8">
            <h2 className="text-xs font-black text-white/20 uppercase tracking-[0.2em] mb-3">{t('price')}</h2>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-2xl font-black text-velvet-400">
                {ad.price_min.toLocaleString()} ₪
              </span>
            </div>
          </section>
        )}

        {/* Extra info */}
        {(ad.payments || ad.parking) && (
          <section className="mb-8">
            <div className="flex gap-4">
              {ad.payments && (
                <div className="flex-1 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-[10px] text-white/20 uppercase tracking-wider font-bold mb-1">{t('section_payments')}</div>
                  <div className="text-sm text-white/60">{ad.payments}</div>
                </div>
              )}
              {ad.parking && (
                <div className="flex-1 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-[10px] text-white/20 uppercase tracking-wider font-bold mb-1">{t('section_parking')}</div>
                  <div className="text-sm text-white/60">{ad.parking}</div>
                </div>
              )}
            </div>
          </section>
        )}

      </main>

      {/* Fixed bottom Contact CTA */}
      {(ad.whatsapp || ad.phone) && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/95 to-transparent">
          <div className="max-w-[900px] mx-auto">
            <button
              onClick={() => setShowContact(true)}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-velvet-500 hover:bg-velvet-400 text-white font-black text-sm uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg shadow-velvet-500/25"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
              </svg>
              {t('contact_btn')}
            </button>
          </div>
        </div>
      )}

      {/* Contact Popup */}
      {showContact && (
        <ProfileContactPopup
          nickname={ad.nickname}
          whatsapp={ad.whatsapp}
          phone={ad.phone}
          telegram={ad.telegram}
          onClose={() => setShowContact(false)}
        />
      )}
    </div>
  )
}
