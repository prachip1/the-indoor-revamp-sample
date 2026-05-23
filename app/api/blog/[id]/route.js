import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import BlogPost from '@/models/BlogPost'
import { getAuthUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

export async function GET(request, { params }) {
  const { id } = await params
  await connectDB()
  const post = await BlogPost.findById(id).lean()
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(post)
}

export async function PUT(request, { params }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await connectDB()
  const data = await request.json()

  const existing = await BlogPost.findById(id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const update = {}
  if (data.title !== undefined) update.title = data.title
  if (data.slug !== undefined) update.slug = slugify(data.slug)
  if (data.excerpt !== undefined) update.excerpt = data.excerpt
  if (data.body !== undefined) update.body = data.body
  if (data.coverImage !== undefined) update.coverImage = data.coverImage
  if (data.author !== undefined) update.author = data.author
  if (data.tags !== undefined) update.tags = data.tags
  if (data.metaTitle !== undefined) update.metaTitle = data.metaTitle
  if (data.metaDescription !== undefined) update.metaDescription = data.metaDescription
  if (data.ogImage !== undefined) update.ogImage = data.ogImage
  if (data.status !== undefined) {
    update.status = data.status
    if (data.status === 'published' && existing.status !== 'published') {
      update.publishedAt = new Date()
    }
  }

  try {
    const updated = await BlogPost.findByIdAndUpdate(id, update, { new: true })
    revalidatePath('/blog')
    revalidatePath(`/blog/${updated.slug}`)
    if (existing.slug !== updated.slug) revalidatePath(`/blog/${existing.slug}`)
    return NextResponse.json(updated)
  } catch (err) {
    if (err.code === 11000) {
      return NextResponse.json({ error: 'A post with this slug already exists.' }, { status: 409 })
    }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await connectDB()
  const deleted = await BlogPost.findByIdAndDelete(id)
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  revalidatePath('/blog')
  revalidatePath(`/blog/${deleted.slug}`)
  return NextResponse.json({ success: true })
}
