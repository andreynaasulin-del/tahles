import { createServerClient } from '@vm/db'
import { parseListing, parseProfile } from './parser'
import { normalizeTitiData } from './normalizer'
import { diffProfile } from './diff'
import { RawTitiListing } from './types'

export class CrawlerService {
    private supabase = createServerClient()
    private readonly SOURCE = 'titi'
    private readonly BASE_URL = 'https://www.titi.co.il'

    /**
     * Main entry point: Crawl the titi.co.il listing and update all profiles
     */
    async runFullCrawl() {
        console.log('[Crawler] Starting full crawl cycle...')

        try {
            // 1. Fetch Listing
            const listingHtml = await this.fetchPage(this.BASE_URL)
            const listings = parseListing(listingHtml)
            console.log(`[Crawler] Found ${listings.length} listings`)

            for (const listing of listings) {
                await this.processProfile(listing)
                // Respectful jitter (300-1200ms)
                await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 900))
            }

            console.log('[Crawler] Full crawl cycle completed')
        } catch (error) {
            console.error('[Crawler] Error during crawl:', error)
        }
    }

    private async processProfile(listing: RawTitiListing) {
        try {
            // 1. Fetch Profile Details
            const profileHtml = await this.fetchPage(listing.url)
            const rawProfile = parseProfile(profileHtml, listing)

            // 2. Normalize
            const normalized = normalizeTitiData(rawProfile)

            // 3. Find existing
            const { data: existing } = await this.supabase
                .from('advertisements')
                .select('*')
                .eq('source', this.SOURCE)
                .eq('source_id', listing.source_id)
                .single()

            // 4. Diff
            const diff = diffProfile(existing as any, normalized.ad)

            if (diff.type === 'unchanged') {
                console.log(`[Crawler] Profile ${listing.source_id} unchanged. Skipping update.`)
                return
            }

            // 5. Save/Update Advertisement
            const { data: ad, error: adError } = await this.supabase
                .from('advertisements')
                .upsert({
                    ...normalized.ad,
                    id: (existing as any)?.id, // Keep ID if updating
                    user_id: '00000000-0000-0000-0000-000000000000' // SYSTEM USER or specific admin
                } as any, { onConflict: 'source,source_id' })
                .select()
                .single()

            const adRecord = ad as any
            if (adError || !adRecord) throw adError || new Error('Ad save failed')

            // 6. Save Contacts
            await this.supabase
                .from('contacts')
                .upsert({ ...normalized.contacts, ad_id: adRecord.id } as any)

            // 7. Save Comments
            for (const comment of normalized.comments) {
                await this.supabase
                    .from('ad_comments')
                    .upsert({ ...comment, ad_id: adRecord.id } as any, { onConflict: 'ad_id,comment_key' })
            }

            // 8. Record Change
            await this.supabase
                .from('profile_changes')
                .insert({
                    ad_id: adRecord.id,
                    change_type: diff.type,
                    changed_fields: diff.changedFields,
                    before_json: diff.before as any,
                    after_json: diff.after as any
                } as any)

            console.log(`[Crawler] Profile ${listing.source_id} ${diff.type} successfully`)

        } catch (error) {
            console.error(`[Crawler] Failed to process profile ${listing.source_id}:`, error)
        }
    }

    private async fetchPage(url: string): Promise<string> {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,he;q=0.6'
            }
        })

        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`)
        return res.text()
    }
}
