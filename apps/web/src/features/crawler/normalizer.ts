import { Action } from '@radix-ui/react-toast'
import { RawTitiProfile, NormalizedData } from './types'
import { CATEGORIES } from '@/lib/constants'

// City mapping dictionary
const CITY_MAP: Record<string, string> = {
    'תל אביב': 'Tel Aviv',
    'מרכז': 'Central District',
    'חיפה': 'Haifa',
    'ירושלים': 'Jerusalem',
    'נתניה': 'Netanya',
    'אשדוד': 'Ashdod',
    'פתח תקווה': 'Petah Tikva',
}

export function normalizeTitiData(raw: RawTitiProfile): NormalizedData {
    const normalizedCity = CITY_MAP[raw.city || ''] || raw.city || 'Israel'

    // Map categories to Tahles slugs
    const categoryIds: string[] = []
    raw.categories.forEach(cat => {
        const match = CATEGORIES.find(c =>
            c.name.toLowerCase() === cat.toLowerCase() ||
            cat.toLowerCase().includes(c.slug)
        )
        if (match) categoryIds.push(match.slug)
    })

    // Basic Advertisement data
    const ad: any = {
        source: 'titi',
        source_id: raw.source_id,
        nickname: raw.name,
        description: raw.description,
        age: raw.age,
        city: normalizedCity,
        price_min: raw.price_min,
        price_max: raw.price_max,
        photos: raw.photos,
        verified: raw.is_verified,
        vip_status: raw.is_vip,
        views_count: raw.views_today,
        rating_avg: raw.rating_avg,
        rating_count: raw.rating_count,
        online_status: raw.online_status,
        raw_data: raw,
        updated_at: new Date().toISOString()
    }

    const contacts: any = {
        phone: raw.contacts.phone || null,
        whatsapp: raw.contacts.whatsapp || null,
        telegram_username: raw.contacts.telegram || null
    }

    const comments: any[] = raw.comments.map(c => ({
        comment_key: c.comment_key,
        author_name: c.author,
        text: c.text,
        rating: c.rating,
        created_at: c.date_raw ? new Date(c.date_raw).toISOString() : new Date().toISOString(),
        raw_json: c
    }))

    return { ad, contacts, comments }
}
