import * as cheerio from 'cheerio'
import { RawTitiListing, RawTitiProfile, RawTitiComment } from './types'

export function parseListing(html: string): RawTitiListing[] {
    const $ = cheerio.load(html)
    const results: RawTitiListing[] = []

    // Note: Selectors are based on common patterns and initial HTML analysis
    // They may need adjustment if the site structure changes
    $('.catalog-item, .girl-preview, .item').each((_, el) => {
        const $el = $(el)
        const url = $el.find('a').attr('href')
        if (!url) return

        const source_id = url.split('/').pop()?.replace('.html', '') || ''
        const name = $el.find('.name, h3').text().trim()
        const age = parseInt($el.find('.age').text().replace(/\D/g, '')) || null
        const city = $el.find('.city, .location').text().trim() || null

        // Price extraction logic
        const priceText = $el.find('.price').text().replace(/\D/g, '')
        const price = priceText ? parseInt(priceText) : null

        results.push({
            source_id,
            url: url.startsWith('http') ? url : `https://www.titi.co.il${url}`,
            name,
            city,
            age,
            price_min: price,
            price_max: null,
            preview_image: $el.find('img').attr('src') || null,
            is_verified: $el.find('.verified, .check').length > 0,
            is_vip: $el.find('.vip, .premium').length > 0,
            views_today: parseInt($el.find('.views').text().replace(/\D/g, '')) || null,
            online_status: $el.find('.online').length > 0,
        })
    })

    return results
}

export function parseProfile(html: string, listingData: RawTitiListing): RawTitiProfile {
    const $ = cheerio.load(html)

    // Gallery
    const photos: string[] = []
    $('.gallery img, .photos img, .main-image img').each((_, el) => {
        const src = $(el).attr('src')
        if (src) photos.push(src)
    })

    // Categories & Tags
    const categories: string[] = []
    $('.tags a, .categories span').each((_, el) => {
        categories.push($(el).text().trim())
    })

    // Contacts
    const phone = $('.phone, .tel').text().trim()
    const whatsapp = $('.whatsapp').attr('href')?.split('phone=')[1] || undefined
    const telegram = $('.telegram').attr('href')?.split('/').pop() || undefined

    // Comments
    const comments: RawTitiComment[] = []
    $('.comment, .review').each((_, el) => {
        const $c = $(el)
        comments.push({
            comment_key: $c.attr('id') || Math.random().toString(36).substring(7),
            author: $c.find('.author').text().trim() || null,
            text: $c.find('.text, .content').text().trim() || null,
            rating: parseInt($c.find('.rating').attr('data-score') || '') || null,
            date_raw: $c.find('.date').text().trim() || null,
        })
    })

    return {
        ...listingData,
        description: $('.description, .about').text().trim() || null,
        photos: Array.from(new Set(photos)),
        categories,
        languages: [], // Extract if available
        service_type: html.includes('outcall') ? 'outcall' : 'incall',
        contacts: { phone, whatsapp, telegram },
        comments,
        rating_avg: parseFloat($('.rating-avg').text()) || null,
        rating_count: parseInt($('.rating-count').text().replace(/\D/g, '')) || null,
    }
}
