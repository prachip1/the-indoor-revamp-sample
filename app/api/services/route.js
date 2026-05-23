import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Service from '@/models/Service'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  await connectDB()
  const services = await Service.find().sort({ order: 1, createdAt: -1 })
  return NextResponse.json(services)
}

export async function POST(request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const data = await request.json()
  const service = await Service.create(data)
  return NextResponse.json(service, { status: 201 })
}
