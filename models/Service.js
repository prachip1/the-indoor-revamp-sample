import mongoose from 'mongoose'

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: String, default: '' },
  order: { type: Number, default: 0 },
  published: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.models.Service || mongoose.model('Service', ServiceSchema)
