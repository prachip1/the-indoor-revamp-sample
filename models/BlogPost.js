import mongoose from 'mongoose'

const BlogPostSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    excerpt: { type: String, default: '' },
    body: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    author: { type: String, default: '' },
    tags: [{ type: String }],
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    publishedAt: { type: Date },

    // SEO overrides — fall back to title/excerpt/coverImage when empty
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    ogImage: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema)
