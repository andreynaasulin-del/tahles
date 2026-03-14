import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSeoPageBySlug, SEO_PAGE_SLUGS } from '@/lib/seo-pages'
import { SITE_URL } from '@/lib/cities'

export async function generateStaticParams() {
  return SEO_PAGE_SLUGS.map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = getSeoPageBySlug(params.slug)
  if (!page) return notFound()

  const url = `${SITE_URL}/guide/${page.slug}`

  return {
    title: `${page.seo.titleEn} | Tahles`,
    description: page.seo.descEn,
    keywords: page.seo.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      title: page.seo.titleEn,
      description: page.seo.descEn,
      url,
      siteName: 'Tahles',
    },
    twitter: {
      card: 'summary_large_image',
      title: page.seo.titleEn,
      description: page.seo.descEn,
    },
  }
}

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return children
}
