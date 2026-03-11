import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@vm/db'

const ADMIN_SECRET = process.env.CRON_SECRET || ''

/**
 * POST /api/admin/upload-photo-url
 *
 * Download photos from URLs (e.g. CRM/WhatsApp media links),
 * re-upload to Supabase Storage, update profile.
 *
 * Auth: Bearer token (CRON_SECRET)
 * Body: JSON
 *   - ad_id: string (required)
 *   - urls: string[] (required) — source photo URLs to download
 *   - mode: "replace" | "append" (default: "replace")
 *
 * Response: { ok: true, photos: string[], total: number }
 */
export async function POST(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (!ADMIN_SECRET || auth !== `Bearer ${ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { ad_id, urls, mode = 'replace' } = body

    if (!ad_id || !urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'ad_id and urls[] are required' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // Verify profile exists
    const { data: ad, error: adError } = await supabase
      .from('advertisements')
      .select('id, nickname, photos')
      .eq('id', ad_id)
      .single()

    if (adError || !ad) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Download + re-upload each URL
    const uploadedUrls: string[] = []
    const timestamp = Date.now()

    for (let i = 0; i < urls.length; i++) {
      try {
        const res = await fetch(urls[i], {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(15000),
        })
        if (!res.ok) {
          console.error(`Failed to download ${urls[i]}: ${res.status}`)
          continue
        }

        const contentType = res.headers.get('content-type') || 'image/jpeg'
        const buffer = Buffer.from(await res.arrayBuffer())

        // Determine extension from content-type
        const extMap: Record<string, string> = {
          'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
        }
        const ext = extMap[contentType] || 'jpg'
        const safeName = `${ad_id}/${timestamp}_${i}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(safeName, buffer, {
            contentType,
            upsert: true,
          })

        if (uploadError) {
          console.error(`Upload error for ${safeName}:`, uploadError)
          continue
        }

        const { data: urlData } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(safeName)

        if (urlData?.publicUrl) {
          uploadedUrls.push(urlData.publicUrl)
        }
      } catch (err) {
        console.error(`Error processing URL ${urls[i]}:`, err)
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json({ error: 'All downloads/uploads failed' }, { status: 500 })
    }

    // Update profile
    const existingPhotos = ad.photos || []
    const newPhotos = mode === 'append'
      ? [...existingPhotos, ...uploadedUrls]
      : uploadedUrls

    const { error: updateError } = await supabase
      .from('advertisements')
      .update({ photos: newPhotos })
      .eq('id', ad_id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      profile: ad.nickname,
      uploaded: uploadedUrls.length,
      failed: urls.length - uploadedUrls.length,
      photos: newPhotos,
      total: newPhotos.length,
    })

  } catch (error) {
    console.error('Upload-url error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
