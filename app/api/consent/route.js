import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectDB } from '@/lib/mongodb'
import ConsentLog from '@/models/ConsentLog'

function hashIp(ip) {
  if (!ip) return ''
  const salt = process.env.IP_HASH_SALT || 'static-fallback-salt'
  return crypto.createHash('sha256').update(ip + salt).digest('hex').slice(0, 16)
}

export async function POST(request) {
  await connectDB()
  const data = await request.json()
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    ''

  await ConsentLog.create({
    visitorId: data.visitorId || '',
    choice: data.choice || 'reject-non-essential',
    categories: data.categories || {},
    userAgent: request.headers.get('user-agent') || '',
    ipHash: hashIp(ip),
    pageUrl: data.pageUrl || '',
  })

  return NextResponse.json({ ok: true })
}
