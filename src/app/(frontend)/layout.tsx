import type { Metadata } from 'next'
import Script from 'next/script'
import { ViewTransitions } from 'next-view-transitions'
import { DM_Serif_Display, DM_Sans } from 'next/font/google'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import './globals.css'

const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://still.place'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'STILL — Kuratierte stille Orte im Alpenraum',
    template: '%s | STILL',
  },
  description: 'Eine kuratierte Sammlung der ruhigsten Orte im Alpenraum. Orte, an denen dein Kopf leise wird.',
  openGraph: {
    siteName: 'STILL',
    locale: 'de_AT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ViewTransitions>
      <html lang="de" className={`${dmSerifDisplay.variable} ${dmSans.variable}`}>
        <body className="antialiased">
          {plausibleDomain && (
            <Script
              defer
              data-domain={plausibleDomain}
              src="https://plausible.io/js/script.js"
              strategy="afterInteractive"
            />
          )}
          <Navigation />
          {children}
          <Footer />
        </body>
      </html>
    </ViewTransitions>
  )
}
