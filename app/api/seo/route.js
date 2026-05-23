import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import SeoSettings from '@/models/SeoSettings'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  await connectDB()
  let seo = await SeoSettings.findOne()
  if (!seo) seo = await SeoSettings.create({})
  return NextResponse.json(seo)
}

export async function PUT(request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const data = await request.json()

  let seo = await SeoSettings.findOne()
  if (!seo) {
    seo = await SeoSettings.create(data)
  } else {
    seo = await SeoSettings.findByIdAndUpdate(seo._id, data, { new: true })
  }

  return NextResponse.json(seo)
}
