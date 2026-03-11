import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@vm/db'

const ADMIN_SECRET = process.env.CRON_SECRET || ''

/**
 * POST /api/admin/upload-photo
 *
 * Upload one or more photos for a profile, replacing external URLs with
 * Supabase Storage URLs (no watermarks, permanent).
 *
 * Auth: Bearer token (same CRON_SECRET used for crawl)
 * Body: multipart/form-data
 *   - ad_id: string (required) — profile UUID
 *   - mode: "replace" | "append" (default: "replace")
 *   - photos: File[] — one or more image files
 *
 * Response: { ok: true, photos: string[], total: number }
 */
export async function POST(request: NextRequest) {
  // Auth check
  const auth = request.headers.get('authorization')
  if (!ADMIN_SECRET || auth !== `Bearer ${ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const adId = formData.get('ad_id') as string
    const mode = (formData.get('mode') as string) || 'replace'

    if (!adId) {
      return NextResponse.json({ error: 'ad_id is required' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // Verify profile exists
    const { data: ad, error: adError } = await supabase
      .from('advertisements')
      .select('id, nickname, photos')
      .eq('id', adId)
      .single()

    if (adError || !ad) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Collect all uploaded files
    const files: File[] = []
    for (const [key, value] of formData.entries()) {
      if (key === 'photos' && value instanceof File) {
        files.push(value)
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'No photos uploaded' }, { status: 400 })
    }

    // Upload each file to Supabase Storage
    const uploadedUrls: string[] = []
    const timestamp = Date.now()

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const safeName = `${adId}/${timestamp}_${i}.${ext}`

      const buffer = Buffer.from(await file.arrayBuffer())

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(safeName, buffer, {
          contentType: file.type || 'image/jpeg',
          upsert: true,
        })

      if (uploadError) {
        console.error(`Upload error for ${safeName}:`, uploadError)
        continue
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(safeName)

      if (urlData?.publicUrl) {
        uploadedUrls.push(urlData.publicUrl)
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json({ error: 'All uploads failed' }, { status: 500 })
    }

    // Update profile photos
    const existingPhotos = ad.photos || []
    const newPhotos = mode === 'append'
      ? [...existingPhotos, ...uploadedUrls]
      : uploadedUrls

    const { error: updateError } = await supabase
      .from('advertisements')
      .update({ photos: newPhotos })
      .eq('id', adId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      profile: ad.nickname,
      uploaded: uploadedUrls.length,
      photos: newPhotos,
      total: newPhotos.length,
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
