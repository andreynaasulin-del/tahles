import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { I18nProvider } from '@/lib/i18n/context'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Tahles — Truth Engine',
    template: '%s | Tahles',
  },
  description: 'Search interest. Real-time demand data.',
  robots: { index: false, follow: false },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  )
}
