import { createClient } from '@supabase/supabase-js'
import type { MetadataRoute } from 'next'
import { CITIES, FILTERS } from '@/lib/cities'

const SITE_URL = 'https://tahles.top'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const entries: MetadataRoute.Sitemap = [
    // Homepage
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    // FAQ
    {
      url: `${SITE_URL}/faq`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // City landing pages (11 pages)
  for (const city of CITIES) {
    entries.push({
      url: `${SITE_URL}/${city.slug}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    })
  }

  // Category/filter pages (6 pages)
  for (const filter of FILTERS) {
    entries.push({
      url: `${SITE_URL}/escorts/${filter.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    })
  }

  // All ad profile pages
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: ads } = await supabase
      .from('advertisements')
      .select('id, updated_at')
      .order('updated_at', { ascending: false })

    if (ads) {
      for (const ad of ads) {
        entries.push({
          url: `${SITE_URL}/ad/${ad.id}`,
          lastModified: ad.updated_at ? new Date(ad.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        })
      }
    }
  } catch {
    // Fallback — return at least the static pages
  }

  return entries
}
