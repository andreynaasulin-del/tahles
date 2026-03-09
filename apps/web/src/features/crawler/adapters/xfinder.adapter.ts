
import * as cheerio from 'cheerio';
import { SiteParser, CrawlSection } from '../parser.interface';
import { RawTitiListing, RawTitiProfile, RawTitiComment } from '../types';

/**
 * XFinder4 Adapter — WordPress escort directory
 *
 * Site: https://xfinder4.com/he/israel/
 * CMS: WordPress with custom theme (xfinder)
 * Protection: Cloudflare Managed Challenge → requires Playwright
 *
 * Structure:
 *   Listing cards: div.top_girl_box
 *   Profile pages: WordPress single "profile" post type
 *   Pagination: AJAX-loaded (single page per category+city)
 *
 * Categories (nav menu, real URLs):
 *   /girl-cat/דירות-דיסקרטיות/          → discreet apartments → individual
 *   /girl-cat/נערות-ליווי/              → escort girls        → individual
 *   /girl-cat/עיסוי-אירוטי/            → erotic massage      → massage
 *   /girl-cat/שירותי-ליווי/            → escort services     → individual
 *   /girl-cat/קוקסינליות/              → trans               → trans
 *   /girl-cat/bdsm/                    → BDSM               → domina
 */
export class XfinderAdapter implements SiteParser {
    source = 'xfinder';
    baseUrl = 'https://xfinder4.com';

    sections: CrawlSection[] = [
        {
            url: `${this.baseUrl}/he/israel/girl-cat/%d7%93%d7%99%d7%a8%d7%95%d7%aa-%d7%93%d7%99%d7%a1%d7%a7%d7%a8%d7%98%d7%99%d7%95%d7%aa/`,
            categorySlug: 'individual',
            label: 'Discreet Apartments (דירות דיסקרטיות)',
        },
        {
            url: `${this.baseUrl}/he/israel/girl-cat/%d7%a0%d7%a2%d7%a8%d7%95%d7%aa-%d7%9c%d7%99%d7%95%d7%95%d7%99/`,
            categorySlug: 'individual',
            label: 'Escort Girls (נערות ליווי)',
        },
        {
            url: `${this.baseUrl}/he/israel/girl-cat/%d7%a2%d7%99%d7%a1%d7%95%d7%99-%d7%90%d7%99%d7%a8%d7%95%d7%98%d7%99/`,
            categorySlug: 'massage',
            label: 'Erotic Massage (עיסוי אירוטי)',
        },
        {
            url: `${this.baseUrl}/he/israel/girl-cat/%d7%a9%d7%99%d7%a8%d7%95%d7%aa%d7%99-%d7%9c%d7%99%d7%95%d7%95%d7%99/`,
            categorySlug: 'individual',
            label: 'Escort Services (שירותי ליווי)',
        },
        {
            url: `${this.baseUrl}/he/israel/girl-cat/%d7%a7%d7%95%d7%a7%d7%a1%d7%99%d7%a0%d7%9c%d7%99%d7%95%d7%aa/`,
            categorySlug: 'trans',
            label: 'Trans (קוקסינליות)',
        },
        {
            url: `${this.baseUrl}/he/israel/girl-cat/bdsm/`,
            categorySlug: 'domina',
            label: 'BDSM',
        },
    ];

    /**
     * Parse listing page — cards are div.top_girl_box
     *
     * Card structure (from accessibility tree + JS analysis):
     *   div.top_girl_box
     *     a[href="/he/israel/profile/{slug}/"]   → profile link (wraps card)
     *       h3 or heading                        → full title
     *       h2.main-title.starTitle              → "9.5 מצויין" (rating, optional)
     *       img                                  → preview photo
     *       div                                  → city text
     *       div                                  → description text
     *     (after main link block, outside or sibling)
     *     a[href="tel:XXX"]                      → phone
     *     a[href*="whatsapp.com/send"]           → WhatsApp with phone=+972...
     */
    parseListing(html: string): RawTitiListing[] {
        const $ = cheerio.load(html);
        const results: RawTitiListing[] = [];

        $('div.top_girl_box').each((_, el) => {
            const $el = $(el);

            // Profile link — first <a> pointing to /profile/
            const $link = $el.find('a[href*="/profile/"]').first();
            const url = $link.attr('href');
            if (!url) return;

            // Source ID from URL slug
            const slug = decodeURIComponent(url).replace(/\/$/, '').split('/').pop() || '';
            const source_id = slug || Math.random().toString(36).slice(2);

            // Name — h3 inside the card link, or any heading
            const name = $el.find('h3').first().text().trim() ||
                $el.find('h2').not('.starTitle').first().text().trim();
            if (!name) return;

            // Rating from h2.starTitle — "9.5 מצויין"
            const ratingText = $el.find('h2.starTitle, .starTitle').first().text().trim();
            const ratingMatch = ratingText.match(/([\d.]+)/);

            // City — look for specific text patterns
            // On listing page, city appears in small div after image
            let city: string | null = null;
            $el.find('div, span').each((_, child) => {
                const text = $(child).text().trim();
                // City names are short Hebrew text, not descriptions
                if (!city && text.length > 1 && text.length < 30 && !text.includes('...') &&
                    !text.includes('מצויין') && !text.includes('טוב')) {
                    // Check if it looks like a city (appears after image, before description)
                    const parent = $(child).parent();
                    if (parent.is('a[href*="/profile/"]') || parent.is('.top_girl_box')) {
                        // Skip if it's clearly a description (too long)
                        if (text.length < 20) city = text;
                    }
                }
            });

            // Preview image
            const $img = $el.find('img').first();
            const preview = $img.attr('data-src') || $img.attr('src') || null;

            // Phone — a[href^="tel:"] near the card
            const phoneHref = $el.find('a[href^="tel:"]').first().attr('href') || '';
            const phone = phoneHref.replace('tel:', '').replace(/-/g, '').trim();

            // WhatsApp — extract phone from whatsapp API URL
            const waHref = $el.find('a[href*="whatsapp"]').first().attr('href') || '';
            const waMatch = waHref.match(/phone=\+?(\d+)/);
            const whatsapp = waMatch?.[1] || '';

            // VIP/TOP badges — check for class or text indicators
            const classes = $el.attr('class') || '';
            const is_vip = classes.includes('vip') || classes.includes('top') ||
                $el.find('[class*=vip], [class*=top_badge]').length > 0;

            // Verified — check for "מאומתת" badge
            const cardHtml = $el.html() || '';
            const is_verified = cardHtml.includes('מאומתת') || cardHtml.includes('verified');

            results.push({
                source_id,
                url: url.startsWith('http') ? url : `${this.baseUrl}${url}`,
                name,
                city,
                age: null,
                price_min: null,
                price_max: null,
                preview_image: preview && !preview.startsWith('data:')
                    ? (preview.startsWith('http') ? preview : `${this.baseUrl}${preview}`)
                    : null,
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
     * Structure (from real page analysis):
     *   h3 (no class)                          → full name/title
     *   h2.main-title.starTitle                → "9.5 מצויין" rating
     *   div.title-detail                       → full description
     *   div.girl_details_row_cont
     *     div.girl_details_inside_row
     *       div.gd_left                        → label (אתניות, שירותים, עיר, etc.)
     *       div.gd_right                       → value
     *   div.profile_gallery img                → photos
     *   a[href^="tel:"]                        → phone
     *   a[href*="whatsapp"]                    → WhatsApp
     *   div.feedback_box
     *     div.feedback_row_header              → "author DD.MM.YYYY"
     *     div.frhs_right.review-text           → review text
     *   body.postid-XXXXX                      → post ID
     */
    parseProfile(html: string, listing: RawTitiListing): RawTitiProfile {
        const $ = cheerio.load(html);

        // Name — h3 without class (the main title)
        const profileName = $('h3').not('[class]').first().text().trim() ||
            $('h3').first().text().trim() || listing.name;

        // Description — .title-detail has the full description
        const description = $('.title-detail').first().text().trim() || null;

        // Rating
        const ratingText = $('h2.starTitle, .main-title.starTitle').first().text().trim();
        const ratingMatch = ratingText.match(/([\d.]+)/);
        const rating_avg = ratingMatch ? parseFloat(ratingMatch[1]) : null;

        // Rating count — "על פי N מדרגים"
        const ratingRow = $('.grid-rating_row').text();
        const ratingCountMatch = ratingRow.match(/על פי (\d+)/);
        const rating_count = ratingCountMatch ? parseInt(ratingCountMatch[1]) : null;

        // Details from girl_details_inside_row (key-value pairs)
        const details: Record<string, string> = {};
        $('.girl_details_inside_row').each((_, row) => {
            const label = $(row).find('.gd_left').text().trim();
            const value = $(row).find('.gd_right').text().trim();
            if (label && value) details[label] = value;
        });

        const city = details['עיר'] || listing.city;
        const region = details['איזור'] || null;
        const ethnicity = details['אתניות'] || null;
        const hairColor = details['צבע שיער'] || null;
        const eyeColor = details['צבע עיניים'] || null;
        const serviceFor = details['שירותים'] || null;

        // Phone
        const telLink = $('a[href^="tel:"]').first();
        const phone = (telLink.attr('href')?.replace('tel:', '') || '').replace(/-/g, '').trim();

        // WhatsApp — extract from api.whatsapp.com/send?phone=+972...
        let whatsapp = '';
        const waHref = $('a[href*="whatsapp"]').first().attr('href') || '';
        const waMatch = waHref.match(/phone=\+?(\d+)/);
        if (waMatch) whatsapp = waMatch[1];

        // Photos — .profile_gallery img + any large content images
        const photos: string[] = [];
        $('.profile_gallery img').each((_, el) => {
            const src = $(el).attr('data-src') || $(el).attr('src') || '';
            if (src && !src.startsWith('data:') && !src.includes('logo') && !src.includes('icon')) {
                const fullSize = src.replace(/-\d+x\d+\./, '.');
                const fullUrl = fullSize.startsWith('http') ? fullSize : `${this.baseUrl}${fullSize}`;
                if (!photos.includes(fullUrl)) photos.push(fullUrl);
            }
        });
        // Also check for gallery links (lightbox)
        $('a[href$=".jpg"], a[href$=".jpeg"], a[href$=".png"], a[href$=".webp"]').each((_, el) => {
            const href = $(el).attr('href') || '';
            if (href && href.includes('uploads')) {
                const fullUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
                if (!photos.includes(fullUrl)) photos.push(fullUrl);
            }
        });

        // Comments — .feedback_box contains .feedback_row_header (author + date) and .review-text
        const comments: RawTitiComment[] = [];
        $('.feedback_box').each((_, box) => {
            const $box = $(box);
            const header = $box.find('.feedback_row_header').first().text().trim();
            // Header format: "author DD.MM.YYYY" or just "DD.MM.YYYY"
            const dateMatch = header.match(/(\d{2}\.\d{2}\.\d{4})/);
            const date_raw = dateMatch?.[1] || null;
            const author = header.replace(/\d{2}\.\d{2}\.\d{4}/, '').trim() || null;

            // Review text — may have "happy" and "sad" sections
            const happyText = $box.find('.feedback_row_happy_sad').first().find('.frhs_right.review-text').text().trim();
            const sadText = $box.find('.feedback_row_happy_sad.last').find('.frhs_right.review-text').text().trim();
            const text = [happyText, sadText].filter(Boolean).join(' | ') || null;

            if (text) {
                comments.push({
                    comment_key: `xfinder-${listing.source_id}-${comments.length}`,
                    author,
                    text,
                    rating: rating_avg,  // xfinder doesn't have per-comment ratings, use overall
                    date_raw,
                });
            }
        });

        // Categories from breadcrumbs
        const categories: string[] = [];
        $('[class*=bread] a, .breadcrumb a').each((_, el) => {
            const text = $(el).text().trim();
            if (text && text !== 'נערות ליווי אקספיינדר' && text !== 'Home') categories.push(text);
        });

        // Services from detail fields
        const services: string[] = [];
        if (serviceFor) services.push(serviceFor);

        // Physical params
        const physicalParams: Record<string, string> = {};
        if (ethnicity) physicalParams.ethnicity = ethnicity;
        if (hairColor) physicalParams.hairColor = hairColor;
        if (eyeColor) physicalParams.eyeColor = eyeColor;

        const profile: RawTitiProfile = {
            ...listing,
            name: profileName || listing.name,
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
            comments,
            rating_avg,
            rating_count,
        };

        (profile as any)._enriched = {
            videos: [],
            priceTable: [],
            physicalParams,
            services,
            shortDescription: description?.slice(0, 150) || null,
            payments: null,
            parking: null,
            region: region || city || null,
            registrationDate: null,
            showsCount: null,
            commentsCount: comments.length || null,
        };

        return profile;
    }
}
