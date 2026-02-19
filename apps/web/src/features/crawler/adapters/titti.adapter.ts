
import * as cheerio from 'cheerio';
import { SiteParser, CrawlSection } from '../parser.interface';
import { RawTitiListing, RawTitiProfile } from '../types';

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

        // --- PHOTOS: Extract from photos_source JS array (reliable, no junk) ---
        const photos: string[] = [];
        const photoRegex = /large:\s*'([^']+)'/g;
        let match;
        while ((match = photoRegex.exec(html)) !== null) {
            const src = match[1];
            if (src && !src.includes('/images/') && !src.includes('logo') && !src.includes('verified')) {
                photos.push(src.startsWith('http') ? src : `${this.baseUrl}${src}`);
            }
        }

        // Fallback: gallery thumbnails only (if JS parsing found nothing)
        if (photos.length === 0) {
            $('.gallery .thumbs li').each((_, el) => {
                const href = $(el).attr('href');
                if (href && !href.includes('/images/')) {
                    photos.push(href.startsWith('http') ? href : `${this.baseUrl}${href}`);
                }
            });
        }

        // --- PRICE: Extract from happy_hour_text or description ---
        let priceMin: number | null = null;
        const happyHourText = $('.happy_hour_text').text().trim();
        const priceMatch = happyHourText.match(/(\d[\d,. ]*)\s*₪/);
        if (priceMatch) {
            priceMin = parseInt(priceMatch[1].replace(/[, .]/g, ''));
        }
        // Also try description for price patterns
        if (!priceMin) {
            const descText = $('.details').text();
            const descPriceMatch = descText.match(/(\d{3,5})\s*₪/) || descText.match(/(\d{3,5})\s*nis/i) || descText.match(/(\d{3,5})\s*shekel/i);
            if (descPriceMatch) {
                priceMin = parseInt(descPriceMatch[1]);
            }
        }

        // --- FIELDS: Extract structured data ---
        const getFieldValue = (fieldId: string) => $(`#df_field_${fieldId} .value`).text().trim();
        const getListItems = (selector: string) => $(selector).map((_, el) => $(el).text().trim()).get().filter(Boolean);

        const phone = $('.show_phone').attr('data-name') || '';

        // Extract provide type (incall/outcall)
        const provideField = getFieldValue('providefield');
        const serviceType: 'incall' | 'outcall' | 'both' =
            provideField.toLowerCase().includes('outcall') && provideField.toLowerCase().includes('incall') ? 'both' :
                provideField.toLowerCase().includes('outcall') ? 'outcall' : 'incall';

        // --- ENRICH DESCRIPTION ---
        // Combine multiple text blocks to create a "rich" profile
        const aboutMe = $('.description-content').text().trim();
        const shortDesc = $('meta[name="description"]').attr('content')?.trim() || '';

        // Extract services list
        const servicesList = getListItems('.services_list li');

        // Extract "My Details" / Stats (Titti uses specific IDs or classes for these detailed fields sometimes, but often just a list)
        // Let's try to grab as much as possible
        const detailsMap: Record<string, string> = {};
        $('.details_list li').each((_, el) => {
            const label = $(el).find('.label').text().replace(':', '').trim();
            const value = $(el).find('.value').text().trim();
            if (label && value) detailsMap[label] = value;
        });

        // Construct the rich description
        let richDescription = '';
        if (shortDesc) richDescription += `${shortDesc}\n\n`;
        if (aboutMe && aboutMe !== shortDesc) richDescription += `${aboutMe}\n\n`;

        // Add Stats Section if any found
        const keyStats = ['Age', 'Height', 'Weight', 'Breast Size', 'Hair Color', 'Eye color', 'Ethnicity', 'Nationality'].filter(k => k in detailsMap);
        if (keyStats.length > 0) {
            richDescription += `📍 Details:\n`;
            keyStats.forEach(k => richDescription += `• ${k}: ${detailsMap[k]}\n`);
            richDescription += '\n';
        }

        // Add Services Section
        if (servicesList.length > 0) {
            richDescription += `💎 Services:\n${servicesList.join(' • ')}\n`;
        }

        // Add Incall Prices if available (Titti structure varies, sometimes in a table)
        const prices: string[] = [];
        $('.price_list tr').each((_, el) => {
            const time = $(el).find('td:first-child').text().trim();
            const price = $(el).find('td:last-child').text().trim();
            if (time && price) prices.push(`${time}: ${price}`);
        });
        if (prices.length > 0) {
            richDescription += `\n💰 Rates:\n${prices.join('\n')}`;
        }

        // Category from page
        const category = getFieldValue('Category_ID');

        return {
            ...listing,
            price_min: priceMin ?? listing.price_min,
            description: richDescription.trim() || null,
            photos: Array.from(new Set(photos)),
            categories: category ? [category.trim()] : [],
            languages: [],
            service_type: serviceType,
            contacts: {
                phone: phone ? phone.replace(/[^\d+]/g, '') : undefined,
                whatsapp: phone ? phone.replace(/[^\d+]/g, '') : undefined,
                telegram: undefined
            },
            comments: [],
            rating_avg: null,
            rating_count: null,
        };
    }
}
