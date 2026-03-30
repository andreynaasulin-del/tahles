'use client'

import { useEffect, useRef, useState } from 'react'
import { ResultRow } from '@/components/search/ResultRow'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { PublishCTA } from '@/components/PublishCTA'
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
  description?: string | null
  category?: string | null
  score?: number
  score_category?: string | null
}

interface SignalStats {
  total: number
  added24h: number
  waVerified: number
  demand: 'low' | 'medium' | 'high'
}

const SUPPORT_WA = '972000000000' // TODO: replace with real WhatsApp number
const SUPPORT_TG = 'tahles_support'

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

/* ── See More CTA ────────────────────────────────────────────────────────── */
function SeeMoreCTA() {
  const { t } = useTranslation()
  const msg = encodeURIComponent(t('see_more_msg'))

  return (
    <section className="mt-10 mb-6 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-velvet-500/[0.1] via-velvet-500/[0.04] to-transparent border border-velvet-500/[0.2]">
      <div className="text-center mb-6">
        <h3 className="text-lg sm:text-xl font-black text-white mb-2">{t('see_more_title')}</h3>
        <p className="text-sm text-white/50">{t('see_more_subtitle')}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        {/* WhatsApp */}
        <a
          href={`https://wa.me/${SUPPORT_WA}?text=${msg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-3 px-5 py-4 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 transition-all active:scale-[0.98] group"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          <span className="text-sm font-bold text-[#25D366]">{t('see_more_wa')}</span>
        </a>

        {/* Telegram */}
        <a
          href={`https://t.me/${SUPPORT_TG}?text=${msg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-3 px-5 py-4 rounded-xl bg-[#2AABEE]/15 hover:bg-[#2AABEE]/25 border border-[#2AABEE]/30 transition-all active:scale-[0.98] group"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#2AABEE"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
          <span className="text-sm font-bold text-[#2AABEE]">{t('see_more_tg')}</span>
        </a>
      </div>
    </section>
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

const MAX_PROFILES = 8

export default function HomePage() {
  const { t, locale } = useTranslation()
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [signalStats, setSignalStats] = useState<SignalStats | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => setSignalStats(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setStarted(true)

    const params = new URLSearchParams()
    params.set('page', '1')
    // Fetch enough to find profiles with video across all quality tiers
    params.set('limit', '100')

    fetch(`/api/search?${params}`, { signal: controller.signal })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(json => {
        const all: Ad[] = json.data ?? []
        // Sort: profiles with video first, then by original quality order
        const sorted = [...all].sort((a, b) => {
          const aHasVideo = (a.videos?.length ?? 0) > 0 ? 1 : 0
          const bHasVideo = (b.videos?.length ?? 0) > 0 ? 1 : 0
          return bHasVideo - aHasVideo
        })
        setAds(sorted.slice(0, MAX_PROFILES))
      })
      .catch(err => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setAds([])
      })
      .finally(() => {
        if (abortRef.current === controller) setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      <header className="sticky top-0 z-50 glass">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-[1100px] mx-auto">
          <div className="flex items-center gap-2.5 cursor-pointer select-none">
            <TahlesLogo size={30} />
            <span className="text-lg font-bold bg-gradient-to-r from-velvet-400 to-velvet-300 bg-clip-text text-transparent">
              Tahles
            </span>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 pb-20">

        {/* ── Hero + Stats Marquee ─────────────────────────────────────── */}
        <section className="mt-4 mb-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
          <div className="px-5 py-4">
            <h1 className="text-lg font-black text-velvet-300">{t('hero_line1')}</h1>
            <p className="text-sm text-white/50 mt-1">{t('hero_line2')}</p>
          </div>
          {signalStats && signalStats.total > 0 && (
            <div className="overflow-hidden border-t border-white/[0.06] py-3">
              <div className="marquee-track flex whitespace-nowrap">
                {[0, 1].map((dup) => (
                  <span key={dup} className="inline-flex items-center gap-8 px-8 text-sm font-bold shrink-0">
                    <span className="text-white/70">👤 {fmtNum(signalStats.total)} {t('signal_profiles')}</span>
                    <span className="text-white/20">✦</span>
                    <span className="text-white/70">🔍 {fmtNum(signalStats.added24h)} {t('signal_added_24h')}</span>
                    <span className="text-white/20">✦</span>
                    <span className="text-white/70">✔ {fmtNum(signalStats.waVerified)} {t('signal_wa_verified')}</span>
                    <span className="text-white/20">✦</span>
                    <span className={signalStats.demand === 'high' ? 'text-green-400' : signalStats.demand === 'medium' ? 'text-yellow-400' : 'text-white/50'}>
                      📊 {t(`signal_demand_${signalStats.demand}` as TranslationKey)} {t('signal_demand')}
                    </span>
                    <span className="text-white/20">✦</span>
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="border-t border-white/[0.06] px-5 py-3">
            <span className="font-black text-white/80">{t('how_title')}</span>
            <span className="text-white/40">{' — '}</span>
            <span className="text-sm text-white/50">{t('how_text')}</span>
          </div>
        </section>

        {/* ── Publish CTA ──────────────────────────────────────────────── */}
        <PublishCTA />

        {/* ── Results ──────────────────────────────────────────────────── */}
        <div className="mt-4">
          {loading && ads.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: MAX_PROFILES }).map((_, i) => (
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
              <p className="text-white/30 text-sm font-bold">{t('no_results')}</p>
            </div>
          )}

          {ads.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ads.map((ad, i) => (
                <ResultRow key={ad.id} rank={i + 1} priority={i < 4} {...ad} />
              ))}
            </div>
          )}

          {/* ── See More CTA ─────────────────────────────────────────── */}
          {started && !loading && ads.length > 0 && (
            <SeeMoreCTA />
          )}
        </div>

      </main>

      <footer className="mt-4 pb-4 px-4">
        <div className="text-center text-[10px] text-white/10">
          &copy; {new Date().getFullYear()} Tahles
        </div>
      </footer>

      {/* ── Cookie Consent ──────────────────────────────────────────────── */}
      <CookieBanner />
      <ScrollToTop />
    </div>
  )
}
