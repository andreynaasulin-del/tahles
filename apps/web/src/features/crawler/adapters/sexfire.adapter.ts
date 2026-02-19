
import * as cheerio from 'cheerio';
import { SiteParser } from '../parser.interface';
import { RawTitiListing, RawTitiProfile } from '../types';

export class SexfireAdapter implements SiteParser {
    source = 'sexfire';
    baseUrl = 'https://www.sexfire2.com';

    parseListing(html: string): RawTitiListing[] {
        const $ = cheerio.load(html);
        const results: RawTitiListing[] = [];

        // Проверим селекторы (базируясь на типичных эскорт-шаблонах)
        // Обычно это блоки .item или .box
        $('.item, .box, .listing-item').each((_, el) => {
            const $el = $(el);
            const url = $el.find('a').attr('href');
            if (!url) return;

            results.push({
                source_id: url.split('/').pop()?.replace('.html', '') || Math.random().toString(),
                url: url.startsWith('http') ? url : `${this.baseUrl}${url}`,
                name: $el.find('.name, h3').text().trim(),
                city: $el.find('.city').text().trim() || null,
                age: null,
                price_min: null,
                price_max: null,
                preview_image: $el.find('img').attr('src') || null,
                is_verified: true,
                is_vip: false,
                views_today: null,
                online_status: false,
            });
        });

        return results;
    }

    parseProfile(html: string, listing: RawTitiListing): RawTitiProfile {
        const $ = cheerio.load(html);
        return {
            ...listing,
            description: $('.description').text().trim() || null,
            photos: [],
            categories: [],
            languages: [],
            service_type: 'incall',
            contacts: { phone: '', whatsapp: undefined, telegram: undefined },
            comments: [],
            rating_avg: null,
            rating_count: null,
        };
    }
}
