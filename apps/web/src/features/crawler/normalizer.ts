import { Action } from '@radix-ui/react-toast'
import { RawTitiProfile, NormalizedData } from './types'
import { CATEGORIES } from '@/lib/constants'

/**
 * Parse DD.MM.YYYY HH:MM format (used by titti.co.il) into ISO string.
 * Returns null if invalid.
 */
function parseTitiDate(dateRaw: string | null): string | null {
    if (!dateRaw) return null
    try {
        // Format: "31.12.2023 14:30" or "1.5.2024 9:00"
        const match = dateRaw.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})\s*(\d{1,2}):(\d{2})/)
        if (!match) return null
        const [, day, month, year, hours, minutes] = match
        const d = new Date(
            parseInt(year),
            parseInt(month) - 1, // months are 0-indexed
            parseInt(day),
            parseInt(hours),
            parseInt(minutes)
        )
        if (isNaN(d.getTime())) return null
        return d.toISOString()
    } catch {
        return null
    }
}

// City mapping dictionary (Hebrew + English variants → normalized)
const CITY_MAP: Record<string, string> = {
    'תל אביב': 'Tel Aviv',
    'Tel Aviv - Jaffa': 'Tel Aviv',
    'Tel Aviv -Jaffa': 'Tel Aviv',
    'Tel-Aviv': 'Tel Aviv',
    'TLV': 'Tel Aviv',
    'מרכז': 'Central District',
    'Center': 'Central District',
    'חיפה': 'Haifa',
    'ירושלים': 'Jerusalem',
    'נתניה': 'Netanya',
    'אשדוד': 'Ashdod',
    'פתח תקווה': 'Petah Tikva',
    'Petach Tikva': 'Petah Tikva',
    'באר שבע': 'Beer Sheva',
    'Beer-Sheva': 'Beer Sheva',
    'Beersheba': 'Beer Sheva',
    'הרצליה': 'Herzliya',
    'רמת גן': 'Ramat Gan',
    'Ramat-Gan': 'Ramat Gan',
    'ראשון לציון': 'Rishon LeZion',
    'Rishon Lezion': 'Rishon LeZion',
    'Rishon LeZion': 'Rishon LeZion',
    'Rishon': 'Rishon LeZion',
    'בת ים': 'Bat Yam',
    'Bat-Yam': 'Bat Yam',
    'Bat Yam': 'Bat Yam',
    'רחובות': 'Rehovot',
    'כפר סבא': 'Kfar Saba',
    'Kfar-Saba': 'Kfar Saba',
    'אילת': 'Eilat',
    'Eilat': 'Eilat',
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
        created_at: parseTitiDate(c.date_raw) || new Date().toISOString(),
        raw_json: c
    }))

    return { ad, contacts, comments }
}

/**
 * Auto-detect Tahles categories from profile data (services, description, tags).
 * Returns array of matching category slugs. Profiles can belong to multiple categories.
 */
export function detectCategories(rawData: any): string[] {
    const cats = new Set<string>()
    const enriched = rawData?._enriched || rawData?.raw_data?._enriched || {}
    const services: string[] = enriched.services || []
    const desc: string = rawData?.description || rawData?.raw_data?.description || ''
    const categories: string[] = rawData?.categories || rawData?.raw_data?.categories || []
    const nickname: string = rawData?.nickname || rawData?.raw_data?.name || ''

    // Combine all text for matching
    const allText = [...services, desc, ...categories, nickname].join(' ').toLowerCase()

    // Trans detection
    if (/\btrans\b|\b(t\.?s\.?)\b|\bshemale\b|\bladyboy\b|\bטרנס\b/.test(allText)) {
        cats.add('trans')
    }

    // Domina / BDSM / Fetish detection
    if (/\bdomina\b|\bbdsm\b|\bfetish\b|\bmistress\b|\bslave\b|\bbondage\b|\bfemdom\b|\bsadomaso\b|\bdominatrix\b/.test(allText)) {
        cats.add('domina')
    }

    // Massage detection
    if (/\bmassage\b|\bmasseuse\b|\brelax(ation)?\b|\bspa\b|\bnuru\b|\btantric\b|\bעיסוי\b/.test(allText)) {
        cats.add('massage')
    }

    // Sugar baby / GFE / Dating detection
    if (/\bsugar\s*baby\b|\bsugar\s*daddy\b|\bgirlfriend\s*experience\b|\bgfe\b|\bcompanion\b|\btravel\s*companion\b|\bescort\s*dating\b/.test(allText)) {
        cats.add('sugar-baby')
    }

    // Dating / Companion
    if (/\bdating\b|\bdate\b|\bdinners?\b|\bcompanion(ship)?\b|\bovernight\b/.test(allText)) {
        cats.add('dating')
    }

    // Default — individual if nothing specific detected
    if (cats.size === 0) {
        cats.add('individual')
    }

    return [...cats]
}
