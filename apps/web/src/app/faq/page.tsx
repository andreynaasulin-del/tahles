import type { Metadata } from 'next'
import { CITIES, SITE_URL } from '@/lib/cities'

export const metadata: Metadata = {
  title: 'FAQ — Frequently Asked Questions | Tahles',
  description: 'Frequently asked questions about Tahles escort directory in Israel. How it works, safety tips, verification process, covered cities.',
  alternates: { canonical: `${SITE_URL}/faq` },
  openGraph: {
    type: 'website',
    title: 'FAQ — Tahles Escort Directory Israel',
    description: 'Frequently asked questions about Tahles escort directory in Israel.',
    url: `${SITE_URL}/faq`,
  },
}

const FAQ_ITEMS = [
  {
    q: { en: 'What is Tahles?', he: 'מה זה Tahles?', ru: 'Что такое Tahles?' },
    a: {
      en: 'Tahles is Israel\'s largest escort directory with verified profiles, real photos, reviews and ratings. We aggregate listings from multiple sources and verify them for authenticity. Our directory covers Tel Aviv, Haifa, Jerusalem, Eilat, and all major Israeli cities.',
      he: 'Tahles הוא מאגר המודעות הגדול ביותר בישראל עם פרופילים מאומתים, תמונות אמיתיות, ביקורות ודירוגים. אנו אוספים מודעות ממקורות מרובים ומאמתים אותן. המאגר שלנו מכסה את תל אביב, חיפה, ירושלים, אילת וכל הערים הגדולות בישראל.',
      ru: 'Tahles — крупнейший каталог эскорт-услуг в Израиле с верифицированными профилями, реальными фото, отзывами и рейтингами. Мы агрегируем объявления из нескольких источников и проверяем их подлинность. Каталог охватывает Тель-Авив, Хайфу, Иерусалим, Эйлат и все крупные города Израиля.',
    },
  },
  {
    q: { en: 'How does profile verification work?', he: 'איך עובד תהליך האימות?', ru: 'Как работает верификация профилей?' },
    a: {
      en: 'Verified profiles on Tahles have been checked for authentic photos and accurate information. We cross-reference data from multiple sources and flag profiles that meet our quality standards. Verified profiles are marked with a special badge.',
      he: 'פרופילים מאומתים ב-Tahles עברו בדיקת תמונות אמיתיות ומידע מדויק. אנו מצליבים נתונים ממקורות מרובים ומסמנים פרופילים שעומדים בסטנדרט האיכות שלנו. פרופילים מאומתים מסומנים בתג מיוחד.',
      ru: 'Верифицированные профили на Tahles проверены на подлинность фотографий и точность информации. Мы перекрёстно сверяем данные из нескольких источников и отмечаем профили, соответствующие нашим стандартам качества.',
    },
  },
  {
    q: { en: 'Which cities does Tahles cover?', he: 'באילו ערים Tahles פעיל?', ru: 'Какие города охватывает Tahles?' },
    a: {
      en: 'Tahles covers all major Israeli cities including Tel Aviv, Haifa, Jerusalem, Eilat, Netanya, Bat Yam, Beer Sheva, Ashdod, Rishon LeZion, Herzliya, and Hadera. New cities and profiles are added daily.',
      he: 'Tahles מכסה את כל הערים הגדולות בישראל כולל תל אביב, חיפה, ירושלים, אילת, נתניה, בת ים, באר שבע, אשדוד, ראשון לציון, הרצליה וחדרה. ערים ופרופילים חדשים מתווספים יומיומית.',
      ru: 'Tahles охватывает все крупные города Израиля: Тель-Авив, Хайфа, Иерусалим, Эйлат, Нетания, Бат-Ям, Беэр-Шева, Ашдод, Ришон-ле-Цион, Герцлия и Хадера. Новые города и профили добавляются ежедневно.',
    },
  },
  {
    q: { en: 'How often is Tahles updated?', he: 'כמה פעמים Tahles מתעדכן?', ru: 'Как часто обновляется Tahles?' },
    a: {
      en: 'Tahles is updated daily. Our automated system crawls multiple sources every hour to add new profiles and update existing ones. You can see the latest additions in our "New Profiles" section.',
      he: 'Tahles מתעדכן יומיומית. המערכת האוטומטית שלנו סורקת מקורות מרובים כל שעה כדי להוסיף פרופילים חדשים ולעדכן קיימים. ניתן לראות את התוספות האחרונות בקטגוריה "פרופילים חדשים".',
      ru: 'Tahles обновляется ежедневно. Наша автоматизированная система каждый час сканирует несколько источников, добавляя новые профили и обновляя существующие. Последние добавления можно увидеть в разделе "Новые профили".',
    },
  },
  {
    q: { en: 'Is Tahles free to use?', he: 'האם Tahles בחינם?', ru: 'Tahles бесплатный?' },
    a: {
      en: 'Yes, browsing profiles on Tahles is completely free. You can view photos, descriptions, prices, and contact information without any charge.',
      he: 'כן, גלישה בפרופילים ב-Tahles חינמית לחלוטין. ניתן לצפות בתמונות, תיאורים, מחירים ופרטי קשר ללא כל תשלום.',
      ru: 'Да, просмотр профилей на Tahles полностью бесплатный. Вы можете просматривать фото, описания, цены и контактную информацию без оплаты.',
    },
  },
  {
    q: { en: 'How can I contact someone on Tahles?', he: 'איך אפשר ליצור קשר דרך Tahles?', ru: 'Как связаться с кем-то через Tahles?' },
    a: {
      en: 'Each profile on Tahles includes contact options such as WhatsApp, phone call, and Telegram. Simply open a profile and tap the contact button to see available communication methods.',
      he: 'כל פרופיל ב-Tahles כולל אפשרויות קשר כמו WhatsApp, שיחת טלפון וטלגרם. פשוט פתח פרופיל ולחץ על כפתור יצירת הקשר כדי לראות את אמצעי התקשורת הזמינים.',
      ru: 'Каждый профиль на Tahles содержит контактные данные: WhatsApp, телефон и Telegram. Откройте профиль и нажмите кнопку контакта, чтобы увидеть доступные способы связи.',
    },
  },
]

export default function FaqPage() {
  // JSON-LD FAQPage schema
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map(item => ({
      '@type': 'Question',
      name: item.q.en,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a.en,
      },
    })),
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Tahles', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'FAQ', item: `${SITE_URL}/faq` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="min-h-screen bg-[#0a0a0a] text-white">
        {/* Header */}
        <header className="sticky top-0 z-50 glass border-b border-white/5 px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <a href="/" className="text-xl font-bold tracking-tight">
              <span className="text-[#c8a97e]">Tahles</span>
            </a>
            <nav className="flex gap-3 text-sm text-white/50">
              <a href="/" className="hover:text-white transition">Home</a>
            </nav>
          </div>
        </header>

        {/* Breadcrumbs */}
        <nav className="max-w-3xl mx-auto px-4 py-3 text-sm text-white/40">
          <a href="/" className="hover:text-white/70 transition">Home</a>
          <span className="mx-2">/</span>
          <span className="text-white/70">FAQ</span>
        </nav>

        {/* Title */}
        <section className="max-w-3xl mx-auto px-4 pt-4 pb-8">
          <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
          <p className="text-white/50">Everything you need to know about Tahles</p>
        </section>

        {/* FAQ Items */}
        <section className="max-w-3xl mx-auto px-4 pb-12 space-y-6">
          {FAQ_ITEMS.map((item, i) => (
            <details key={i} className="group bg-white/[0.03] rounded-xl border border-white/5 overflow-hidden" open={i === 0}>
              <summary className="px-6 py-4 cursor-pointer text-lg font-medium hover:bg-white/[0.02] transition list-none flex justify-between items-center">
                <span>{item.q.en}</span>
                <span className="text-white/30 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-6 pb-5 space-y-4">
                <p className="text-white/60 leading-relaxed">{item.a.en}</p>
                <p className="text-white/40 leading-relaxed" dir="rtl">{item.a.he}</p>
                <p className="text-white/40 leading-relaxed">{item.a.ru}</p>
              </div>
            </details>
          ))}
        </section>

        {/* City Links */}
        <section className="max-w-3xl mx-auto px-4 pb-12 border-t border-white/5 pt-8">
          <h2 className="text-xl font-semibold mb-4 text-white/70">Browse by city</h2>
          <div className="flex flex-wrap gap-2">
            {CITIES.map(c => (
              <a key={c.slug} href={`/${c.slug}`}
                className="px-4 py-2 rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition text-sm">
                {c.nameEn}
              </a>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 text-center text-white/30 text-sm">
          <p>&copy; {new Date().getFullYear()} Tahles — Premium Escort Directory Israel</p>
        </footer>
      </div>
    </>
  )
}
