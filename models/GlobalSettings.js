import mongoose from 'mongoose'

const GlobalSettingsSchema = new mongoose.Schema(
  {
    businessName: { type: String, default: '' },
    tagline: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    faviconUrl: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    region: { type: String, default: '' },
    currency: { type: String, default: 'INR' },

    siteUrl: { type: String, default: '' },

    googleVerificationId: { type: String, default: '' },
    bingVerificationId: { type: String, default: '' },
    pinterestVerificationId: { type: String, default: '' },
    yandexVerificationId: { type: String, default: '' },

    ga4MeasurementId: { type: String, default: '' },
    gtmContainerId: { type: String, default: '' },
    metaPixelId: { type: String, default: '' },
    googleAdsId: { type: String, default: '' },

    plausibleDomain: { type: String, default: '' },
    vercelAnalyticsEnabled: { type: Boolean, default: false },

    ga4ApiSecret: { type: String, default: '' },

    llmsTxtEnabled: { type: Boolean, default: true },
    nlwebEnabled: { type: Boolean, default: true },

    resendApiKey: { type: String, default: '' },
    resendFromEmail: { type: String, default: '' },
    notificationEmail: { type: String, default: '' },

    slackWebhookUrl: { type: String, default: '' },
    whatsappBusinessUrl: { type: String, default: '' },
    crmWebhookUrl: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.models.GlobalSettings ||
  mongoose.model('GlobalSettings', GlobalSettingsSchema)
