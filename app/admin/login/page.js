'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    if (res.ok) {
      router.push('/admin/dashboard')
    } else {
      setError(data.error || 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div
      className="dash min-h-screen flex items-center justify-center"
      style={{ background: 'var(--dash-bg)' }}
    >
      <div
        className="p-8 rounded-2xl w-full max-w-sm"
        style={{
          background: 'var(--dash-surface)',
          border: '1px solid var(--dash-line)',
          boxShadow: '0 20px 60px -30px rgba(63, 78, 79, 0.35)',
        }}
      >
        <h1 className="text-3xl mb-1" style={{ color: 'var(--dash-cta)' }}>
          The Indoor Revamp
        </h1>
        <p className="text-sm mb-7" style={{ color: 'var(--dash-ink-dim)' }}>
          Admin Dashboard sign-in
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--dash-ink)' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition-colors"
              style={{
                background: 'var(--dash-bg)',
                border: '1px solid var(--dash-line)',
                color: 'var(--dash-ink)',
              }}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--dash-ink)' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition-colors"
              style={{
                background: 'var(--dash-bg)',
                border: '1px solid var(--dash-line)',
                color: 'var(--dash-ink)',
              }}
              required
            />
          </div>
          {error && (
            <p className="text-sm" style={{ color: '#c1432a' }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg text-sm font-medium disabled:opacity-60 transition-colors"
            style={{ background: 'var(--dash-cta)', color: 'var(--dash-bg)' }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
