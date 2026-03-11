'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ResultRow } from '@/components/search/ResultRow'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { CATEGORIES, DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { translateCity } from '@/lib/i18n/translations'
import type { TranslationKey } from '@/lib/i18n/translations'

function TahlesLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#d85078" />
      <text x="20" y="27" textAnchor="middle" fontFamily="Inter,-apple-system,sans-serif" fontWeight="900" fontSize="19" fill="white" letterSpacing="-0.5">T</text>
      <text x="27.5" y="35" textAnchor="middle" fontSize="8" fill="white" opacity="0.9">★</text>
    </svg>
  )
}

interface Ad {
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
  price_table?: { type: string; amount: number; duration: string }[]
  physical_params?: Record<string, string>
  languages?: string[]
  category?: string | null
  score?: number
  score_category?: string | null
}

interface SearchMeta { total: number; page: number }

const CITIES: { key: TranslationKey; value: string }[] = [
  { key: 'city_tel_aviv',      value: 'Tel Aviv' },
  { key: 'city_jerusalem',     value: 'Jerusalem' },
  { key: 'city_haifa',         value: 'Haifa' },
  { key: 'city_bat_yam',       value: 'Bat Yam' },
  { key: 'city_rishon_lezion', value: 'Rishon LeZion' },
  { key: 'city_netanya',       value: 'Netanya' },
  { key: 'city_beer_sheva',    value: 'Beer Sheva' },
  { key: 'city_petah_tikva',   value: 'Petah Tikva' },
  { key: 'city_ramat_gan',     value: 'Ramat Gan' },
  { key: 'city_ashdod',        value: 'Ashdod' },
  { key: 'city_holon',         value: 'Holon' },
  { key: 'city_hadera',        value: 'Hadera' },
]

const PRICE_MIN = 0
const PRICE_MAX = 5000
const PRICE_STEP = 50

function fmtNum(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/* ── Cookie Banner ────────────────────────────────────────────────────────── */
function CookieBanner() {
  const { t } = useTranslation()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('tahles_cookie')
    if (!accepted) setShow(true)
  }, [])

  if (!show) return null

  const handle = (accept: boolean) => {
    localStorage.setItem('tahles_cookie', accept ? 'accepted' : 'declined')
    setShow(false)
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-[999] p-4 animate-slide-up">
      <div className="max-w-[600px] mx-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-surface-100/95 backdrop-blur-xl border border-white/[0.08] shadow-2xl">
        <span className="text-xs text-white/50 flex-1">{t('cookie_text')}</span>
        <button
          onClick={() => handle(true)}
          className="shrink-0 px-4 py-1.5 rounded-lg bg-velvet-500/20 text-velvet-300 text-xs font-bold hover:bg-velvet-500/30 transition-colors border border-velvet-500/25"
        >
          {t('cookie_accept')}
        </button>
        <button
          onClick={() => handle(false)}
          className="shrink-0 px-3 py-1.5 rounded-lg text-white/30 text-xs font-bold hover:text-white/50 transition-colors"
        >
          {t('cookie_decline')}
        </button>
      </div>
    </div>
  )
}

/* ── Rating System Block ──────────────────────────────────────────────────── */
function RatingBlock() {
  const { t } = useTranslation()
  return (
    <div className="mt-10 mb-6 p-6 rounded-2xl bg-gradient-to-br from-velvet-500/[0.06] to-transparent border border-velvet-500/[0.12]">
      <h3 className="text-sm font-black text-velvet-300 mb-2 flex items-center gap-2">
        <span>⭐</span> {t('rating_title')}
      </h3>
      <p className="text-xs text-white/40 mb-3 leading-relaxed">{t('rating_intro')}</p>
      <div className="space-y-1.5">
        {[
          { icon: '✅', key: 'rating_wa' as TranslationKey },
          { icon: '✅', key: 'rating_photos' as TranslationKey },
          { icon: '✅', key: 'rating_retouch' as TranslationKey },
          { icon: '❤️', key: 'rating_reviews' as TranslationKey },
        ].map((item) => (
          <div key={item.key} className="flex items-center gap-2 text-xs text-white/50">
            <span className="text-xs">{item.icon}</span>
            <span>{t(item.key)}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-white/30 leading-relaxed">{t('rating_outro')}</p>
    </div>
  )
}

/* ── Warning Block ────────────────────────────────────────────────────────── */
function WarningBlock() {
  const { t } = useTranslation()
  return (
    <div className="my-10 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/[0.08] via-amber-500/[0.04] to-amber-500/[0.08] border-2 border-amber-500/20">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">⚠️</span>
        <h4 className="text-base sm:text-lg font-black text-amber-400">{t('warning_title')}</h4>
      </div>
      <p className="text-sm text-white/50 leading-relaxed mb-2">{t('warning_text')}</p>
      <p className="text-sm text-amber-400/80 font-bold">{t('warning_money')}</p>
      <div className="mt-3 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
      <p className="mt-3 text-xs text-white/40 uppercase tracking-widest font-bold text-center">
        ↓ {t('signal_profiles')} ↓
      </p>
    </div>
  )
}

/* ── Scroll-to-Top Button ─────────────────────────────────────────────────── */
function ScrollToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!show) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-20 right-4 z-[998] w-11 h-11 rounded-full bg-velvet-500/20 backdrop-blur-xl border border-velvet-500/30 text-velvet-300 flex items-center justify-center shadow-lg hover:bg-velvet-500/30 transition-all animate-slide-up"
      aria-label="Scroll to top"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 15l-6-6-6 6"/>
      </svg>
    </button>
  )
}

/* ════════════════════════════════════════════════════════════════════════════ */

export default function HomePage() {
  const { t, locale } = useTranslation()
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState('')
  const activeSheet = 'all'
  const [activeCity, setActiveCity] = useState('')
  const activeOrigin = ''
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX])
  const [appliedPrice, setAppliedPrice] = useState<[number, number]>([PRICE_MIN, PRICE_MAX])
  const [meta, setMeta] = useState<SearchMeta>({ total: 0, page: 1 })
  const [userCity, setUserCity] = useState<string | null>(null)
  const userCityRef = useRef<string | null>(null)
  const [started, setStarted] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)
  const priceDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  /* Helper: translate a DB city value to display name */
  const cityLabel = (val: string): string => {
    return translateCity(val, locale)
  }

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
          )
          const data = await res.json()
          const city = data.address?.city || data.address?.town || data.address?.village || null
          if (city) { userCityRef.current = city; setUserCity(city) }
        } catch { }
      },
      () => { },
      { timeout: 5000 }
    )
  }, [])

  const fetchResults = useCallback(async (
    cat: string, sh: string, city: string, pMin: number, pMax: number, page = 1, origin = ''
  ) => {
    setLoading(true)
    setStarted(true)
    const params = new URLSearchParams()
    if (cat) params.set('category', cat)
    if (sh && sh !== 'all') params.set('sheet', sh)
    const cityParam = city || (sh === 'nearme' ? (userCityRef.current ?? '') : '')
    if (cityParam) params.set('city', cityParam)
    if (origin) params.set('ethnicity', origin)
    if (pMin > PRICE_MIN) params.set('price_min', String(pMin))
    if (pMax < PRICE_MAX) params.set('price_max', String(pMax))
    params.set('page', String(page))
    try {
      const res = await fetch(`/api/search?${params}`)
      if (!res.ok) { setAds([]); return }
      const json = await res.json()
      if (page === 1) setAds(json.data ?? [])
      else setAds((prev) => [...prev, ...(json.data ?? [])])
      setMeta({ total: json.total ?? 0, page })
    } catch {
      setAds([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResults('', 'all', '', PRICE_MIN, PRICE_MAX, 1, '')
  }, [fetchResults])

  const handleCategory = (slug: string) => {
    const next = activeCategory === slug ? '' : slug
    setActiveCategory(next)
    fetchResults(next, 'all', activeCity, appliedPrice[0], appliedPrice[1], 1, activeOrigin)
  }

  const handleCity = (city: string) => {
    const next = activeCity === city ? '' : city
    setActiveCity(next)
    fetchResults(activeCategory, activeSheet, next, appliedPrice[0], appliedPrice[1], 1, activeOrigin)
  }

  const handlePriceChange = (idx: 0 | 1, val: number) => {
    const next: [number, number] = [...priceRange] as [number, number]
    next[idx] = val
    // Prevent crossing
    if (idx === 0 && val > priceRange[1]) next[1] = val
    if (idx === 1 && val < priceRange[0]) next[0] = val
    setPriceRange(next)
    // Debounce the API call
    if (priceDebounce.current) clearTimeout(priceDebounce.current)
    priceDebounce.current = setTimeout(() => {
      setAppliedPrice(next)
      fetchResults(activeCategory, activeSheet, activeCity, next[0], next[1], 1, activeOrigin)
    }, 500)
  }

  const handleReset = () => {
    setActiveCategory('')
    setActiveCity('')
    setPriceRange([PRICE_MIN, PRICE_MAX])
    setAppliedPrice([PRICE_MIN, PRICE_MAX])
    fetchResults('', 'all', '', PRICE_MIN, PRICE_MAX, 1, '')
  }

  const hasPriceFilter = appliedPrice[0] > PRICE_MIN || appliedPrice[1] < PRICE_MAX
  const hasActiveFilters = activeCategory || activeCity || hasPriceFilter
  const leftPercent = ((priceRange[0] - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100
  const rightPercent = ((priceRange[1] - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      <header className="sticky top-0 z-50 glass">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-[1100px] mx-auto">
          <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={handleReset}>
            <TahlesLogo size={30} />
            <span className="text-lg font-bold bg-gradient-to-r from-velvet-400 to-velvet-300 bg-clip-text text-transparent">
              Tahles
            </span>
          </div>
          <div className="flex items-center gap-3">
            {started && meta.total > 0 && (
              <span className="hidden sm:block text-xs font-black text-white/40 uppercase tracking-widest tabular-nums">
                {fmtNum(meta.total)} {t('profiles')}
              </span>
            )}
            {userCity && (
              <span className="hidden sm:flex items-center gap-1 text-xs text-white/25">
                📍 {cityLabel(userCity)}
              </span>
            )}
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 pb-20">

        {/* ── Hero Section ─────────────────────────────────────────────── */}
        <section className="mt-5 mb-2">
          <p className="text-sm sm:text-base font-bold text-white/70 leading-relaxed">
            {t('hero_line1')}
          </p>
          <p className="text-xs sm:text-sm text-white/40 mt-1 leading-relaxed">
            {t('hero_line2')}
          </p>
          <p className="text-xs sm:text-xs text-white/25 mt-1 leading-relaxed">
            {t('hero_line3')}
          </p>
        </section>

        {/* ── Categories ────────────────────────────────────────────────── */}
        <section className="mt-2 mb-2">
          <div className="text-xs text-white/50 uppercase tracking-[0.2em] font-black mb-1.5">{t('category')}</div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.slug
              return (
                <button
                  key={cat.slug}
                  onClick={() => handleCategory(cat.slug)}
                  className={`
                    shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold
                    transition-all duration-150 touch-manipulation whitespace-nowrap
                    ${isActive
                      ? 'bg-velvet-500/25 border-velvet-500/50 border text-velvet-300'
                      : 'bg-white/[0.04] border border-white/[0.07] text-white/50 hover:text-white hover:bg-white/[0.08]'}
                  `}
                >
                  <span>{cat.icon}</span>
                  <span>{t(`cat_${cat.slug}` as any) || cat.name}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* ── Cities ───────────────────────────────────────────────────── */}
        <section className="mb-2">
          <div className="text-xs text-white/50 uppercase tracking-[0.2em] font-black mb-1.5">{t('city')}</div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => handleCity('')}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-150 touch-manipulation whitespace-nowrap
                ${!activeCity ? 'bg-velvet-500/25 border-velvet-500/50 border text-velvet-300' : 'bg-white/[0.04] border border-white/[0.07] text-white/50 hover:text-white hover:bg-white/[0.08]'}`}
            >
              🌍 {t('all_cities')}
            </button>
            {CITIES.map((c) => (
              <button
                key={c.value}
                onClick={() => handleCity(c.value)}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-150 touch-manipulation whitespace-nowrap
                  ${activeCity === c.value ? 'bg-velvet-500/25 border-velvet-500/50 border text-velvet-300' : 'bg-white/[0.04] border border-white/[0.07] text-white/50 hover:text-white hover:bg-white/[0.08]'}`}
              >
                {t(c.key)}
              </button>
            ))}
          </div>
        </section>

        {/* ── Price Range Slider ───────────────────────────────────────── */}
        <section className="mb-2 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-white/50 uppercase tracking-[0.2em] font-black">{t('price_range')}</div>
            <div className="text-sm font-bold text-velvet-300 tabular-nums">
              {priceRange[0] === PRICE_MIN && priceRange[1] === PRICE_MAX
                ? t('any_price')
                : `${fmtNum(priceRange[0])} — ${fmtNum(priceRange[1])} ₪`
              }
            </div>
          </div>
          <div className="relative h-8 flex items-center">
            {/* Track background */}
            <div className="absolute inset-x-0 h-1.5 rounded-full bg-white/[0.08]" />
            {/* Active range highlight */}
            <div
              className="absolute h-1.5 rounded-full bg-gradient-to-r from-velvet-500 to-velvet-400"
              style={{ left: `${leftPercent}%`, right: `${100 - rightPercent}%` }}
            />
            {/* Min slider */}
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              value={priceRange[0]}
              onChange={(e) => handlePriceChange(0, Number(e.target.value))}
              className="price-slider absolute inset-x-0"
            />
            {/* Max slider */}
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              value={priceRange[1]}
              onChange={(e) => handlePriceChange(1, Number(e.target.value))}
              className="price-slider absolute inset-x-0"
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-white/40 font-bold tabular-nums">
            <span>{PRICE_MIN} ₪</span>
            <span>{fmtNum(PRICE_MAX)}+ ₪</span>
          </div>
        </section>

        {/* ── How Tahles Works (small text after filters) ──────────────── */}
        <div className="mb-3 px-1">
          <p className="text-xs text-white/40 leading-relaxed">
            <span className="font-bold text-white/30">{t('how_title')}</span>
            {' · '}
            {t('how_text')}
          </p>
        </div>

        {/* ── Active filters + count ────────────────────────────────── */}
        <div ref={resultsRef} className="scroll-mt-20">
          {started && (
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <span className="text-xs font-black text-white/50 uppercase tracking-[0.2em]">
                {loading ? '…' : fmtNum(meta.total)} {t('results') || 'results'}
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {activeCategory && (
                  <button onClick={() => handleCategory(activeCategory)} className="text-xs px-2.5 py-1 rounded-full bg-velvet-500/15 text-velvet-300 font-bold border border-velvet-500/25 flex items-center gap-1">
                    {CATEGORIES.find(c => c.slug === activeCategory)?.icon} {t(`cat_${activeCategory}` as any)} ✕
                  </button>
                )}
                {activeCity && (
                  <button onClick={() => handleCity(activeCity)} className="text-xs px-2.5 py-1 rounded-full bg-velvet-500/15 text-velvet-300 font-bold border border-velvet-500/25 flex items-center gap-1">
                    📍 {cityLabel(activeCity)} ✕
                  </button>
                )}
                {hasPriceFilter && (
                  <button onClick={() => { setPriceRange([PRICE_MIN, PRICE_MAX]); setAppliedPrice([PRICE_MIN, PRICE_MAX]); fetchResults(activeCategory, activeSheet, activeCity, PRICE_MIN, PRICE_MAX, 1, activeOrigin) }} className="text-xs px-2.5 py-1 rounded-full bg-velvet-500/15 text-velvet-300 font-bold border border-velvet-500/25 flex items-center gap-1">
                    💰 {appliedPrice[0]}–{appliedPrice[1]} ₪ ✕
                  </button>
                )}
              </div>
              {hasActiveFilters && (
                <button onClick={handleReset} className="text-xs font-bold text-white/20 hover:text-velvet-400 transition-colors ml-auto uppercase tracking-widest">
                  {t('reset_filters')}
                </button>
              )}
            </div>
          )}

          {loading && ads.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-white/[0.03] border border-white/[0.05] p-5 h-[160px] animate-pulse">
                  <div className="flex gap-4 mb-4">
                    <div className="w-20 h-20 rounded-2xl bg-white/5" />
                    <div className="flex-1 flex flex-col justify-center gap-2">
                      <div className="h-4 bg-white/10 rounded-md w-32" />
                      <div className="h-3 bg-white/5 rounded-md w-20" />
                    </div>
                  </div>
                  <div className="h-10 bg-white/5 rounded-xl w-full" />
                </div>
              ))}
            </div>
          )}

          {started && !loading && ads.length === 0 && (
            <div className="text-center py-24 bg-white/[0.02] rounded-3xl border border-white/[0.04]">
              <div className="text-5xl mb-4 opacity-30">🔍</div>
              <p className="text-white/30 text-sm font-bold mb-5">{t('no_results')}</p>
              <button onClick={handleReset} className="px-6 py-2.5 rounded-full bg-velvet-500/10 text-velvet-400 font-bold text-xs uppercase tracking-widest hover:bg-velvet-500/20 transition-all border border-velvet-500/20">
                {t('reset_filters')}
              </button>
            </div>
          )}

          {ads.length > 0 && (() => {
            // Find where HOT profiles end
            const hotEndIdx = ads.findIndex(ad => (ad.score_category ?? 'HOT') !== 'HOT')
            const hasNonHot = hotEndIdx > 0 && hotEndIdx < ads.length

            return (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(hasNonHot ? ads.slice(0, hotEndIdx) : ads).map((ad, i) => (
                    <ResultRow key={ad.id} rank={(meta.page - 1) * DEFAULT_PAGE_SIZE + i + 1} {...ad} />
                  ))}
                </div>

                {/* Warning separator after HOT profiles */}
                {hasNonHot && <WarningBlock />}

                {hasNonHot && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {ads.slice(hotEndIdx).map((ad, i) => (
                      <ResultRow key={ad.id} rank={(meta.page - 1) * DEFAULT_PAGE_SIZE + hotEndIdx + i + 1} {...ad} />
                    ))}
                  </div>
                )}
              </>
            )
          })()}

          {!loading && ads.length > 0 && ads.length < meta.total && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => fetchResults(activeCategory, activeSheet, activeCity, appliedPrice[0], appliedPrice[1], meta.page + 1, activeOrigin)}
                className="group relative px-10 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs font-black uppercase tracking-[0.2em] text-white/40 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.2] transition-all overflow-hidden"
              >
                <div className="relative z-10 flex items-center gap-3">
                  {t('load_more')} <span className="text-velvet-400">{fmtNum(meta.total - ads.length)}</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-velvet-500/0 via-velvet-500/5 to-velvet-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>
            </div>
          )}

          {loading && ads.length > 0 && (
            <div className="flex justify-center mt-8">
              <div className="w-6 h-6 border-2 border-velvet-400/30 border-t-velvet-400 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* ── Rating System Block (after verified profiles) ────────────── */}
        {started && !loading && ads.length > 0 && (
          <RatingBlock />
        )}

        {/* Warning now appears inline between HOT and non-HOT profiles */}

        <div className="mt-8 border-t border-white/[0.05] pt-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 opacity-30 hover:opacity-70 transition-opacity cursor-pointer" onClick={handleReset}>
            <TahlesLogo size={20} />
            <span className="text-xs text-white/50 font-black uppercase tracking-[0.3em]">Tahles</span>
          </div>
          {started && (
            <div className="text-xs text-white/20 font-black uppercase tracking-widest tabular-nums">
              {t('showing')} <span className="text-white/35">{ads.length}</span> {t('of')} <span className="text-white/35">{fmtNum(meta.total)}</span>
            </div>
          )}
        </div>
      </main>

      {/* ── Cookie Consent ──────────────────────────────────────────────── */}
      <CookieBanner />
      <ScrollToTop />
    </div>
  )
}
