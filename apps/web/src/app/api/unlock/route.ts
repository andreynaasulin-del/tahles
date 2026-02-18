import { createServerClient } from '@vm/db'
import { createUnlockCheckoutSession } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { adId } = await request.json()

  if (!adId || typeof adId !== 'string') {
    return NextResponse.json({ error: 'adId required' }, { status: 400 })
  }

  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if ad exists
  const { data: ad, error: adError } = await supabase
    .from('advertisements')
    .select('id')
    .eq('id', adId)
    .single()

  if (adError || !ad) {
    return NextResponse.json({ error: 'Ad not found' }, { status: 404 })
  }

  // Check if already unlocked (paid unlock exists)
  const { data: existing } = await supabase
    .from('unlocks')
    .select('id, transactions ( status )')
    .eq('client_id', session.user.id)
    .eq('ad_id', adId)
    .single()

  if (existing) {
    return NextResponse.json({ already_unlocked: true })
  }

  // Create Stripe Checkout Session
  const checkoutSession = await createUnlockCheckoutSession({
    adId,
    clientUserId: session.user.id,
    returnUrl: process.env.NEXT_PUBLIC_APP_URL!,
  })

  return NextResponse.json({ checkout_url: checkoutSession.url })
}
