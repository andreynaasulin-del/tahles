import { createClient } from '@supabase/supabase-js'
import type { MetadataRoute } from 'next'

const SITE_URL = 'https://tahles-web.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  // Add all ad profile pages
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
    // Fallback — return at least the homepage
  }

  return entries
}
