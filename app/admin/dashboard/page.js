import Link from 'next/link'
import { PageHeader } from '../_components/ui'
import { getDashboardStats, deltaPercent, pickAnalyticsLink } from '@/lib/dashboardStats'

// Sample sparklines for stat cards we can't yet measure (visitor traffic, etc.).
// Shape: realistic-looking values so the marketer can preview the layout.
const SAMPLE_SESSIONS = [4, 6, 3, 7, 5, 9, 6, 8, 7, 11, 9, 12, 10, 14, 12, 9, 11, 15, 13, 10, 12, 14, 16, 13, 11, 14, 12, 15, 13, 16]
const SAMPLE_VISITORS = [3, 4, 2, 5, 4, 6, 4, 5, 5, 8, 6, 8, 7, 10, 8, 6, 7, 10, 9, 7, 8, 10, 11, 9, 8, 10, 9, 11, 10, 12]

export default async function DashboardPage() {
  const stats = await getDashboardStats()
  const c = stats?.counts
  const analytics = pickAnalyticsLink(stats?.settings)
  const hasAnyProvider =
    stats?.settings?.ga4Configured ||
    stats?.settings?.plausibleConfigured ||
    stats?.settings?.vercelConfigured

  const sections = [
    {
      href: '/admin/inbox',
      title: 'Inbox',
      desc: 'Contact form submissions delivered to you.',
      primary: c ? { value: c.inbox.unread, label: 'unread' } : null,
      secondary: c ? `${c.inbox.total} total submissions` : null,
    },
    {
      href: '/admin/blog',
      title: 'Blog',
      desc: 'Write, edit and publish posts with per-post SEO.',
      primary: c ? { value: c.blog.published, label: 'published' } : null,
      secondary: c
        ? `${c.blog.drafts} draft${c.blog.drafts === 1 ? '' : 's'} · ${c.blog.total} total`
        : null,
    },
    {
      href: '/admin/projects',
      title: 'Projects',
      desc: 'Portfolio projects shown on the website.',
      primary: c ? { value: c.projects, label: c.projects === 1 ? 'project' : 'projects' } : null,
    },
    {
      href: '/admin/services',
      title: 'Services',
      desc: 'Services offered by the studio.',
      primary: c ? { value: c.services, label: c.services === 1 ? 'service' : 'services' } : null,
    },
    {
      href: '/admin/seo',
      title: 'SEO Settings',
      desc: 'Default meta tags, OG defaults, JSON-LD per page.',
      primary: c ? { value: c.pageSeo, label: c.pageSeo === 1 ? 'page' : 'pages' } : null,
    },
    {
      href: '/admin/site-verification',
      title: 'Site Verification',
      desc: 'Connect Google Analytics, Search Console, Meta Pixel, and more.',
      primary: c ? { value: `${c.connectedProviders}/${c.totalProviders}`, label: 'connected' } : null,
    },
    {
      href: '/admin/redirects',
      title: 'URL Redirects',
      desc: 'Map old URLs to new ones. Essential for the Wix migration.',
      primary: c ? { value: c.redirects, label: c.redirects === 1 ? 'redirect' : 'redirects' } : null,
    },
    {
      href: '/admin/content',
      title: 'Site Content',
      desc: 'Hero, about, contact, social links.',
      primary: c ? { value: c.siteContent, label: c.siteContent === 1 ? 'block' : 'blocks' } : null,
    },
    {
      href: '/admin/privacy',
      title: 'Privacy & GDPR',
      desc: 'Data erasure requests, cookie consent log.',
      primary: c ? { value: c.consents, label: 'consents' } : null,
    },
    {
      href: '/admin/settings',
      title: 'Site Settings',
      desc: 'Business info, favicon, email, integrations.',
      primary: null,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Manage every part of the website from one place. Pick a section to begin."
      />

      {/* ===== A brief of analytics ===== */}
      <div className="mb-10">
        <div className="flex items-end justify-between gap-4 mb-1">
          <h2
            className="text-2xl"
            style={{ color: 'var(--dash-ink)', fontFamily: 'var(--font-heading)' }}
          >
            A brief of analytics
          </h2>
          {analytics.href.startsWith('/') ? (
            <Link
              href={analytics.href}
              className="text-sm hover:underline whitespace-nowrap cursor-pointer"
              style={{ color: 'var(--dash-accent)' }}
            >
              {analytics.label} →
            </Link>
          ) : (
            <a
              href={analytics.href}
              target="_blank"
              rel="noreferrer"
              className="text-sm hover:underline whitespace-nowrap"
              style={{ color: 'var(--dash-accent)' }}
            >
              {analytics.label} ↗
            </a>
          )}
        </div>

        <div className="flex items-center gap-3 mb-5">
          <p className="text-sm" style={{ color: 'var(--dash-ink-dim)' }}>
            Your key stats for the <span style={{ color: 'var(--dash-ink)', fontWeight: 500 }}>last 30 days</span>
          </p>
          <span
            className="inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full"
            style={{
              background: hasAnyProvider ? 'rgba(6, 125, 41, 0.1)' : 'rgba(168, 126, 83, 0.12)',
              color: hasAnyProvider ? 'var(--dash-accent-2)' : 'var(--dash-accent)',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 6,
                height: 6,
                borderRadius: 999,
                background: 'currentColor',
              }}
            />
            {hasAnyProvider ? 'Live' : 'Not connected'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Leads received"
            value={stats?.leads.current ?? 0}
            delta={stats ? deltaPercent(stats.leads.current, stats.leads.prior) : null}
            sparkline={stats?.leads.sparkline}
            today={stats?.leads.today}
            yesterday={stats?.leads.yesterday}
            color="#067D29"
          />
          <StatCard
            label="Posts published"
            value={stats?.posts.current ?? 0}
            delta={stats ? deltaPercent(stats.posts.current, stats.posts.prior) : null}
            sparkline={stats?.posts.sparkline}
            today={stats?.posts.today}
            yesterday={stats?.posts.yesterday}
            color="#A87E53"
          />
          <StatCard
            label="Site sessions"
            preview
            previewHref="/admin/site-verification"
            sparkline={SAMPLE_SESSIONS}
            color="#3f4e4f"
          />
          <StatCard
            label="Unique visitors"
            preview
            previewHref="/admin/site-verification"
            sparkline={SAMPLE_VISITORS}
            color="#5b6c8a"
          />
        </div>

        <p className="text-[11px] mt-3" style={{ color: 'var(--dash-ink-dim)' }}>
          Live data shown for content you create here. Visitor metrics turn on once an analytics provider is connected.
        </p>
      </div>

      {/* ===== Manage your site ===== */}
      <h2
        className="text-xl mb-3"
        style={{ color: 'var(--dash-ink)', fontFamily: 'var(--font-heading)' }}
      >
        Manage your site
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((s) => (
          <SectionCard key={s.href} {...s} />
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value, delta, sparkline, color, today, yesterday, preview, previewHref }) {
  const accent = color || 'var(--dash-accent)'
  return (
    <div
      className="rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5"
      style={{
        background: 'var(--dash-surface)',
        border: '1px solid var(--dash-line)',
        boxShadow: '0 4px 16px -8px rgba(63, 78, 79, 0.12), 0 1px 2px rgba(63, 78, 79, 0.04)',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: accent,
          opacity: preview ? 0.25 : 0.9,
        }}
      />

      <div className="p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: 'var(--dash-ink-dim)' }}
          >
            {label}
          </div>
          {preview && (
            <span
              className="text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider"
              style={{
                background: 'rgba(168, 126, 83, 0.12)',
                color: 'var(--dash-accent)',
                letterSpacing: '0.08em',
              }}
            >
              Preview
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <div
            className="leading-none"
            style={{
              color: 'var(--dash-ink)',
              fontFamily: 'var(--font-heading)',
              fontSize: 36,
              fontWeight: 400,
              letterSpacing: '-0.02em',
            }}
          >
            {preview ? '—' : value ?? 0}
          </div>
          {!preview && delta !== null && delta !== undefined && (
            <DeltaBadge delta={delta} />
          )}
        </div>

        <div className="text-[11px]" style={{ color: 'var(--dash-ink-dim)' }}>
          {preview ? (
            <Link
              href={previewHref || '/admin/site-verification'}
              className="hover:underline cursor-pointer font-medium"
              style={{ color: 'var(--dash-accent)' }}
            >
              Connect to see data →
            </Link>
          ) : (
            <span>
              <span style={{ color: 'var(--dash-ink)', fontWeight: 500 }}>{today ?? 0}</span> today
              <span className="mx-1.5">·</span>
              <span style={{ color: 'var(--dash-ink)', fontWeight: 500 }}>{yesterday ?? 0}</span> yesterday
            </span>
          )}
        </div>
      </div>

      <div style={{ color: accent, opacity: preview ? 0.5 : 1 }}>
        <Sparkline data={sparkline} filled />
      </div>
    </div>
  )
}

function DeltaBadge({ delta }) {
  if (delta === 0) {
    return (
      <span
        className="inline-flex items-center text-[11px] px-1.5 py-0.5 rounded-full font-semibold"
        style={{
          background: 'rgba(107, 93, 78, 0.1)',
          color: 'var(--dash-ink-dim)',
        }}
      >
        —
      </span>
    )
  }
  const positive = delta > 0
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[11px] px-1.5 py-0.5 rounded-full font-semibold"
      style={{
        background: positive ? 'rgba(6, 125, 41, 0.1)' : 'rgba(193, 67, 42, 0.1)',
        color: positive ? 'var(--dash-accent-2)' : '#c1432a',
      }}
    >
      <span style={{ fontSize: 10, lineHeight: 1 }}>{positive ? '▲' : '▼'}</span>
      {Math.abs(delta)}%
    </span>
  )
}

function Sparkline({ data, width = 240, height = 56, filled = false }) {
  if (!data || data.length === 0) {
    return <svg width="100%" height={height} />
  }
  const max = Math.max(...data, 1)
  const stepX = data.length > 1 ? width / (data.length - 1) : width
  const padY = 6
  const points = data
    .map((v, i) => {
      const x = (i * stepX).toFixed(1)
      const y = (height - padY - (v / max) * (height - padY * 2)).toFixed(1)
      return `${x},${y}`
    })
    .join(' ')

  if (filled) {
    const id = `spark-${Math.random().toString(36).slice(2, 9)}`
    const fillPoints = `0,${height} ${points} ${width},${height}`
    return (
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={fillPoints} fill={`url(#${id})`} />
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SectionCard({ href, title, desc, primary, secondary }) {
  return (
    <Link
      href={href}
      className="rounded-xl p-5 transition-all hover:-translate-y-0.5 block cursor-pointer"
      style={{
        background: 'var(--dash-surface)',
        border: '1px solid var(--dash-line)',
        boxShadow: '0 1px 2px rgba(63, 78, 79, 0.04)',
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-lg" style={{ color: 'var(--dash-cta)' }}>
          {title}
        </h3>
        {primary && (
          <div className="text-right shrink-0">
            <div
              className="text-xl font-semibold leading-none"
              style={{ color: 'var(--dash-ink)' }}
            >
              {primary.value}
            </div>
            <div className="text-[10px] uppercase tracking-wide mt-1" style={{ color: 'var(--dash-ink-dim)' }}>
              {primary.label}
            </div>
          </div>
        )}
      </div>
      <p className="text-sm" style={{ color: 'var(--dash-ink-dim)' }}>
        {desc}
      </p>
      {secondary && (
        <p className="text-xs mt-1.5" style={{ color: 'var(--dash-ink-dim)' }}>
          {secondary}
        </p>
      )}
    </Link>
  )
}
