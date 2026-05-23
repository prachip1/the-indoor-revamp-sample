import { NextResponse } from 'next/server'
import { del } from '@vercel/blob'
import { getAuthUser } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'Storage not configured.' }, { status: 500 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Expected JSON body { url }.' }, { status: 400 })
  }

  const url = body?.url
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'Missing url.' }, { status: 400 })
  }
  if (!url.includes('.public.blob.vercel-storage.com')) {
    return NextResponse.json({ ok: true, skipped: 'not-blob-url' })
  }

  try {
    await del(url)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Delete failed' }, { status: 500 })
  }
}
