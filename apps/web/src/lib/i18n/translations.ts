export type Locale = 'en' | 'ru' | 'he'

export const LOCALES: { id: Locale; label: string; flag: string; dir: 'ltr' | 'rtl' }[] = [
  { id: 'en', label: 'English', flag: '🇬🇧', dir: 'ltr' },
  { id: 'ru', label: 'Русский', flag: '🇷🇺', dir: 'ltr' },
  { id: 'he', label: 'עברית', flag: '🇮🇱', dir: 'rtl' },
]

export type TranslationKey =
  // meta
  | 'app_name'
  | 'app_tagline'
  | 'app_subtitle'
  // header
  | 'ask_tahles'
  // search
  | 'search_placeholder'
  | 'search_btn'
  | 'search_clear'
  // search insights
  | 'times_searched'
  | 'trend'
  | 'trend_rising'
  | 'trend_stable'
  | 'results_found'
  | 'phone_matches'
  | 'top_city'
  | 'here'
  // databar
  | 'db_active'
  | 'db_online'
  | 'db_updates_hr'
  | 'db_searches_today'
  | 'db_checks_today'
  | 'db_top_city'
  // filters
  | 'filter_listed'
  | 'filter_listed_tip'
  | 'filter_basic'
  | 'filter_basic_tip'
  | 'filter_paid'
  | 'filter_paid_tip'
  | 'filter_vip1500'
  | 'filter_vip1500_tip'
  | 'filter_up1000'
  | 'filter_up1000_tip'
  | 'filter_massage'
  | 'filter_massage_tip'
  | 'filter_striptease'
  | 'filter_striptease_tip'
  | 'filter_domina'
  | 'filter_domina_tip'
  | 'filter_kinky'
  | 'filter_kinky_tip'
  // results table
  | 'col_price'
  | 'col_city'
  | 'col_type'
  | 'results'
  | 'no_results'
  | 'no_results_sub'
  | 'reset_filters'
  | 'load_more'
  | 'remaining'
  | 'showing'
  | 'of'
  // badges
  | 'vip'
  | 'verified'
  | 'online'
  | 'badge_vip'
  | 'badge_verified'
  | 'badge_online'
  // price
  | 'price_on_request'
  | 'from_price'
  | 'up_to_price'
  // ask tahles
  | 'ask_input_placeholder'
  | 'ask_btn'
  | 'ask_loading'
  | 'ask_query_label'
  | 'ask_example_vip'
  | 'ask_example_searched'
  | 'ask_example_city'
  | 'ask_example_online'
  | 'ask_example_price'
  // roles
  | 'role_basic_1'
  | 'role_basic_2'
  | 'role_basic_3'
  | 'role_paid_1'
  | 'role_paid_2'
  | 'role_paid_3'
  | 'role_paid_4'
  | 'role_paid_cta'
  // result row extras
  | 'views_today'
  // monetization
  | 'unlock_phone'
  | 'unlock_price'
  // truth engine
  | 'truth_engine'
  // legacy
  | 'unlock_to_text'
  | 'photos'
  | 'sheet_all'
  | 'sheet_verified'
  | 'sheet_vip'
  | 'sheet_under25'
  | 'sheet_40plus'
  | 'sheet_outcall'
  | 'sheet_nearme'
  | 'cat_massage'
  | 'cat_dating'
  | 'cat_sugar_baby'
  | 'cat_domina'
  | 'cat_individual'
  | 'cat_trans'
  | 'preset_mfw'
  | 'preset_mfm'
  | 'preset_russian'
  | 'preset_latina'
  | 'filters'
  | 'age'
  | 'price'
  | 'city'
  | 'category'
  | 'sheets'
  | 'load_more_label'
  | 'language'
  | 'starting_at'
  | 'contacts'
  | 'unlock'

type TranslationDict = Record<TranslationKey, string>

const en: TranslationDict = {
  app_name: 'Tahles',
  app_tagline: 'Find your\nperfect match',
  app_subtitle: 'Premium escort companions. Verified profiles. Discreet service.',
  ask_tahles: 'Ask Tahles',
  search_placeholder: 'Name, city, category or price...',
  search_btn: 'Search',
  search_clear: 'Clear',
  times_searched: 'Times searched',
  trend: 'Trend',
  trend_rising: 'Rising',
  trend_stable: 'Stable',
  results_found: 'Results found',
  phone_matches: 'Phone matches',
  top_city: 'Top city',
  here: 'here',
  db_active: 'Active',
  db_online: 'Online',
  db_updates_hr: 'Updates/hr',
  db_searches_today: 'Searches today',
  db_checks_today: 'Checks today',
  db_top_city: 'Top city',
  filter_listed: 'Listed',
  filter_listed_tip: 'All active results in the system.',
  filter_basic: 'Basic',
  filter_basic_tip: 'No promotion. Standard placement.',
  filter_paid: 'Paid',
  filter_paid_tip: 'Priority visibility. Verified placement.',
  filter_vip1500: 'VIP ₪1500+',
  filter_vip1500_tip: 'Results from ₪1500 and above.',
  filter_up1000: 'Up to ₪1000',
  filter_up1000_tip: 'Results priced up to ₪1000.',
  filter_massage: 'Massage',
  filter_massage_tip: 'Massage services only.',
  filter_striptease: 'Striptease',
  filter_striptease_tip: 'Striptease category.',
  filter_domina: 'Domina',
  filter_domina_tip: 'Domination and BDSM services.',
  filter_kinky: 'Kinky',
  filter_kinky_tip: 'Non-standard requests and fetishes.',
  col_price: 'Price',
  col_city: 'City',
  col_type: 'Type',
  results: 'Results',
  no_results: 'No results for current filters',
  no_results_sub: '',
  reset_filters: 'Reset filters',
  load_more: 'Load more',
  remaining: 'remaining',
  showing: 'Showing',
  of: 'of',
  vip: 'VIP',
  verified: 'Verified',
  online: 'Online',
  badge_vip: 'VIP',
  badge_verified: 'Verified',
  badge_online: 'Online',
  price_on_request: 'On request',
  from_price: 'from',
  up_to_price: 'up to',
  ask_input_placeholder: 'What do you want to know about the data?',
  ask_btn: 'Ask',
  ask_loading: 'Querying data',
  ask_query_label: 'Query',
  ask_example_vip: 'Show VIP nearby',
  ask_example_searched: 'Most searched today',
  ask_example_city: 'Most active city',
  ask_example_online: 'How many online now',
  ask_example_price: 'Top price range',
  role_basic_1: 'Limited searches per day',
  role_basic_2: 'No analytics access',
  role_basic_3: 'Standard result view',
  role_paid_1: 'Unlimited searches',
  role_paid_2: 'Full check history',
  role_paid_3: 'Trend & demand analytics',
  role_paid_4: 'Extended statistics',
  role_paid_cta: 'Unlock paid access',
  views_today: 'views',
  unlock_phone: 'Unlock contact',
  unlock_price: '$100',
  truth_engine: 'Premium Matching',
  // legacy
  unlock_to_text: 'UNLOCK TO TEXT',
  photos: 'photos',
  sheet_all: 'All',
  sheet_verified: 'Verified',
  sheet_vip: 'VIP',
  sheet_under25: 'Under 25',
  sheet_40plus: '40+',
  sheet_outcall: 'Outcall',
  sheet_nearme: 'Near Me',
  cat_massage: 'Massage',
  cat_dating: 'Dating Only',
  cat_sugar_baby: 'Sugar Baby',
  cat_domina: 'Domina',
  cat_individual: 'Individual',
  cat_trans: 'Trans',
  preset_mfw: 'Men for Women & Couples',
  preset_mfm: 'Men for Men',
  preset_russian: 'Russian Girls',
  preset_latina: 'Chicas Latinas',
  filters: 'Filters',
  age: 'Age',
  price: 'Price',
  city: 'City',
  category: 'Category',
  sheets: 'Sheets',
  load_more_label: 'Load more',
  language: 'Language',
  starting_at: 'Starting at',
  contacts: 'Contacts',
  unlock: 'Unlock',
}

const ru: TranslationDict = {
  app_name: 'Tahles',
  app_tagline: 'Найди свою\nидеальную пару',
  app_subtitle: 'Премиум эскорт. Проверенные профили. Конфиденциальный сервис.',
  ask_tahles: 'Спросить Tahles',
  search_placeholder: 'Имя, город, категория или цена...',
  search_btn: 'Поиск',
  search_clear: 'Очистить',
  times_searched: 'Раз искали',
  trend: 'Тренд',
  trend_rising: 'Растёт',
  trend_stable: 'Стабильно',
  results_found: 'Найдено',
  phone_matches: 'Совпадений по номеру',
  top_city: 'Топ город',
  here: 'здесь',
  db_active: 'Активных',
  db_online: 'Онлайн',
  db_updates_hr: 'Обновл./час',
  db_searches_today: 'Поисков сегодня',
  db_checks_today: 'Проверок сегодня',
  db_top_city: 'Топ город',
  filter_listed: 'Все',
  filter_listed_tip: 'Все активные результаты в системе.',
  filter_basic: 'Базовые',
  filter_basic_tip: 'Без продвижения. Стандартное размещение.',
  filter_paid: 'Платные',
  filter_paid_tip: 'Приоритетная видимость. Верифицированное размещение.',
  filter_vip1500: 'VIP ₪1500+',
  filter_vip1500_tip: 'Результаты от ₪1500 и выше.',
  filter_up1000: 'До ₪1000',
  filter_up1000_tip: 'Результаты с ценой до ₪1000.',
  filter_massage: 'Массаж',
  filter_massage_tip: 'Только услуги массажа.',
  filter_striptease: 'Стриптиз',
  filter_striptease_tip: 'Категория стриптиз.',
  filter_domina: 'Доминация',
  filter_domina_tip: 'Доминация и BDSM услуги.',
  filter_kinky: 'Кинки',
  filter_kinky_tip: 'Нестандартные запросы и фетиши.',
  col_price: 'Цена',
  col_city: 'Город',
  col_type: 'Тип',
  results: 'Результатов',
  no_results: 'Нет результатов по фильтрам',
  no_results_sub: '',
  reset_filters: 'Сбросить фильтры',
  load_more: 'Загрузить ещё',
  remaining: 'осталось',
  showing: 'Показано',
  of: 'из',
  vip: 'VIP',
  verified: 'Проверено',
  online: 'Онлайн',
  badge_vip: 'VIP',
  badge_verified: 'Верифицирован',
  badge_online: 'Онлайн',
  price_on_request: 'По запросу',
  from_price: 'от',
  up_to_price: 'до',
  ask_input_placeholder: 'Что вы хотите узнать из данных?',
  ask_btn: 'Спросить',
  ask_loading: 'Запрашиваю данные',
  ask_query_label: 'Запрос',
  ask_example_vip: 'Покажи VIP рядом',
  ask_example_searched: 'Чаще всего ищут сегодня',
  ask_example_city: 'Самый активный город',
  ask_example_online: 'Сколько онлайн сейчас',
  ask_example_price: 'Топ ценовой диапазон',
  role_basic_1: 'Ограниченное кол-во поисков',
  role_basic_2: 'Без доступа к аналитике',
  role_basic_3: 'Стандартная выдача',
  role_paid_1: 'Безлимитный поиск',
  role_paid_2: 'Полная история проверок',
  role_paid_3: 'Тренды и аналитика спроса',
  role_paid_4: 'Расширенная статистика',
  role_paid_cta: 'Открыть платный доступ',
  views_today: 'просм.',
  unlock_phone: 'Открыть контакт',
  unlock_price: '$100',
  truth_engine: 'Премиум подбор',
  // legacy
  unlock_to_text: 'РАЗБЛОКИРУЙ ДЛЯ СВЯЗИ',
  photos: 'фото',
  sheet_all: 'Все',
  sheet_verified: 'Проверенные',
  sheet_vip: 'VIP',
  sheet_under25: 'До 25',
  sheet_40plus: '40+',
  sheet_outcall: 'Выезд',
  sheet_nearme: 'Рядом',
  cat_massage: 'Массаж',
  cat_dating: 'Только свидания',
  cat_sugar_baby: 'Сахарная',
  cat_domina: 'Домина',
  cat_individual: 'Индивидуально',
  cat_trans: 'Транс',
  preset_mfw: 'Мужчины для женщин и пар',
  preset_mfm: 'Мужчины для мужчин',
  preset_russian: 'Русские девушки',
  preset_latina: 'Латиноамериканки',
  filters: 'Фильтры',
  age: 'Возраст',
  price: 'Цена',
  city: 'Город',
  category: 'Категория',
  sheets: 'Листы',
  load_more_label: 'Загрузить ещё',
  language: 'Язык',
  starting_at: 'От',
  contacts: 'Контакты',
  unlock: 'Открыть',
}

const he: TranslationDict = {
  app_name: 'Tahles',
  app_tagline: 'מצא את\nההתאמה המושלמת',
  app_subtitle: 'שירותי ליווי פרימיום. פרופילים מאומתים. שירות דיסקרטי.',
  ask_tahles: 'שאל את Tahles',
  search_placeholder: 'שם, עיר, קטגוריה או מחיר...',
  search_btn: 'חיפוש',
  search_clear: 'נקה',
  times_searched: 'פעמים חיפשו',
  trend: 'מגמה',
  trend_rising: 'עולה',
  trend_stable: 'יציב',
  results_found: 'תוצאות נמצאו',
  phone_matches: 'התאמות טלפון',
  top_city: 'עיר מובילה',
  here: 'כאן',
  db_active: 'פעילים',
  db_online: 'מחוברים',
  db_updates_hr: 'עדכונים/שעה',
  db_searches_today: 'חיפושים היום',
  db_checks_today: 'בדיקות היום',
  db_top_city: 'עיר מובילה',
  filter_listed: 'רשומים',
  filter_listed_tip: 'כל התוצאות הפעילות במערכת.',
  filter_basic: 'בסיסי',
  filter_basic_tip: 'ללא קידום. מיקום סטנדרטי.',
  filter_paid: 'בתשלום',
  filter_paid_tip: 'נראות עדיפה. מיקום מאומת.',
  filter_vip1500: 'VIP ₪1500+',
  filter_vip1500_tip: 'תוצאות מ-₪1500 ומעלה.',
  filter_up1000: 'עד ₪1000',
  filter_up1000_tip: 'תוצאות עם מחיר עד ₪1000.',
  filter_massage: 'עיסוי',
  filter_massage_tip: 'שירותי עיסוי בלבד.',
  filter_striptease: 'סטריפטיז',
  filter_striptease_tip: 'קטגוריית סטריפטיז.',
  filter_domina: 'דומינה',
  filter_domina_tip: 'שירותי שליטה ו-BDSM.',
  filter_kinky: 'קינקי',
  filter_kinky_tip: 'בקשות לא שגרתיות ופטישים.',
  col_price: 'מחיר',
  col_city: 'עיר',
  col_type: 'סוג',
  results: 'תוצאות',
  no_results: 'אין תוצאות לפי הפילטרים הנוכחיים',
  no_results_sub: '',
  reset_filters: 'אפס פילטרים',
  load_more: 'טען עוד',
  remaining: 'נותרו',
  showing: 'מוצגים',
  of: 'מתוך',
  vip: 'VIP',
  verified: 'מאומת',
  online: 'מחובר',
  badge_vip: 'VIP',
  badge_verified: 'מאומת',
  badge_online: 'מחובר',
  price_on_request: 'לפי בקשה',
  from_price: 'מ',
  up_to_price: 'עד',
  ask_input_placeholder: 'מה אתה רוצה לדעת מהנתונים?',
  ask_btn: 'שאל',
  ask_loading: 'מבצע שאילתה',
  ask_query_label: 'שאילתה',
  ask_example_vip: 'הצג VIP בקרבת מקום',
  ask_example_searched: 'הכי מחופש היום',
  ask_example_city: 'העיר הפעילה ביותר',
  ask_example_online: 'כמה מחוברים עכשיו',
  ask_example_price: 'טווח מחירים מוביל',
  role_basic_1: 'חיפושים מוגבלים ליום',
  role_basic_2: 'ללא גישה לאנליטיקה',
  role_basic_3: 'תצוגת תוצאות סטנדרטית',
  role_paid_1: 'חיפושים ללא הגבלה',
  role_paid_2: 'היסטוריית בדיקות מלאה',
  role_paid_3: 'אנליטיקת מגמות וביקוש',
  role_paid_4: 'סטטיסטיקה מורחבת',
  role_paid_cta: 'פתח גישה בתשלום',
  views_today: 'צפיות',
  unlock_phone: 'פתח יצירת קשר',
  unlock_price: '$100',
  truth_engine: 'שידוך פרימיום',
  // legacy
  unlock_to_text: 'פתח לשליחת הודעה',
  photos: 'תמונות',
  sheet_all: 'הכל',
  sheet_verified: 'מאומתות',
  sheet_vip: 'VIP',
  sheet_under25: 'מתחת 25',
  sheet_40plus: '40+',
  sheet_outcall: 'יוצאות',
  sheet_nearme: 'קרוב',
  cat_massage: 'עיסוי',
  cat_dating: 'דייטים בלבד',
  cat_sugar_baby: 'שוגר בייבי',
  cat_domina: 'דומינה',
  cat_individual: 'אישי',
  cat_trans: 'טרנס',
  preset_mfw: 'גברים לנשים וזוגות',
  preset_mfm: 'גברים לגברים',
  preset_russian: 'בנות רוסיות',
  preset_latina: 'בנות לטיניות',
  filters: 'מסננים',
  age: 'גיל',
  price: 'מחיר',
  city: 'עיר',
  category: 'קטגוריה',
  sheets: 'רשימות',
  load_more_label: 'טען עוד',
  language: 'שפה',
  starting_at: 'החל מ',
  contacts: 'אנשי קשר',
  unlock: 'פתיחה',
}

export const translations: Record<Locale, TranslationDict> = { en, ru, he }
