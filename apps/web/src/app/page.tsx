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
  photos?: string[]
  whatsapp?: string | null
  created_at?: string | null
  comments_count?: number
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

import { DEFAULT_PAGE_SIZE } from '@/lib/constants'

export default function HomePage() {
  const { t } = useTranslation()
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState('')
  const [activeSheet, setActiveSheet] = useState('all')
  const [meta, setMeta] = useState<SearchMeta>({ total: 0, page: 1, query: '', sheet: 'all' })
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
    if (cat) params.set('category', cat)
    if (sh && sh !== 'all') params.set('sheet', sh)
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

  // Initial fetch
  useEffect(() => {
    fetchResults('', 'all', 1)
  }, [fetchResults])

  const handleCategory = (slug: string) => {
    const next = activeCategory === slug ? '' : slug
    setActiveCategory(next)
    setActiveSheet(next ? '' : 'all')
    fetchResults(next, next ? '' : 'all', 1)
    if (next) scrollToResults()
  }

  const handleSheet = (id: string) => {
    const next = activeSheet === id && id !== 'all' ? 'all' : id
    setActiveSheet(next)
    setActiveCategory('')
    fetchResults('', next, 1)
    if (next !== 'all') scrollToResults()
  }

  const handleReset = () => {
    setActiveCategory('')
    setActiveSheet('all')
    fetchResults('', 'all', 1)
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
            <span className="bg-gradient-to-r from-velvet-300 via-velvet-400 to-velvet-500 bg-clip-text text-transparent uppercase tracking-tight">
              {t('app_tagline')}
            </span>
          </h1>
          <p className="text-sm text-white/35 max-w-xs mx-auto font-medium">
            {t('app_subtitle')}
          </p>
        </section>

        {/* ── Категории ────────────────────────────────────────────────── */}
        <section className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] text-white/30 uppercase tracking-[0.2em] font-black">
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
                    group relative flex items-center gap-3 px-4 py-4 sm:py-5 rounded-2xl
                    transition-all duration-300 text-left overflow-hidden
                    ${isActive
                      ? 'bg-velvet-500/20 border-velvet-500/50 border shadow-2xl shadow-velvet-500/20 scale-[1.02]'
                      : 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12]'}
                  `}
                >
                  <span className="text-2xl sm:text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    {cat.icon}
                  </span>
                  <span className={`text-sm sm:text-base font-bold tracking-tight transition-colors ${isActive ? 'text-velvet-300' : 'text-white/60 group-hover:text-white'}`}>
                    {cat.name}
                  </span>
                  {isActive && (
                    <div className="absolute -right-4 -bottom-4 w-12 h-12 rounded-full bg-velvet-500/20 blur-xl animate-pulse" />
                  )}
                </button>
              )
            })}
          </div>
        </section>

        {/* ── Листы — кубики ───────────────────────────────────────────── */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] text-white/30 uppercase tracking-[0.2em] font-black">
              {t('sheets')}
            </span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
            {SHEETS.map((s) => {
              const isActive = activeSheet === s.id
              const icon = SHEET_ICONS[s.id] ?? '✨'
              return (
                <button
                  key={s.id}
                  onClick={() => handleSheet(s.id)}
                  className={`
                    group flex flex-col items-center justify-center gap-1.5
                    aspect-square rounded-2xl text-center transition-all duration-300
                    ${isActive
                      ? 'bg-velvet-500/30 border-velvet-400/70 border shadow-2xl shadow-velvet-500/20 scale-[1.05]'
                      : 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.07] hover:border-white/[0.15] hover:scale-[1.03]'}
                  `}
                >
                  <span className="text-xl sm:text-2xl transition-transform duration-300 group-hover:scale-110">{icon}</span>
                  <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-tighter leading-tight px-1 ${isActive ? 'text-velvet-300' : 'text-white/40 group-hover:text-white/80'} transition-colors`}>
                    {s.label}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* ── Активный фильтр ──────────────────────────────────────────── */}
        <div ref={resultsRef} className="scroll-mt-24">
          {started && (
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                {t('results')}: {meta.total.toLocaleString()}
              </span>
              <div className="flex gap-2">
                {activeCategory && (
                  <span className="text-[10px] px-3 py-1 rounded-full bg-velvet-500/20 text-velvet-300 font-bold uppercase tracking-wider border border-velvet-500/30 shadow-sm shadow-velvet-500/10">
                    {CATEGORIES.find(c => c.slug === activeCategory)?.icon}{' '}
                    {CATEGORIES.find(c => c.slug === activeCategory)?.name}
                  </span>
                )}
                {activeSheet && activeSheet !== 'all' && (
                  <span className="text-[10px] px-3 py-1 rounded-full bg-velvet-500/20 text-velvet-300 font-bold uppercase tracking-wider border border-velvet-500/30 shadow-sm shadow-velvet-500/10">
                    {SHEET_ICONS[activeSheet]} {SHEETS.find(s => s.id === activeSheet)?.label}
                  </span>
                )}
              </div>
              <button
                onClick={handleReset}
                className="text-[10px] font-bold text-white/20 hover:text-velvet-400 transition-colors ml-auto uppercase tracking-widest border-b border-white/5 hover:border-velvet-400/40"
              >
                ✕ {t('reset_filters')}
              </button>
            </div>
          )}

          {/* ── Результаты — скелетон ────────────────────────────────────── */}
          {loading && ads.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-white/[0.03] border border-white/[0.05] p-5 h-[160px] animate-pulse">
                  <div className="flex gap-4 mb-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/5" />
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

          {/* ── Нет результатов ──────────────────────────────────────────── */}
          {started && !loading && ads.length === 0 && (
            <div className="text-center py-24 bg-white/[0.02] rounded-3xl border border-white/[0.04]">
              <div className="text-6xl mb-6 opacity-40">🔍</div>
              <p className="text-white/30 text-base font-bold tracking-tight mb-6">{t('no_results')}</p>
              <button
                onClick={handleReset}
                className="px-8 py-3 rounded-full bg-velvet-500/10 text-velvet-400 font-bold text-xs uppercase tracking-widest hover:bg-velvet-500/20 transition-all border border-velvet-500/20"
              >
                {t('reset_filters')}
              </button>
            </div>
          )}

          {/* ── Профили ──────────────────────────────────────────────────── */}
          {ads.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ads.map((ad, i) => (
                <ResultRow key={ad.id} rank={(meta.page - 1) * DEFAULT_PAGE_SIZE + i + 1} {...ad} />
              ))}
            </div>
          )}

          {/* ── Загрузить ещё ────────────────────────────────────────────── */}
          {!loading && ads.length > 0 && ads.length < meta.total && (
            <div className="flex justify-center mt-12">
              <button
                onClick={() => fetchResults(activeCategory, activeSheet, meta.page + 1)}
                className="group relative px-10 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs font-black uppercase tracking-[0.2em] text-white/40 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.2] transition-all overflow-hidden"
              >
                <div className="relative z-10 flex items-center gap-3">
                  {t('load_more')} <span className="text-velvet-400">{(meta.total - ads.length)}</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-velvet-500/0 via-velvet-500/5 to-velvet-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>
            </div>
          )}

        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="mt-20 border-t border-white/[0.05] pt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 group opacity-40 hover:opacity-100 transition-opacity">
            <TahlesLogo size={24} />
            <span className="text-sm text-white/50 font-black uppercase tracking-[0.3em]">
              Tahles
            </span>
          </div>
          {started && ads.length > 0 && (
            <div className="text-[10px] text-white/20 font-black uppercase tracking-widest tabular-nums bg-white/[0.03] px-4 py-2 rounded-full border border-white/[0.05]">
              {t('showing')} <span className="text-white/40">{ads.length}</span> {t('of')} <span className="text-white/40">{meta.total.toLocaleString()}</span>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
