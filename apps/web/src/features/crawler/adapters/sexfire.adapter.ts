
import * as cheerio from 'cheerio';
import { SiteParser, CrawlSection } from '../parser.interface';
import { RawTitiListing, RawTitiProfile } from '../types';

/**
 * SexFire2 Adapter — WordPress escort directory
 *
 * Site: https://www.sexfire2.com
 * CMS: WordPress with custom theme
 * Protection: Cloudflare Managed Challenge (Turnstile) → requires Playwright
 *
 * Structure:
 *   Listing cards: div.sof (Schema.org AdultEntertainment markup)
 *   Profile pages: WordPress single post with structured data
 *   No pagination — all cards loaded on one page per category
 *
 * Categories:
 *   /נערות-ליווי/           → ~306 ads → individual
 *   /דירות-דיסקרטיות/       → ~325 ads → individual
 *   /עיסוי-אירוטי/          → ~330 ads → massage
 *   /קוקסינליות/            → ~2 ads   → trans
 */
export class SexfireAdapter implements SiteParser {
    source = 'sexfire';
    baseUrl = 'https://www.sexfire2.com';

    sections: CrawlSection[] = [
        {
            url: `${this.baseUrl}/%d7%a0%d7%a2%d7%a8%d7%95%d7%aa-%d7%9c%d7%99%d7%95%d7%95%d7%99/`,
            categorySlug: 'individual',
            label: 'Escort Girls (נערות ליווי)'
        },
        {
            url: `${this.baseUrl}/%d7%93%d7%99%d7%a8%d7%95%d7%aa-%d7%93%d7%99%d7%a1%d7%a7%d7%a8%d7%98%d7%99%d7%95%d7%aa/`,
            categorySlug: 'individual',
            label: 'Discreet Apartments (דירות דיסקרטיות)'
        },
        {
            url: `${this.baseUrl}/%d7%a2%d7%99%d7%a1%d7%95%d7%99-%d7%90%d7%99%d7%a8%d7%95%d7%98%d7%99/`,
            categorySlug: 'massage',
            label: 'Erotic Massage (עיסוי אירוטי)'
        },
        {
            url: `${this.baseUrl}/%d7%a7%d7%95%d7%a7%d7%a1%d7%99%d7%a0%d7%9c%d7%99%d7%95%d7%aa/`,
            categorySlug: 'trans',
            label: 'Trans (קוקסינליות)'
        },
    ];

    /**
     * Parse listing page — cards are div.sof with Schema.org markup
     *
     * Card HTML:
     *   div.sof[itemscope][itemtype="AdultEntertainment"]
     *     meta[itemprop="priceRange"]          → "300-1000 שקלים"
     *     address > span[itemprop="addressLocality"] → city
     *     a[href] (first non-.tel link)         → profile URL
     *     img.lazyload[data-src]               → preview photo
     *     div.info
     *       h4.name[itemprop="name"]           → name
     *       span.description                   → short description
     *       a.tel[href="tel:..."]              → phone
     *       span.send-msg[onclick="wMsg(...)"] → WhatsApp
     */
    parseListing(html: string): RawTitiListing[] {
        const $ = cheerio.load(html);
        const results: RawTitiListing[] = [];

        $('div.sof').each((_, el) => {
            const $el = $(el);

            // Profile link — first <a> that isn't .tel or .send-msg
            const $link = $el.find('a').not('.tel').not('.send-msg').first();
            const url = $link.attr('href');
            if (!url) return;

            // Source ID from URL slug
            const slug = decodeURIComponent(url).replace(/\/$/, '').split('/').pop() || '';
            const source_id = slug || Math.random().toString(36).slice(2);

            // Name
            const name = $el.find('h4.name').text().trim() ||
                $el.find('[itemprop="name"]').text().trim();
            if (!name) return;

            // City
            const city = $el.find('[itemprop="addressLocality"]').text().trim() || null;

            // Price
            const priceRange = $el.find('[itemprop="priceRange"]').attr('content') || '';
            const priceNums = priceRange.match(/(\d+)/g);
            const price_min = priceNums?.[0] ? parseInt(priceNums[0]) : null;
            const price_max = priceNums?.[1] ? parseInt(priceNums[1]) : null;

            // Preview image
            const $img = $el.find('img').first();
            const preview = $img.attr('data-src') || $img.attr('src') || null;

            // Badges
            const classes = $el.attr('class') || '';
            const is_vip = classes.includes('toptop');
            const is_verified = $el.html()?.includes('תמונות אמיתיות') || false;

            results.push({
                source_id,
                url: url.startsWith('http') ? url : `${this.baseUrl}${url}`,
                name,
                city,
                age: null,
                price_min,
                price_max,
                preview_image: preview,
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
     *   h1                                → full name
     *   [itemprop="addressLocality"]      → city
     *   [itemprop="disambiguatingDescription"] → full description
     *   a[href^="tel:"]                   → phone
     *   [onclick*="wMsg('972...'"]        → WhatsApp
     *   img[src*="uploads"]               → photos
     *   [itemprop="priceRange"]           → price range
     */
    parseProfile(html: string, listing: RawTitiListing): RawTitiProfile {
        const $ = cheerio.load(html);

        // Description
        const description =
            $('[itemprop="disambiguatingDescription"]').text().trim() ||
            $('[itemprop="description"]').text().trim() ||
            $('.entry-content p').first().text().trim() ||
            null;

        // Phone
        const telLink = $('a[href^="tel:"]').first();
        const phone = (telLink.attr('href')?.replace('tel:', '') ||
            telLink.attr('content') || '').replace(/\D/g, '');

        // WhatsApp — extract from wMsg('972...', 'Name')
        let whatsapp = '';
        const sendMsgOnclick = $('[onclick*="wMsg"]').first().attr('onclick') || '';
        const waMatch = sendMsgOnclick.match(/wMsg\s*\(\s*'(\d+)'/);
        if (waMatch) whatsapp = waMatch[1];
        if (!whatsapp) {
            const waHref = $('a[href*="wa.me"]').attr('href') || '';
            const waNum = waHref.match(/wa\.me\/(\d+)/);
            if (waNum) whatsapp = waNum[1];
        }

        // Photos — all wp-content/uploads images, full size
        const photos: string[] = [];
        $('img').each((_, el) => {
            const src = $(el).attr('data-src') || $(el).attr('src') || '';
            if (src.includes('uploads') && !src.includes('logo') && !src.includes('icon') && !src.includes('150x')) {
                // Remove WP thumbnail suffix -300x400 to get full size
                const fullSize = src.replace(/-\d+x\d+\./, '.');
                const fullUrl = fullSize.startsWith('http') ? fullSize : `${this.baseUrl}${fullSize}`;
                if (!photos.includes(fullUrl)) photos.push(fullUrl);
            }
        });
        // Gallery image links
        $('a[href$=".jpg"], a[href$=".jpeg"], a[href$=".png"], a[href$=".webp"]').each((_, el) => {
            const href = $(el).attr('href') || '';
            if (href.includes('uploads')) {
                const fullUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
                if (!photos.includes(fullUrl)) photos.push(fullUrl);
            }
        });

        // City
        const city = $('[itemprop="addressLocality"]').text().trim() || listing.city;

        // Categories from breadcrumbs
        const categories: string[] = [];
        $('[class*="bread"] a').each((_, el) => {
            const text = $(el).text().trim();
            if (text && text !== 'סקס אש' && text !== 'Home') categories.push(text);
        });

        // Services from tags
        const services: string[] = [];
        $('.tags a, .service-tag, .tag').each((_, el) => {
            const svc = $(el).text().trim();
            if (svc) services.push(svc);
        });

        const profile: RawTitiProfile = {
            ...listing,
            city: city || listing.city,
            description,
            photos,
            categories,
            languages: [],
            service_type: 'incall',
            contacts: {
                phone: phone || undefined,
                whatsapp: whatsapp || undefined,
                telegram: undefined,
            },
            comments: [],
            rating_avg: null,
            rating_count: null,
        };

        (profile as any)._enriched = {
            videos: [],
            priceTable: listing.price_min ? [{ duration: '1h', type: 'incall', amount: listing.price_min }] : [],
            physicalParams: {},
            services,
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
