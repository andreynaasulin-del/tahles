import { createServerClient } from '@vm/db'
import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const city     = searchParams.get('city')
  const category = searchParams.get('category')
  const sheet    = searchParams.get('sheet') ?? 'all'
  const preset   = searchParams.get('preset')
  const page     = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const ageMin   = searchParams.get('age_min')
  const ageMax   = searchParams.get('age_max')
  const priceMin = searchParams.get('price_min')
  const priceMax = searchParams.get('price_max')
  const gender   = searchParams.get('gender')

  const supabase = createServerClient()

  let query = supabase
    .from('advertisements')
    .select(`
      id,
      nickname,
      age,
      verified,
      vip_status,
      online_status,
      service_type,
      gender,
      price_min,
      price_max,
      city,
      photos,
      created_at,
      ad_categories ( category_id, categories ( slug, name ) ),
      boosts ( start_at, end_at )
    `)
    .range((page - 1) * DEFAULT_PAGE_SIZE, page * DEFAULT_PAGE_SIZE - 1)
    .order('verified', { ascending: false })
    .order('vip_status', { ascending: false })
    .order('online_status', { ascending: false })
    .order('created_at', { ascending: false })

  // ── Sheet filters ──────────────────────────────────────────────────────────
  if (sheet === 'verified') {
    query = query.eq('verified', true)
  } else if (sheet === 'vip') {
    query = query.eq('vip_status', true)
  } else if (sheet === 'under25') {
    query = query.lte('age', 25).eq('verified_age', true)
  } else if (sheet === '40plus') {
    query = query.gte('age', 40).eq('verified_age', true)
  } else if (sheet === 'outcall') {
    query = query.in('service_type', ['outcall', 'both'])
  }

  // ── Geo / city filter ──────────────────────────────────────────────────────
  if (city) {
    query = query.ilike('city', city)
  }

  // ── Additional filters ─────────────────────────────────────────────────────
  if (ageMin) query = query.gte('age', parseInt(ageMin))
  if (ageMax) query = query.lte('age', parseInt(ageMax))
  if (priceMin) query = query.gte('price_min', parseInt(priceMin))
  if (priceMax) query = query.lte('price_max', parseInt(priceMax))
  if (gender) query = query.eq('gender', gender)

  // ── Preset filters ─────────────────────────────────────────────────────────
  if (preset === 'mfw') {
    query = query.eq('gender', 'male').overlaps('target_audience', ['women', 'couples'])
  } else if (preset === 'mfm') {
    query = query.eq('gender', 'male').overlaps('target_audience', ['men'])
  } else if (preset === 'russian') {
    query = query.overlaps('language', ['russian'])
  } else if (preset === 'latina') {
    query = query.overlaps('language', ['spanish'])
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    data: data ?? [],
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    total: count,
  })
}
