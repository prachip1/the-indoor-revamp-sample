import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import PageSeo from '@/models/PageSeo'
import { getAuthUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function GET(request, { params }) {
  const { id } = await params
  await connectDB()
  const page = await PageSeo.findById(id).lean()
  if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(page)
}

export async function PUT(request, { params }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await connectDB()
  const data = await request.json()

  const existing = await PageSeo.findById(id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const update = {}
  // System pages can't change their URL or name
  if (!existing.isSystem) {
    if (data.pagePath !== undefined) update.pagePath = normalizePath(data.pagePath)
    if (data.pageName !== undefined) update.pageName = data.pageName
  }
  if (data.focusKeyword !== undefined) update.focusKeyword = data.focusKeyword
  if (data.title !== undefined) update.title = data.title
  if (data.description !== undefined) update.description = data.description
  if (data.ogTitle !== undefined) update.ogTitle = data.ogTitle
  if (data.ogDescription !== undefined) update.ogDescription = data.ogDescription
  if (data.ogImage !== undefined) update.ogImage = data.ogImage
  if (data.indexable !== undefined) update.indexable = data.indexable
  if (data.canonicalUrl !== undefined) update.canonicalUrl = data.canonicalUrl
  if (data.structuredData !== undefined) update.structuredData = data.structuredData
  if (data.additionalTags !== undefined) update.additionalTags = data.additionalTags
  if (data.order !== undefined) update.order = data.order

  try {
    const updated = await PageSeo.findByIdAndUpdate(id, update, { new: true })
    revalidatePath(updated.pagePath)
    return NextResponse.json(updated)
  } catch (err) {
    if (err.code === 11000) {
      return NextResponse.json({ error: 'A page with this URL already exists.' }, { status: 409 })
    }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await connectDB()
  const existing = await PageSeo.findById(id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing.isSystem) {
    return NextResponse.json({ error: 'System pages cannot be deleted.' }, { status: 400 })
  }
  await existing.deleteOne()
  return NextResponse.json({ ok: true })
}

function normalizePath(p) {
  let s = String(p || '').trim()
  if (!s.startsWith('/')) s = '/' + s
  if (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1)
  return s
}
