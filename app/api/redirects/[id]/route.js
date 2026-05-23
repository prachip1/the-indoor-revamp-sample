import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Redirect from '@/models/Redirect'
import { getAuthUser } from '@/lib/auth'
import { bustRedirectsCache, normalizePath } from '@/lib/redirects'

export async function PUT(request, { params }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await connectDB()
  const data = await request.json()

  const update = {}
  if (data.sourceUrl !== undefined) update.sourceUrl = normalizePath(data.sourceUrl)
  if (data.targetUrl !== undefined) update.targetUrl = data.targetUrl.trim()
  if (data.statusCode !== undefined) update.statusCode = data.statusCode
  if (data.active !== undefined) update.active = data.active
  if (data.description !== undefined) update.description = data.description

  try {
    const updated = await Redirect.findByIdAndUpdate(id, update, { new: true })
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    bustRedirectsCache()
    return NextResponse.json(updated)
  } catch (err) {
    if (err.code === 11000) {
      return NextResponse.json({ error: 'A redirect for that source URL already exists.' }, { status: 409 })
    }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await connectDB()
  const deleted = await Redirect.findByIdAndDelete(id)
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  bustRedirectsCache()
  return NextResponse.json({ success: true })
}
