import mongoose from 'mongoose'

const ContactSubmissionSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    subject: { type: String, default: '' },
    message: { type: String, default: '' },
    pageUrl: { type: String, default: '' },
    deliveryResults: { type: Object, default: {} },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
)

export default mongoose.models.ContactSubmission ||
  mongoose.model('ContactSubmission', ContactSubmissionSchema)
