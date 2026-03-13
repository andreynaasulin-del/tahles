import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

const SITE_URL = 'https://tahles.top'

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

export default async function AdLayout({ children, params }: { children: React.ReactNode; params: { id: string } }) {
  // Build JSON-LD for this profile
  let jsonLd: object[] = []
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: ad } = await supabase
      .from('advertisements')
      .select('nickname, age, city, photos, description, service_type, verified, vip_status')
      .eq('id', params.id)
      .single()

    if (ad) {
      const name = ad.nickname || 'Profile'
      const city = ad.city || 'Israel'
      const citySlug = city.toLowerCase().replace(/\s+/g, '-')

      // ProfilePage schema
      jsonLd.push({
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: {
          '@type': 'Person',
          name,
          ...(ad.age && { birthDate: undefined }),
          address: {
            '@type': 'PostalAddress',
            addressLocality: city,
            addressCountry: 'IL',
          },
          ...(ad.photos?.[0] && { image: ad.photos[0] }),
          ...(ad.description && { description: ad.description.substring(0, 200) }),
        },
      })

      // BreadcrumbList
      jsonLd.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Tahles', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: city, item: `${SITE_URL}/${citySlug}` },
          { '@type': 'ListItem', position: 3, name },
        ],
      })
    }
  } catch {
    // Don't break the page if JSON-LD fails
  }

  return (
    <>
      {jsonLd.map((ld, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      ))}
      {children}
    </>
  )
}
