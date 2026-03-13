import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getFilterBySlug, FILTER_SLUGS, SITE_URL } from '@/lib/cities'

export async function generateStaticParams() {
  return FILTER_SLUGS.map(filter => ({ filter }))
}

export async function generateMetadata({ params }: { params: { filter: string } }): Promise<Metadata> {
  const filter = getFilterBySlug(params.filter)
  if (!filter) return notFound()

  const title = `${filter.seo.titleEn} | Tahles`
  const description = filter.seo.descEn
  const url = `${SITE_URL}/escorts/${filter.slug}`

  return {
    title,
    description,
    keywords: `${filter.nameEn}, escort Israel, ${filter.nameHe}, Tahles, verified escorts`,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      title,
      description,
      url,
      siteName: 'Tahles',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default function FilterLayout({ children }: { children: React.ReactNode }) {
  return children
}
