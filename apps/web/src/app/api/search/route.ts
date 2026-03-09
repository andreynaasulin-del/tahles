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
  'Haifa':         ['Haifa', 'חיפה', 'Krayot', 'קריות', 'חיפה, קריות והצפון'],
  'Netanya':       ['Netanya', 'נתניה'],
  'Hadera':        ['Hadera', 'חדרה'],
  'Rishon LeZion': ['Rishon LeZion', 'ראשון לציון', 'Rishon Lezion'],
  'Beer Sheva':    ['Beer Sheva', 'באר שבע', 'Beersheba'],
  'Petah Tikva':   ['Petah Tikva', 'פתח תקווה'],
  'Ramat Gan':     ['Ramat Gan', 'רמת גן'],
  'Ashdod':        ['Ashdod', 'אשדוד', 'Ashkelon', 'אשקלון'],
  'Holon':         ['Holon', 'חולון'],
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

  // Category filter — use raw_data._category JSONB field

  // Build base query — only profiles WITH photos
  let query = supabase
    .from('advertisements')
    .select(
      'id,nickname,age,verified,vip_status,online_status,price_min,price_max,city,gender,service_type,created_at,photos,rating_count,raw_data,contacts(whatsapp,phone,telegram_username)',
      { count: 'exact' }
    )
    .not('photos', 'is', null)
    .not('description', 'is', null)
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

  // Sort: VIP → Verified → Online → Newest
  query = query
    .order('vip_status',    { ascending: false })
    .order('verified',      { ascending: false })
    .order('online_status', { ascending: false })
    .order('created_at',    { ascending: false })

  const { data, error, count } = await query
  if (error) {
    console.error('Supabase query error:', JSON.stringify(error))
    throw error
  }

  // Filter out profiles without photos or contacts
  const withPhotos = (data || []).filter((ad: any) => {
    const photos = ad.photos
    const hasPhotos = Array.isArray(photos) && photos.length > 0
    const contact = Array.isArray(ad.contacts) ? ad.contacts[0] : ad.contacts
    const hasContact = !!(contact?.whatsapp || contact?.phone)
    return hasPhotos && hasContact
  })

  const mappedData = withPhotos.map((ad: any) => {
    const contact = Array.isArray(ad.contacts) ? ad.contacts[0] : ad.contacts
    const rawData = ad.raw_data as any
    const enriched = rawData?._enriched ?? {}
    return {
      ...ad,
      whatsapp:      contact?.whatsapp || null,
      phone:         contact?.phone || null,
      telegram:      contact?.telegram_username || null,
      comments_count: ad.rating_count || 0,
      address:       rawData?._address || null,
      services:      enriched.services ?? [],
      price_table:   enriched.priceTable ?? [],
      physical_params: {
        ...(enriched.physicalParams ?? {}),
        ethnicity: enriched.physicalParams?.ethnicity || rawData?._ethnicity || null,
      },
      languages:     rawData?.languages ?? [],
      videos:        enriched.videos ?? [],
      category:      rawData?._category || rawData?.category || null,
      score:         rawData?._score ?? 0,
      score_category: rawData?._score_category ?? null,
      contacts:      undefined,
      rating_count:  undefined,
      raw_data:      undefined,
      photos: ad.photos,
    }
  })

  // Sort: score first → then videos → then photos
  mappedData.sort((a: any, b: any) => {
    const aScore = (a.score || 0)
    const bScore = (b.score || 0)
    if (aScore !== bScore) return bScore - aScore  // higher score first
    const aVids = (a.videos?.length || 0)
    const bVids = (b.videos?.length || 0)
    if (aVids !== bVids) return bVids - aVids      // more videos second
    const aPhotos = (a.photos?.length || 0)
    const bPhotos = (b.photos?.length || 0)
    return bPhotos - aPhotos                        // then more photos
  })

  // Paginate AFTER sorting (so video profiles always appear first)
  const totalCount = mappedData.length
  const paginatedData = mappedData.slice((page - 1) * limit, page * limit)

  return {
    type: 'text',
    data: paginatedData,
    total: totalCount,
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

    return NextResponse.json(
      await realSearch(q, sheet, category, city, ethnicity, priceMin ?? null, priceMax ?? null, page, DEFAULT_PAGE_SIZE)
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid parameters', details: error.errors }, { status: 400 })
    }
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
