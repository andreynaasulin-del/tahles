
import * as cheerio from 'cheerio';
import { SiteParser, CrawlSection } from '../parser.interface';
import { RawTitiListing, RawTitiProfile, RawTitiComment } from '../types';

export class TittiAdapter implements SiteParser {
    source = 'titi';
    baseUrl = 'https://www.titti.co.il';

    /**
     * Все разделы titti.co.il → маппинг на Tahles-категории
     *
     * titti sections:
     *   /premium-escorts/  → "Elite escort" (VIP/premium) → наша: individual
     *   /hotexclusive.html → "HOT Exclusive"              → наша: individual (VIP)
     *   /girls.html        → "Independent incall girls"    → наша: individual
     *   /escort-services.html → "OutCall Escort"           → наша: individual (outcall)
     *   /erotic-massage.html  → "Erotic massage"           → наша: massage
     *   /discreet-apartments.html → "Discreet apartments"  → наша: individual
     */
    sections: CrawlSection[] = [
        { url: `${this.baseUrl}/premium-escorts/`, categorySlug: 'individual', label: 'Premium Escorts' },
        { url: `${this.baseUrl}/hotexclusive.html`, categorySlug: 'individual', label: 'HOT Exclusive' },
        { url: `${this.baseUrl}/girls.html`, categorySlug: 'individual', label: 'Independent Girls' },
        { url: `${this.baseUrl}/escort-services.html`, categorySlug: 'individual', label: 'OutCall Escort' },
        { url: `${this.baseUrl}/erotic-massage.html`, categorySlug: 'massage', label: 'Erotic Massage' },
        { url: `${this.baseUrl}/discreet-apartments.html`, categorySlug: 'individual', label: 'Discreet Apartments' },
        { url: `${this.baseUrl}/apartments.html`, categorySlug: 'individual', label: 'Apartments' },
    ];

    parseListing(html: string): RawTitiListing[] {
        const $ = cheerio.load(html);
        const results: RawTitiListing[] = [];

        $('.listing_box li[id^="fli_"]').each((_, el) => {
            const $el = $(el);
            const $link = $el.find('.picture a');
            const url = $link.attr('href');
            if (!url) return;

            const source_id = url.split('-').pop()?.replace('.html', '') || '';
            const title = $link.attr('title') || '';
            const name = title.split(',')[0].trim();
            const city = $el.find('li[id$="_country_level1"] div').text().trim();
            const preview_image = $el.find('.picture img').attr('src') || null;

            results.push({
                source_id,
                url: url.startsWith('http') ? url : `${this.baseUrl}${url}`,
                name,
                city: city || null,
                age: parseInt(title.split(',')[1]) || null,
                price_min: null,
                price_max: null,
                preview_image,
                is_verified: $el.find('.verifiedIcon').length > 0 || $el.find('.verifiedDetailsBigIcon').length > 0,
                is_vip: $el.find('.hot_exclusive').length > 0,
                views_today: null,
                online_status: $el.find('.online').length > 0,
            });
        });

        return results;
    }

    parseProfile(html: string, listing: RawTitiListing): RawTitiProfile {
        const $ = cheerio.load(html);

        // --- PHOTOS & VIDEOS: Parse photos_source JS array ---
        // Photos have type: 'image', Videos have type: 'local' with .mp4 in href
        const photos: string[] = [];
        const videos: string[] = [];

        // Parse each photos_source.push({ ... }) entry
        const pushRegex = /photos_source\.push\(\s*\{([^}]+)\}/g;
        let pushMatch;
        while ((pushMatch = pushRegex.exec(html)) !== null) {
            const block = pushMatch[1];
            const typeMatch = block.match(/type:\s*'([^']*)'/);
            const hrefMatch = block.match(/href:\s*'([^']*)'/);
            const largeMatch = block.match(/large:\s*'([^']*)'/);
            const itemType = typeMatch?.[1] || '';
            const href = hrefMatch?.[1] || '';
            const large = largeMatch?.[1] || '';

            if (itemType === 'local' && href.includes('.mp4')) {
                // Video entry — URL is in href field
                const videoUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
                if (!videos.includes(videoUrl)) videos.push(videoUrl);
            } else if (itemType === 'image' || (!itemType && large && !large.endsWith('/files/'))) {
                // Photo entry — use _large version for full quality (676x900 vs thumbnail 189x245)
                let rawUrl = large.startsWith('http') ? large : `${this.baseUrl}${large}`;
                // Upgrade to _large version if not already
                if (rawUrl.endsWith('.webp') && !rawUrl.includes('_large')) {
                    rawUrl = rawUrl.replace(/\.webp$/, '_large.webp');
                }
                if (rawUrl && !rawUrl.endsWith('/files/') && !rawUrl.includes('/images/') && !rawUrl.includes('logo')) {
                    if (!photos.includes(rawUrl)) photos.push(rawUrl);
                }
            }
        }

        // Fallback: gallery thumbnails (if JS parsing found nothing)
        if (photos.length === 0) {
            $('.gallery .thumbs li').each((_, el) => {
                const $li = $(el);
                const href = $li.attr('href') || '';
                const isVideo = $li.hasClass('fancybox.iframe') || href.includes('.mp4');
                if (isVideo && href.includes('.mp4')) {
                    const url = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
                    if (!videos.includes(url)) videos.push(url);
                } else if (href && !href.includes('/images/')) {
                    let url = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
                    // Upgrade to _large version for full quality
                    if (url.endsWith('.webp') && !url.includes('_large')) {
                        url = url.replace(/\.webp$/, '_large.webp');
                    }
                    if (!photos.includes(url)) photos.push(url);
                }
            });
        }

        // Also catch <video> tags as extra fallback
        $('video[src], video source[src]').each((_, el) => {
            const src = $(el).attr('src');
            if (src && src.includes('.mp4')) {
                const url = src.startsWith('http') ? src : `${this.baseUrl}${src}`;
                if (!videos.includes(url)) videos.push(url);
            }
        });

        // --- FIELDS: Generic field extractor for titti (Flynax CMS) ---
        // Pattern: <div id="df_field_{key}"><div class="name">...</div><div class="value">...</div></div>
        const getFieldValue = (fieldId: string) => {
            return $(`#df_field_${fieldId} .value`).text().trim();
        };

        // --- PRICE: Extract from df_field_price_incall* / price_outcall* ---
        let priceMin: number | null = null;
        const priceTable: { duration: string; type: string; amount: number }[] = [];

        // Parse price fields: #df_field_price_incall30, #df_field_price_incall1, etc.
        $('[id^="df_field_price_"]').each((_, el) => {
            const $el = $(el);
            const label = $el.find('.name').text().trim(); // "30m Incall", "1h Incall"
            const valueText = $el.find('.value').text().trim(); // "₪ 600", "₪ 1,200"
            const amountMatch = valueText.match(/₪?\s*([\d,. ]+)/);
            if (amountMatch && label) {
                const amount = parseInt(amountMatch[1].replace(/[, .]/g, ''));
                if (amount > 0) {
                    const type = label.toLowerCase().includes('outcall') ? 'outcall' : 'incall';
                    priceTable.push({ duration: label.split(' ')[0], type, amount });
                    if (priceMin === null || amount < priceMin) priceMin = amount;
                }
            }
        });

        // Fallback: happy_hour_text
        if (!priceMin) {
            const happyHourText = $('.happy_hour_text').text().trim();
            const priceMatch = happyHourText.match(/(\d[\d,. ]*)\s*₪/);
            if (priceMatch) {
                priceMin = parseInt(priceMatch[1].replace(/[, .]/g, ''));
            }
        }

        // --- PHONE: Extract from WhatsApp link (most reliable, has full number) ---
        let phone = '';
        const whatsappLink = $('a[href*="whatsapp.com/send"]').attr('href') || '';
        const phoneFromWa = whatsappLink.match(/phone=(\d+)/);
        if (phoneFromWa) {
            phone = phoneFromWa[1];
        }
        // Fallback: show_phone data
        if (!phone) {
            phone = ($('.show_phone').attr('data-name') || '').replace(/[^\d+]/g, '');
        }

        // --- SERVICE TYPE: check if price fieldset mentions outcall ---
        const hasOutcall = $('[id^="df_field_price_outcall"]').length > 0;
        const hasIncall = $('[id^="df_field_price_incall"]').length > 0;
        const serviceType: 'incall' | 'outcall' | 'both' =
            hasIncall && hasOutcall ? 'both' :
                hasOutcall ? 'outcall' : 'incall';

        // --- DESCRIPTION ---
        const description = getFieldValue('about_me') ||
            $('meta[name="description"]').attr('content')?.trim() || null;

        // Category from page
        const category = getFieldValue('Category_ID');

        // --- PHYSICAL PARAMS: Correct titti field IDs ---
        const physicalParams: Record<string, string> = {};
        const fieldMap: Record<string, string> = {
            'ethnicity': 'ethnicity',
            'nationality': 'nationality',
            'sexuality': 'sexuality',
            'eyes': 'eye_color',
            'Hair_Color': 'hair_color',
            'height': 'height',
            'weight': 'weight',
            'titi_size': 'breast_size',
        };
        for (const [fieldId, key] of Object.entries(fieldMap)) {
            const val = getFieldValue(fieldId);
            if (val) physicalParams[key] = val;
        }

        // --- SERVICES LIST: ul.checkboxes li with title ---
        // All services in #df_field_my_escort_services ul.checkboxes li
        const services: string[] = [];
        $('#df_field_my_escort_services ul.checkboxes li').each((_, el) => {
            const title = $(el).attr('title');
            if (title) services.push(title);
        });

        // --- COMMENTS: Parse from ul.comments ---
        const comments: RawTitiComment[] = [];
        $('ul.comments > li[id^="comment_"]').each((_, el) => {
            const $c = $(el);
            // Author: span.dark > b
            const author = $c.find('span.dark b').first().text().trim() || null;
            // Comment text: inside div.hlight after </h3> — get text content
            const $hlight = $c.find('div.hlight');
            // Remove child elements to get just the comment text
            const hlightClone = $hlight.clone();
            hlightClone.find('h3, .rating_container, .like_dislike').remove();
            const text = hlightClone.text().trim() || null;
            // Date: in span.unregistered or span.registered text after "/"
            const metaText = $c.find('span.unregistered, span.registered').text();
            const dateMatch = metaText.match(/(\d{1,2}\.\d{1,2}\.\d{4}\s*\d{1,2}:\d{2})/);
            const dateRaw = dateMatch ? dateMatch[1] : null;
            // Rating: count active stars in ul.comments-rating-bar
            const activeStars = $c.find('ul.comments-rating-bar li.active').length;
            const ratingNum = activeStars > 0 ? activeStars : null;
            // Comment ID from element
            const commentId = $c.attr('id')?.replace('comment_', '') || '';

            if (text || author) {
                const commentKey = `${listing.source_id}_comment_${commentId}`;
                comments.push({
                    comment_key: commentKey,
                    author,
                    text,
                    rating: ratingNum,
                    date_raw: dateRaw,
                });
            }
        });

        // --- RATING: from section.statistics ---
        let ratingAvg: number | null = null;
        let ratingCount: number | null = null;
        // Text pattern: "Current rating:" followed by number
        const statsText = $('section.statistics').text();
        const ratingAvgMatch = statsText.match(/Current rating:\s*([\d.]+)/);
        if (ratingAvgMatch) ratingAvg = parseFloat(ratingAvgMatch[1]);
        const ratingCountMatch2 = statsText.match(/Total stars votes:\s*(\d+)/);
        if (ratingCountMatch2) ratingCount = parseInt(ratingCountMatch2[1]);

        // --- SHOWS & COMMENTS COUNT: ul.counters ---
        let showsCount: number | null = null;
        let commentsCountPage: number | null = null;
        $('ul.counters li').each((_, el) => {
            const text = $(el).text().trim();
            const countEl = $(el).find('span.count').text().trim();
            const count = countEl ? parseInt(countEl.replace(/,/g, '')) : null;
            if (text.includes('Shows') && count) showsCount = count;
            if (text.includes('Comments') && count) commentsCountPage = count;
        });

        // --- SHORT DESCRIPTION ---
        const shortDescription = getFieldValue('short_description') || null;

        // --- PAYMENTS, PARKING, LANGUAGE, REGION ---
        const payments = getFieldValue('pay_options') || null;
        const parking = getFieldValue('parking') || null;
        const language = getFieldValue('language') || null;
        const region = getFieldValue('country_level1') || getFieldValue('region') || null;

        return {
            ...listing,
            price_min: priceMin ?? listing.price_min,
            description,
            photos: Array.from(new Set(photos)),
            categories: category ? [category.trim()] : [],
            languages: language ? language.split(/[,\n]/).map(l => l.trim()).filter(Boolean) : [],
            service_type: serviceType,
            contacts: {
                phone: phone || undefined,
                whatsapp: phone || undefined,
                telegram: undefined
            },
            comments,
            rating_avg: ratingAvg,
            rating_count: ratingCount,
            // Store ALL enriched data in the profile for the raw_data field
            _enriched: {
                videos,
                priceTable,
                physicalParams,
                services,
                shortDescription,
                payments,
                parking,
                region,
                registrationDate: null, // titti doesn't expose registration date
                showsCount,
                commentsCount: commentsCountPage,
            }
        } as any;
    }
}
