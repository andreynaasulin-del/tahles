import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ── Validation Schema ────────────────────────────────────────────────────────
const SearchSchema = z.object({
  q: z.string().max(100).optional().default(''),
  sheet: z.string().max(50).optional().default(''),
  category: z.string().max(50).optional().default(''),
  city: z.string().max(100).optional().default(''),
  price_min: z.string().regex(/^\d+$/).optional().nullable(),
  price_max: z.string().regex(/^\d+$/).optional().nullable(),
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
})

// ── Mock profiles (Sanitized — Phone numbers removed) ────────────────────────
const MOCK_ADS = [
  { id: '1', nickname: 'Sofia', age: 24, verified: true, vip_status: true, online_status: true, price_min: 1800, price_max: 3000, city: 'Tel Aviv', gender: 'female', service_type: 'escort', views_today: 341, last_seen_min: 0, is_new: false },
  { id: '2', nickname: 'Anna', age: 22, verified: true, vip_status: false, online_status: true, price_min: 900, price_max: 1500, city: 'Tel Aviv', gender: 'female', service_type: 'escort', views_today: 187, last_seen_min: 0, is_new: false },
  { id: '3', nickname: 'Mia', age: 28, verified: false, vip_status: false, online_status: false, price_min: 700, price_max: 1200, city: 'Haifa', gender: 'female', service_type: 'massage', views_today: 94, last_seen_min: 47, is_new: false },
  { id: '4', nickname: 'Diana', age: 26, verified: true, vip_status: true, online_status: true, price_min: 2000, price_max: 4000, city: 'Jerusalem', gender: 'female', service_type: 'escort', views_today: 512, last_seen_min: 0, is_new: false },
  { id: '5', nickname: 'Kate', age: 21, verified: false, vip_status: false, online_status: true, price_min: 600, price_max: 900, city: 'Tel Aviv', gender: 'female', service_type: 'striptease', views_today: 63, last_seen_min: 0, is_new: true },
  { id: '6', nickname: 'Lena', age: 30, verified: true, vip_status: false, online_status: false, price_min: 1100, price_max: 1800, city: 'Beer Sheva', gender: 'female', service_type: 'massage', views_today: 128, last_seen_min: 120, is_new: false },
  { id: '7', nickname: 'Vika', age: 25, verified: false, vip_status: false, online_status: true, price_min: 800, price_max: 1300, city: 'Netanya', gender: 'female', service_type: 'escort', views_today: 77, last_seen_min: 0, is_new: true },
  { id: '8', nickname: 'Julia', age: 27, verified: true, vip_status: true, online_status: true, price_min: 1600, price_max: 2500, city: 'Tel Aviv', gender: 'female', service_type: 'escort', views_today: 289, last_seen_min: 0, is_new: false },
  { id: '9', nickname: 'Nika', age: 23, verified: false, vip_status: false, online_status: false, price_min: 500, price_max: 800, city: 'Haifa', gender: 'female', service_type: 'massage', views_today: 41, last_seen_min: 210, is_new: false },
  { id: '10', nickname: 'Maria', age: 29, verified: true, vip_status: false, online_status: true, price_min: 1000, price_max: 1600, city: 'Ramat Gan', gender: 'female', service_type: 'escort', views_today: 156, last_seen_min: 0, is_new: false },
  { id: '11', nickname: 'Eva', age: 24, verified: true, vip_status: true, online_status: true, price_min: 2200, price_max: 3500, city: 'Tel Aviv', gender: 'female', service_type: 'domina', views_today: 433, last_seen_min: 0, is_new: false },
  { id: '12', nickname: 'Nina', age: 32, verified: false, vip_status: false, online_status: false, price_min: 650, price_max: 950, city: 'Herzliya', gender: 'female', service_type: 'striptease', views_today: 55, last_seen_min: 330, is_new: false },
  { id: '13', nickname: 'Anya', age: 20, verified: true, vip_status: false, online_status: true, price_min: 900, price_max: 1400, city: 'Petah Tikva', gender: 'female', service_type: 'escort', views_today: 112, last_seen_min: 0, is_new: true },
  { id: '14', nickname: 'Irina', age: 35, verified: false, vip_status: false, online_status: true, price_min: 750, price_max: 1100, city: 'Tel Aviv', gender: 'female', service_type: 'massage', views_today: 88, last_seen_min: 0, is_new: false },
  { id: '15', nickname: 'Dasha', age: 26, verified: true, vip_status: true, online_status: false, price_min: 1700, price_max: 2800, city: 'Tel Aviv', gender: 'female', service_type: 'domina', views_today: 374, last_seen_min: 18, is_new: false },
  { id: '16', nickname: 'Sasha', age: 22, verified: false, vip_status: false, online_status: true, price_min: 550, price_max: 850, city: 'Haifa', gender: 'female', service_type: 'striptease', views_today: 49, last_seen_min: 0, is_new: true },
  { id: '17', nickname: 'Tanya', age: 28, verified: true, vip_status: false, online_status: false, price_min: 1200, price_max: 2000, city: 'Tel Aviv', gender: 'female', service_type: 'kinky', views_today: 201, last_seen_min: 95, is_new: false },
  { id: '18', nickname: 'Olga', age: 31, verified: false, vip_status: false, online_status: false, price_min: 700, price_max: 1000, city: 'Rishon', gender: 'female', service_type: 'massage', views_today: 33, last_seen_min: 480, is_new: false },
  { id: '19', nickname: 'Rita', age: 23, verified: true, vip_status: true, online_status: true, price_min: 1900, price_max: 3200, city: 'Tel Aviv', gender: 'female', service_type: 'escort', views_today: 498, last_seen_min: 0, is_new: false },
  { id: '20', nickname: 'Kira', age: 25, verified: false, vip_status: false, online_status: true, price_min: 850, price_max: 1250, city: 'Jerusalem', gender: 'female', service_type: 'kinky', views_today: 143, last_seen_min: 0, is_new: false },
  { id: '21', nickname: 'Alicia', age: 27, verified: true, vip_status: true, online_status: true, price_min: 2500, price_max: 4500, city: 'Tel Aviv', gender: 'female', service_type: 'domina', views_today: 587, last_seen_min: 0, is_new: false },
  { id: '22', nickname: 'Maya', age: 24, verified: true, vip_status: false, online_status: true, price_min: 800, price_max: 1300, city: 'Ramat Gan', gender: 'female', service_type: 'massage', views_today: 102, last_seen_min: 0, is_new: true },
  { id: '23', nickname: 'Stella', age: 29, verified: false, vip_status: false, online_status: false, price_min: 600, price_max: 1000, city: 'Netanya', gender: 'female', service_type: 'striptease', views_today: 67, last_seen_min: 145, is_new: false },
  { id: '24', nickname: 'Kristina', age: 23, verified: true, vip_status: true, online_status: true, price_min: 1800, price_max: 3000, city: 'Haifa', gender: 'female', service_type: 'escort', views_today: 321, last_seen_min: 0, is_new: false },
  { id: '25', nickname: 'Polina', age: 21, verified: false, vip_status: false, online_status: true, price_min: 500, price_max: 900, city: 'Beer Sheva', gender: 'female', service_type: 'massage', views_today: 58, last_seen_min: 0, is_new: true },
]

function applyMockFilters(sheet: string, q: string, priceMin?: string | null, priceMax?: string | null) {
  let list = [...MOCK_ADS]
  if (q) {
    const qLow = q.toLowerCase()
    list = list.filter(a => a.nickname.toLowerCase().includes(qLow) || a.city.toLowerCase().includes(qLow))
  }
  if (sheet === 'basic') list = list.filter(a => !a.vip_status && !a.verified)
  if (sheet === 'paid') list = list.filter(a => a.verified)
  if (sheet === 'vip' || sheet === 'vip1500') list = list.filter(a => a.vip_status)
  if (sheet === 'up1000') list = list.filter(a => (a.price_min ?? 0) <= 1000)
  if (['massage', 'striptease', 'domina', 'kinky'].includes(sheet)) list = list.filter(a => a.service_type === sheet)
  if (priceMin) list = list.filter(a => (a.price_min ?? 0) >= parseInt(priceMin))
  if (priceMax) list = list.filter(a => (a.price_max ?? 9999) <= parseInt(priceMax))
  list.sort((a, b) => {
    if (b.vip_status !== a.vip_status) return b.vip_status ? 1 : -1
    if (b.verified !== a.verified) return b.verified ? 1 : -1
    if (b.online_status !== a.online_status) return b.online_status ? 1 : -1
    return 0
  })
  return list
}


// ── Real Supabase search ─────────────────────────────────────────────────────
async function realSearch(q: string, sheet: string, category: string, city: string, priceMin: string | null, priceMax: string | null, page: number, limit: number) {
  const { createServiceRoleClient } = await import('@vm/db')
  const supabase = createServiceRoleClient()

  // Phone search is protected - returning metadata only, no raw phone data
  if (q && /^\+?[\d\s\-().]{6,}$/.test(q)) {
    const digits = q.replace(/\D/g, '')
    const { count: phoneCount } = await supabase.from('contacts').select('ad_id', { count: 'exact', head: true }).ilike('phone', `%${digits}%`)
    const ts = Math.floor(Math.random() * 80 + 20)
    return { type: 'phone', query: '[REDACTED]', insights: { timesSearched: ts, trend: ts > 50 ? 'rising' : 'stable', matchCount: phoneCount ?? 0, topCity: null }, data: [], total: phoneCount ?? 0, page }
  }

  // If category filter is active — get ad IDs from ad_categories first
  let categoryAdIds: string[] | null = null
  if (category) {
    const { data: catData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single() as { data: { id: string } | null }

    if (catData) {
      const { data: adCats } = await supabase
        .from('ad_categories')
        .select('ad_id')
        .eq('category_id', catData.id) as { data: { ad_id: string }[] | null }

      categoryAdIds = (adCats ?? []).map(r => r.ad_id)
      // If no ads in this category, return empty
      if (categoryAdIds.length === 0) {
        return { type: 'text', query: q, insights: null, data: [], total: 0, page, pageSize: limit }
      }
    }
  }

  let query = supabase.from('advertisements')
    .select('id,nickname,age,verified,vip_status,online_status,price_min,price_max,city,gender,service_type,description,created_at,photos, contacts(whatsapp,phone), ad_comments(count)', { count: 'exact' })
    .range((page - 1) * limit, page * limit - 1)

  // Category filter — restrict to ad IDs in that category
  if (categoryAdIds) {
    query = query.in('id', categoryAdIds)
  }

  if (q) query = query.or(`nickname.ilike.%${q}%,city.ilike.%${q}%,description.ilike.%${q}%`)
  if (sheet === 'basic') query = query.eq('vip_status', false).eq('verified', false)
  if (sheet === 'paid') query = query.eq('verified', true)
  if (sheet === 'vip' || sheet === 'vip1500') query = query.eq('vip_status', true)
  if (sheet === 'up1000') query = query.lte('price_min', 1000)
  if (sheet === 'under25') query = query.lte('age', 25)
  if (sheet === '40plus') query = query.gte('age', 40)
  if (sheet === 'outcall') query = query.in('service_type', ['outcall', 'both'])
  if (city) query = query.ilike('city', `%${city}%`)
  if (priceMin) query = query.gte('price_min', parseInt(priceMin))
  if (priceMax) query = query.lte('price_max', parseInt(priceMax))

  // Сортировка по весу: VIP -> Verified -> Online -> Newest
  query = query
    .order('vip_status', { ascending: false })
    .order('verified', { ascending: false })
    .order('online_status', { ascending: false })
    .order('created_at', { ascending: false })

  const { data, error, count } = await query
  if (error) throw error

  // Map joined data to flat structure
  const mappedData = (data || []).map((ad: any) => ({
    ...ad,
    whatsapp: ad.contacts?.[0]?.whatsapp || null,
    phone: ad.contacts?.[0]?.phone || null,
    comments_count: ad.ad_comments?.[0]?.count || 0,
    // Clean up joined arrays
    contacts: undefined,
    ad_comments: undefined
  }))

  type R = { city?: string | null }
  const total = count ?? 0
  const ts = q ? Math.floor(total * 3 + 17) : 0
  const cityMap: Record<string, number> = {}
  for (const row of (mappedData ?? []) as R[]) { if (row.city) cityMap[row.city] = (cityMap[row.city] ?? 0) + 1 }
  const topCity = Object.entries(cityMap).sort((a, b) => b[1] - a[1])[0]

  return {
    type: 'text',
    query: q,
    insights: q ? { timesSearched: ts, trend: ts > 40 ? 'rising' : 'stable', matchCount: total, topCity: topCity?.[0] ?? null, localFrequency: topCity?.[1] ?? 0 } : null,
    data: mappedData ?? [],
    total,
    page,
    pageSize: limit
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rawParams = Object.fromEntries(searchParams.entries())
    const validated = SearchSchema.parse(rawParams)

    const { q, sheet, category, city, price_min: priceMin, price_max: priceMax, page } = validated

    // Используем константу из либы
    const { DEFAULT_PAGE_SIZE } = await import('@/lib/constants')
    const limit = DEFAULT_PAGE_SIZE

    const hasSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('demo.supabase'))

    if (hasSupabase) {
      try {
        return NextResponse.json(await realSearch(q, sheet, category, city, priceMin ?? null, priceMax ?? null, page, limit))
      } catch (e) {
        console.error('RealSearch Error:', e)
        // fall through to mock in dev/fallback
      }
    }

    // ── Mock response ────────────────────────────────────────────────────────
    const filtered = applyMockFilters(sheet, q, priceMin ?? null, priceMax ?? null)
    const pageData = filtered.slice((page - 1) * limit, page * limit).map(ad => ({ ...ad, photos: [] }))
    const total = filtered.length

    return NextResponse.json({
      type: 'text', query: q,
      data: pageData, total, page, pageSize: limit,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid search parameters', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

