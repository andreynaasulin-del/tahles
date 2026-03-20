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
    'חדרה': 'Hadera',
    'Hadera': 'Hadera',
    'אשקלון': 'Ashkelon',
    'Ashkelon': 'Ashkelon',
    'קריות': 'Haifa',
    'Krayot': 'Haifa',
    'והצפון': 'Haifa',
    'עכו': 'Haifa',
    'Acre': 'Haifa',
    'בית שמש': 'Jerusalem',
    'Beit Shemesh': 'Jerusalem',
    'רמלה': 'Central District',
    'Ramla': 'Central District',
    'לוד': 'Central District',
    'Lod': 'Central District',
}

// Ethnicity value normalization: titti uses Hebrew/English → map to our slugs
const ETHNICITY_MAP: Record<string, string> = {
    'european': 'european',
    'eastern european': 'european',
    'east european': 'european',
    'western european': 'european',
    'אירופאית': 'european',
    'מזרח אירופה': 'european',
    'מערב אירופה': 'european',
    'רוסייה': 'european',
    'אוקראינית': 'european',

    'latina': 'latina',
    'latino': 'latina',
    'south american': 'latina',
    'brazilian': 'latina',
    'ברזילאית': 'latina',
    'לטינית': 'latina',
    'דרום אמריקה': 'latina',

    'asian': 'asian',
    'east asian': 'asian',
    'southeast asian': 'asian',
    'thai': 'asian',
    'chinese': 'asian',
    'japanese': 'asian',
    'filipina': 'asian',
    'אסיאתית': 'asian',
    'תאילנדית': 'asian',

    'african': 'african',
    'אפריקאית': 'african',
    'אתיופית': 'african',
    'ethiopian': 'african',

    'israeli': 'israeli',
    'ישראלית': 'israeli',
    'מרוקאית': 'israeli',
    'תימנייה': 'israeli',
}

function normalizeEthnicity(raw: RawTitiProfile): string | null {
    const enriched = (raw as any)._enriched || {}
    const physEthnicity = enriched.physicalParams?.ethnicity || ''
    const physNationality = enriched.physicalParams?.nationality || ''
    const combined = `${physEthnicity} ${physNationality}`.toLowerCase().trim()

    for (const [key, value] of Object.entries(ETHNICITY_MAP)) {
        if (combined.includes(key.toLowerCase())) return value
    }
    return null
}

export function normalizeTitiData(raw: RawTitiProfile, sourceOverride?: string): NormalizedData {
    // Map city — if unknown, keep original (NOT 'Israel' fallback)
    const rawCity = raw.city?.trim() || null
    const normalizedCity = rawCity ? (CITY_MAP[rawCity] || rawCity) : null

    // Map categories to Tahles slugs
    const categoryIds: string[] = []
    raw.categories.forEach(cat => {
        const match = CATEGORIES.find(c =>
            c.name.toLowerCase() === cat.toLowerCase() ||
            cat.toLowerCase().includes(c.slug)
        )
        if (match) categoryIds.push(match.slug)
    })

    // Detect category for raw_data (search API filters on this)
    const detectedCats = detectCategories(raw)
    const primaryCategory = detectedCats[0] || 'individual'

    // Normalize ethnicity from physical params
    const ethnicity = normalizeEthnicity(raw)

    // Compute score from rating data
    const score = raw.rating_avg ? Math.round(raw.rating_avg * (raw.rating_count || 1)) : 0
    const scoreCategory = (raw as any).is_vip ? 'HOT' : (score > 20 ? 'TOP' : null)

    // Address from enriched data
    const enriched = (raw as any)._enriched || {}
    const address = enriched.region || normalizedCity || null

    // Build raw_data with required _ prefixed fields for search API
    const rawData = {
        ...raw,
        _verified: raw.is_verified ? 'true' : 'false',
        _category: primaryCategory,
        _ethnicity: ethnicity,
        _score: score,
        _score_category: scoreCategory,
        _address: address,
    }

    // Basic Advertisement data
    const ad: any = {
        source: sourceOverride || 'titi',
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
        raw_data: rawData,
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
