import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Redirect from '@/models/Redirect'
import { getAuthUser } from '@/lib/auth'
import { bustRedirectsCache, normalizePath } from '@/lib/redirects'

export async function GET() {
  await connectDB()
  const list = await Redirect.find().sort({ createdAt: -1 }).lean()
  return NextResponse.json(list)
}

export async function POST(request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const data = await request.json()
  if (!data.sourceUrl || !data.targetUrl) {
    return NextResponse.json({ error: 'sourceUrl and targetUrl are required' }, { status: 400 })
  }

  try {
    const created = await Redirect.create({
      sourceUrl: normalizePath(data.sourceUrl),
      targetUrl: data.targetUrl.trim(),
      statusCode: data.statusCode || 301,
      active: data.active !== false,
      description: data.description || '',
    })
    bustRedirectsCache()
    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    if (err.code === 11000) {
      return NextResponse.json({ error: 'A redirect for that source URL already exists.' }, { status: 409 })
    }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
