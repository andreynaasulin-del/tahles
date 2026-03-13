import type { Metadata } from 'next'
import { CITIES, FILTERS, SITE_URL } from '@/lib/cities'
import { SubpageHeader } from '@/components/layout/SubpageHeader'

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
        <SubpageHeader
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'FAQ' },
          ]}
        />

        <main className="max-w-[1100px] mx-auto px-4 sm:px-6 pb-20">
          {/* Hero */}
          <section className="mt-4 mb-6 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
            <div className="px-5 py-4">
              <h1 className="text-lg font-black text-velvet-300">Frequently Asked Questions</h1>
              <p className="text-sm text-white/50 mt-1">Everything you need to know about Tahles</p>
            </div>
          </section>

          {/* FAQ Items */}
          <section className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <details
                key={i}
                className="group rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden"
                open={i === 0}
              >
                <summary className="px-5 py-4 cursor-pointer text-sm font-bold hover:bg-white/[0.02] transition list-none flex justify-between items-center">
                  <span className="text-white/80">{item.q.en}</span>
                  <span className="text-white/30 group-open:rotate-180 transition-transform text-xs ml-4">&#9660;</span>
                </summary>
                <div className="px-5 pb-5 space-y-3 border-t border-white/[0.04] pt-3">
                  <p className="text-xs text-white/50 leading-relaxed">{item.a.en}</p>
                  <p className="text-xs text-white/35 leading-relaxed" dir="rtl">{item.a.he}</p>
                  <p className="text-xs text-white/35 leading-relaxed">{item.a.ru}</p>
                </div>
              </details>
            ))}
          </section>

          {/* Category nav */}
          <section className="mt-10">
            <h2 className="text-xs text-white/50 uppercase tracking-[0.2em] font-black mb-3">Browse by category</h2>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map(f => (
                <a
                  key={f.slug}
                  href={`/escorts/${f.slug}`}
                  className="px-3 py-1.5 rounded-full bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition text-xs"
                >
                  {f.nameEn}
                </a>
              ))}
            </div>
          </section>

          {/* City Links */}
          <section className="mt-6">
            <h2 className="text-xs text-white/50 uppercase tracking-[0.2em] font-black mb-3">Browse by city</h2>
            <div className="flex flex-wrap gap-2">
              {CITIES.map(c => (
                <a
                  key={c.slug}
                  href={`/${c.slug}`}
                  className="px-3 py-1.5 rounded-full bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition text-xs"
                >
                  {c.nameEn}
                </a>
              ))}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/[0.04] mt-12 pt-10 pb-8 px-4">
          <div className="max-w-[1100px] mx-auto space-y-6">
            <div className="flex flex-wrap gap-2 justify-center">
              <a href="/escorts/vip" className="px-3 py-1.5 rounded-full bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition text-xs">VIP</a>
              <a href="/escorts/verified" className="px-3 py-1.5 rounded-full bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition text-xs">Verified</a>
              <a href="/escorts/new" className="px-3 py-1.5 rounded-full bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition text-xs">New</a>
            </div>
            <div className="text-center text-[10px] text-white/15">
              &copy; {new Date().getFullYear()} Tahles — Premium Escort Directory Israel
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
