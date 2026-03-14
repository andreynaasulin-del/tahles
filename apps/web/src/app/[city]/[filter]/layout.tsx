import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCityBySlug, getFilterBySlug, CITY_SLUGS, FILTER_SLUGS, SITE_URL } from '@/lib/cities'

export async function generateStaticParams() {
  const params: { city: string; filter: string }[] = []
  for (const city of CITY_SLUGS) {
    for (const filter of FILTER_SLUGS) {
      params.push({ city, filter })
    }
  }
  return params
}

export async function generateMetadata({ params }: { params: { city: string; filter: string } }): Promise<Metadata> {
  const city = getCityBySlug(params.city)
  const filter = getFilterBySlug(params.filter)
  if (!city || !filter) return notFound()

  const titleEn = `${filter.nameEn} in ${city.nameEn} — Verified Profiles`
  const titleHe = `${filter.nameHe} ב${city.nameHe} — פרופילים מאומתים`
  const descEn = `Browse ${filter.nameEn.toLowerCase()} profiles in ${city.nameEn}, Israel. Verified with real photos, reviews & direct WhatsApp contact. Updated daily on Tahles.`
  const url = `${SITE_URL}/${city.slug}/${filter.slug}`

  return {
    title: `${titleEn} | Tahles`,
    description: descEn,
    keywords: `${filter.nameEn} ${city.nameEn}, escort ${city.nameEn}, ${filter.nameHe} ${city.nameHe}, ${city.nameRu} ${filter.nameRu}, Tahles`,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      title: `${titleEn} | Tahles`,
      description: descEn,
      url,
      siteName: 'Tahles',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${titleEn} | Tahles`,
      description: descEn,
    },
  }
}

export default function CityFilterLayout({ children }: { children: React.ReactNode }) {
  return children
}
