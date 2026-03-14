'use client'

import { useState, useCallback } from 'react'
import { ResultRow } from '@/components/search/ResultRow'

interface GuidePageClientProps {
  searchParams: Record<string, string>
  initialProfiles: any[]
  initialTotal: number
}

function fmtNum(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export default function GuidePageClient({ searchParams, initialProfiles, initialTotal }: GuidePageClientProps) {
  const [profiles, setProfiles] = useState(initialProfiles)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const total = initialTotal

  const loadMore = useCallback(async () => {
    setLoading(true)
    try {
      const nextPage = page + 1
      const qs = new URLSearchParams({ ...searchParams, page: String(nextPage) })
      const res = await fetch(`/api/search?${qs}`)
      if (res.ok) {
        const json = await res.json()
        setProfiles(prev => [...prev, ...(json.data || [])])
        setPage(nextPage)
      }
    } finally {
      setLoading(false)
    }
  }, [searchParams, page])

  if (profiles.length === 0) {
    return null
  }

  return (
    <section className="mt-8">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-xs font-black text-white/50 uppercase tracking-[0.2em]">
          {fmtNum(total)} profiles
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {profiles.map((p: any, i: number) => (
          <ResultRow key={p.id} rank={i + 1} {...p} />
        ))}
      </div>

      {profiles.length < total && (
        <div className="flex justify-center mt-10">
          <button
            onClick={loadMore}
            disabled={loading}
            className="group relative px-10 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs font-black uppercase tracking-[0.2em] text-white/40 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.2] transition-all overflow-hidden disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-velvet-400/30 border-t-velvet-400 rounded-full animate-spin" />
                Loading...
              </div>
            ) : (
              <>
                <div className="relative z-10 flex items-center gap-3">
                  Load more <span className="text-velvet-400">{fmtNum(total - profiles.length)}</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-velvet-500/0 via-velvet-500/5 to-velvet-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </>
            )}
          </button>
        </div>
      )}
    </section>
  )
}
