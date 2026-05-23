import mongoose from 'mongoose'

const SiteContentSchema = new mongoose.Schema({
  heroTitle: { type: String, default: '' },
  heroSubtitle: { type: String, default: '' },
  aboutTitle: { type: String, default: '' },
  aboutText: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  contactAddress: { type: String, default: '' },
  socialInstagram: { type: String, default: '' },
  socialFacebook: { type: String, default: '' },
  socialLinkedin: { type: String, default: '' },
}, { timestamps: true })

export default mongoose.models.SiteContent || mongoose.model('SiteContent', SiteContentSchema)
