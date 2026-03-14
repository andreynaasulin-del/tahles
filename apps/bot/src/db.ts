import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export interface Profile {
  id: string
  nickname: string
  age: number | null
  city: string | null
  photos: string[]
  price_min: number | null
  price_max: number | null
  whatsapp: string | null
  phone: string | null
  category: string | null
  score: number | null
}

function mapProfile(ad: any): Profile {
  const rd = ad.raw_data ?? {}
  const contacts = rd.contacts ?? {}
  const phone = contacts.phone || rd.phone || null
  const wa = contacts.whatsapp || rd.wa || phone
  return {
    id: ad.id,
    nickname: ad.nickname || rd.title || 'No name',
    age: ad.age,
    city: ad.city,
    photos: (ad.photos || []).slice(0, 5),
    price_min: ad.price_min,
    price_max: ad.price_max,
    whatsapp: wa,
    phone,
    category: rd._category || 'individual',
    score: ad.quality_score,
  }
}

/** Search profiles by text query / city / category */
export async function searchProfiles(opts: {
  query?: string
  city?: string
  category?: string
  limit?: number
}): Promise<Profile[]> {
  const { query, city, category, limit = 10 } = opts

  let q = supabase
    .from('advertisements')
    .select('id,nickname,age,city,photos,price_min,price_max,quality_score,raw_data')
    .not('photos', 'is', null)
    .eq('raw_data->>_verified', 'true')

  if (category) q = q.eq('raw_data->>_category', category)
  if (city) q = q.ilike('city', `%${city}%`)
  if (query) q = q.or(`nickname.ilike.%${query}%,city.ilike.%${query}%`)

  q = q.order('quality_score', { ascending: false }).limit(limit)

  const { data, error } = await q
  if (error) { console.error('DB search error:', error); return [] }
  return (data || []).map(mapProfile)
}

/** Get a random profile not in excludeIds */
export async function getRandomProfile(excludeIds: string[] = []): Promise<Profile | null> {
  // Get all profile IDs first
  let q = supabase
    .from('advertisements')
    .select('id')
    .not('photos', 'is', null)
    .eq('raw_data->>_verified', 'true')

  const { data: ids } = await q
  if (!ids || ids.length === 0) return null

  // Filter out excluded and pick random
  const available = ids.filter(r => !excludeIds.includes(r.id))
  if (available.length === 0) return null

  const pick = available[Math.floor(Math.random() * available.length)]

  const { data } = await supabase
    .from('advertisements')
    .select('id,nickname,age,city,photos,price_min,price_max,quality_score,raw_data')
    .eq('id', pick.id)
    .single()

  return data ? mapProfile(data) : null
}

/** Get total profile count */
export async function getProfileCount(): Promise<number> {
  const { count } = await supabase
    .from('advertisements')
    .select('id', { count: 'exact', head: true })
    .not('photos', 'is', null)
    .eq('raw_data->>_verified', 'true')
  return count ?? 0
}

/** Get all cities with profile counts */
export async function getCitiesWithCounts(): Promise<{ city: string; count: number }[]> {
  const { data } = await supabase
    .from('advertisements')
    .select('city')
    .not('photos', 'is', null)
    .eq('raw_data->>_verified', 'true')
    .not('city', 'is', null)

  if (!data) return []

  const counts: Record<string, number> = {}
  for (const row of data) {
    if (!row.city) continue
    counts[row.city] = (counts[row.city] || 0) + 1
  }

  return Object.entries(counts)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
}
