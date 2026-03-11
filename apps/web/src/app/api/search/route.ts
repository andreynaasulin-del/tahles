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

  // Build base query — verified profiles WITH photos (description no longer required)
  let query = supabase
    .from('advertisements')
    .select(
      'id,nickname,age,verified,vip_status,online_status,price_min,price_max,city,gender,service_type,created_at,photos,rating_count,raw_data,contacts(whatsapp,phone,telegram_username)',
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

  // Extract contacts from raw_data (primary source) or contacts table (fallback)
  function extractContact(ad: any) {
    const rawData = ad.raw_data as any
    const rdContacts = rawData?.contacts || {}
    const phone = rdContacts?.phone || rawData?.phone || null
    const wa = rdContacts?.whatsapp || rawData?.wa || phone
    // Fallback: contacts table join
    const tblContact = Array.isArray(ad.contacts) ? ad.contacts[0] : ad.contacts
    return {
      whatsapp: wa || tblContact?.whatsapp || null,
      phone: phone || tblContact?.phone || null,
      telegram: tblContact?.telegram_username || null,
    }
  }

  // Filter out profiles without photos or contacts
  const withPhotos = (data || []).filter((ad: any) => {
    const photos = ad.photos
    const hasPhotos = Array.isArray(photos) && photos.length > 0
    const contact = extractContact(ad)
    const hasContact = !!(contact.whatsapp || contact.phone)
    return hasPhotos && hasContact
  })

  const mappedData = withPhotos.map((ad: any) => {
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
      contacts:      undefined,
      rating_count:  undefined,
      raw_data:      undefined,
      photos: (ad.photos || []).slice(0, 15),
    }
  })

  // Sheet: video — keep only profiles that have at least one video
  const filteredData = sheet === 'video'
    ? mappedData.filter((ad: any) => ad.videos && ad.videos.length > 0)
    : mappedData

  // Deep quality rank — comprehensive multi-factor sorting
  function qualityRank(ad: any): number {
    let rank = 0

    // ① Base score (0-100) weighted ×10 → max 1000
    rank += (ad.score || 0) * 10

    // ② Score category bonus
    if (ad.score_category === 'HOT') rank += 500

    // ③ VIP & verification trust signals
    if (ad.vip_status) rank += 200
    if (ad.verified) rank += 100

    // ④ Media richness — videos weigh more (harder to fake)
    const vids = ad.videos?.length || 0
    const photos = ad.photos?.length || 0
    rank += vids * 80         // each video = +80
    rank += photos * 10       // each photo = +10

    // ⑤ Contact completeness — WhatsApp most valuable
    if (ad.whatsapp) rank += 60
    if (ad.phone) rank += 30
    if (ad.telegram) rank += 20

    // ⑥ Profile completeness — services, prices, params, languages
    const services = ad.services?.length || 0
    const priceTable = ad.price_table?.length || 0
    const params = Object.keys(ad.physical_params || {}).filter(
      (k: string) => ad.physical_params[k]
    ).length
    const langs = ad.languages?.length || 0
    rank += Math.min(services, 8) * 8   // cap at 8 services (64 max)
    rank += priceTable * 15
    rank += params * 12
    rank += langs * 5

    // ⑦ Price & address filled
    if (ad.price_min) rank += 25
    if (ad.address) rank += 15

    // ⑧ Online status boost
    if (ad.online_status) rank += 40

    // ⑨ Freshness bonus — newer profiles rank higher
    if (ad.created_at) {
      const ageMs = Date.now() - new Date(ad.created_at).getTime()
      const ageDays = ageMs / (1000 * 60 * 60 * 24)
      if (ageDays < 1) rank += 100
      else if (ageDays < 3) rank += 60
      else if (ageDays < 7) rank += 30
    }

    return rank
  }

  filteredData.sort((a: any, b: any) => qualityRank(b) - qualityRank(a))

  // Paginate AFTER sorting (so video profiles always appear first)
  const totalCount = filteredData.length
  const paginatedData = filteredData.slice((page - 1) * limit, page * limit)

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
