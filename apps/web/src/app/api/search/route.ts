import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const SearchSchema = z.object({
  q:         z.string().max(100).optional().default(''),
  sheet:     z.string().max(50).optional().default(''),
  category:  z.string().max(50).optional().default(''),
  city:      z.string().max(100).optional().default(''),
  ethnicity: z.string().max(50).optional().default(''),
  price_min: z.string().regex(/^\d+$/).optional().nullable(),
  price_max: z.string().regex(/^\d+$/).optional().nullable(),
  page:      z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
})

// Hebrew/alternate equivalents for city OR-search
const CITY_VARIANTS: Record<string, string[]> = {
  'Tel Aviv':      ['Tel Aviv', 'תל אביב', 'Ramat Aviv'],
  'Jerusalem':     ['Jerusalem', 'ירושלים'],
  'Bat Yam':       ['Bat Yam', 'בת ים'],
  'Haifa':         ['Haifa', 'חיפה', 'Krayot', 'קריות', 'והצפון'],
  'Netanya':       ['Netanya', 'נתניה'],
  'Hadera':        ['Hadera', 'חדרה'],
  'Rishon LeZion': ['Rishon LeZion', 'ראשון לציון', 'Rishon Lezion'],
  'Beer Sheva':    ['Beer Sheva', 'באר שבע', 'Beersheba'],
  'Ashdod':        ['Ashdod', 'אשדוד', 'Ashkelon', 'אשקלון'],
}

async function realSearch(
  q: string, sheet: string, category: string, city: string, ethnicity: string,
  priceMin: string | null, priceMax: string | null, page: number, limit: number
) {
  const { createServiceRoleClient } = await import('@vm/db')
  const supabase = createServiceRoleClient()

  // Phone search — return metadata only, no raw numbers
  if (q && /^\+?[\d\s\-().]{6,}$/.test(q)) {
    const digits = q.replace(/\D/g, '')
    const { count: phoneCount } = await supabase
      .from('contacts').select('ad_id', { count: 'exact', head: true })
      .ilike('phone', `%${digits}%`)
    return { type: 'phone', data: [], total: phoneCount ?? 0, page }
  }

  // Build base query — verified profiles WITH photos
  let query = supabase
    .from('advertisements')
    .select(
      'id,nickname,age,verified,vip_status,online_status,price_min,price_max,city,gender,service_type,created_at,photos,rating_count,quality_score,raw_data',
      { count: 'exact' }
    )
    .not('photos', 'is', null)
    .eq('raw_data->>_verified', 'true')

  // Category filter via raw_data JSONB
  if (category) query = query.eq('raw_data->>_category', category)

  // Text search (name or city)
  if (q) query = query.or(`nickname.ilike.%${q}%,city.ilike.%${q}%`)

  // Sheet filters
  if (sheet === 'verified')        query = query.eq('verified', true)
  if (sheet === 'vip')             query = query.eq('vip_status', true)
  if (sheet === 'under25')         query = query.lte('age', 25).gt('age', 0)
  if (sheet === '40plus')          query = query.gte('age', 40)
  if (sheet === 'outcall')         query = query.in('service_type', ['outcall', 'both'])

  // Ethnicity filter via raw_data JSONB
  if (ethnicity) query = query.eq('raw_data->>_ethnicity', ethnicity)

  // City filter with Hebrew variants
  if (city) {
    const variants = CITY_VARIANTS[city] ?? [city]
    const cityOr = variants.map(v => `city.ilike.%${v}%`).join(',')
    query = query.or(cityOr)
  }

  if (priceMin) query = query.gte('price_min', parseInt(priceMin))
  if (priceMax) query = query.lte('price_max', parseInt(priceMax))

  // Sort by pre-computed quality_score (database-level)
  query = query.order('quality_score', { ascending: false })

  // Server-side pagination
  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) {
    console.error('Supabase query error:', JSON.stringify(error))
    throw error
  }

  // Extract contacts from raw_data (primary source)
  function extractContact(ad: any) {
    const rawData = ad.raw_data as any
    const rdContacts = rawData?.contacts || {}
    const phone = rdContacts?.phone || rawData?.phone || null
    const wa = rdContacts?.whatsapp || rawData?.wa || phone
    return {
      whatsapp: wa || null,
      phone: phone || null,
      telegram: null,
    }
  }

  const mappedData = (data || []).map((ad: any) => {
    const contact = extractContact(ad)
    const rawData = ad.raw_data as any
    const enriched = rawData?._enriched ?? {}
    return {
      ...ad,
      whatsapp:      contact.whatsapp,
      phone:         contact.phone,
      telegram:      contact.telegram,
      comments_count: ad.rating_count || 0,
      address:       rawData?._address || null,
      services:      enriched.services ?? [],
      price_table:   enriched.priceTable ?? [],
      physical_params: {
        ...(enriched.physicalParams ?? {}),
        ethnicity: enriched.physicalParams?.ethnicity || rawData?._ethnicity || null,
      },
      languages:     rawData?.languages ?? [],
      videos:        (enriched.videos ?? []).slice(0, 5),
      category:      rawData?._category || rawData?.category || null,
      score:         rawData?._score ?? 0,
      score_category: rawData?._score_category ?? null,
      rating_count:  undefined,
      quality_score: undefined,
      raw_data:      undefined,
      photos: (ad.photos || []).slice(0, 15),
    }
  })

  return {
    type: 'text',
    data: mappedData,
    total: count ?? 0,
    page,
    pageSize: limit,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const validated = SearchSchema.parse(Object.fromEntries(searchParams.entries()))
    const { q, sheet, category, city, ethnicity, price_min: priceMin, price_max: priceMax, page } = validated
    const { DEFAULT_PAGE_SIZE } = await import('@/lib/constants')

    const result = await realSearch(q, sheet, category, city, ethnicity, priceMin ?? null, priceMax ?? null, page, DEFAULT_PAGE_SIZE)

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid parameters', details: error.errors }, { status: 400 })
    }
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
