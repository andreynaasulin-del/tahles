/**
 * Compute quality score for a profile.
 * Used for ranking profiles in search results.
 */
export function computeQualityScore(ad: {
  score?: number
  score_category?: string | null
  vip_status?: boolean
  verified?: boolean
  videos?: any[]
  photos?: any[]
  whatsapp?: string | null
  phone?: string | null
  telegram?: string | null
  services?: any[]
  price_table?: any[]
  physical_params?: Record<string, any>
  languages?: any[]
  price_min?: number | null
  address?: string | null
  online_status?: boolean
  created_at?: string | null
}): number {
  let rank = 0

  // Base score (0-100) weighted x10
  rank += (ad.score || 0) * 10

  // Score category bonus
  if (ad.score_category === 'HOT') rank += 500

  // VIP & verification trust signals
  if (ad.vip_status) rank += 200
  if (ad.verified) rank += 100

  // Media richness
  const vids = ad.videos?.length || 0
  const photos = ad.photos?.length || 0
  rank += vids * 80
  rank += photos * 10

  // Contact completeness
  if (ad.whatsapp) rank += 60
  if (ad.phone) rank += 30
  if (ad.telegram) rank += 20

  // Profile completeness
  const services = ad.services?.length || 0
  const priceTable = ad.price_table?.length || 0
  const params = Object.keys(ad.physical_params || {}).filter(
    (k: string) => ad.physical_params?.[k]
  ).length
  const langs = ad.languages?.length || 0
  rank += Math.min(services, 8) * 8
  rank += priceTable * 15
  rank += params * 12
  rank += langs * 5

  // Price & address filled
  if (ad.price_min) rank += 25
  if (ad.address) rank += 15

  // Online status boost
  if (ad.online_status) rank += 40

  // Freshness bonus
  if (ad.created_at) {
    const ageMs = Date.now() - new Date(ad.created_at).getTime()
    const ageDays = ageMs / (1000 * 60 * 60 * 24)
    if (ageDays < 1) rank += 100
    else if (ageDays < 3) rank += 60
    else if (ageDays < 7) rank += 30
  }

  return rank
}
