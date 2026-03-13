import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCityBySlug, CITY_SLUGS, SITE_URL } from '@/lib/cities'

export async function generateStaticParams() {
  return CITY_SLUGS.map(city => ({ city }))
}

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const city = getCityBySlug(params.city)
  if (!city) return notFound()

  const title = `${city.seo.titleEn} | Tahles`
  const description = city.seo.descEn
  const url = `${SITE_URL}/${city.slug}`

  return {
    title,
    description,
    keywords: `escort ${city.nameEn}, escort ${city.nameHe}, escort directory ${city.nameEn}, ${city.nameHe} ליווי, Tahles ${city.nameEn}`,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      title: `${city.seo.titleEn} | Tahles`,
      description,
      url,
      siteName: 'Tahles',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${city.seo.titleEn} | Tahles`,
      description,
    },
  }
}

export default function CityLayout({ children }: { children: React.ReactNode }) {
  return children
}
