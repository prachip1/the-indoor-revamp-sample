import mongoose from 'mongoose'

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  images: [{ type: String }],
  altText: { type: String, default: '' },
  tags: [{ type: String }],
  order: { type: Number, default: 0 },
  published: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema)
