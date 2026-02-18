'use client'

import { useState } from 'react'
import { useTranslation } from '@/lib/i18n/useTranslation'

async function resolveQuery(q: string): Promise<Record<string, string | number>> {
  const lower = q.toLowerCase()

  const safeJson = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) return null
    return res.json()
  }

  if (lower.includes('vip') || lower.includes('nearby') || lower.includes('рядом') || lower.includes('vip')) {
    const json = await safeJson('/api/search?sheet=vip1500&page=1')
    return { 'VIP results': json?.total ?? 0, 'Shown': Math.min(json?.data?.length ?? 0, 5), 'Filter': 'VIP ₪1500+' }
  }
  if (lower.includes('city') || lower.includes('город') || lower.includes('עיר')) {
    const json = await safeJson('/api/stats')
    return { 'Top city': json?.topCity?.name ?? '—', 'Active in city': json?.topCity?.count ?? 0, 'Total active': json?.total ?? 0 }
  }
  if (lower.includes('search') || lower.includes('поиск') || lower.includes('חיפוש') || lower.includes('ищут')) {
    const json = await safeJson('/api/stats')
    return { 'Searches today': json?.searchesToday ?? 0, 'Checks today': json?.checksToday ?? 0, 'Updates/hr': json?.updatesPerHour ?? 0 }
  }
  if (lower.includes('online') || lower.includes('онлайн') || lower.includes('מחובר') || lower.includes('now') || lower.includes('сейчас')) {
    const json = await safeJson('/api/stats')
    return { 'Online now': json?.online ?? 0, 'Total active': json?.total ?? 0, 'VIP online': json?.vip ?? 0 }
  }
  if (lower.includes('price') || lower.includes('цена') || lower.includes('מחיר') || lower.includes('range')) {
    const json = await safeJson('/api/stats')
    return { 'VIP (₪1500+)': json?.vip ?? 0, 'Up to ₪1000': Math.floor((json?.total ?? 0) * 0.6), 'Total': json?.total ?? 0 }
  }
  // default
  const json = await safeJson('/api/stats')
  return { 'Total active': json?.total ?? 0, 'Online': json?.online ?? 0, 'Searches today': json?.searchesToday ?? 0 }
}

export function AskTahles() {
  const { t } = useTranslation()
  const [input, setInput]   = useState('')
  const [result, setResult] = useState<{ question: string; answer: Record<string, string | number> } | null>(null)
  const [loading, setLoading] = useState(false)

  const EXAMPLES = [
    t('ask_example_vip'),
    t('ask_example_searched'),
    t('ask_example_city'),
    t('ask_example_online'),
    t('ask_example_price'),
  ]

  const handleAsk = async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const answer = await resolveQuery(q)
      setResult({ question: q, answer })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-black/10 bg-white p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-tahles-500" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-black/40">
          {t('ask_tahles')}
        </span>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk(input)}
          placeholder={t('ask_input_placeholder')}
          className="flex-1 border border-black/15 px-4 py-2.5 text-sm placeholder:text-black/30 focus:outline-none focus:border-black/40 bg-white"
        />
        <button
          onClick={() => handleAsk(input)}
          disabled={loading || !input.trim()}
          className="px-5 py-2.5 bg-black text-white text-sm font-semibold disabled:opacity-40 hover:bg-black/80 transition-colors"
        >
          {loading ? '...' : t('ask_btn')}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {EXAMPLES.map((q) => (
          <button
            key={q}
            onClick={() => { setInput(q); handleAsk(q) }}
            className="text-[11px] px-3 py-1.5 border border-black/10 text-black/50 hover:border-black/30 hover:text-black transition-colors font-medium"
          >
            {q}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex gap-1 items-center text-black/30 text-sm">
          <span className="animate-data-pulse">{t('ask_loading')}</span>
          {[0.3, 0.6, 0.9].map((d) => (
            <span key={d} className="animate-data-pulse" style={{ animationDelay: `${d}s` }}>.</span>
          ))}
        </div>
      )}

      {result && !loading && (
        <div className="border-t border-black/8 pt-4">
          <div className="text-[11px] text-black/30 font-medium uppercase tracking-widest mb-3">
            {t('ask_query_label')}: &ldquo;{result.question}&rdquo;
          </div>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(result.answer).map(([key, val]) => (
              <div key={key} className="border border-black/8 p-3">
                <div className="text-[10px] text-black/40 uppercase tracking-widest font-medium mb-1">{key}</div>
                <div className="text-xl font-bold tabular-nums text-black">
                  {typeof val === 'number' ? val.toLocaleString() : val}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
