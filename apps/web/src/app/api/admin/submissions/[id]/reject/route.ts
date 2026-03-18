import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@vm/db'

const ADMIN_SECRET = process.env.CRON_SECRET || ''
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''

/**
 * POST /api/admin/submissions/[id]/reject
 *
 * Body (optional): { reason?: string }
 *
 * 1. Mark submission as rejected
 * 2. Notify user via Telegram with reason
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

  try {
    const body = await request.json().catch(() => ({}))
    const reason = (body as any)?.reason || ''

    const supabase = createServiceRoleClient()

    // Fetch submission
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

    // Mark rejected
    const { error: updateErr } = await supabase
      .from('submissions')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', submissionId)

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 })
    }

    // Notify user via Telegram
    const reasonText = reason ? `\n\n📝 Reason: ${reason}` : ''
    await notifyTelegram(
      sub.telegram_user_id,
      `❌ *Your ad was not approved*\n\n` +
      `👤 ${sub.nickname}${reasonText}\n\n` +
      `You can submit a new ad with /publish`
    )

    return NextResponse.json({ ok: true, submission_id: submissionId })

  } catch (err) {
    console.error('[reject] Error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
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
