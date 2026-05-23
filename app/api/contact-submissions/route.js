import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import ContactSubmission from '@/models/ContactSubmission'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const list = await ContactSubmission.find().sort({ createdAt: -1 }).limit(200).lean()
  return NextResponse.json(list)
}
