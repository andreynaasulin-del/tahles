'use client'

import { useState, useCallback } from 'react'
import { ResultRow } from '@/components/search/ResultRow'

interface FilterPageClientProps {
  filterSlug: string
  searchParams: Record<string, string>
  initialProfiles: any[]
  initialTotal: number
}

export default function FilterPageClient({ filterSlug, searchParams, initialProfiles, initialTotal }: FilterPageClientProps) {
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
    return (
      <section className="max-w-5xl mx-auto px-4 py-12 text-center">
        <p className="text-white/40 text-lg">No profiles found in this category yet.</p>
        <a href="/" className="inline-block mt-4 px-6 py-3 bg-[#c8a97e]/20 text-[#c8a97e] rounded-lg hover:bg-[#c8a97e]/30 transition">
          Browse all profiles
        </a>
      </section>
    )
  }

  return (
    <section className="max-w-5xl mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {profiles.map((p: any, i: number) => (
          <ResultRow key={p.id} rank={i + 1} {...p} />
        ))}
      </div>

      {profiles.length < total && (
        <div className="flex justify-center py-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : `Load more (${profiles.length} of ${total})`}
          </button>
        </div>
      )}
    </section>
  )
}
