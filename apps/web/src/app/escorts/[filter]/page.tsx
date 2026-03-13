import { notFound } from 'next/navigation'
import { getFilterBySlug, FILTERS, CITIES, SITE_URL } from '@/lib/cities'
import FilterPageClient from './FilterPageClient'

export default async function FilterPage({ params }: { params: { filter: string } }) {
  const filter = getFilterBySlug(params.filter)
  if (!filter) return notFound()

  // Fetch profiles with this filter (server-side)
  const searchParams = new URLSearchParams({ ...filter.searchParams, page: '1' })
  let profiles: any[] = []
  let total = 0

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || SITE_URL
    const res = await fetch(`${baseUrl}/api/search?${searchParams}`, {
      next: { revalidate: 60 },
    })
    if (res.ok) {
      const json = await res.json()
      profiles = json.data || []
      total = json.total || 0
    }
  } catch {
    // Fallback
  }

  // JSON-LD
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Tahles', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: filter.nameEn, item: `${SITE_URL}/escorts/${filter.slug}` },
    ],
  }

  const otherFilters = FILTERS.filter(f => f.slug !== filter.slug)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="min-h-screen bg-[#0a0a0a] text-white">
        {/* Header */}
        <header className="sticky top-0 z-50 glass border-b border-white/5 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <a href="/" className="text-xl font-bold tracking-tight">
              <span className="text-[#c8a97e]">Tahles</span>
            </a>
            <nav className="flex gap-3 text-sm text-white/50">
              <a href="/" className="hover:text-white transition">Home</a>
            </nav>
          </div>
        </header>

        {/* Breadcrumbs */}
        <nav className="max-w-5xl mx-auto px-4 py-3 text-sm text-white/40">
          <a href="/" className="hover:text-white/70 transition">Home</a>
          <span className="mx-2">/</span>
          <span className="text-white/70">{filter.nameEn}</span>
        </nav>

        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 pt-4 pb-8">
          <h1 className="text-3xl font-bold mb-2">
            {filter.nameEn} <span className="text-white/40 text-xl">({filter.nameHe})</span>
          </h1>
          <p className="text-white/50 text-lg">
            {total} profiles found. Real photos, reviews & ratings. Updated daily.
          </p>
        </section>

        {/* Profiles Grid */}
        <FilterPageClient
          filterSlug={filter.slug}
          searchParams={filter.searchParams}
          initialProfiles={profiles}
          initialTotal={total}
        />

        {/* SEO Text */}
        <section className="max-w-5xl mx-auto px-4 py-12 border-t border-white/5">
          <div className="prose prose-invert prose-sm max-w-none">
            <h2 className="text-xl font-semibold mb-4">{filter.seo.titleHe}</h2>
            <p className="text-white/50 leading-relaxed mb-4" dir="rtl">{filter.seo.descHe}</p>
            <h2 className="text-xl font-semibold mb-4 mt-8">{filter.seo.titleEn}</h2>
            <p className="text-white/50 leading-relaxed">{filter.seo.descEn}</p>
          </div>
        </section>

        {/* Other Filters */}
        <section className="max-w-5xl mx-auto px-4 pb-6">
          <h3 className="text-lg font-semibold mb-4 text-white/70">Browse by category</h3>
          <div className="flex flex-wrap gap-2">
            {otherFilters.map(f => (
              <a key={f.slug} href={`/escorts/${f.slug}`}
                className="px-4 py-2 rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition text-sm">
                {f.nameEn}
              </a>
            ))}
          </div>
        </section>

        {/* Cities Links */}
        <section className="max-w-5xl mx-auto px-4 pb-12">
          <h3 className="text-lg font-semibold mb-4 text-white/70">Browse by city</h3>
          <div className="flex flex-wrap gap-2">
            {CITIES.map(c => (
              <a key={c.slug} href={`/${c.slug}`}
                className="px-4 py-2 rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition text-sm">
                {c.nameEn}
              </a>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 text-center text-white/30 text-sm">
          <p>&copy; {new Date().getFullYear()} Tahles — Premium Escort Directory Israel</p>
        </footer>
      </div>
    </>
  )
}
