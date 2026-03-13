import type { Metadata, Viewport } from 'next'
import { Inter, Heebo } from 'next/font/google'
import './globals.css'
import { I18nProvider } from '@/lib/i18n/context'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
})

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
})

const SITE_URL = 'https://tahles.top'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0a',
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Tahles — Premium Escort Directory Israel | Verified Profiles',
    template: '%s | Tahles',
  },
  description: 'Israel\'s top escort directory. Browse 65+ verified profiles with real photos, reviews & ratings. Tel Aviv, Haifa, Jerusalem. Safe, discreet, updated daily.',
  keywords: ['escort Israel', 'escort Tel Aviv', 'escort directory', 'verified escorts', 'premium escorts Israel', 'Tahles', 'escort Haifa', 'escort Jerusalem', 'massage Israel'],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['he_IL', 'ru_RU'],
    url: SITE_URL,
    siteName: 'Tahles',
    title: 'Tahles — Premium Escort Directory Israel',
    description: '65+ verified profiles with real photos. Tel Aviv, Haifa, Jerusalem.',
    images: [{
      url: `${SITE_URL}/og-image.png`,
      width: 1200,
      height: 630,
      alt: 'Tahles — Premium Escort Directory',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tahles — Premium Escort Directory Israel',
    description: '65+ verified profiles. Real photos, updated daily.',
    images: [`${SITE_URL}/og-image.png`],
  },
  alternates: {
    canonical: SITE_URL,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Tahles',
    url: SITE_URL,
    description: 'Premium escort directory in Israel with verified profiles, reviews and ratings.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Tahles',
    url: SITE_URL,
    logo: `${SITE_URL}/og-image.png`,
    description: 'Israel\'s largest verified escort directory. Tel Aviv, Haifa, Jerusalem, Eilat and more.',
    areaServed: {
      '@type': 'Country',
      name: 'Israel',
    },
    sameAs: [],
  }

  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        {/* Microsoft Clarity */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "vrlax7xzts");`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${heebo.variable} font-sans antialiased`}>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  )
}
