import mongoose from 'mongoose'

const PageSeoSchema = new mongoose.Schema(
  {
    pagePath: { type: String, required: true, unique: true, index: true },
    pageName: { type: String, required: true },
    focusKeyword: { type: String, default: '' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    ogTitle: { type: String, default: '' },
    ogDescription: { type: String, default: '' },
    ogImage: { type: String, default: '' },
    indexable: { type: Boolean, default: true },
    canonicalUrl: { type: String, default: '' },
    structuredData: { type: String, default: '' },
    additionalTags: [
      {
        name: { type: String, default: '' },
        content: { type: String, default: '' },
      },
    ],
    isSystem: { type: Boolean, default: false }, // built-in pages can't be deleted
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default mongoose.models.PageSeo || mongoose.model('PageSeo', PageSeoSchema)
