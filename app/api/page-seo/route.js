import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import PageSeo from '@/models/PageSeo'
import { ensureDefaultPages } from '@/lib/pageSeo'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  await ensureDefaultPages()
  const list = await PageSeo.find().sort({ order: 1, pageName: 1 }).lean()
  return NextResponse.json(list)
}

export async function POST(request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const data = await request.json()
  if (!data.pagePath || !data.pageName) {
    return NextResponse.json(
      { error: 'pagePath and pageName are required' },
      { status: 400 }
    )
  }

  try {
    const created = await PageSeo.create({
      pagePath: normalizePath(data.pagePath),
      pageName: data.pageName,
      focusKeyword: data.focusKeyword || '',
      title: data.title || '',
      description: data.description || '',
      ogTitle: data.ogTitle || '',
      ogDescription: data.ogDescription || '',
      ogImage: data.ogImage || '',
      indexable: data.indexable !== false,
      canonicalUrl: data.canonicalUrl || '',
      structuredData: data.structuredData || '',
      additionalTags: data.additionalTags || [],
      isSystem: false,
      order: data.order || 99,
    })
    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    if (err.code === 11000) {
      return NextResponse.json({ error: 'A page with this URL already exists.' }, { status: 409 })
    }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

function normalizePath(p) {
  let s = String(p || '').trim()
  if (!s.startsWith('/')) s = '/' + s
  if (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1)
  return s
}
