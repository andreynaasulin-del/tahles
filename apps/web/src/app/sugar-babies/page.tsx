'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { SugarBabyCard } from '@/components/ads/SugarBabyCard'
import type { SugarBabyCardProps } from '@/components/ads/SugarBabyCard'

const PAGE_SIZE = 20

const HAIR_OPTIONS = [
  { label: 'Все', value: '' },
  { label: 'Блондинка', value: 'blonde' },
  { label: 'Брюнетка', value: 'brunette' },
  { label: 'Рыжая', value: 'red' },
  { label: 'Шатенка', value: 'brown' },
]

interface ApiAd {
  id: string
  nickname: string
  age: number | null
  city: string | null
  photos: string[]
  description: string | null
  telegram: string | null
  whatsapp: string | null
  raw_data: Record<string, unknown> | null
}

export default function SugarBabiesPage() {
  const [ads, setAds] = useState<SugarBabyCardProps[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)

  // filters
  const [hairColor, setHairColor] = useState('')
  const [hasVideo, setHasVideo] = useState(false)
  const [ageMin, setAgeMin] = useState('')
  const [ageMax, setAgeMax] = useState('')

  const abortRef = useRef<AbortController | null>(null)

  const fetchAds = useCallback(
    async (pageNum: number, append: boolean) => {
      abortRef.current?.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl

      setLoading(true)
      try {
        const params = new URLSearchParams({
          category: 'sugar_baby',
          page: String(pageNum),
        })
        if (hairColor) params.set('hair_color', hairColor)
        if (hasVideo) params.set('has_video', 'true')

        const res = await fetch(`/api/search?${params.toString()}`, {
          signal: ctrl.signal,
        })
        if (!res.ok) throw new Error('fetch failed')
        const json = await res.json()

        const rows: SugarBabyCardProps[] = (json.data ?? []).map((ad: ApiAd) => ({
          id: ad.id,
          nickname: ad.nickname,
          age: ad.age ?? undefined,
          city: ad.city ?? undefined,
          photos: ad.photos ?? [],
          description: ad.description ?? undefined,
          telegram: ad.telegram,
          whatsapp: ad.whatsapp,
          raw_data: ad.raw_data as SugarBabyCardProps['raw_data'],
        }))

        // client-side age filter
        const filtered = rows.filter((r) => {
          if (ageMin && r.age && r.age < Number(ageMin)) return false
          if (ageMax && r.age && r.age > Number(ageMax)) return false
          return true
        })

        setAds((prev) => (append ? [...prev, ...filtered] : filtered))
        setTotal(json.meta?.total ?? 0)
        setHasMore(rows.length >= PAGE_SIZE)
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        console.error('SugarBabies fetch error', err)
      } finally {
        setLoading(false)
      }
    },
    [hairColor, hasVideo, ageMin, ageMax],
  )

  // initial + filter change
  useEffect(() => {
    setPage(1)
    fetchAds(1, false)
  }, [fetchAds])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    fetchAds(next, true)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            💎 Содержанки та-тахלес
          </h1>
          {total > 0 && (
            <span className="text-sm text-white/40 font-bold tabular-nums">
              {total} анкет
            </span>
          )}
        </div>
      </header>

      {/* ── Filters ── */}
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Hair color */}
          <select
            value={hairColor}
            onChange={(e) => setHairColor(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#1a1a1a] border border-white/[0.08] text-sm text-white font-bold focus:outline-none focus:border-velvet-500/50"
          >
            {HAIR_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {/* Video toggle */}
          <button
            onClick={() => setHasVideo((v) => !v)}
            className={`px-3 py-2 rounded-xl border text-sm font-bold transition-colors ${
              hasVideo
                ? 'bg-velvet-500 border-velvet-500 text-white'
                : 'bg-[#1a1a1a] border-white/[0.08] text-white/50'
            }`}
          >
            🎬 С видео
          </button>

          {/* Age range */}
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              placeholder="от"
              value={ageMin}
              onChange={(e) => setAgeMin(e.target.value)}
              className="w-16 px-2 py-2 rounded-xl bg-[#1a1a1a] border border-white/[0.08] text-sm text-white font-bold text-center focus:outline-none focus:border-velvet-500/50"
              min={18}
              max={60}
            />
            <span className="text-white/30 text-xs">–</span>
            <input
              type="number"
              placeholder="до"
              value={ageMax}
              onChange={(e) => setAgeMax(e.target.value)}
              className="w-16 px-2 py-2 rounded-xl bg-[#1a1a1a] border border-white/[0.08] text-sm text-white font-bold text-center focus:outline-none focus:border-velvet-500/50"
              min={18}
              max={60}
            />
            <span className="text-xs text-white/30 font-bold">лет</span>
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <main className="max-w-6xl mx-auto px-4 pb-12">
        {ads.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <span className="text-5xl">💎</span>
            <p className="text-white/40 font-bold text-sm">Нет анкет по заданным фильтрам</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ads.map((ad) => (
            <SugarBabyCard key={ad.id} {...ad} />
          ))}
        </div>

        {/* Load more */}
        {hasMore && ads.length > 0 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-velvet-500 hover:bg-velvet-400 disabled:opacity-40 text-white font-black text-sm tracking-wide transition-colors"
            >
              {loading ? 'Загрузка...' : 'Показать ещё'}
            </button>
          </div>
        )}

        {loading && ads.length === 0 && (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-velvet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </main>
    </div>
  )
}
