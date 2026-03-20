import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@vm/db'

const ADMIN_SECRET = process.env.CRON_SECRET || ''
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const SITE = 'https://tahles.top'

// City normalization: Hebrew bot input → English DB value
const CITY_MAP: Record<string, string> = {
  'תל אביב': 'Tel Aviv',
  'Tel Aviv': 'Tel Aviv',
  'חיפה': 'Haifa',
  'Haifa': 'Haifa',
  'ירושלים': 'Jerusalem',
  'Jerusalem': 'Jerusalem',
  'אילת': 'Eilat',
  'Eilat': 'Eilat',
  'נתניה': 'Netanya',
  'Netanya': 'Netanya',
  'בת ים': 'Bat Yam',
  'Bat Yam': 'Bat Yam',
  'באר שבע': 'Beer Sheva',
  'Beer Sheva': 'Beer Sheva',
  'אשדוד': 'Ashdod',
  'Ashdod': 'Ashdod',
  'ראשון לציון': 'Rishon LeZion',
  'Rishon LeZion': 'Rishon LeZion',
  'הרצליה': 'Herzliya',
  'Herzliya': 'Herzliya',
  'חדרה': 'Hadera',
  'Hadera': 'Hadera',
  'פתח תקווה': 'Petah Tikva',
  'Petah Tikva': 'Petah Tikva',
  'רמת גן': 'Ramat Gan',
  'Ramat Gan': 'Ramat Gan',
  'אשקלון': 'Ashkelon',
  'Ashkelon': 'Ashkelon',
  'כפר סבא': 'Kfar Saba',
  'רחובות': 'Rehovot',
}

function normalizeCity(city: string | null): string | null {
  if (!city) return null
  return CITY_MAP[city.trim()] || city.trim()
}

function detectCategory(sub: any): string {
  const text = [sub.nickname, sub.description, sub.service_type].filter(Boolean).join(' ').toLowerCase()
  if (/\btrans\b|\bטרנס\b|\bshemale\b|\bladyboy\b|\bt\.?s\.?\b|\bטרנסית\b/.test(text)) return 'trans'
  return 'individual'
}

/**
 * POST /api/admin/submissions/[id]/approve
 *
 * 1. Fetch submission
 * 2. Download photos from Telegram → Supabase Storage
 * 3. Create user + advertisement + contacts
 * 4. Mark submission approved
 * 5. Notify via Telegram
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

    // ── 4. Normalize data ──
    const city = normalizeCity(sub.city)
    const category = detectCategory(sub)
    const whatsapp = sub.whatsapp || null
    const phone = whatsapp ? `+${whatsapp}` : null

    // ── 4b. Parse structured extra data from description ──
    const DATA_SEP = '\n---DATA---\n'
    let cleanDescription = sub.description || ''
    let enriched: Record<string, any> = {}
    if (cleanDescription.includes(DATA_SEP)) {
      const [descPart, jsonPart] = cleanDescription.split(DATA_SEP)
      cleanDescription = descPart.trim()
      try { enriched = JSON.parse(jsonPart) } catch { enriched = {} }
    }

    // Build _enriched block matching crawled profile format
    const enrichedBlock: Record<string, any> = {
      services: enriched.services ?? [],
      priceTable: enriched.priceTable ?? [],
      physicalParams: enriched.physicalParams ?? {},
      shortDescription: cleanDescription.split('\n')[0] || sub.nickname,
    }

    // ── 5. Create advertisement with full raw_data ──
    const { data: ad, error: adErr } = await supabase
      .from('advertisements')
      .insert({
        user_id: userId,
        nickname: sub.nickname,
        description: cleanDescription || null,
        age: sub.age,
        city,
        service_type: sub.service_type,
        price_min: sub.price_min || null,
        price_max: sub.price_max || null,
        photos: photoUrls,
        verified: false,
        gender: 'female',
        online_status: true,
        raw_data: {
          _verified: 'true',
          _category: category,
          _source: 'telegram_bot',
          _submission_id: submissionId,
          _enriched: enrichedBlock,
          languages: enriched.languages ?? [],
          contacts: {
            phone,
            whatsapp,
            telegram: sub.telegram_username || null,
          },
          description: cleanDescription || null,
        },
      })
      .select('id')
      .single()

    if (adErr || !ad) {
      console.error('[approve] Insert ad error:', adErr)
      return NextResponse.json({ error: 'Failed to create advertisement' }, { status: 500 })
    }

    // ── 6. Create contacts row ──
    await supabase.from('contacts').insert({
      ad_id: ad.id,
      phone,
      whatsapp,
      telegram_username: sub.telegram_username || null,
    })

    // ── 7. Mark submission approved ──
    await supabase
      .from('submissions')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', submissionId)

    // ── 8. Notify user via Telegram ──
    await notifyTelegram(
      sub.telegram_user_id,
      `🎉 *המודעה שלך אושרה ועלתה לאתר!*\n\n` +
      `👤 ${sub.nickname}\n📍 ${city}\n\n` +
      `🔗 צפי בפרופיל: ${SITE}/ad/${ad.id}\n\n` +
      `שתפי את הלינק עם הלקוחות שלך! 💎`
    )

    return NextResponse.json({
      ok: true,
      ad_id: ad.id,
      photos_uploaded: photoUrls.length,
      category,
      city,
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

  const fileRes = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`
  )
  const fileJson = await fileRes.json()

  if (!fileJson.ok || !fileJson.result?.file_path) {
    console.error(`[tg] getFile failed for ${fileId}:`, fileJson)
    return null
  }

  const filePath = fileJson.result.file_path as string
  const downloadUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`
  const downloadRes = await fetch(downloadUrl)

  if (!downloadRes.ok) {
    console.error(`[tg] Download failed: ${downloadRes.status}`)
    return null
  }

  const buffer = Buffer.from(await downloadRes.arrayBuffer())
  const ext = filePath.split('.').pop()?.toLowerCase() || 'jpg'
  const mimeMap: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' }
  const contentType = mimeMap[ext] || 'image/jpeg'

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
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('tg_id', telegramUserId)
    .maybeSingle()

  if (existing) return existing.id

  const email = `tg_${telegramUserId}@tahles.bot`
  const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { tg_id: telegramUserId, tg_username: telegramUsername },
  })

  if (authErr || !authUser.user) {
    throw new Error(`Failed to create auth user: ${authErr?.message}`)
  }

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
