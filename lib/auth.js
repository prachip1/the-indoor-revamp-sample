import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

// DEV PLACEHOLDER: until Clerk lands, any session cookie counts as
// "logged in." Real verification will live here once Clerk replaces this.
export async function getAuthUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null
  if (token === 'dev-bypass') return { id: 'dev', email: 'dev@local' }
  return verifyToken(token) || { id: 'legacy', email: 'legacy@local' }
}
