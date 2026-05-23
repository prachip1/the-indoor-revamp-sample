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

export async function GET(request) {
  await connectDB()
  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  const query = status ? { status } : {}
  const list = await BlogPost.find(query).sort({ createdAt: -1 }).lean()
  return NextResponse.json(list)
}

export async function POST(request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const data = await request.json()
  if (!data.title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

  const slug = data.slug ? slugify(data.slug) : slugify(data.title)

  try {
    const created = await BlogPost.create({
      slug,
      title: data.title,
      excerpt: data.excerpt || '',
      body: data.body || '',
      coverImage: data.coverImage || '',
      author: data.author || '',
      tags: data.tags || [],
      status: data.status || 'draft',
      publishedAt: data.status === 'published' ? new Date() : undefined,
      metaTitle: data.metaTitle || '',
      metaDescription: data.metaDescription || '',
      ogImage: data.ogImage || '',
    })
    revalidatePath('/blog')
    revalidatePath(`/blog/${slug}`)
    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    if (err.code === 11000) {
      return NextResponse.json({ error: 'A post with this slug already exists.' }, { status: 409 })
    }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
