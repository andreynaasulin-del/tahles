import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
  typescript: true,
})

export async function createUnlockCheckoutSession({
  adId,
  clientUserId,
  returnUrl,
}: {
  adId: string
  clientUserId: string
  returnUrl: string
}) {
  const amountCents = parseInt(process.env.UNLOCK_PRICE_EUR_CENTS ?? '1000')

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Contact Reveal — VelvetMatching',
            description: 'One-time unlock to view advertiser contact details',
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${returnUrl}/ad/${adId}?unlocked=true`,
    cancel_url: `${returnUrl}/ad/${adId}?cancelled=true`,
    metadata: {
      ad_id: adId,
      client_user_id: clientUserId,
      purpose: 'unlock',
    },
  })

  return session
}
