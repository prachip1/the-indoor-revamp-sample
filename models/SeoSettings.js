import mongoose from 'mongoose'

const SeoSettingsSchema = new mongoose.Schema({
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  metaKeywords: { type: String, default: '' },
  ogTitle: { type: String, default: '' },
  ogDescription: { type: String, default: '' },
  ogImage: { type: String, default: '' },
  canonicalUrl: { type: String, default: '' },
  jsonLd: { type: String, default: '' },
  robotsIndex: { type: Boolean, default: true },
  googleVerification: { type: String, default: '' },
}, { timestamps: true })

export default mongoose.models.SeoSettings || mongoose.model('SeoSettings', SeoSettingsSchema)
