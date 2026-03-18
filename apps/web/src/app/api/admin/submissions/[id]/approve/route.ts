import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@vm/db'

const ADMIN_SECRET = process.env.CRON_SECRET || ''
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const SITE = 'https://tahles.top'

/**
 * POST /api/admin/submissions/[id]/approve
 *
 * 1. Fetch submission
 * 2. Download photos from Telegram by file_id → upload to Supabase Storage
 * 3. Create user (if needed) + advertisement + contacts row
 * 4. Mark submission as approved
 * 5. Notify user via Telegram
 *
 * Auth: Bearer CRON_SECRET
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = request.headers.get('authorization')
  if (!ADMIN_SECRET || auth !== `Bearer ${ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const submissionId = params.id
  if (!submissionId) {
    return NextResponse.json({ error: 'Missing submission id' }, { status: 400 })
  }

  const supabase = createServiceRoleClient()

  try {
    // ── 1. Fetch submission ──
    const { data: sub, error: subErr } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submissionId)
      .single()

    if (subErr || !sub) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    if (sub.status !== 'pending') {
      return NextResponse.json({ error: `Already ${sub.status}` }, { status: 409 })
    }

    // ── 2. Download Telegram photos → Supabase Storage ──
    const photoUrls: string[] = []
    const fileIds: string[] = sub.photo_file_ids || []

    for (let i = 0; i < fileIds.length; i++) {
      try {
        const url = await downloadTelegramPhoto(fileIds[i], submissionId, i, supabase)
        if (url) photoUrls.push(url)
      } catch (err) {
        console.error(`[approve] Photo ${i} failed:`, err)
      }
    }

    if (photoUrls.length === 0) {
      return NextResponse.json(
        { error: 'Failed to download any photos from Telegram' },
        { status: 500 }
      )
    }

    // ── 3. Create or find user ──
    const userId = await getOrCreateUser(supabase, sub.telegram_user_id, sub.telegram_username)

    // ── 4. Create advertisement ──
    const { data: ad, error: adErr } = await supabase
      .from('advertisements')
      .insert({
        user_id: userId,
        nickname: sub.nickname,
        description: sub.description || null,
        age: sub.age,
        city: sub.city,
        service_type: sub.service_type,
        price_min: sub.price_min,
        price_max: sub.price_max,
        photos: photoUrls,
        verified: false,
        gender: 'female',
        online_status: true,
        raw_data: {
          _verified: 'true',
          _category: 'individual',
          _source: 'telegram_bot',
          _submission_id: submissionId,
        },
      })
      .select('id')
      .single()

    if (adErr || !ad) {
      console.error('[approve] Insert ad error:', adErr)
      return NextResponse.json({ error: 'Failed to create advertisement' }, { status: 500 })
    }

    // ── 5. Create contacts row ──
    await supabase.from('contacts').insert({
      ad_id: ad.id,
      whatsapp: sub.whatsapp,
      telegram_username: sub.telegram_username || null,
    })

    // ── 6. Mark submission approved ──
    await supabase
      .from('submissions')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', submissionId)

    // ── 7. Notify user via Telegram ──
    await notifyTelegram(
      sub.telegram_user_id,
      `🎉 *Your ad has been approved!*\n\n` +
      `👤 ${sub.nickname}\n📍 ${sub.city}\n\n` +
      `🔗 View your profile: ${SITE}/ad/${ad.id}\n\n` +
      `Share with your clients! 💎`
    )

    return NextResponse.json({
      ok: true,
      ad_id: ad.id,
      photos_uploaded: photoUrls.length,
    })

  } catch (err) {
    console.error('[approve] Error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// ── Helpers ──

async function downloadTelegramPhoto(
  fileId: string,
  submissionId: string,
  index: number,
  supabase: ReturnType<typeof createServiceRoleClient>
): Promise<string | null> {
  if (!BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN not set')

  // Step 1: Get file path from Telegram
  const fileRes = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`
  )
  const fileJson = await fileRes.json()

  if (!fileJson.ok || !fileJson.result?.file_path) {
    console.error(`[tg] getFile failed for ${fileId}:`, fileJson)
    return null
  }

  const filePath = fileJson.result.file_path as string

  // Step 2: Download the file
  const downloadUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`
  const downloadRes = await fetch(downloadUrl)

  if (!downloadRes.ok) {
    console.error(`[tg] Download failed: ${downloadRes.status}`)
    return null
  }

  const buffer = Buffer.from(await downloadRes.arrayBuffer())
  const contentType = downloadRes.headers.get('content-type') || 'image/jpeg'

  // Step 3: Upload to Supabase Storage
  const ext = filePath.split('.').pop() || 'jpg'
  const storagePath = `${submissionId}/${Date.now()}_${index}.${ext}`

  const { error: uploadErr } = await supabase.storage
    .from('profile-photos')
    .upload(storagePath, buffer, { contentType, upsert: true })

  if (uploadErr) {
    console.error(`[storage] Upload failed:`, uploadErr)
    return null
  }

  const { data: urlData } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(storagePath)

  return urlData?.publicUrl || null
}

async function getOrCreateUser(
  supabase: ReturnType<typeof createServiceRoleClient>,
  telegramUserId: number,
  telegramUsername: string
): Promise<string> {
  // Check if user exists by tg_id
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('tg_id', telegramUserId)
    .maybeSingle()

  if (existing) return existing.id

  // Create auth user first, then public.users trigger fills the rest
  const email = `tg_${telegramUserId}@tahles.bot`
  const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { tg_id: telegramUserId, tg_username: telegramUsername },
  })

  if (authErr || !authUser.user) {
    throw new Error(`Failed to create auth user: ${authErr?.message}`)
  }

  // Update tg_id on public.users (trigger creates the row)
  await supabase
    .from('users')
    .update({ tg_id: telegramUserId, role: 'advertiser' })
    .eq('id', authUser.user.id)

  return authUser.user.id
}

async function notifyTelegram(chatId: number, text: string) {
  if (!BOT_TOKEN || !chatId) return

  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    })
  } catch (err) {
    console.error('[notify] Telegram notification failed:', err)
  }
}
