import { notFound } from 'next/navigation'
import { getSeoPageBySlug, SEO_PAGES } from '@/lib/seo-pages'
import { CITIES, FILTERS, SITE_URL } from '@/lib/cities'
import { SubpageHeader } from '@/components/layout/SubpageHeader'
import GuidePageClient from './GuidePageClient'

export default async function GuidePage({ params }: { params: { slug: string } }) {
  const page = getSeoPageBySlug(params.slug)
  if (!page) return notFound()

  // Fetch profiles if page has search params
  let profiles: any[] = []
  let total = 0

  if (page.searchParams) {
    try {
      const searchParams = new URLSearchParams({ ...page.searchParams, page: '1' })
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
  }

  // JSON-LD
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Tahles', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: page.content.h1En, item: `${SITE_URL}/guide/${page.slug}` },
    ],
  }

  const webPageLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.seo.titleEn,
    description: page.seo.descEn,
    url: `${SITE_URL}/guide/${page.slug}`,
    isPartOf: { '@type': 'WebSite', name: 'Tahles', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'Tahles',
      url: SITE_URL,
    },
  }

  const otherGuides = SEO_PAGES.filter(p => p.slug !== page.slug).slice(0, 12)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }} />

      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <SubpageHeader
          count={total || undefined}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: page.content.h1En },
          ]}
        />

        <main className="max-w-[1100px] mx-auto px-4 sm:px-6 pb-20">
          {/* Hero */}
          <section className="mt-4 mb-6 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
            <div className="px-5 py-5">
              <h1 className="text-xl font-black text-velvet-300">{page.content.h1En}</h1>
              <p className="text-sm text-white/50 mt-2">{page.content.introEn}</p>
            </div>
          </section>

          {/* Content Block — English */}
          <section className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-velvet-500/[0.06] to-transparent border border-velvet-500/[0.12]">
            <p className="text-sm text-white/60 leading-relaxed">{page.content.bodyEn}</p>
          </section>

          {/* Content Block — Hebrew */}
          <section className="mb-6 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <h2 className="text-sm font-black text-velvet-300 mb-3">{page.content.h1He}</h2>
            <p className="text-xs text-white/40 leading-relaxed mb-3" dir="rtl">{page.content.introHe}</p>
            <p className="text-xs text-white/35 leading-relaxed" dir="rtl">{page.content.bodyHe}</p>
          </section>

          {/* Content Block — Russian */}
          <section className="mb-6 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <h2 className="text-sm font-black text-velvet-300 mb-3">{page.content.h1Ru}</h2>
            <p className="text-xs text-white/40 leading-relaxed mb-3">{page.content.introRu}</p>
            <p className="text-xs text-white/35 leading-relaxed">{page.content.bodyRu}</p>
          </section>

          {/* Embedded profiles (if search params provided) */}
          {page.searchParams && (
            <GuidePageClient
              searchParams={page.searchParams}
              initialProfiles={profiles}
              initialTotal={total}
            />
          )}

          {/* Category navigation */}
          <section className="mt-10">
            <h3 className="text-xs text-white/50 uppercase tracking-[0.2em] font-black mb-3">Browse by category</h3>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map(f => (
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

          {/* City navigation */}
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

          {/* Related guides */}
          <section className="mt-6">
            <h3 className="text-xs text-white/50 uppercase tracking-[0.2em] font-black mb-3">Related guides</h3>
            <div className="flex flex-wrap gap-2">
              {otherGuides.map(g => (
                <a
                  key={g.slug}
                  href={`/guide/${g.slug}`}
                  className="px-3 py-1.5 rounded-full bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition text-xs"
                >
                  {g.content.h1En}
                </a>
              ))}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/[0.04] mt-12 pt-10 pb-8 px-4">
          <div className="max-w-[1100px] mx-auto space-y-6">
            <div className="flex flex-wrap gap-2 justify-center">
              <a href="/" className="px-3 py-1.5 rounded-full bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition text-xs">Home</a>
              <a href="/faq" className="px-3 py-1.5 rounded-full bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition text-xs">FAQ</a>
              <a href="/escorts/vip" className="px-3 py-1.5 rounded-full bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition text-xs">VIP</a>
              <a href="/escorts/verified" className="px-3 py-1.5 rounded-full bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition text-xs">Verified</a>
              <a href="/escorts/new" className="px-3 py-1.5 rounded-full bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition text-xs">New</a>
              <a href="/guide/about" className="px-3 py-1.5 rounded-full bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition text-xs">About</a>
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
