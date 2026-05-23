import { Inter, Playfair_Display, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import { getGlobalSettings } from '@/lib/settings'
import AnalyticsScripts, { GTMNoScript } from './_components/AnalyticsScripts'
import CookieConsent from './_components/CookieConsent'

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
})

const playfair = Playfair_Display({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  style: ['normal', 'italic'],
})

const cormorant = Cormorant_Garamond({
  variable: '--font-swash',
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  style: ['normal', 'italic'],
})

export async function generateMetadata() {
  const s = await getGlobalSettings()
  const brand = s.businessName || 'The Indoor Revamp'
  const description = s.tagline || 'We don’t design homes — we transform them.'

  const verificationOther = {}
  if (s.bingVerificationId) verificationOther['msvalidate.01'] = s.bingVerificationId
  if (s.pinterestVerificationId) verificationOther['p:domain_verify'] = s.pinterestVerificationId

  const metadata = {
    title: {
      default: brand,
      template: `%s | ${brand}`,
    },
    description,
    applicationName: brand,
    authors: brand ? [{ name: brand }] : undefined,
    creator: brand,
    publisher: brand,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: brand,
      description,
      siteName: brand,
      type: 'website',
      ...(s.logoUrl ? { images: [{ url: s.logoUrl }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: brand,
      description,
      ...(s.logoUrl ? { images: [s.logoUrl] } : {}),
    },
    verification: {
      ...(s.googleVerificationId ? { google: s.googleVerificationId } : {}),
      ...(s.yandexVerificationId ? { yandex: s.yandexVerificationId } : {}),
      ...(Object.keys(verificationOther).length ? { other: verificationOther } : {}),
    },
  }

  if (s.siteUrl) {
    try {
      metadata.metadataBase = new URL(s.siteUrl)
    } catch {
      // invalid URL, skip
    }
  }

  if (s.faviconUrl) {
    metadata.icons = {
      icon: s.faviconUrl,
      shortcut: s.faviconUrl,
      apple: s.faviconUrl,
    }
  }

  return metadata
}

export default async function RootLayout({ children }) {
  const settings = await getGlobalSettings()

  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${cormorant.variable} antialiased`}
    >
      <body suppressHydrationWarning>
        <GTMNoScript settings={settings} />
        {children}
        <CookieConsent />
        <AnalyticsScripts settings={settings} />
      </body>
    </html>
  )
}
