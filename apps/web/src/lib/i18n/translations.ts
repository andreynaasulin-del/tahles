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
  | 'filter_up1000'
  | 'filter_up1000_tip'
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
  | 'sheet_video'
  | 'cat_individual'
  | 'cat_agency'
  | 'cat_sugar_baby'
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
  | 'origin'
  | 'origin_european'
  | 'origin_eastern_european'
  | 'origin_israeli'
  | 'origin_latina'
  | 'origin_asian'
  | 'origin_african'
  | 'origin_ethiopian'
  | 'view_profile'
  | 'all_cities'
  | 'all_origins'
  | 'price_range'
  | 'any_price'
  | 'profiles'
  // ── infographic slide ──
  | 'info_prices'
  | 'info_details'
  | 'info_services'
  | 'info_languages'
  // ── physical params ──
  | 'param_height'
  | 'param_weight'
  | 'param_breast'
  | 'param_hair'
  | 'param_eyes'
  | 'param_ethnicity'
  | 'param_nationality'
  | 'param_sexuality'
  // ── contact popup ──
  | 'contact_btn'
  | 'contact_how'
  | 'contact_wa_sub'
  | 'contact_call'
  | 'contact_call_sub'
  | 'wa_message'
  // ── profile detail sections ──
  | 'section_about'
  | 'section_payments'
  | 'section_parking'
  // ── hero / info blocks ──
  | 'hero_line1'
  | 'hero_line2'
  | 'hero_line3'
  | 'signal_profiles'
  | 'signal_added_24h'
  | 'signal_wa_verified'
  | 'signal_demand'
  | 'signal_demand_low'
  | 'signal_demand_medium'
  | 'signal_demand_high'
  | 'how_title'
  | 'how_text'
  | 'publish_title'
  | 'publish_subtitle'
  | 'rating_title'
  | 'rating_intro'
  | 'rating_wa'
  | 'rating_photos'
  | 'rating_retouch'
  | 'rating_reviews'
  | 'rating_outro'
  | 'warning_title'
  | 'warning_text'
  | 'warning_money'
  | 'cookie_text'
  | 'cookie_accept'
  | 'cookie_decline'
  // ── city names ──
  | 'city_tel_aviv'
  | 'city_jerusalem'
  | 'city_haifa'
  | 'city_bat_yam'
  | 'city_rishon_lezion'
  | 'city_netanya'
  | 'city_beer_sheva'
  | 'city_petah_tikva'
  | 'city_ramat_gan'
  | 'city_ashdod'
  | 'city_holon'
  | 'city_hadera'

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
  filter_up1000: 'Up to ₪1000',
  filter_up1000_tip: 'Results priced up to ₪1000.',
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
  unlock_to_text: 'UNLOCK TO TEXT',
  photos: 'photos',
  sheet_all: 'All',
  sheet_verified: 'Verified',
  sheet_vip: 'VIP',
  sheet_under25: 'Under 25',
  sheet_40plus: '40+',
  sheet_outcall: 'Outcall',
  sheet_nearme: 'Near Me',
  sheet_video: 'With Video',
  cat_individual: 'Individual',
  cat_agency: 'Agency',
  cat_sugar_baby: 'Sugar Babies',
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
  origin: 'Origin',
  origin_european: 'European',
  origin_eastern_european: 'East European',
  origin_israeli: 'Israeli',
  origin_latina: 'Latina',
  origin_asian: 'Asian',
  origin_african: 'African',
  origin_ethiopian: 'Ethiopian',
  view_profile: 'View Profile',
  all_cities: 'All',
  all_origins: 'All',
  price_range: 'Price Range',
  any_price: 'Any price',
  profiles: 'profiles',
  // infographic
  info_prices: 'Prices',
  info_details: 'Details',
  info_services: 'Services',
  info_languages: 'Languages',
  param_height: 'Height',
  param_weight: 'Weight',
  param_breast: 'Breast',
  param_hair: 'Hair',
  param_eyes: 'Eyes',
  param_ethnicity: 'Ethnicity',
  param_nationality: 'Nationality',
  param_sexuality: 'Sexuality',
  // contact
  contact_btn: 'Contact',
  contact_how: 'Choose how to connect',
  contact_wa_sub: 'Message directly',
  contact_call: 'Call',
  contact_call_sub: 'Phone call',
  wa_message: 'Hi, I found your profile on Tahles and would like to meet',
  // profile sections
  section_about: 'About',
  section_payments: 'Payments',
  section_parking: 'Parking',
  // hero / info
  hero_line1: 'The largest ad database in the country, updated daily.',
  hero_line2: 'Escort \u2022 Strippers \u2022 Massage \u2022 Sugar dating & more.',
  hero_line3: 'A simple, convenient interactive feed aggregating ads from Telegram and other sources.',
  signal_profiles: 'profiles on site',
  signal_added_24h: 'added in last 24h',
  signal_wa_verified: 'with verified WhatsApp',
  signal_demand: 'Current demand level',
  signal_demand_low: 'low',
  signal_demand_medium: 'medium',
  signal_demand_high: 'high',
  how_title: 'How Tahles works',
  how_text: 'We collect ads from various sources, remove duplicates, and display them in an organized feed.',
  publish_title: 'Publish Your Profile',
  publish_subtitle: 'List your ad on Tahles — quick setup via Telegram bot',
  rating_title: 'Tahles Rating System',
  rating_intro: 'To maintain order and trust, profiles are reviewed and rated.',
  rating_wa: 'WhatsApp verification',
  rating_photos: 'Manual photo review',
  rating_retouch: 'Removal of overly retouched photos',
  rating_reviews: 'Reviews and likes from verified users',
  rating_outro: 'Profiles with more trust and good reviews appear higher in the feed.',
  warning_title: 'Important',
  warning_text: 'Even with checks and a high rating, reliability cannot be guaranteed 100%.',
  warning_money: 'Do not send money in advance to anyone.',
  cookie_text: 'We use cookies to improve your experience.',
  cookie_accept: 'Accept',
  cookie_decline: 'Decline',
  // cities
  city_tel_aviv: 'Tel Aviv',
  city_jerusalem: 'Jerusalem',
  city_haifa: 'Haifa',
  city_bat_yam: 'Bat Yam',
  city_rishon_lezion: 'Rishon LeZion',
  city_netanya: 'Netanya',
  city_beer_sheva: 'Beer Sheva',
  city_petah_tikva: 'Petah Tikva',
  city_ramat_gan: 'Ramat Gan',
  city_ashdod: 'Ashdod',
  city_holon: 'Holon',
  city_hadera: 'Hadera',
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
  filter_up1000: 'До ₪1000',
  filter_up1000_tip: 'Результаты с ценой до ₪1000.',
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
  unlock_to_text: 'РАЗБЛОКИРУЙ ДЛЯ СВЯЗИ',
  photos: 'фото',
  sheet_all: 'Все',
  sheet_verified: 'Проверенные',
  sheet_vip: 'VIP',
  sheet_under25: 'До 25',
  sheet_40plus: '40+',
  sheet_outcall: 'Выезд',
  sheet_nearme: 'Рядом',
  sheet_video: 'С видео',
  cat_individual: 'Индивидуалка',
  cat_agency: 'Агентство',
  cat_sugar_baby: 'Sugar Babies',
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
  origin: 'Происхождение',
  origin_european: 'Европейки',
  origin_eastern_european: 'Восточная Европа',
  origin_israeli: 'Израильтянки',
  origin_latina: 'Латиноамериканки',
  origin_asian: 'Азиатки',
  origin_african: 'Африканки',
  origin_ethiopian: 'Эфиопки',
  view_profile: 'Смотреть профиль',
  all_cities: 'Все',
  all_origins: 'Все',
  price_range: 'Диапазон цен',
  any_price: 'Любая цена',
  profiles: 'профилей',
  // infographic
  info_prices: 'Цены',
  info_details: 'Детали',
  info_services: 'Услуги',
  info_languages: 'Языки',
  param_height: 'Рост',
  param_weight: 'Вес',
  param_breast: 'Грудь',
  param_hair: 'Волосы',
  param_eyes: 'Глаза',
  param_ethnicity: 'Этнос',
  param_nationality: 'Гражданство',
  param_sexuality: 'Ориентация',
  // contact
  contact_btn: 'Связаться',
  contact_how: 'Выберите способ связи',
  contact_wa_sub: 'Написать напрямую',
  contact_call: 'Звонок',
  contact_call_sub: 'Телефонный звонок',
  wa_message: 'Привет, я нашёл ваш профиль на Tahles и хотел бы встретиться',
  // profile sections
  section_about: 'О себе',
  section_payments: 'Оплата',
  section_parking: 'Парковка',
  // hero / info
  hero_line1: 'Самая крупная база объявлений в стране, обновляется каждый день.',
  hero_line2: 'Эскорт \u2022 Стриптиз \u2022 Массаж \u2022 Содержанки и другое.',
  hero_line3: 'Простой и удобный интерактивный фид, объединяющий объявления из Telegram и других источников.',
  signal_profiles: 'профилей на сайте',
  signal_added_24h: 'добавлено за 24ч',
  signal_wa_verified: 'с подтверждённым WhatsApp',
  signal_demand: 'Уровень спроса сейчас',
  signal_demand_low: 'низкий',
  signal_demand_medium: 'средний',
  signal_demand_high: 'высокий',
  how_title: 'Как работает Tahles',
  how_text: 'Мы собираем объявления из разных источников, удаляем дубликаты и показываем их в упорядоченном фиде.',
  publish_title: 'Разместить анкету',
  publish_subtitle: 'Добавь свою анкету на Tahles — быстро через Telegram-бот',
  rating_title: 'Система рейтинга Tahles',
  rating_intro: 'Для поддержания порядка и доверия, профили проходят проверку и получают рейтинг.',
  rating_wa: 'Подтверждение через WhatsApp',
  rating_photos: 'Ручная проверка фотографий',
  rating_retouch: 'Удаление фото с чрезмерной ретушью',
  rating_reviews: 'Отзывы и лайки от проверенных пользователей',
  rating_outro: 'Профили с большим доверием и хорошими отзывами показываются выше в ленте.',
  warning_title: 'Важно знать',
  warning_text: 'Даже при проверках и высоком рейтинге невозможно гарантировать надёжность на 100%.',
  warning_money: 'Не переводите деньги заранее никому.',
  cookie_text: 'Мы используем cookies для улучшения вашего опыта.',
  cookie_accept: 'Принять',
  cookie_decline: 'Отклонить',
  // cities
  city_tel_aviv: 'Тель-Авив',
  city_jerusalem: 'Иерусалим',
  city_haifa: 'Хайфа',
  city_bat_yam: 'Бат-Ям',
  city_rishon_lezion: 'Ришон ле-Цион',
  city_netanya: 'Нетания',
  city_beer_sheva: 'Беэр-Шева',
  city_petah_tikva: 'Петах-Тиква',
  city_ramat_gan: 'Рамат-Ган',
  city_ashdod: 'Ашдод',
  city_holon: 'Холон',
  city_hadera: 'Хадера',
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
  filter_up1000: 'עד ₪1000',
  filter_up1000_tip: 'תוצאות עם מחיר עד ₪1000.',
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
  unlock_to_text: 'פתח לשליחת הודעה',
  photos: 'תמונות',
  sheet_all: 'הכל',
  sheet_verified: 'מאומתות',
  sheet_vip: 'VIP',
  sheet_under25: 'מתחת 25',
  sheet_40plus: '40+',
  sheet_outcall: 'יוצאות',
  sheet_nearme: 'קרוב',
  sheet_video: 'עם וידאו',
  cat_individual: 'עצמאית',
  cat_agency: 'סוכנות',
  cat_sugar_baby: 'Sugar Babies',
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
  origin: 'מוצא',
  origin_european: 'אירופאיות',
  origin_eastern_european: 'מזרח אירופה',
  origin_israeli: 'ישראליות',
  origin_latina: 'לטיניות',
  origin_asian: 'אסיאתיות',
  origin_african: 'אפריקאיות',
  origin_ethiopian: 'אתיופיות',
  view_profile: 'צפה בפרופיל',
  all_cities: 'הכל',
  all_origins: 'הכל',
  price_range: 'טווח מחירים',
  any_price: 'כל מחיר',
  profiles: 'פרופילים',
  // infographic
  info_prices: 'מחירים',
  info_details: 'פרטים',
  info_services: 'שירותים',
  info_languages: 'שפות',
  param_height: 'גובה',
  param_weight: 'משקל',
  param_breast: 'חזה',
  param_hair: 'שיער',
  param_eyes: 'עיניים',
  param_ethnicity: 'מוצא',
  param_nationality: 'לאום',
  param_sexuality: 'נטייה',
  // contact
  contact_btn: 'צור קשר',
  contact_how: 'בחר איך ליצור קשר',
  contact_wa_sub: 'שלח הודעה',
  contact_call: 'התקשר',
  contact_call_sub: 'שיחת טלפון',
  wa_message: 'היי, מצאתי את הפרופיל שלך ב-Tahles ואשמח להיפגש',
  // profile sections
  section_about: 'אודות',
  section_payments: 'תשלומים',
  section_parking: 'חניה',
  // hero / info
  hero_line1: 'מאגר המודעות הגדול בארץ שמתעדכן כל יום.',
  hero_line2: 'נערות ליווי \u2022 חשפניות \u2022 עיסויים \u2022 נתמכות ועוד.',
  hero_line3: 'פיד אינטראקטיבי פשוט ונוח שמרכז מודעות מטלגרם וממקורות נוספים.',
  signal_profiles: 'פרופילים באתר',
  signal_added_24h: 'נוספו ב-24 שעות אחרונות',
  signal_wa_verified: 'עם WhatsApp מאומת',
  signal_demand: 'קצב ביקוש כרגע',
  signal_demand_low: 'נמוך',
  signal_demand_medium: 'בינוני',
  signal_demand_high: 'גבוה',
  how_title: 'איך Tahles עובד',
  how_text: 'אנחנו אוספים מודעות ממקורות שונים, מסירים כפילויות ומציגים אותן בפיד מסודר.',
  publish_title: 'פרסמי את המודעה שלך',
  publish_subtitle: 'הוסיפי את המודעה שלך ל-Tahles — תהליך מהיר דרך בוט טלגרם',
  rating_title: 'מערכת דירוג ב-Tahles',
  rating_intro: 'כדי לשמור על סדר ואמינות, פרופילים עוברים בדיקה ומקבלים דירוג.',
  rating_wa: 'אימות דרך WhatsApp',
  rating_photos: 'בדיקה ידנית של תמונות',
  rating_retouch: 'הסרת תמונות עם ריטוש מוגזם',
  rating_reviews: 'ביקורות ולייקים ממשתמשים מאומתים',
  rating_outro: 'פרופילים עם יותר אמון וביקורות טובות מופיעים גבוה יותר בפיד.',
  warning_title: 'חשוב לדעת',
  warning_text: 'גם עם בדיקות וציון גבוה לא ניתן להבטיח אמינות ב-100%.',
  warning_money: 'אל תעבירו כסף מראש לאף אחד.',
  cookie_text: 'אנחנו משתמשים בעוגיות כדי לשפר את חוויית השימוש.',
  cookie_accept: 'אישור',
  cookie_decline: 'דחייה',
  // cities
  city_tel_aviv: 'תל אביב',
  city_jerusalem: 'ירושלים',
  city_haifa: 'חיפה',
  city_bat_yam: 'בת ים',
  city_rishon_lezion: 'ראשון לציון',
  city_netanya: 'נתניה',
  city_beer_sheva: 'באר שבע',
  city_petah_tikva: 'פתח תקווה',
  city_ramat_gan: 'רמת גן',
  city_ashdod: 'אשדוד',
  city_holon: 'חולון',
  city_hadera: 'חדרה',
}

export const translations: Record<Locale, TranslationDict> = { en, ru, he }

/* ── City name translation map (for DB values → display) ── */
export const CITY_MAP: Record<string, Record<Locale, string>> = {
  'Tel Aviv':      { en: 'Tel Aviv',      ru: 'Тель-Авив',      he: 'תל אביב' },
  'Jerusalem':     { en: 'Jerusalem',     ru: 'Иерусалим',      he: 'ירושלים' },
  'Haifa':         { en: 'Haifa',         ru: 'Хайфа',          he: 'חיפה' },
  'Bat Yam':       { en: 'Bat Yam',       ru: 'Бат-Ям',         he: 'בת ים' },
  'Rishon LeZion': { en: 'Rishon LeZion', ru: 'Ришон ле-Цион',  he: 'ראשון לציון' },
  'Netanya':       { en: 'Netanya',       ru: 'Нетания',        he: 'נתניה' },
  'Beer Sheva':    { en: 'Beer Sheva',    ru: 'Беэр-Шева',      he: 'באר שבע' },
  'Petah Tikva':   { en: 'Petah Tikva',   ru: 'Петах-Тиква',    he: 'פתח תקווה' },
  'Ramat Gan':     { en: 'Ramat Gan',     ru: 'Рамат-Ган',      he: 'רמת גן' },
  'Ashdod':        { en: 'Ashdod',        ru: 'Ашдод',          he: 'אשדוד' },
  'Holon':         { en: 'Holon',         ru: 'Холон',          he: 'חולון' },
  'Hadera':        { en: 'Hadera',        ru: 'Хадера',         he: 'חדרה' },
}

export function translateCity(city: string | null, locale: Locale): string {
  if (!city) return ''
  return CITY_MAP[city]?.[locale] || city
}

/* ── Service type translation map ── */
export const SERVICE_TYPE_MAP: Record<string, Record<Locale, string>> = {
  'INCALL':     { en: 'Incall',     ru: 'В апартаментах', he: 'בדירה' },
  'OUTCALL':    { en: 'Outcall',    ru: 'Выезд',         he: 'יוצאת' },
  'Incall':     { en: 'Incall',     ru: 'В апартаментах', he: 'בדירה' },
  'Outcall':    { en: 'Outcall',    ru: 'Выезд',         he: 'יוצאת' },
  'Escort':     { en: 'Escort',     ru: 'Эскорт',        he: 'ליווי' },
  'escort':     { en: 'Escort',     ru: 'Эскорт',        he: 'ליווי' },
  'Massage':    { en: 'Massage',    ru: 'Массаж',        he: 'עיסוי' },
  'massage':    { en: 'Massage',    ru: 'Массаж',        he: 'עיסוי' },
  'Striptease': { en: 'Striptease', ru: 'Стриптиз',      he: 'סטריפטיז' },
  'BDSM':       { en: 'BDSM',      ru: 'БДСМ',          he: 'BDSM' },
  'Domina':     { en: 'Domina',     ru: 'Доминация',     he: 'דומינה' },
}

export function translateServiceType(st: string | null, locale: Locale): string {
  if (!st) return ''
  return SERVICE_TYPE_MAP[st]?.[locale]
    || SERVICE_TYPE_MAP[st.charAt(0).toUpperCase() + st.slice(1)]?.[locale]
    || SERVICE_TYPE_MAP[st.toUpperCase()]?.[locale]
    || st
}

/* ── Ethnicity value translation map ── */
export const ETHNICITY_MAP: Record<string, Record<Locale, string>> = {
  'Eastern European': { en: 'Eastern European', ru: 'Восточная Европа',    he: 'מזרח אירופה' },
  'European':         { en: 'European',         ru: 'Европейка',           he: 'אירופאית' },
  'Latino':           { en: 'Latina',           ru: 'Латиноамериканка',    he: 'לטינית' },
  'Asian':            { en: 'Asian',            ru: 'Азиатка',             he: 'אסיאתית' },
  'Ethiopian':        { en: 'Ethiopian',        ru: 'Эфиопка',             he: 'אתיופית' },
  'African':          { en: 'African',          ru: 'Африканка',           he: 'אפריקאית' },
  'Israeli':          { en: 'Israeli',          ru: 'Израильтянка',        he: 'ישראלית' },
  'Russian':          { en: 'Russian',          ru: 'Русская',             he: 'רוסיה' },
}

export function translateEthnicity(eth: string | null, locale: Locale): string {
  if (!eth) return ''
  return ETHNICITY_MAP[eth]?.[locale] || eth
}
