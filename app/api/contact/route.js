import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import ContactSubmission from '@/models/ContactSubmission'
import { notifyNewContact } from '@/lib/notifications'
import { sendServerEvent } from '@/lib/ga4'

export async function POST(request) {
  await connectDB()
  const data = await request.json()

  if (!data.email && !data.name && !data.message) {
    return NextResponse.json({ error: 'Please fill in at least one field.' }, { status: 400 })
  }

  const submission = await ContactSubmission.create({
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    subject: data.subject || '',
    message: data.message || '',
    pageUrl: data.pageUrl || '',
  })

  // Fire-and-forget notifications; capture results for log
  const results = await notifyNewContact({
    name: submission.name,
    email: submission.email,
    phone: submission.phone,
    subject: submission.subject,
    message: submission.message,
  })
  submission.deliveryResults = {
    email: results[0],
    slack: results[1],
    crm: results[2],
    whatsapp: results[3],
  }
  await submission.save()

  // Server-side GA4 event — bypasses ad-blockers so the marketer always sees
  // accurate lead numbers. Best-effort, never fails the request.
  sendServerEvent({
    name: 'generate_lead',
    params: {
      page_location: submission.pageUrl || '',
      lead_source: 'contact_form',
    },
  }).catch(() => {})

  return NextResponse.json({ ok: true, id: submission._id })
}
