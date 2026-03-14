import { notFound } from 'next/navigation'
import { getFilterBySlug, FILTERS, CITIES, SITE_URL } from '@/lib/cities'
import { SubpageHeader } from '@/components/layout/SubpageHeader'
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
        <SubpageHeader
          count={total}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: filter.nameEn },
          ]}
        />

        <main className="max-w-[1100px] mx-auto px-4 sm:px-6 pb-20">
          {/* Hero */}
          <section className="mt-4 mb-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
            <div className="px-5 py-4">
              <h1 className="text-lg font-black text-velvet-300">
                {filter.nameEn} <span className="text-white/30 text-base">({filter.nameHe})</span>
              </h1>
              <p className="text-sm text-white/50 mt-1">
                {total} profiles found. Real photos, reviews &amp; ratings. Updated daily.
              </p>
            </div>
          </section>

          {/* Category Filter Nav */}
          <section className="mb-2">
            <div className="text-xs text-white/50 uppercase tracking-[0.2em] font-black mb-1.5">Category</div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <a
                href="/"
                className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-150 whitespace-nowrap bg-white/[0.04] border border-white/[0.07] text-white/50 hover:text-white hover:bg-white/[0.08]"
              >
                All
              </a>
              {FILTERS.map((f) => (
                <a
                  key={f.slug}
                  href={`/escorts/${f.slug}`}
                  className={`shrink-0 px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-150 whitespace-nowrap ${
                    f.slug === filter.slug
                      ? 'bg-velvet-500/25 border-velvet-500/50 border text-velvet-300'
                      : 'bg-white/[0.04] border border-white/[0.07] text-white/50 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {f.nameEn}
                </a>
              ))}
            </div>
          </section>

          {/* City Filter Nav */}
          <section className="mb-4">
            <div className="text-xs text-white/50 uppercase tracking-[0.2em] font-black mb-1.5">City</div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {CITIES.map((c) => (
                <a
                  key={c.slug}
                  href={`/${c.slug}`}
                  className="shrink-0 px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-150 whitespace-nowrap bg-white/[0.04] border border-white/[0.07] text-white/50 hover:text-white hover:bg-white/[0.08]"
                >
                  {c.nameEn}
                </a>
              ))}
            </div>
          </section>

          {/* Profiles Grid */}
          <FilterPageClient
            filterSlug={filter.slug}
            searchParams={filter.searchParams}
            initialProfiles={profiles}
            initialTotal={total}
          />

          {/* SEO Text */}
          <section className="mt-10 p-6 rounded-2xl bg-gradient-to-br from-velvet-500/[0.06] to-transparent border border-velvet-500/[0.12]">
            <h2 className="text-sm font-black text-velvet-300 mb-3">{filter.seo.titleHe}</h2>
            <p className="text-xs text-white/40 leading-relaxed mb-4" dir="rtl">{filter.seo.descHe}</p>
            <h3 className="text-sm font-black text-velvet-300 mb-3">{filter.seo.titleEn}</h3>
            <p className="text-xs text-white/40 leading-relaxed">{filter.seo.descEn}</p>
          </section>

          {/* Browse Other Categories */}
          <section className="mt-8">
            <h3 className="text-xs text-white/50 uppercase tracking-[0.2em] font-black mb-3">Other categories</h3>
            <div className="flex flex-wrap gap-2">
              {otherFilters.map(f => (
                <a
                  key={f.slug}
                  href={`/escorts/${f.slug}`}
                  className="px-3 py-1.5 rounded-full bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition text-xs"
                >
                  {f.nameEn}
                </a>
              ))}
            </div>
          </section>

          {/* Browse Cities */}
          <section className="mt-6">
            <h3 className="text-xs text-white/50 uppercase tracking-[0.2em] font-black mb-3">Browse by city</h3>
            <div className="flex flex-wrap gap-2">
              {CITIES.map(c => (
                <a
                  key={c.slug}
                  href={`/${c.slug}`}
                  className="px-3 py-1.5 rounded-full bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition text-xs"
                >
                  {c.nameEn}
                </a>
              ))}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/[0.04] mt-12 pt-10 pb-8 px-4">
          <div className="max-w-[1100px] mx-auto space-y-6">
            <div className="flex flex-wrap gap-2 justify-center">
              <a href="/faq" className="px-3 py-1.5 rounded-full bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition text-xs">FAQ</a>
              <a href="/escorts/european" className="px-3 py-1.5 rounded-full bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition text-xs">🇪🇺 European</a>
              <a href="/escorts/latina" className="px-3 py-1.5 rounded-full bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition text-xs">💃 Latina</a>
              <a href="/escorts/asian" className="px-3 py-1.5 rounded-full bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition text-xs">🌸 Asian</a>
              <a href="/escorts/independent" className="px-3 py-1.5 rounded-full bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition text-xs">👩 Independent</a>
            </div>
            <div className="text-center text-[10px] text-white/15">
              &copy; {new Date().getFullYear()} Tahles — Premium Escort Directory Israel
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
