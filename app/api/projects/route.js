import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Project from '@/models/Project'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  await connectDB()
  const projects = await Project.find().sort({ order: 1, createdAt: -1 })
  return NextResponse.json(projects)
}

export async function POST(request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const data = await request.json()
  const project = await Project.create(data)
  return NextResponse.json(project, { status: 201 })
}
