import * as cheerio from 'cheerio'
import { RawTitiListing, RawTitiProfile, RawTitiComment } from './types'


export function parseListing(html: string): RawTitiListing[] {
    const $ = cheerio.load(html)
    const results: RawTitiListing[] = []

    // Новые селекторы: ищем li внутри listing_box
    $('.listing_box li[id^="fli_"]').each((_, el) => {
        const $el = $(el)
        const $link = $el.find('.picture a')
        const url = $link.attr('href')
        if (!url) return

        const source_id = url.split('-').pop()?.replace('.html', '') || ''
        const name = $link.attr('title')?.split(',')[0].trim() || ''
        const city = $el.find('li[id$="_country_level1"] div').text().trim()

        // Фото превью
        const preview_image = $el.find('.picture img').attr('src') || null

        results.push({
            source_id,
            url: url.startsWith('http') ? url : `https://www.titti.co.il${url}`,
            name,
            city: city || null,
            age: null, // Возраст теперь часто внутри title линка
            price_min: null,
            price_max: null,
            preview_image,
            is_verified: $el.find('.verifiedIcon').length > 0,
            is_vip: $el.find('.hot_exclusive').length > 0,
            views_today: null,
            online_status: $el.find('.online').length > 0,
        })
    })

    return results
}

export function parseProfile(html: string, listingData: RawTitiListing): RawTitiProfile {
    const $ = cheerio.load(html)

    // Gallery: теперь картинки часто в .picture или .photos
    const photos: string[] = []
    $('img[src*="/files/"]').each((_, el) => {
        const src = $(el).attr('src')
        if (src && !src.includes('logo')) photos.push(src)
    })

    // Извлекаем данные из таблицы характеристик
    const getValue = (label: string) => {
        return $(`.table-cell:contains("${label}")`).find('.value').text().trim()
    }

    const ageStr = getValue('Age')
    const age = parseInt(ageStr) || listingData.age

    // Контакты (телефон пока под звездочками в HTML, но мы берем ID для ревизии)
    const phoneId = $('.show_phone').attr('data-id')
    const phone = $('.show_phone').parent().find('a').text().trim()

    return {
        ...listingData,
        age,
        description: $('.description-content').text().trim() || null,
        photos: Array.from(new Set(photos)),
        categories: [],
        languages: [],
        service_type: html.includes('Outcall') ? 'outcall' : 'incall',
        contacts: {
            phone: phone.includes('*') ? phone : phone,
            whatsapp: undefined,
            telegram: undefined
        },
        comments: [],
        rating_avg: null,
        rating_count: null,
    }
}

