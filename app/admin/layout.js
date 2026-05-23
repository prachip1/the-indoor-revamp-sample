'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/inbox', label: 'Inbox' },
  { href: '/admin/settings', label: 'Site Settings' },
  { href: '/admin/seo', label: 'SEO Settings' },
  { href: '/admin/site-verification', label: 'Site Verification' },
  { href: '/admin/geo', label: 'AI Visibility' },
  { href: '/admin/redirects', label: 'URL Redirects' },
  { href: '/admin/blog', label: 'Blog' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/services', label: 'Services' },
  { href: '/admin/content', label: 'Site Content' },
  { href: '/admin/privacy', label: 'Privacy & GDPR' },
]

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (pathname?.startsWith('/admin')) {
      document.title = 'The Indoor Revamp'
    }
  }, [pathname])

  if (pathname === '/admin/login') return <>{children}</>

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div className="dash min-h-screen flex">
      <aside
        className="w-64 flex flex-col shrink-0 border-r"
        style={{ background: 'var(--dash-surface)', borderColor: 'var(--dash-line)' }}
      >
        <div className="p-6 border-b" style={{ borderColor: 'var(--dash-line)' }}>
          <h1 className="text-xl" style={{ color: 'var(--dash-cta)' }}>
            The Indoor Revamp
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--dash-ink-dim)' }}>
            Admin Dashboard
          </p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: active ? 'var(--dash-bg)' : 'transparent',
                  color: active ? 'var(--dash-cta)' : 'var(--dash-ink-dim)',
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t" style={{ borderColor: 'var(--dash-line)' }}>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm rounded-lg transition-colors hover:opacity-80"
            style={{ color: 'var(--dash-accent)' }}
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
