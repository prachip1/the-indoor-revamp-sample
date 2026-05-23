import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Service from '@/models/Service'
import { getAuthUser } from '@/lib/auth'

export async function GET(request, { params }) {
  await connectDB()
  const service = await Service.findById(params.id)
  if (!service) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(service)
}

export async function PUT(request, { params }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const data = await request.json()
  const service = await Service.findByIdAndUpdate(params.id, data, { new: true })
  if (!service) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(service)
}

export async function DELETE(request, { params }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  await Service.findByIdAndDelete(params.id)
  return NextResponse.json({ success: true })
}
