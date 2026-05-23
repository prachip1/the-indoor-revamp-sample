import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import SiteContent from '@/models/SiteContent'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  await connectDB()
  let content = await SiteContent.findOne()
  if (!content) content = await SiteContent.create({})
  return NextResponse.json(content)
}

export async function PUT(request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const data = await request.json()

  let content = await SiteContent.findOne()
  if (!content) {
    content = await SiteContent.create(data)
  } else {
    content = await SiteContent.findByIdAndUpdate(content._id, data, { new: true })
  }

  return NextResponse.json(content)
}
