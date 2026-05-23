import mongoose from 'mongoose'

const ConsentLogSchema = new mongoose.Schema(
  {
    visitorId: { type: String, index: true }, // anonymous id from cookie
    choice: { type: String, enum: ['accept-all', 'reject-non-essential', 'custom'], required: true },
    categories: {
      essential: { type: Boolean, default: true },
      analytics: { type: Boolean, default: false },
      marketing: { type: Boolean, default: false },
      preferences: { type: Boolean, default: false },
    },
    userAgent: { type: String, default: '' },
    ipHash: { type: String, default: '' }, // hashed, never raw IP
    pageUrl: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.models.ConsentLog || mongoose.model('ConsentLog', ConsentLogSchema)
