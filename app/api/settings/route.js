import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import GlobalSettings from '@/models/GlobalSettings'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  await connectDB()
  let settings = await GlobalSettings.findOne()
  if (!settings) settings = await GlobalSettings.create({})
  return NextResponse.json(settings)
}

export async function PUT(request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const data = await request.json()

  let settings = await GlobalSettings.findOne()
  if (!settings) {
    settings = await GlobalSettings.create(data)
  } else {
    settings = await GlobalSettings.findByIdAndUpdate(settings._id, data, { new: true })
  }

  return NextResponse.json(settings)
}
