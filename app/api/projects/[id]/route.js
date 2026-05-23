import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Project from '@/models/Project'
import { getAuthUser } from '@/lib/auth'

export async function GET(request, { params }) {
  await connectDB()
  const project = await Project.findById(params.id)
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(project)
}

export async function PUT(request, { params }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const data = await request.json()
  const project = await Project.findByIdAndUpdate(params.id, data, { new: true })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(project)
}

export async function DELETE(request, { params }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  await Project.findByIdAndDelete(params.id)
  return NextResponse.json({ success: true })
}
