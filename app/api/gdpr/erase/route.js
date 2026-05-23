import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import ContactSubmission from '@/models/ContactSubmission'
import ConsentLog from '@/models/ConsentLog'
import { getAuthUser } from '@/lib/auth'

// Admin-triggered GDPR erasure: wipe or anonymize a user's data by email.
// Returns counts of records affected per collection.
export async function POST(request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, mode = 'erase' } = await request.json()
  if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

  await connectDB()

  const matchEmail = { email: { $regex: `^${escapeRegex(email)}$`, $options: 'i' } }

  let contactsAffected = 0
  if (mode === 'erase') {
    const result = await ContactSubmission.deleteMany(matchEmail)
    contactsAffected = result.deletedCount
  } else if (mode === 'anonymize') {
    const result = await ContactSubmission.updateMany(matchEmail, {
      $set: {
        name: '[redacted]',
        email: '[redacted]',
        phone: '[redacted]',
        message: '[redacted by user request]',
      },
    })
    contactsAffected = result.modifiedCount
  }

  // ConsentLog has no email — visitorId could be passed separately if needed.

  return NextResponse.json({
    ok: true,
    mode,
    affected: {
      contactSubmissions: contactsAffected,
    },
  })
}

function escapeRegex(str) {
  return String(str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
