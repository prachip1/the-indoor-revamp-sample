import { cache } from 'react'
import { connectDB } from './mongodb'
import GlobalSettings from '@/models/GlobalSettings'

const FALLBACK = {
  businessName: '',
  tagline: '',
  logoUrl: '',
  faviconUrl: '',
  email: '',
  phone: '',
  address: '',
  region: '',
  currency: 'INR',
  siteUrl: '',
  googleVerificationId: '',
  bingVerificationId: '',
  pinterestVerificationId: '',
  yandexVerificationId: '',
  ga4MeasurementId: '',
  gtmContainerId: '',
  metaPixelId: '',
  googleAdsId: '',
  plausibleDomain: '',
  vercelAnalyticsEnabled: false,
  ga4ApiSecret: '',
  llmsTxtEnabled: true,
  nlwebEnabled: true,
  resendApiKey: '',
  resendFromEmail: '',
  notificationEmail: '',
  slackWebhookUrl: '',
  whatsappBusinessUrl: '',
  crmWebhookUrl: '',
}

export const getGlobalSettings = cache(async () => {
  try {
    await connectDB()
    const doc = await GlobalSettings.findOne().lean()
    if (!doc) return FALLBACK
    return { ...FALLBACK, ...doc }
  } catch {
    return FALLBACK
  }
})
