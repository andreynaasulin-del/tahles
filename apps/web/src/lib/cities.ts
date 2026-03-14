export const SITE_URL = 'https://tahles.top'

/* ── Israeli cities for SEO landing pages ─────────────────────────── */
export interface CityConfig {
  slug: string
  nameEn: string
  nameHe: string
  nameRu: string
  /** value that matches the `city` column in advertisements table */
  dbValues: string[]
  seo: {
    titleEn: string
    titleHe: string
    descEn: string
    descHe: string
  }
}

export const CITIES: CityConfig[] = [
  {
    slug: 'tel-aviv',
    nameEn: 'Tel Aviv',
    nameHe: 'תל אביב',
    nameRu: 'Тель-Авив',
    dbValues: ['Tel Aviv', 'תל אביב', 'tel aviv', 'Tel-Aviv', 'TLV'],
    seo: {
      titleEn: 'Escort in Tel Aviv — Verified Profiles',
      titleHe: 'שירותי ליווי בתל אביב — פרופילים מאומתים',
      descEn: 'Browse verified escort profiles in Tel Aviv. Real photos, reviews, ratings. Premium companions in Israel\'s top city. Updated daily on Tahles.',
      descHe: 'גלה פרופילים מאומתים של נערות ליווי בתל אביב. תמונות אמיתיות, ביקורות ודירוגים. מתעדכן יומיומית.',
    },
  },
  {
    slug: 'haifa',
    nameEn: 'Haifa',
    nameHe: 'חיפה',
    nameRu: 'Хайфа',
    dbValues: ['Haifa', 'חיפה', 'haifa'],
    seo: {
      titleEn: 'Escort in Haifa — Verified Profiles',
      titleHe: 'שירותי ליווי בחיפה — פרופילים מאומתים',
      descEn: 'Browse verified escort profiles in Haifa. Real photos, reviews, ratings. Premium companions in northern Israel. Updated daily on Tahles.',
      descHe: 'גלה פרופילים מאומתים של נערות ליווי בחיפה. תמונות אמיתיות, ביקורות ודירוגים. מתעדכן יומיומית.',
    },
  },
  {
    slug: 'jerusalem',
    nameEn: 'Jerusalem',
    nameHe: 'ירושלים',
    nameRu: 'Иерусалим',
    dbValues: ['Jerusalem', 'ירושלים', 'jerusalem'],
    seo: {
      titleEn: 'Escort in Jerusalem — Verified Profiles',
      titleHe: 'שירותי ליווי בירושלים — פרופילים מאומתים',
      descEn: 'Browse verified escort profiles in Jerusalem. Real photos, reviews, ratings. Discreet premium service. Updated daily on Tahles.',
      descHe: 'גלה פרופילים מאומתים של נערות ליווי בירושלים. תמונות אמיתיות, ביקורות ודירוגים. מתעדכן יומיומית.',
    },
  },
  {
    slug: 'eilat',
    nameEn: 'Eilat',
    nameHe: 'אילת',
    nameRu: 'Эйлат',
    dbValues: ['Eilat', 'אילת', 'eilat'],
    seo: {
      titleEn: 'Escort in Eilat — Verified Profiles',
      titleHe: 'שירותי ליווי באילת — פרופילים מאומתים',
      descEn: 'Browse verified escort profiles in Eilat. Real photos, reviews, ratings. Premium companions in Israel\'s resort city. Updated daily on Tahles.',
      descHe: 'גלה פרופילים מאומתים של נערות ליווי באילת. תמונות אמיתיות, ביקורות ודירוגים. מתעדכן יומיומית.',
    },
  },
  {
    slug: 'netanya',
    nameEn: 'Netanya',
    nameHe: 'נתניה',
    nameRu: 'Нетания',
    dbValues: ['Netanya', 'נתניה', 'netanya'],
    seo: {
      titleEn: 'Escort in Netanya — Verified Profiles',
      titleHe: 'שירותי ליווי בנתניה — פרופילים מאומתים',
      descEn: 'Browse verified escort profiles in Netanya. Real photos, reviews, ratings. Updated daily on Tahles.',
      descHe: 'גלה פרופילים מאומתים של נערות ליווי בנתניה. תמונות אמיתיות, ביקורות ודירוגים. מתעדכן יומיומית.',
    },
  },
  {
    slug: 'bat-yam',
    nameEn: 'Bat Yam',
    nameHe: 'בת ים',
    nameRu: 'Бат-Ям',
    dbValues: ['Bat Yam', 'בת ים', 'bat yam', 'Bat-Yam'],
    seo: {
      titleEn: 'Escort in Bat Yam — Verified Profiles',
      titleHe: 'שירותי ליווי בבת ים — פרופילים מאומתים',
      descEn: 'Browse verified escort profiles in Bat Yam. Real photos, reviews, ratings. Updated daily on Tahles.',
      descHe: 'גלה פרופילים מאומתים של נערות ליווי בבת ים. תמונות אמיתיות, ביקורות ודירוגים. מתעדכן יומיומית.',
    },
  },
  {
    slug: 'beer-sheva',
    nameEn: 'Beer Sheva',
    nameHe: 'באר שבע',
    nameRu: 'Беэр-Шева',
    dbValues: ['Beer Sheva', 'באר שבע', 'beer sheva', 'Be\'er Sheva', 'Beersheba'],
    seo: {
      titleEn: 'Escort in Beer Sheva — Verified Profiles',
      titleHe: 'שירותי ליווי בבאר שבע — פרופילים מאומתים',
      descEn: 'Browse verified escort profiles in Beer Sheva. Real photos, reviews, ratings. Updated daily on Tahles.',
      descHe: 'גלה פרופילים מאומתים של נערות ליווי בבאר שבע. תמונות אמיתיות, ביקורות ודירוגים. מתעדכן יומיומית.',
    },
  },
  {
    slug: 'ashdod',
    nameEn: 'Ashdod',
    nameHe: 'אשדוד',
    nameRu: 'Ашдод',
    dbValues: ['Ashdod', 'אשדוד', 'ashdod'],
    seo: {
      titleEn: 'Escort in Ashdod — Verified Profiles',
      titleHe: 'שירותי ליווי באשדוד — פרופילים מאומתים',
      descEn: 'Browse verified escort profiles in Ashdod. Real photos, reviews, ratings. Updated daily on Tahles.',
      descHe: 'גלה פרופילים מאומתים של נערות ליווי באשדוד. תמונות אמיתיות, ביקורות ודירוגים. מתעדכן יומיומית.',
    },
  },
  {
    slug: 'rishon-lezion',
    nameEn: 'Rishon LeZion',
    nameHe: 'ראשון לציון',
    nameRu: 'Ришон-ле-Цион',
    dbValues: ['Rishon LeZion', 'ראשון לציון', 'rishon lezion', 'Rishon Lezion'],
    seo: {
      titleEn: 'Escort in Rishon LeZion — Verified Profiles',
      titleHe: 'שירותי ליווי בראשון לציון — פרופילים מאומתים',
      descEn: 'Browse verified escort profiles in Rishon LeZion. Real photos, reviews, ratings. Updated daily on Tahles.',
      descHe: 'גלה פרופילים מאומתים של נערות ליווי בראשון לציון. תמונות אמיתיות, ביקורות ודירוגים. מתעדכן יומיומית.',
    },
  },
  {
    slug: 'herzliya',
    nameEn: 'Herzliya',
    nameHe: 'הרצליה',
    nameRu: 'Герцлия',
    dbValues: ['Herzliya', 'הרצליה', 'herzliya'],
    seo: {
      titleEn: 'Escort in Herzliya — Verified Profiles',
      titleHe: 'שירותי ליווי בהרצליה — פרופילים מאומתים',
      descEn: 'Browse verified escort profiles in Herzliya. Real photos, reviews, ratings. Updated daily on Tahles.',
      descHe: 'גלה פרופילים מאומתים של נערות ליווי בהרצליה. תמונות אמיתיות, ביקורות ודירוגים. מתעדכן יומיומית.',
    },
  },
  {
    slug: 'hadera',
    nameEn: 'Hadera',
    nameHe: 'חדרה',
    nameRu: 'Хадера',
    dbValues: ['Hadera', 'חדרה', 'hadera'],
    seo: {
      titleEn: 'Escort in Hadera — Verified Profiles',
      titleHe: 'שירותי ליווי בחדרה — פרופילים מאומתים',
      descEn: 'Browse verified escort profiles in Hadera. Real photos, reviews, ratings. Updated daily on Tahles.',
      descHe: 'גלה פרופילים מאומתים של נערות ליווי בחדרה. תמונות אמיתיות, ביקורות ודירוגים. מתעדכן יומיומית.',
    },
  },
]

export const CITY_SLUGS = CITIES.map(c => c.slug)

export function getCityBySlug(slug: string): CityConfig | undefined {
  return CITIES.find(c => c.slug === slug)
}

/* ── Filter/category configs for SEO pages ────────────────────────── */
export interface FilterConfig {
  slug: string
  nameEn: string
  nameHe: string
  nameRu: string
  /** query params for /api/search */
  searchParams: Record<string, string>
  seo: {
    titleEn: string
    titleHe: string
    descEn: string
    descHe: string
  }
}

export const FILTERS: FilterConfig[] = [
  {
    slug: 'vip',
    nameEn: 'VIP Escorts',
    nameHe: 'ליווי VIP',
    nameRu: 'VIP эскорт',
    searchParams: { sheet: 'vip' },
    seo: {
      titleEn: 'VIP Escort Israel — Premium Verified Profiles',
      titleHe: 'שירותי ליווי VIP בישראל — פרופילים פרמיום',
      descEn: 'Browse VIP escort profiles in Israel. Premium verified companions with real photos and reviews. Updated daily on Tahles.',
      descHe: 'גלה פרופילים VIP של נערות ליווי בישראל. שירות פרמיום עם תמונות אמיתיות. מתעדכן יומיומית.',
    },
  },
  {
    slug: 'verified',
    nameEn: 'Verified Escorts',
    nameHe: 'ליווי מאומת',
    nameRu: 'Проверенные',
    searchParams: { sheet: 'verified' },
    seo: {
      titleEn: 'Verified Escort Israel — Real Photos & Reviews',
      titleHe: 'נערות ליווי מאומתות בישראל — תמונות אמיתיות',
      descEn: 'Browse verified escort profiles in Israel. Confirmed real photos, identity checked. Safe and trusted directory. Updated daily on Tahles.',
      descHe: 'גלה פרופילים מאומתים של נערות ליווי בישראל. תמונות ופרופילים מאומתים. מתעדכן יומיומית.',
    },
  },
  {
    slug: 'new',
    nameEn: 'New Profiles',
    nameHe: 'פרופילים חדשים',
    nameRu: 'Новые анкеты',
    searchParams: { sort: 'newest' },
    seo: {
      titleEn: 'New Escort Profiles in Israel — Just Added',
      titleHe: 'פרופילים חדשים של נערות ליווי בישראל',
      descEn: 'Discover the newest escort profiles in Israel. Fresh faces, just added to Tahles. Real photos, verified profiles.',
      descHe: 'גלה פרופילים חדשים של נערות ליווי בישראל. נוספו לאחרונה עם תמונות אמיתיות.',
    },
  },
  {
    slug: 'european',
    nameEn: 'European Escorts',
    nameHe: 'נערות ליווי אירופאיות',
    nameRu: 'Европейки',
    searchParams: { ethnicity: 'european' },
    seo: {
      titleEn: 'European Escort in Israel — Verified Profiles',
      titleHe: 'נערות ליווי אירופאיות בישראל — פרופילים מאומתים',
      descEn: 'Browse European escort profiles in Israel. Verified with real photos. Premium companions from Europe. Updated daily on Tahles.',
      descHe: 'גלה נערות ליווי אירופאיות בישראל. פרופילים מאומתים עם תמונות אמיתיות.',
    },
  },
  {
    slug: 'russian',
    nameEn: 'Russian Escorts',
    nameHe: 'נערות ליווי רוסיות',
    nameRu: 'Русские девушки',
    searchParams: { ethnicity: 'eastern_european' },
    seo: {
      titleEn: 'Russian Escort in Israel — Verified Profiles',
      titleHe: 'נערות ליווי רוסיות בישראל — פרופילים מאומתים',
      descEn: 'Browse Russian and Eastern European escort profiles in Israel. Verified with real photos. Updated daily on Tahles.',
      descHe: 'גלה נערות ליווי רוסיות ומזרח אירופאיות בישראל. פרופילים מאומתים.',
    },
  },
  {
    slug: 'massage',
    nameEn: 'Massage Services',
    nameHe: 'שירותי עיסוי',
    nameRu: 'Массаж',
    searchParams: { q: 'massage' },
    seo: {
      titleEn: 'Massage Services Israel — Professional & Relaxing',
      titleHe: 'שירותי עיסוי בישראל — מקצועי ומרגיע',
      descEn: 'Find professional massage services in Israel. Verified providers, real photos. Browse on Tahles — updated daily.',
      descHe: 'מצא שירותי עיסוי מקצועיים בישראל. ספקים מאומתים עם תמונות אמיתיות.',
    },
  },
  // ── Service type filters ──
  {
    slug: 'outcall',
    nameEn: 'Outcall Services',
    nameHe: 'שירות עד הבית',
    nameRu: 'Выезд на дом',
    searchParams: { sheet: 'outcall' },
    seo: {
      titleEn: 'Outcall Escort Israel — Home & Hotel Visits',
      titleHe: 'שירותי ליווי עד הבית בישראל — ביקורי בית ומלון',
      descEn: 'Browse outcall escort profiles in Israel. Home and hotel visits with verified companions. Real photos & WhatsApp. Updated daily on Tahles.',
      descHe: 'נערות ליווי עם שירות עד הבית בישראל. ביקורי בית ומלון עם פרופילים מאומתים. תמונות אמיתיות ו-WhatsApp.',
    },
  },
  {
    slug: 'incall',
    nameEn: 'Incall Services',
    nameHe: 'קבלה בדירה',
    nameRu: 'Приём у себя',
    searchParams: { sheet: 'incall' },
    seo: {
      titleEn: 'Incall Escort Israel — Private Apartment Meetings',
      titleHe: 'שירותי ליווי בדירה פרטית בישראל — קבלה בדירה',
      descEn: 'Browse incall escort profiles in Israel. Private apartment meetings with verified companions. Real photos & direct contact on Tahles.',
      descHe: 'נערות ליווי עם קבלה בדירה פרטית בישראל. פרופילים מאומתים עם תמונות אמיתיות.',
    },
  },
  // ── Age filters ──
  {
    slug: 'under-25',
    nameEn: 'Under 25',
    nameHe: 'מתחת ל-25',
    nameRu: 'До 25 лет',
    searchParams: { sheet: 'under25' },
    seo: {
      titleEn: 'Young Escorts Under 25 in Israel — Verified Profiles',
      titleHe: 'נערות ליווי צעירות מתחת ל-25 בישראל — פרופילים מאומתים',
      descEn: 'Browse young escort profiles under 25 in Israel. Verified with real photos and direct WhatsApp contact. Updated daily on Tahles.',
      descHe: 'גלה נערות ליווי צעירות מתחת לגיל 25 בישראל. פרופילים מאומתים עם תמונות אמיתיות.',
    },
  },
  {
    slug: 'mature',
    nameEn: 'Mature 40+',
    nameHe: 'בוגרות 40+',
    nameRu: 'Зрелые 40+',
    searchParams: { sheet: '40plus' },
    seo: {
      titleEn: 'Mature Escorts 40+ in Israel — Experienced & Verified',
      titleHe: 'נערות ליווי בוגרות 40+ בישראל — מנוסות ומאומתות',
      descEn: 'Browse mature escort profiles 40+ in Israel. Experienced, verified companions with real photos. Updated daily on Tahles.',
      descHe: 'גלה נערות ליווי בוגרות מעל גיל 40 בישראל. מנוסות ומאומתות עם תמונות אמיתיות.',
    },
  },
  // ── Ethnicity filters ──
  {
    slug: 'asian',
    nameEn: 'Asian Escorts',
    nameHe: 'נערות ליווי אסיאתיות',
    nameRu: 'Азиатки',
    searchParams: { ethnicity: 'asian' },
    seo: {
      titleEn: 'Asian Escort in Israel — Verified Profiles',
      titleHe: 'נערות ליווי אסיאתיות בישראל — פרופילים מאומתים',
      descEn: 'Browse Asian escort profiles in Israel. Verified with real photos. Premium companions from Asia. Updated daily on Tahles.',
      descHe: 'גלה נערות ליווי אסיאתיות בישראל. פרופילים מאומתים עם תמונות אמיתיות.',
    },
  },
  {
    slug: 'latina',
    nameEn: 'Latina Escorts',
    nameHe: 'נערות ליווי לטיניות',
    nameRu: 'Латиноамериканки',
    searchParams: { ethnicity: 'latina' },
    seo: {
      titleEn: 'Latina Escort in Israel — Verified Profiles',
      titleHe: 'נערות ליווי לטיניות בישראל — פרופילים מאומתים',
      descEn: 'Browse Latina escort profiles in Israel. Verified with real photos. Exotic companions from Latin America. Updated daily on Tahles.',
      descHe: 'גלה נערות ליווי לטיניות בישראל. פרופילים מאומתים עם תמונות אמיתיות.',
    },
  },
  {
    slug: 'african',
    nameEn: 'African Escorts',
    nameHe: 'נערות ליווי אפריקאיות',
    nameRu: 'Африканки',
    searchParams: { ethnicity: 'african' },
    seo: {
      titleEn: 'African Escort in Israel — Verified Profiles',
      titleHe: 'נערות ליווי אפריקאיות בישראל — פרופילים מאומתים',
      descEn: 'Browse African escort profiles in Israel. Verified with real photos. Updated daily on Tahles.',
      descHe: 'גלה נערות ליווי אפריקאיות בישראל. פרופילים מאומתים עם תמונות אמיתיות.',
    },
  },
  // ── Category filters (from real profile data) ──
  {
    slug: 'trans',
    nameEn: 'Trans Escorts',
    nameHe: 'טרנס ליווי',
    nameRu: 'Транс эскорт',
    searchParams: { category: 'trans' },
    seo: {
      titleEn: 'Trans Escort in Israel — Verified Profiles',
      titleHe: 'שירותי ליווי טרנס בישראל — פרופילים מאומתים',
      descEn: 'Browse trans escort profiles in Israel. Verified with real photos and direct WhatsApp contact. Updated daily on Tahles.',
      descHe: 'גלה פרופילים של ליווי טרנס בישראל. מאומתים עם תמונות אמיתיות ו-WhatsApp ישיר.',
    },
  },
  {
    slug: 'bdsm',
    nameEn: 'BDSM & Fetish',
    nameHe: 'BDSM ופטיש',
    nameRu: 'БДСМ и фетиш',
    searchParams: { category: 'domina' },
    seo: {
      titleEn: 'BDSM & Fetish Escort Israel — Domina Profiles',
      titleHe: 'שירותי BDSM ופטיש בישראל — פרופילי דומינה',
      descEn: 'Browse BDSM and fetish escort profiles in Israel. Verified dominatrix and fetish companions. Real photos on Tahles.',
      descHe: 'גלה פרופילים של BDSM ופטיש בישראל. דומינות מאומתות עם תמונות אמיתיות.',
    },
  },
  {
    slug: 'dating',
    nameEn: 'Escort Dating & GFE',
    nameHe: 'דייטינג וליווי',
    nameRu: 'Свидания и GFE',
    searchParams: { category: 'dating' },
    seo: {
      titleEn: 'Escort Dating & GFE Israel — Girlfriend Experience',
      titleHe: 'שירותי דייטינג וליווי בישראל — חוויית חברה',
      descEn: 'Browse dating escort and GFE profiles in Israel. Girlfriend experience, dinner dates, overnight companions. Verified on Tahles.',
      descHe: 'גלה פרופילים לדייטינג וליווי בישראל. חוויית חברה, ארוחות ערב, לינה. מאומתים ב-Tahles.',
    },
  },
  {
    slug: 'sugar-baby',
    nameEn: 'Sugar Baby',
    nameHe: 'שוגר בייבי',
    nameRu: 'Шугар бейби',
    searchParams: { category: 'sugar-baby' },
    seo: {
      titleEn: 'Sugar Baby Israel — Companion Profiles',
      titleHe: 'שוגר בייבי בישראל — פרופילי מלווים',
      descEn: 'Browse sugar baby profiles in Israel. Verified companions for dating, events, and travel. Real photos on Tahles.',
      descHe: 'גלה פרופילים של שוגר בייבי בישראל. מלווים מאומתים לדייטים, אירועים וטיולים.',
    },
  },
  {
    slug: 'independent',
    nameEn: 'Independent Escorts',
    nameHe: 'נערות ליווי עצמאיות',
    nameRu: 'Индивидуалки',
    searchParams: { category: 'individual' },
    seo: {
      titleEn: 'Independent Escorts Israel — No Agency, Direct Contact',
      titleHe: 'נערות ליווי עצמאיות בישראל — ללא סוכנות, קשר ישיר',
      descEn: 'Browse independent escort profiles in Israel. Direct contact, no agency. Verified with real photos and WhatsApp on Tahles.',
      descHe: 'גלה נערות ליווי עצמאיות בישראל. קשר ישיר ללא סוכנות. מאומתות עם תמונות אמיתיות.',
    },
  },
]

export const FILTER_SLUGS = FILTERS.map(f => f.slug)

export function getFilterBySlug(slug: string): FilterConfig | undefined {
  return FILTERS.find(f => f.slug === slug)
}
