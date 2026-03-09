import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

const SITE_URL = 'https://tahles-web.vercel.app'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: ad } = await supabase
      .from('advertisements')
      .select('nickname, age, city, photos, description, rating_avg, rating_count, service_type, verified, vip_status')
      .eq('id', params.id)
      .single()

    if (!ad) {
      return { title: 'Profile Not Found' }
    }

    const name = ad.nickname || 'Profile'
    const age = ad.age ? `, ${ad.age}` : ''
    const city = ad.city || 'Israel'
    const reviews = ad.rating_count ? `${ad.rating_count} reviews` : ''
    const rating = ad.rating_avg ? `Rating ${ad.rating_avg}/5` : ''
    const badges = [ad.vip_status && 'VIP', ad.verified && 'Verified'].filter(Boolean).join(' ')
    const serviceType = ad.service_type ? ad.service_type.charAt(0).toUpperCase() + ad.service_type.slice(1) : ''

    const title = `${name}${age} — ${city} ${serviceType} ${badges}`.trim()
    const descParts = [
      `${name}${age} in ${city}.`,
      serviceType && `${serviceType} services.`,
      reviews && `${reviews}.`,
      rating && `${rating}.`,
      'Real photos, verified profile on Tahles.',
    ].filter(Boolean)
    const description = descParts.join(' ')

    const photo = ad.photos?.[0] || null

    return {
      title,
      description,
      openGraph: {
        type: 'profile',
        title: `${name}${age} — ${city} | Tahles`,
        description,
        url: `${SITE_URL}/ad/${params.id}`,
        images: photo ? [{
          url: photo,
          width: 676,
          height: 900,
          alt: `${name} — ${city}`,
        }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${name}${age} — ${city}`,
        description,
        images: photo ? [photo] : [],
      },
      alternates: {
        canonical: `${SITE_URL}/ad/${params.id}`,
      },
    }
  } catch {
    return { title: 'Profile | Tahles' }
  }
}

export default function AdLayout({ children }: { children: React.ReactNode }) {
  return children
}
