import { notFound } from 'next/navigation'
import { getCityBySlug, CITIES, FILTERS, SITE_URL } from '@/lib/cities'
import { SubpageHeader } from '@/components/layout/SubpageHeader'
import CityPageClient from './CityPageClient'

export default async function CityPage({ params }: { params: { city: string } }) {
  const city = getCityBySlug(params.city)
  if (!city) return notFound()

  // Fetch profiles for this city from API (server-side)
  const searchParams = new URLSearchParams({ city: city.nameEn, page: '1' })
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
    // Fallback: page renders with 0 profiles
  }

  // JSON-LD BreadcrumbList
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Tahles', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: city.nameEn, item: `${SITE_URL}/${city.slug}` },
    ],
  }

  // JSON-LD ItemList for profiles
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Escort profiles in ${city.nameEn}`,
    numberOfItems: total,
    itemListElement: profiles.slice(0, 10).map((p: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/ad/${p.id}`,
      name: p.nickname || 'Profile',
    })),
  }

  const otherCities = CITIES.filter(c => c.slug !== city.slug)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />

      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <SubpageHeader
          count={total}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: city.nameEn },
          ]}
        />

        <main className="max-w-[1100px] mx-auto px-4 sm:px-6 pb-20">
          {/* Hero */}
          <section className="mt-4 mb-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
            <div className="px-5 py-4">
              <h1 className="text-lg font-black text-velvet-300">
                Escort in {city.nameEn} <span className="text-white/30 text-base">({city.nameHe})</span>
              </h1>
              <p className="text-sm text-white/50 mt-1">
                {total} verified profiles in {city.nameEn}. Real photos, reviews &amp; ratings. Updated daily.
              </p>
            </div>
          </section>

          {/* Category Filter Nav — links to city×filter cross-pages */}
          <section className="mb-2">
            <div className="text-xs text-white/50 uppercase tracking-[0.2em] font-black mb-1.5">Category</div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {FILTERS.map((f) => (
                <a
                  key={f.slug}
                  href={`/escorts/${f.slug}`}
                  className="shrink-0 px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-150 whitespace-nowrap bg-white/[0.04] border border-white/[0.07] text-white/50 hover:text-white hover:bg-white/[0.08]"
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
              <a
                href="/"
                className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-150 whitespace-nowrap bg-white/[0.04] border border-white/[0.07] text-white/50 hover:text-white hover:bg-white/[0.08]"
              >
                All Cities
              </a>
              {CITIES.map((c) => (
                <a
                  key={c.slug}
                  href={`/${c.slug}`}
                  className={`shrink-0 px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-150 whitespace-nowrap ${
                    c.slug === city.slug
                      ? 'bg-velvet-500/25 border-velvet-500/50 border text-velvet-300'
                      : 'bg-white/[0.04] border border-white/[0.07] text-white/50 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {c.nameEn}
                </a>
              ))}
            </div>
          </section>

          {/* Profiles Grid */}
          <CityPageClient
            citySlug={city.slug}
            cityNameEn={city.nameEn}
            initialProfiles={profiles}
            initialTotal={total}
          />

          {/* SEO Text Block */}
          <section className="mt-10 p-6 rounded-2xl bg-gradient-to-br from-velvet-500/[0.06] to-transparent border border-velvet-500/[0.12]">
            <h2 className="text-sm font-black text-velvet-300 mb-3">{city.seo.titleHe}</h2>
            <p className="text-xs text-white/40 leading-relaxed mb-4" dir="rtl">
              {city.seo.descHe}
              {' '}Tahles הוא מאגר המודעות הגדול ביותר בישראל עם פרופילים מאומתים, תמונות אמיתיות, ביקורות ודירוגים.
              כל הפרופילים מאומתים ומתעדכנים יומיומית. שירותי ליווי ב{city.nameHe} כוללים ליווי לבית, ליווי למלון ועוד.
            </p>
            <h3 className="text-sm font-black text-velvet-300 mb-3">{city.seo.titleEn}</h3>
            <p className="text-xs text-white/40 leading-relaxed">
              {city.seo.descEn}
              {' '}Tahles is Israel&apos;s largest escort directory with verified profiles, real photos, reviews and ratings.
              All profiles are verified and updated daily. Escort services in {city.nameEn} include incall, outcall and hotel visits.
            </p>
          </section>

          {/* Browse Other Cities */}
          <section className="mt-8">
            <h3 className="text-xs text-white/50 uppercase tracking-[0.2em] font-black mb-3">Browse other cities</h3>
            <div className="flex flex-wrap gap-2">
              {otherCities.map(c => (
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
