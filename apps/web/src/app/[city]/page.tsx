import { notFound } from 'next/navigation'
import { getCityBySlug, CITIES, SITE_URL } from '@/lib/cities'
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
          <span className="text-white/70">{city.nameEn}</span>
        </nav>

        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 pt-4 pb-8">
          <h1 className="text-3xl font-bold mb-2">
            Escort in {city.nameEn} <span className="text-white/40 text-xl">({city.nameHe})</span>
          </h1>
          <p className="text-white/50 text-lg">
            {total} verified profiles in {city.nameEn}. Real photos, reviews & ratings. Updated daily.
          </p>
        </section>

        {/* Profiles Grid */}
        <CityPageClient
          citySlug={city.slug}
          cityNameEn={city.nameEn}
          initialProfiles={profiles}
          initialTotal={total}
        />

        {/* SEO Text Block */}
        <section className="max-w-5xl mx-auto px-4 py-12 border-t border-white/5">
          <div className="prose prose-invert prose-sm max-w-none">
            <h2 className="text-xl font-semibold mb-4">
              {city.seo.titleHe}
            </h2>
            <p className="text-white/50 leading-relaxed mb-4" dir="rtl">
              {city.seo.descHe}
              {' '}Tahles הוא מאגר המודעות הגדול ביותר בישראל עם פרופילים מאומתים, תמונות אמיתיות, ביקורות ודירוגים.
              כל הפרופילים מאומתים ומתעדכנים יומיומית. שירותי ליווי ב{city.nameHe} כוללים ליווי לבית, ליווי למלון ועוד.
            </p>

            <h2 className="text-xl font-semibold mb-4 mt-8">
              {city.seo.titleEn}
            </h2>
            <p className="text-white/50 leading-relaxed mb-4">
              {city.seo.descEn}
              {' '}Tahles is Israel&apos;s largest escort directory with verified profiles, real photos, reviews and ratings.
              All profiles are verified and updated daily. Escort services in {city.nameEn} include incall, outcall and hotel visits.
            </p>
          </div>
        </section>

        {/* Internal Links to Other Cities */}
        <section className="max-w-5xl mx-auto px-4 pb-12">
          <h3 className="text-lg font-semibold mb-4 text-white/70">Browse other cities</h3>
          <div className="flex flex-wrap gap-2">
            {otherCities.map(c => (
              <a
                key={c.slug}
                href={`/${c.slug}`}
                className="px-4 py-2 rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition text-sm"
              >
                {c.nameEn}
              </a>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 text-center text-white/30 text-sm">
          <p>&copy; {new Date().getFullYear()} Tahles — Premium Escort Directory Israel</p>
          <div className="flex justify-center gap-4 mt-3">
            <a href="/faq" className="hover:text-white/60 transition">FAQ</a>
            <a href="/escorts/vip" className="hover:text-white/60 transition">VIP</a>
            <a href="/escorts/verified" className="hover:text-white/60 transition">Verified</a>
            <a href="/escorts/new" className="hover:text-white/60 transition">New</a>
          </div>
        </footer>
      </div>
    </>
  )
}
