import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const METRICS_ID = '00000000-0000-0000-0000-000000000001'

async function recordVisitAndGetDemand(supabase: any): Promise<'low' | 'medium' | 'high'> {
  const now = Date.now()
  const oneHourAgo = now - 60 * 60 * 1000

  // Get current visits array
  const { data: sentinel } = await supabase
    .from('advertisements')
    .select('raw_data')
    .eq('id', METRICS_ID)
    .single()

  const rd = sentinel?.raw_data ?? { _type: 'system_metrics', _visits: [] }
  const visits: number[] = rd._visits ?? []

  // Add this visit
  visits.push(now)

  // Prune visits older than 1 hour
  const recentVisits = visits.filter((ts: number) => ts > oneHourAgo)

  // Save back
  rd._visits = recentVisits
  await supabase
    .from('advertisements')
    .update({ raw_data: rd })
    .eq('id', METRICS_ID)

  // Determine demand based on visits in last hour
  const count = recentVisits.length
  if (count >= 15) return 'high'
  if (count >= 5) return 'medium'
  return 'low'
}

async function getSignalStats() {
  const { createServiceRoleClient } = await import('@vm/db')
  const supabase = createServiceRoleClient()

  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()

  // 1. Total profiles: same filter as search route (photos + verified)
  const { count: total, error: totalErr } = await supabase
    .from('advertisements')
    .select('id', { count: 'exact', head: true })
    .not('photos', 'is', null)
    .eq('raw_data->>_verified', 'true')

  console.log('STATS_DEBUG:', { supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL, total, totalErr })

  // 2. Recently added among visible
  const { count: added24h } = await supabase
    .from('advertisements')
    .select('id', { count: 'exact', head: true })
    .not('photos', 'is', null)
    .eq('raw_data->>_verified', 'true')
    .gte('created_at', twentyFourHoursAgo)

  // 3. WhatsApp verified = all visible profiles have verified contacts
  const waVerified = total ?? 0

  // 5. Demand level based on real site visits in last hour
  const demand = await recordVisitAndGetDemand(supabase)

  return {
    total: total ?? 0,
    added24h: added24h ?? 0,
    waVerified,
    demand,
    ts: Date.now(),
  }
}

export async function GET(_request: NextRequest) {
  try {
    const stats = await getSignalStats()
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({
      total: 0,
      added24h: 0,
      waVerified: 0,
      demand: 'medium',
      ts: Date.now(),
    })
  }
}
