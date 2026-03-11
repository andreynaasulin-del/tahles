
import { createServiceRoleClient } from '@vm/db/src/service-client'
import { normalizeTitiData, detectCategories } from './normalizer'
import { diffProfile } from './diff'
import { computeQualityScore } from '@/lib/quality-score'
import { RawTitiListing } from './types'
import { TittiAdapter } from './adapters/titti.adapter'
import { SexfireAdapter } from './adapters/sexfire.adapter'
import { XfinderAdapter } from './adapters/xfinder.adapter'
import { IsearchingAdapter } from './adapters/issearching.adapter'
import { SiteParser, CrawlSection } from './parser.interface'

export class CrawlerService {
    private supabase = createServiceRoleClient()
    private adapters: SiteParser[] = [
        new TittiAdapter(),
        // Cloudflare-protected sites — run locally via crawl-cf-sites.ts script
        // Registered here so the service can process pre-fetched HTML
        new SexfireAdapter(),
        new XfinderAdapter(),
        // No Cloudflare — direct HTTP fetch works
        new IsearchingAdapter(),
    ]

    /** Cache: category slug → UUID */
    private categoryMap: Record<string, string> = {}

    private async loadCategories() {
        if (Object.keys(this.categoryMap).length > 0) return
        const { data } = await this.supabase.from('categories').select('id, slug')
        for (const cat of data ?? []) {
            this.categoryMap[cat.slug] = cat.id
        }
        console.log(`📚 [Crawler] Loaded ${Object.keys(this.categoryMap).length} categories:`, Object.keys(this.categoryMap))
    }

    async runFullCrawl() {
        console.log('🚀 [Crawler] Starting DEEP multi-site, multi-section crawl...');

        // Fresh client each cycle — prevents stale connections after 15-min sleep
        this.supabase = createServiceRoleClient()
        this.categoryMap = {}

        await this.loadCategories()

        const { data: users } = await this.supabase.from('users').select('id').limit(1);
        const systemUserId = users?.[0]?.id;

        if (!systemUserId) {
            console.error('🛑 ERROR: No users found. Skipping.');
            return;
        }

        for (const adapter of this.adapters) {
            console.log(`\n📂 [Crawler] Source: ${adapter.source} (${adapter.sections.length} sections)`);

            for (const section of adapter.sections) {
                console.log(`\n🏷️  [Crawler] Section: ${section.label} → category: ${section.categorySlug || 'none'}`);

                for (let page = 1; page <= 10; page++) {
                    try {
                        // Build pagination URL
                        let url: string;
                        if (page === 1) {
                            url = section.url;
                        } else if (section.url.endsWith('.html')) {
                            // /girls.html → /girls/page/2/
                            url = section.url.replace('.html', `/page/${page}/`);
                        } else {
                            // /premium-escorts/ → /premium-escorts/page/2/
                            url = section.url.replace(/\/?$/, `/page/${page}/`);
                        }

                        console.log(`📄 [Crawler] Fetching page ${page}: ${url}`);

                        const html = await this.fetchPage(url);
                        const listings = adapter.parseListing(html);

                        if (listings.length === 0) {
                            console.log(`🏁 [Crawler] No more listings on page ${page}. Next section.`);
                            break;
                        }

                        console.log(`✅ [Crawler] Found ${listings.length} listings on page ${page}`);

                        for (const listing of listings) {
                            await this.processProfile(adapter, listing, systemUserId, section);
                            // Рандомная пауза чтобы не забанили
                            await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));
                        }
                    } catch (error: any) {
                        console.error(`❌ [Crawler] Error on page ${page}:`, error.message);
                        if (error.message.includes('403') || error.message.includes('404')) break;
                    }
                }
            }
        }
        console.log('✨ [Crawler] Full cycle finished. Sleeping before next round...');
    }


    private async processProfile(adapter: SiteParser, listing: RawTitiListing, userId: string, section: CrawlSection) {
        try {
            const profileHtml = await this.fetchPage(listing.url)
            const rawProfile = adapter.parseProfile(profileHtml, listing)
            const normalized = normalizeTitiData(rawProfile, adapter.source)

            // ── Quality filter: skip junk profiles ──
            const hasContact = !!(normalized.contacts?.phone || normalized.contacts?.whatsapp)
            const hasPhotos = normalized.ad.photos && normalized.ad.photos.length > 0
            const hasComments = normalized.comments && normalized.comments.length > 0

            if (!hasContact || !hasPhotos) {
                console.log(`[Crawler] ⏭️  SKIP ${adapter.source}:${listing.source_id} (${listing.name}) — no ${!hasContact ? 'contacts' : 'photos'}`)
                return
            }

            // Проверяем наличие
            const { data: existing } = await this.supabase
                .from('advertisements')
                .select('*')
                .eq('source', adapter.source)
                .eq('source_id', listing.source_id)
                .single()

            const diff = diffProfile(existing as any, normalized.ad)
            if (diff.type === 'unchanged') return

            const { data: ad, error: adError } = await this.supabase
                .from('advertisements')
                .upsert({
                    ...normalized.ad,
                    nickname: listing.name,
                    source: adapter.source,
                    source_id: listing.source_id,
                    id: (existing as any)?.id,
                    user_id: userId
                } as any)
                .select()
                .single()

            const adRecord = ad as any
            if (adError || !adRecord) throw adError || new Error('Ad save failed')

            // Save contacts
            await this.supabase
                .from('contacts')
                .upsert({ ...normalized.contacts, ad_id: adRecord.id } as any)

            // Save comments
            if (normalized.comments && normalized.comments.length > 0) {
                for (const comment of normalized.comments) {
                    await this.supabase
                        .from('ad_comments')
                        .upsert(
                            { ...comment, ad_id: adRecord.id } as any,
                            { onConflict: 'comment_key' }
                        )
                }
                console.log(`💬 [Crawler] Saved ${normalized.comments.length} comments for ${listing.source_id}`)
            }

            // Save categories: section category + auto-detected from content
            const detectedSlugs = detectCategories(rawProfile)
            if (section.categorySlug && !detectedSlugs.includes(section.categorySlug)) {
                detectedSlugs.push(section.categorySlug)
            }
            const uniqueSlugs = [...new Set(detectedSlugs)]

            for (const slug of uniqueSlugs) {
                if (this.categoryMap[slug]) {
                    await this.supabase
                        .from('ad_categories')
                        .upsert(
                            { ad_id: adRecord.id, category_id: this.categoryMap[slug] },
                            { onConflict: 'ad_id,category_id' }
                        )
                }
            }

            // Compute and save quality_score
            const rawData = adRecord.raw_data || {}
            const enriched = rawData._enriched || {}
            const rdContacts = rawData.contacts || {}
            const qScore = computeQualityScore({
                score: rawData._score || 0,
                score_category: rawData._score_category || null,
                vip_status: adRecord.vip_status,
                verified: adRecord.verified,
                videos: enriched.videos || [],
                photos: adRecord.photos || [],
                whatsapp: rdContacts.whatsapp || rawData.wa || null,
                phone: rdContacts.phone || rawData.phone || null,
                telegram: null,
                services: enriched.services || [],
                price_table: enriched.priceTable || [],
                physical_params: enriched.physicalParams || {},
                languages: rawData.languages || [],
                price_min: adRecord.price_min,
                address: rawData._address || null,
                online_status: adRecord.online_status,
                created_at: adRecord.created_at,
            })
            await this.supabase
                .from('advertisements')
                .update({ quality_score: qScore })
                .eq('id', adRecord.id)

            console.log(`[Crawler] ✅ ${adapter.source}:${listing.source_id} (${listing.name}) → [${uniqueSlugs.join(', ')}] score=${qScore}`)
        } catch (error) {
            console.error(`[Crawler] ❌ ${adapter.source}:${listing.source_id}:`, error)
        }
    }

    private async fetchPage(url: string): Promise<string> {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept-Language': 'he-IL,he;q=0.9,ru-RU;q=0.8,ru;q=0.7,en-US;q=0.6,en;q=0.5'
            }
        })
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
        return res.text()
    }
}
