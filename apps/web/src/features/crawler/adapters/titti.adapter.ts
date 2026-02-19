
import * as cheerio from 'cheerio';
import { SiteParser } from '../parser.interface';
import { RawTitiListing, RawTitiProfile } from '../types';

export class TittiAdapter implements SiteParser {
    source = 'titi';
    baseUrl = 'https://www.titti.co.il';

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
                is_verified: $el.find('.verifiedIcon').length > 0,
                is_vip: $el.find('.hot_exclusive').length > 0,
                views_today: null,
                online_status: $el.find('.online').length > 0,
            });
        });

        return results;
    }

    parseProfile(html: string, listing: RawTitiListing): RawTitiProfile {
        const $ = cheerio.load(html);
        const photos: string[] = [];

        $('img[src*="/files/"]').each((_, el) => {
            const src = $(el).attr('src');
            if (src && !src.includes('logo')) {
                photos.push(src.startsWith('http') ? src : `${this.baseUrl}${src}`);
            }
        });

        const getValue = (label: string) => {
            return $(`.table-cell:contains("${label}")`).find('.value').text().trim();
        };

        const phone = $('.show_phone').parent().find('a').text().trim();

        return {
            ...listing,
            description: $('.description-content').text().trim() || null,
            photos: Array.from(new Set(photos)),
            categories: [],
            languages: [],
            service_type: html.includes('Outcall') ? 'outcall' : 'incall',
            contacts: { phone, whatsapp: undefined, telegram: undefined },
            comments: [],
            rating_avg: null,
            rating_count: null,
        };
    }
}
