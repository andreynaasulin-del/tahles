'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ResultRow } from '@/components/search/ResultRow'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { CATEGORIES, SHEETS } from '@/lib/constants'

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
}

interface SearchMeta { total: number; page: number; query: string; sheet: string }

// Иконки для листов
const SHEET_ICONS: Record<string, string> = {
  all: '🔥',
  verified: '✅',
  vip: '👑',
  under25: '🌟',
  '40plus': '💎',
  outcall: '🚗',
  nearme: '📍',
}

export default function HomePage() {
  const { t } = useTranslation()
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState('')
  const [activeSheet, setActiveSheet] = useState('')
  const [meta, setMeta] = useState<SearchMeta>({ total: 0, page: 1, query: '', sheet: '' })
  const [userCity, setUserCity] = useState<string | null>(null)
  const [started, setStarted] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  const scrollToResults = () => {
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  // ── Geolocation ──────────────────────────────────────────────────────────
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
          if (city) setUserCity(city)
        } catch { /* silent */ }
      },
      () => { },
      { timeout: 5000 }
    )
  }, [])

  const fetchResults = useCallback(async (cat: string, sh: string, page = 1) => {
    setLoading(true)
    setStarted(true)
    const params = new URLSearchParams()
    if (cat) params.set('sheet', cat)
    if (sh) params.set('sheet', sh)
    if (userCity) params.set('city', userCity)
    params.set('page', String(page))
    try {
      const res = await fetch(`/api/search?${params}`)
      if (!res.ok) { setAds([]); return }
      const json = await res.json()
      if (page === 1) setAds(json.data ?? [])
      else setAds((prev) => [...prev, ...(json.data ?? [])])
      setMeta({ total: json.total ?? 0, page, query: '', sheet: sh || cat })
    } catch {
      setAds([])
    } finally {
      setLoading(false)
    }
  }, [userCity])

  const handleCategory = (slug: string) => {
    const next = activeCategory === slug ? '' : slug
    setActiveCategory(next)
    setActiveSheet('')
    if (next) {
      fetchResults(next, '', 1)
      scrollToResults()
    } else {
      setStarted(false)
      setAds([])
    }
  }

  const handleSheet = (id: string) => {
    const next = activeSheet === id ? '' : id
    setActiveSheet(next)
    setActiveCategory('')
    if (next) {
      fetchResults('', next, 1)
      scrollToResults()
    } else {
      setStarted(false)
      setAds([])
    }
  }

  const handleReset = () => {
    setActiveCategory('')
    setActiveSheet('')
    setStarted(false)
    setAds([])
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-[1100px] mx-auto">
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={handleReset}
          >
            <TahlesLogo size={30} />
            <span className="text-lg font-bold bg-gradient-to-r from-velvet-400 to-velvet-300 bg-clip-text text-transparent">
              Tahles
            </span>
          </div>
          <div className="flex items-center gap-3">
            {userCity && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-white/30">
                <span>📍</span>
                {userCity}
              </span>
            )}
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 pb-20">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="pt-10 sm:pt-16 pb-8 sm:pb-10 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold mb-3 leading-tight whitespace-pre-line">
            <span className="bg-gradient-to-r from-velvet-300 via-velvet-400 to-velvet-500 bg-clip-text text-transparent">
              {t('app_tagline')}
            </span>
          </h1>
          <p className="text-sm text-white/35 max-w-xs mx-auto">
            {t('app_subtitle')}
          </p>
        </section>

        {/* ── Категории ────────────────────────────────────────────────── */}
        <section className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] text-white/30 uppercase tracking-[0.2em] font-medium">
              {t('category')}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.slug
              return (
                <button
                  key={cat.slug}
                  onClick={() => handleCategory(cat.slug)}
                  className={`
                    group relative flex items-center gap-3 px-4 py-4 sm:py-5 rounded-xl
                    transition-all duration-200 text-left
                    ${isActive
                      ? 'bg-velvet-500/20 border-velvet-500/50 border shadow-lg shadow-velvet-500/10'
                      : 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15]'}
                  `}
                >
                  <span className="text-2xl sm:text-3xl transition-transform duration-200 group-hover:scale-110">
                    {cat.icon}
                  </span>
                  <span className={`text-sm sm:text-base font-semibold transition-colors ${isActive ? 'text-velvet-300' : 'text-white/80 group-hover:text-white'}`}>
                    {cat.name}
                  </span>
                  {isActive && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-velvet-400 animate-data-pulse" />
                  )}
                </button>
              )
            })}
          </div>
        </section>

        {/* ── Листы — кубики ───────────────────────────────────────────── */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] text-white/30 uppercase tracking-[0.2em] font-medium">
              {t('sheets')}
            </span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {SHEETS.map((s) => {
              const isActive = activeSheet === s.id
              const icon = SHEET_ICONS[s.id] ?? '✨'
              return (
                <button
                  key={s.id}
                  onClick={() => handleSheet(s.id)}
                  className={`
                    group flex flex-col items-center justify-center gap-1.5
                    aspect-square rounded-xl text-center transition-all duration-200
                    ${isActive
                      ? 'bg-velvet-500/25 border-velvet-400/60 border shadow-lg shadow-velvet-500/15 scale-[1.03]'
                      : 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.2] hover:scale-[1.02]'}
                  `}
                >
                  <span className="text-xl sm:text-2xl">{icon}</span>
                  <span className={`text-[10px] sm:text-[11px] font-semibold leading-tight px-1 ${isActive ? 'text-velvet-300' : 'text-white/50 group-hover:text-white/80'} transition-colors`}>
                    {s.label}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* ── Активный фильтр ──────────────────────────────────────────── */}
        <div ref={resultsRef} className="scroll-mt-20">
          {started && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-xs text-white/25 uppercase tracking-widest">
                {t('results')}: {meta.total.toLocaleString()}
              </span>
              {activeCategory && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-velvet-500/20 text-velvet-300 font-medium">
                  {CATEGORIES.find(c => c.slug === activeCategory)?.icon}{' '}
                  {CATEGORIES.find(c => c.slug === activeCategory)?.name}
                </span>
              )}
              {activeSheet && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-velvet-500/20 text-velvet-300 font-medium">
                  {SHEET_ICONS[activeSheet]} {SHEETS.find(s => s.id === activeSheet)?.label}
                </span>
              )}
              <button
                onClick={handleReset}
                className="text-xs text-white/25 hover:text-white/50 transition-colors ml-auto"
              >
                ✕ {t('reset_filters')}
              </button>
            </div>
          )}

          {/* ── Результаты — скелетон ────────────────────────────────────── */}
          {loading && ads.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-5 animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-white/10" />
                    <div className="flex-1">
                      <div className="h-4 bg-white/10 rounded w-24 mb-2" />
                      <div className="h-3 bg-white/5 rounded w-16" />
                    </div>
                    <div className="h-4 bg-white/10 rounded w-16" />
                  </div>
                  <div className="h-3 bg-white/5 rounded w-full mb-2" />
                  <div className="h-3 bg-white/5 rounded w-3/4" />
                </div>
              ))}
            </div>
          )}

          {/* ── Нет результатов ──────────────────────────────────────────── */}
          {started && !loading && ads.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-white/30 text-sm">{t('no_results')}</p>
              <button
                onClick={handleReset}
                className="mt-4 text-xs text-velvet-400 hover:text-velvet-300 transition-colors"
              >
                {t('reset_filters')}
              </button>
            </div>
          )}

          {/* ── Профили ──────────────────────────────────────────────────── */}
          {ads.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ads.map((ad, i) => (
                <ResultRow key={ad.id} rank={(meta.page - 1) * 20 + i + 1} {...ad} />
              ))}
            </div>
          )}

          {/* ── Загрузить ещё ────────────────────────────────────────────── */}
          {!loading && ads.length > 0 && ads.length < meta.total && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => fetchResults(activeCategory, activeSheet, meta.page + 1)}
                className="px-8 py-3 rounded-full bg-white/[0.06] border border-white/[0.1] text-sm text-white/50 hover:bg-white/[0.1] hover:text-white/80 transition-all"
              >
                {t('load_more')} — {(meta.total - ads.length).toLocaleString()} {t('remaining')}
              </button>
            </div>
          )}

        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="mt-16 border-t border-white/[0.06] pt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TahlesLogo size={16} />
            <span className="text-xs text-white/20 font-medium uppercase tracking-widest">
              Tahles
            </span>
          </div>
          {started && ads.length > 0 && (
            <div className="text-xs text-white/20 tabular-nums">
              {t('showing')} {ads.length} {t('of')} {meta.total.toLocaleString()}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
