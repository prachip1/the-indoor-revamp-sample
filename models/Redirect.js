import mongoose from 'mongoose'

const RedirectSchema = new mongoose.Schema(
  {
    sourceUrl: { type: String, required: true, unique: true, index: true },
    targetUrl: { type: String, required: true },
    statusCode: { type: Number, default: 301, enum: [301, 302, 307, 308] },
    active: { type: Boolean, default: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.models.Redirect || mongoose.model('Redirect', RedirectSchema)
