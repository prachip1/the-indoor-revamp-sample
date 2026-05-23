import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import Admin from '@/models/Admin'

// One-time setup to create the first admin account
// Blocked once an admin already exists
export async function POST(request) {
  try {
    await connectDB()

    const existing = await Admin.findOne()
    if (existing) {
      return NextResponse.json({ error: 'Admin already exists' }, { status: 400 })
    }

    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)
    const admin = await Admin.create({ email, password: hashed })

    return NextResponse.json({ success: true, email: admin.email })
  } catch (err) {
    console.error('[auth/setup] failed:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
