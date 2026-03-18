import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Fetch ad — only select needed fields, never expose full raw_data
    const { data: ad, error } = await supabase
      .from('advertisements')
      .select('id,nickname,description,age,city,verified,vip_status,online_status,service_type,price_min,price_max,rating_avg,rating_count,created_at,source,photos,gender,raw_data')
      .eq('id', params.id)
      .single()

    if (error || !ad) {
      return NextResponse.json({ error: 'Ad not found', detail: error?.message }, { status: 404 })
    }

    // Fetch contacts separately to avoid join issues
    const { data: contacts } = await supabase
      .from('contacts')
      .select('phone, whatsapp, telegram_username')
      .eq('ad_id', params.id)
      .maybeSingle()

    // Fetch comments separately
    const { data: comments } = await supabase
      .from('ad_comments')
      .select('id, comment_key, author_name, rating, text, created_at, raw_json')
      .eq('ad_id', params.id)
      .order('created_at', { ascending: false })

    const record = ad as any

    // Extract enriched data from raw_data._enriched (set by crawler)
    const enriched = record.raw_data?._enriched || {}

    return NextResponse.json({
      id: record.id,
      nickname: record.nickname,
      description: record.description,
      age: record.age,
      city: record.city,
      address: record.raw_data?._address || null,
      photos: record.photos || [],
      verified: record.verified,
      vip_status: record.vip_status,
      online_status: record.online_status,
      service_type: record.service_type,
      price_min: record.price_min,
      price_max: record.price_max,
      rating_avg: record.rating_avg,
      rating_count: record.rating_count,
      created_at: record.created_at,
      source: record.source,
      // Contacts (separate query)
      phone: contacts?.phone || null,
      whatsapp: contacts?.whatsapp || null,
      telegram: contacts?.telegram_username || null,
      // Comments: prefer DB table, fallback to raw_data.comments
      comments: (comments && comments.length > 0)
        ? comments.map((c: any) => ({
            id: c.id,
            author: c.author_name,
            text: c.text,
            rating: c.rating,
            date: c.created_at,
          }))
        : (record.raw_data?.comments || []).map((c: any, i: number) => ({
            id: c.comment_key || `raw_${i}`,
            author: c.author,
            text: c.text,
            rating: c.rating,
            date: c.date_raw || null,
          })),
      // Enriched data from crawler
      videos: enriched.videos || [],
      priceTable: enriched.priceTable || [],
      physicalParams: enriched.physicalParams || {},
      services: enriched.services || [],
      shortDescription: enriched.shortDescription || null,
      payments: enriched.payments || null,
      parking: enriched.parking || null,
      region: enriched.region || null,
      registrationDate: enriched.registrationDate || null,
      showsCount: enriched.showsCount || null,
      commentsCount: enriched.commentsCount || comments?.length || 0,
      // Sugar baby category fields
      category: record.raw_data?._category || null,
      hair_color: record.raw_data?.hair_color || null,
      height_weight: record.raw_data?.height_weight || null,
      breast_size: record.raw_data?.breast_size || null,
      waist: record.raw_data?.waist || null,
      hobbies: record.raw_data?.hobbies || null,
      working_hours: record.raw_data?.working_hours || null,
      asks_selfie: record.raw_data?.asks_selfie || false,
      has_video: record.raw_data?.has_video || false,
      pricing_text: record.raw_data?.pricing_text || null,
    })
  } catch (err) {
    console.error('Ad detail error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
