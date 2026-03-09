
import * as cheerio from 'cheerio';
import { SiteParser, CrawlSection } from '../parser.interface';
import { RawTitiListing, RawTitiProfile, RawTitiComment } from '../types';

/**
 * iSearching Adapter — WordPress escort directory
 *
 * Site: https://issearching.com
 * CMS: WordPress (Astra theme) with custom child theme
 * Protection: None (plain HTTP, no Cloudflare)
 *
 * Structure:
 *   Listing page: li.card_type_* inside ul.wrap_cards_vip
 *     - Each card has Schema.org (Service) + JSON-LD (LocalBusiness + Review/Product)
 *     - Phone in div.card_phone, WhatsApp in div.card_whatsapp
 *     - Profile link: a[href*="/index/"]
 *
 *   Profile page: #wrap_big_card
 *     - Photos: RoyalSlider #gallery-1 a.rsImg[href]
 *     - Description: #right_half p
 *     - Contacts: #content_phone, #content_whatsapp
 *     - Price/City from JSON-LD
 *     - Verified badge: #content_certificate .verified
 *
 *   Pagination: /escort/page/2/, /escort/page/3/ etc.
 *
 * Sections:
 *   /escort/      → ~300+ ads → individual
 *   /apartments/  → discreet apartments → individual
 *   /realpic/     → verified photos → individual
 *   /massage-spa/ → massage
 *   /bdsm/        → bdsm
 *   /trans/       → trans
 */
export class IsearchingAdapter implements SiteParser {
    source = 'isearching';
    baseUrl = 'https://issearching.com';

    sections: CrawlSection[] = [
        {
            url: `${this.baseUrl}/escort/`,
            categorySlug: 'individual',
            label: 'Escort (שירותי ליווי)'
        },
        // apartments не берём — не нужны
        {
            url: `${this.baseUrl}/realpic/`,
            categorySlug: 'individual',
            label: 'Real Pics (תמונות אמיתיות)'
        },
        {
            // עיסוי אירוטי
            url: `${this.baseUrl}/%d7%a2%d7%99%d7%a1%d7%95%d7%99-%d7%90%d7%99%d7%a8%d7%95%d7%98%d7%99/`,
            categorySlug: 'massage',
            label: 'Erotic Massage (עיסוי אירוטי)'
        },
        {
            // יחסי שליטה bdsm → маппим на domina (в БД нет отдельной bdsm)
            url: `${this.baseUrl}/%d7%99%d7%97%d7%a1%d7%99-%d7%a9%d7%9c%d7%99%d7%98%d7%94-bdsm/`,
            categorySlug: 'domina',
            label: 'BDSM / Domina (יחסי שליטה)'
        },
        {
            // קוקסינליות → trans (сейчас 0 в БД!)
            url: `${this.baseUrl}/%d7%a7%d7%95%d7%a7%d7%a1%d7%99%d7%a0%d7%9c%d7%99%d7%95%d7%aa/`,
            categorySlug: 'trans',
            label: 'Trans (קוקסינליות)'
        },
    ];

    /**
     * Parse listing page — cards are li.card_type_* with JSON-LD
     *
     * Card HTML:
     *   li.card_type_1[itemscope][itemtype="Service"]
     *     script[type="application/ld+json"] (LocalBusiness) → phone, city, image
     *     script[type="application/ld+json"] (Review/Product) → price, sku, description
     *     div.title_info[itemprop="name"]   → title
     *     div.card_phone a[href^="tel:"]    → phone
     *     div.card_whatsapp a[href*="wa.me"] → whatsapp
     *     div.wrap_img > img[itemprop="image"] → preview image
     *     div.card_cert img[src*="verified"] → verified badge
     *     div.card_vip img[src*="vip"]       → VIP badge
     *     a[href*="/index/"]                 → profile link
     */
    parseListing(html: string): RawTitiListing[] {
        const $ = cheerio.load(html);
        const results: RawTitiListing[] = [];

        // Each card is an li with card_type_* class
        $('li[class*="card_type_"]').each((_, el) => {
            const $el = $(el);

            // Profile link — find <a> pointing to /index/
            const $link = $el.find('a[href*="/index/"]').first();
            const url = $link.attr('href');
            if (!url) return;

            // --- Parse JSON-LD structured data ---
            let jsonLdBusiness: any = null;
            let jsonLdProduct: any = null;

            $el.find('script[type="application/ld+json"]').each((_, script) => {
                try {
                    const json = JSON.parse($(script).html() || '');
                    if (json['@type'] === 'LocalBusiness') {
                        jsonLdBusiness = json;
                    } else if (json['@type'] === 'Review' && json.itemReviewed) {
                        jsonLdProduct = json.itemReviewed;
                    }
                } catch { /* ignore malformed JSON-LD */ }
            });

            // Source ID — always use URL slug for consistency across sections
            // (same profile in /escort/ and /realpic/ will have same slug)
            const source_id = decodeURIComponent(url).replace(/\/$/, '').split('/').pop() || '';

            // Name from title_info or JSON-LD
            const name = $el.find('.title_info').text().trim() ||
                $el.find('[itemprop="name"]').text().trim() ||
                jsonLdBusiness?.name || '';
            if (!name) return;

            // City from JSON-LD
            const city = jsonLdBusiness?.address?.addressLocality || null;

            // Price from JSON-LD Product offers, fallback to LocalBusiness priceRange
            const priceStr = jsonLdProduct?.offers?.price;
            let price_min: number | null = priceStr ? parseInt(priceStr) : null;
            if (!price_min && jsonLdBusiness?.priceRange) {
                const priceMatch = jsonLdBusiness.priceRange.match(/(\d+)/);
                if (priceMatch) price_min = parseInt(priceMatch[1]);
            }

            // Preview image
            const preview_image = $el.find('img[itemprop="image"]').attr('src') ||
                $el.find('.wrap_img img').attr('src') ||
                jsonLdBusiness?.image || null;

            // Phone from card_phone
            const phoneLink = $el.find('.card_phone a[href^="tel:"]').attr('href') || '';
            const phone = phoneLink.replace('tel:', '').replace(/[-\s]/g, '');

            // WhatsApp from card_whatsapp
            const waLink = $el.find('.card_whatsapp a[href*="wa.me"]').attr('href') || '';
            const waMatch = waLink.match(/wa\.me\/\+?(\d+)/);
            const whatsapp = waMatch ? waMatch[1] : '';

            // Badges
            const is_verified = $el.find('.card_cert img[src*="verified"]').length > 0 ||
                $el.find('img[src*="verified-picture"]').length > 0;
            const is_vip = $el.find('.card_vip img[src*="vip"]').length > 0 ||
                $el.find('img[src*="vip-girl"]').length > 0;

            // Video indicator
            const hasVideo = $el.find('.card_video').length > 0 &&
                !$el.find('.card_video').hasClass('disable_video');

            results.push({
                source_id,
                url: url.startsWith('http') ? url : `${this.baseUrl}${url}`,
                name,
                city,
                age: null, // not available in listing
                price_min,
                price_max: null,
                preview_image,
                is_verified,
                is_vip,
                views_today: null,
                online_status: false,
            });
        });

        return results;
    }

    /**
     * Parse profile page
     *
     * Structure:
     *   #wrap_big_card — main container
     *   .singel_the_title h1[itemprop="name"] → title
     *   #right_half p — description paragraphs
     *   #left_half #gallery-1 a.rsImg[href] — photos (RoyalSlider)
     *   #content_phone a[href^="tel:"] — phone
     *   #content_whatsapp a[href*="wa.me"] — WhatsApp
     *   #content_certificate .verified — verified badge
     *   #breadcrumb a — categories/location from breadcrumbs
     *   JSON-LD LocalBusiness → city, phone, priceRange
     *   JSON-LD Review/Product → price, sku, description
     */
    parseProfile(html: string, listing: RawTitiListing): RawTitiProfile {
        const $ = cheerio.load(html);

        // --- Parse JSON-LD from profile page ---
        let jsonLdBusiness: any = null;
        let jsonLdProduct: any = null;

        $('script[type="application/ld+json"]').each((_, script) => {
            try {
                const json = JSON.parse($(script).html() || '');
                if (json['@type'] === 'LocalBusiness') {
                    jsonLdBusiness = json;
                } else if (json['@type'] === 'Review' && json.itemReviewed) {
                    jsonLdProduct = json.itemReviewed;
                }
            } catch { /* ignore malformed JSON-LD */ }
        });

        // --- PHOTOS: RoyalSlider gallery ---
        const photos: string[] = [];

        // Primary: a.rsImg href (full-size images)
        $('#gallery-1 a.rsImg, .royalSlider a.rsImg').each((_, el) => {
            const href = $(el).attr('href') || $(el).attr('data-rsBigImg') || '';
            if (href && href.includes('uploads') && !photos.includes(href)) {
                photos.push(href);
            }
        });

        // Fallback: any img with itemprop="image" inside gallery
        if (photos.length === 0) {
            $('img[itemprop="image"]').each((_, el) => {
                const src = $(el).attr('src') || '';
                if (src && src.includes('uploads') && !src.includes('150x') && !photos.includes(src)) {
                    // Remove WP thumbnail suffix to get full size
                    const fullSize = src.replace(/-\d+x\d+\./, '.');
                    if (!photos.includes(fullSize)) photos.push(fullSize);
                }
            });
        }

        // Fallback: any wp-content/uploads images
        if (photos.length === 0) {
            $('img[src*="uploads"]').each((_, el) => {
                const src = $(el).attr('src') || '';
                if (src && !src.includes('logo') && !src.includes('icon') && !src.includes('150x')) {
                    const fullSize = src.replace(/-\d+x\d+\./, '.');
                    const fullUrl = fullSize.startsWith('http') ? fullSize : `${this.baseUrl}${fullSize}`;
                    if (!photos.includes(fullUrl)) photos.push(fullUrl);
                }
            });
        }

        // --- DESCRIPTION: from #right_half paragraphs or JSON-LD ---
        const descParts: string[] = [];
        $('#right_half p').each((_, el) => {
            const text = $(el).text().trim();
            // Skip disclaimer / footer text
            if (text && text.length > 5 && !text.includes('האתר אינו') && !text.includes('isearching')) {
                descParts.push(text);
            }
        });
        const description = descParts.join('\n\n') ||
            jsonLdProduct?.description ||
            $('meta[name="description"]').attr('content')?.trim() ||
            null;

        // --- CONTACTS ---
        // Phone from profile page
        const phoneLink = $('#content_phone a[href^="tel:"]').attr('href') || '';
        const phone = phoneLink.replace('tel:', '').replace(/[-\s]/g, '');

        // WhatsApp from profile page
        const waLink = $('#content_whatsapp a[href*="wa.me"]').attr('href') || '';
        const waMatch = waLink.match(/wa\.me\/\+?(\d+)/);
        const whatsapp = waMatch ? waMatch[1] : '';

        // Fallback phone from JSON-LD
        const phoneFallback = phone || (jsonLdBusiness?.telephone || '').replace(/[-\s]/g, '');

        // --- CITY: from JSON-LD or breadcrumb ---
        const city = jsonLdBusiness?.address?.addressLocality || listing.city;

        // --- PRICE: from JSON-LD Product, fallback to LocalBusiness priceRange ---
        const priceStr = jsonLdProduct?.offers?.price;
        let priceMin: number | null = priceStr ? parseInt(priceStr) : null;
        if (!priceMin && jsonLdBusiness?.priceRange) {
            const priceMatch = jsonLdBusiness.priceRange.match(/(\d+)/);
            if (priceMatch) priceMin = parseInt(priceMatch[1]);
        }
        if (!priceMin) priceMin = listing.price_min;

        // --- VERIFIED: from #content_certificate ---
        const isVerified = $('#content_certificate .verified').length > 0 ||
            listing.is_verified;

        // --- CATEGORIES: from breadcrumb ---
        const categories: string[] = [];
        $('#breadcrumb a').each((_, el) => {
            const text = $(el).text().trim();
            // Skip "home page" link
            if (text && text !== 'דף הבית' && text !== 'Home') {
                categories.push(text);
            }
        });

        // --- TITLE ---
        const title = $('.singel_the_title h1').text().trim() ||
            $('h1[itemprop="name"]').text().trim() ||
            jsonLdBusiness?.name ||
            listing.name;

        // --- Build price table ---
        const priceTable: { duration: string; type: string; amount: number }[] = [];
        if (priceMin) {
            priceTable.push({ duration: '1h', type: 'incall', amount: priceMin });
        }

        // --- SOURCE_ID: use listing's slug (consistent across sections) ---
        const sourceId = listing.source_id;

        const profile: RawTitiProfile = {
            ...listing,
            source_id: sourceId,
            name: title,
            city: city || listing.city,
            price_min: priceMin ?? listing.price_min,
            is_verified: isVerified,
            description,
            photos,
            categories,
            languages: [],
            service_type: 'incall', // issearching doesn't distinguish incall/outcall
            contacts: {
                phone: phoneFallback || undefined,
                whatsapp: whatsapp || undefined,
                telegram: undefined,
            },
            comments: [], // issearching has no real user reviews in HTML
            rating_avg: null,
            rating_count: null,
        };

        (profile as any)._enriched = {
            videos: [],
            priceTable,
            physicalParams: {},
            services: [],
            shortDescription: description?.slice(0, 150) || null,
            payments: null,
            parking: null,
            region: city || null,
            registrationDate: null,
            showsCount: null,
            commentsCount: null,
        };

        return profile;
    }
}
