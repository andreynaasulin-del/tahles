// @ts-nocheck - Supabase type generation issues
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@vm/db'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'

// Next.js App Router: read raw body with request.text() — do NOT set bodyParser: false
export async function POST(request: Request) {
  const body = await request.text()
  const sig = headers().get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Stripe Webhook] Invalid signature:', message)
    return NextResponse.json({ error: `Invalid signature: ${message}` }, { status: 400 })
  }

  // Service role client — bypasses RLS for server-side financial operations
  const supabase = createServiceClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const { ad_id, client_user_id, purpose } = session.metadata ?? {}

    if (!ad_id || !client_user_id || !purpose) {
      console.error('[Stripe Webhook] Missing metadata', session.metadata)
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    // 1. Record transaction
    const { data: tx, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: client_user_id,
        amount: session.amount_total ?? 0,
        currency: session.currency ?? 'eur',
        status: 'paid',
        purpose: purpose as 'unlock' | 'vip' | 'boost' | 'verification',
        provider: 'stripe',
        provider_tx_id: typeof session.payment_intent === 'string'
          ? session.payment_intent
          : null,
      })
      .select()
      .single()

    if (txError) {
      console.error('[Stripe Webhook] Failed to insert transaction:', txError)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    // 2. Create unlock record (idempotent via UNIQUE constraint)
    if (purpose === 'unlock') {
      const { error: unlockError } = await supabase
        .from('unlocks')
        .upsert(
          {
            client_id: client_user_id,
            ad_id,
            tx_id: tx.id,
          },
          { onConflict: 'client_id,ad_id' }
        )

      if (unlockError) {
        console.error('[Stripe Webhook] Failed to insert unlock:', unlockError)
      }

      // 3. Notify advertiser via Telegram (async — don't block response)
      notifyAdvertiserOnUnlock(supabase, ad_id, client_user_id).catch(console.error)
    }
  }

  return NextResponse.json({ received: true })
}

async function notifyAdvertiserOnUnlock(
  supabase: ReturnType<typeof createServiceClient>,
  adId: string,
  _clientUserId: string
) {
  const { data: ad } = await supabase
    .from('advertisements')
    .select('nickname, users ( tg_id )')
    .eq('id', adId)
    .single()

  const tgId = (ad?.users as { tg_id: number | null } | null)?.tg_id
  if (!tgId) return

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) return

  const message = `🔔 Someone just unlocked your contact!\n\nAd: *${ad?.nickname}*\n\nCheck your dashboard for details.`

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: tgId,
      text: message,
      parse_mode: 'Markdown',
    }),
  })
}
