import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getAuthUser } from '@/lib/auth'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

const ALLOWED_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml',
  'image/gif',
  'image/x-icon',
  'image/vnd.microsoft.icon',
])

export const runtime = 'nodejs'

export async function POST(request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Image storage is not configured yet. Add BLOB_READ_WRITE_TOKEN in your Vercel project settings (see CUTOVER.md).' },
      { status: 500 }
    )
  }

  let formData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid upload. Expected multipart/form-data.' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file attached.' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: `File is too large. Max size is ${MAX_SIZE / 1024 / 1024} MB.` },
      { status: 400 }
    )
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: 'Unsupported file type. Please upload a PNG, JPG, WebP, SVG, GIF, or ICO.' },
      { status: 400 }
    )
  }

  const folder = (formData.get('folder') || 'uploads').toString().replace(/[^a-z0-9/-]/gi, '')
  const safeFolder = folder || 'uploads'
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '')
  const pathname = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`

  try {
    const blob = await put(pathname, file, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: false,
    })
    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      size: file.size,
      contentType: file.type,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Upload failed. Try again or check your storage credentials.' }, { status: 500 })
  }
}
