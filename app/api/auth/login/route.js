import { NextResponse } from 'next/server'

// DEV PLACEHOLDER: no real auth. Any click on Sign In opens the dashboard.
// Replace with Clerk in Phase 11.
export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set('token', 'dev-bypass', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return response
}
