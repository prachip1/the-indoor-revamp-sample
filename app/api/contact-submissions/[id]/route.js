import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import ContactSubmission from '@/models/ContactSubmission'
import { getAuthUser } from '@/lib/auth'

export async function PATCH(request, { params }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await connectDB()
  const data = await request.json()
  const updated = await ContactSubmission.findByIdAndUpdate(
    id,
    { read: data.read },
    { new: true }
  )
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(request, { params }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await connectDB()
  const deleted = await ContactSubmission.findByIdAndDelete(id)
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
