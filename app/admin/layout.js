'use client'
import { useEffect, useState } from 'react'
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
  const [menuOpen, setMenuOpen] = useState(false)

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
    <div className="dash min-h-screen md:flex">
      {/* Mobile top bar — only shows below md */}
      <div
        className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b"
        style={{ background: 'var(--dash-surface)', borderColor: 'var(--dash-line)' }}
      >
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="p-1 -ml-1"
          style={{ color: 'var(--dash-ink)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>
        <span className="text-base" style={{ color: 'var(--dash-cta)' }}>
          The Indoor Revamp
        </span>
        <span className="w-6" aria-hidden />
      </div>

      {/* Backdrop behind the drawer (mobile only) */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(15, 23, 23, 0.45)' }}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r transform transition-transform duration-200 ease-out md:static md:z-auto md:translate-x-0 md:shrink-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'var(--dash-surface)', borderColor: 'var(--dash-line)' }}
      >
        <div className="p-6 border-b flex items-start justify-between gap-2" style={{ borderColor: 'var(--dash-line)' }}>
          <div>
            <h1 className="text-xl" style={{ color: 'var(--dash-cta)' }}>
              The Indoor Revamp
            </h1>
            <p className="text-xs mt-1" style={{ color: 'var(--dash-ink-dim)' }}>
              Admin Dashboard
            </p>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="md:hidden p-1 -mr-1 -mt-1"
            style={{ color: 'var(--dash-ink-dim)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
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
      <main className="flex-1 min-w-0 p-4 md:p-8 overflow-auto">{children}</main>
    </div>
  )
}
