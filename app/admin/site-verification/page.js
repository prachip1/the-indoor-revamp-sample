'use client'
import { useState, useEffect, useMemo } from 'react'
import { PageHeader, SaveBar, Input, Badge } from '../_components/ui'

const PROVIDERS = [
  {
    id: 'google-search-console',
    name: 'Google Search Console',
    category: 'verification',
    field: 'googleVerificationId',
    logo: 'G',
    logoBg: '#4285F4',
    description:
      'Verify ownership so Google can show you search performance, index status, and crawl issues for your site.',
    helpUrl: 'https://search.google.com/search-console/welcome',
    helpLabel: 'Open Search Console',
    steps: [
      'In Search Console, choose URL prefix and enter your website address.',
      'Pick the HTML tag verification method.',
      'Copy the value inside content="..." (just the value, not the whole tag).',
      'Paste it below and click Save changes.',
      'Return to Search Console and click Verify.',
    ],
    placeholder: 'abc123XYZ...',
  },
  {
    id: 'bing-webmaster',
    name: 'Bing Webmaster Tools',
    category: 'verification',
    field: 'bingVerificationId',
    logo: 'b',
    logoBg: '#008373',
    description:
      'See how your site performs on Bing and DuckDuckGo. Bing also feeds many AI search assistants.',
    helpUrl: 'https://www.bing.com/webmasters',
    helpLabel: 'Open Bing Webmaster',
    steps: [
      'Sign in at bing.com/webmasters and add your site.',
      'Pick the Meta tag verification option.',
      'Copy the content value from the <meta name="msvalidate.01" ...> tag.',
      'Paste below and Save.',
      'Click Verify on Bing.',
    ],
    placeholder: 'XXXXXXXXXXXXXXXXXXXXXXXXX',
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    category: 'verification',
    field: 'pinterestVerificationId',
    logo: 'P',
    logoBg: '#E60023',
    description:
      'Claim your site on Pinterest so Pins from your domain get author attribution and rich previews.',
    helpUrl: 'https://www.pinterest.com/settings/claim/',
    helpLabel: 'Open Pinterest Claim',
    steps: [
      'In Pinterest Business → Settings → Claim, add your website.',
      'Choose the Add HTML tag method.',
      'Copy the content value from the <meta name="p:domain_verify" ...> tag.',
      'Paste below, Save, then click Submit on Pinterest.',
    ],
    placeholder: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  },
  {
    id: 'yandex',
    name: 'Yandex Webmaster',
    category: 'verification',
    field: 'yandexVerificationId',
    logo: 'Я',
    logoBg: '#FC3F1D',
    description:
      'Adds visibility in Russia and Central Asia. Skip this unless those audiences matter to you.',
    helpUrl: 'https://webmaster.yandex.com/',
    helpLabel: 'Open Yandex Webmaster',
    steps: [
      'Sign in at webmaster.yandex.com and add your site.',
      'Pick the Meta tag option.',
      'Copy the content value from the verification meta tag.',
      'Paste below, Save, then click Verify on Yandex.',
    ],
    placeholder: 'XXXXXXXXXXXXXXX',
  },
  {
    id: 'ga4',
    name: 'Google Analytics 4',
    category: 'analytics',
    field: 'ga4MeasurementId',
    logo: 'GA',
    logoBg: '#E37400',
    description:
      'Track sessions, top pages, traffic sources, and conversions. The standard analytics tool for almost every site.',
    helpUrl: 'https://analytics.google.com',
    helpLabel: 'Open Google Analytics',
    steps: [
      'Create a GA4 property in analytics.google.com.',
      'In Admin → Data Streams → Web, add a stream for your site.',
      'Copy the Measurement ID — it starts with G-.',
      'Paste below and Save.',
    ],
    placeholder: 'G-XXXXXXXXXX',
  },
  {
    id: 'gtm',
    name: 'Google Tag Manager',
    category: 'analytics',
    field: 'gtmContainerId',
    logo: 'GTM',
    logoBg: '#246FDB',
    description:
      'A container for managing multiple tracking scripts (GA, Pixel, ads) without code changes. Use this OR add platforms individually — not both for the same data.',
    helpUrl: 'https://tagmanager.google.com',
    helpLabel: 'Open Tag Manager',
    steps: [
      'In tagmanager.google.com, create a Container for your site.',
      'Copy the Container ID — it starts with GTM-.',
      'Paste below and Save.',
    ],
    placeholder: 'GTM-XXXXXXX',
  },
  {
    id: 'meta-pixel',
    name: 'Meta Pixel (Facebook & Instagram)',
    category: 'analytics',
    field: 'metaPixelId',
    logo: 'M',
    logoBg: '#0866FF',
    description:
      'Track conversions for Facebook and Instagram ads. Required if you run paid social or want to retarget visitors.',
    helpUrl: 'https://business.facebook.com/events_manager2',
    helpLabel: 'Open Events Manager',
    steps: [
      'In Meta Business → Events Manager, create a Pixel.',
      'Copy the Pixel ID — a long number.',
      'Paste below and Save.',
    ],
    placeholder: '1234567890123456',
  },
  {
    id: 'google-ads',
    name: 'Google Ads',
    category: 'analytics',
    field: 'googleAdsId',
    logo: 'Ads',
    logoBg: '#34A853',
    description:
      'Track conversions from Google Ads campaigns. Needed for Search, Display, or Performance Max ads.',
    helpUrl: 'https://ads.google.com',
    helpLabel: 'Open Google Ads',
    steps: [
      'In ads.google.com → Tools → Conversions, create a website conversion.',
      'Copy the Conversion ID — it starts with AW-.',
      'Paste below and Save.',
    ],
    placeholder: 'AW-XXXXXXXXX',
  },
  {
    id: 'plausible',
    name: 'Plausible',
    category: 'privacy',
    field: 'plausibleDomain',
    logo: 'Pl',
    logoBg: '#5850EC',
    description:
      'Lightweight, cookieless analytics. No consent banner needed — Plausible counts traffic without tracking individual people.',
    helpUrl: 'https://plausible.io',
    helpLabel: 'Open Plausible',
    steps: [
      'Create an account at plausible.io and add your site.',
      'They will ask for your domain — copy that exactly (without https:// or www).',
      'Paste below and Save.',
    ],
    placeholder: 'theindoorrevamp.com',
  },
  {
    id: 'vercel-analytics',
    name: 'Vercel Web Analytics',
    category: 'privacy',
    field: 'vercelAnalyticsEnabled',
    kind: 'toggle',
    logo: '▲',
    logoBg: '#000000',
    description:
      'Privacy-first traffic analytics, built into Vercel. Free tier covers most small sites. Works only when this site is deployed on Vercel.',
    helpUrl: 'https://vercel.com/analytics',
    helpLabel: 'About Vercel Analytics',
    steps: [
      'Turn the toggle on below and Save.',
      'After cutover, open the Vercel dashboard for this project.',
      'Go to the Analytics tab — numbers start showing within minutes of real traffic.',
    ],
  },
  {
    id: 'ga4-server',
    name: 'GA4 Server-Side Events',
    category: 'server',
    field: 'ga4ApiSecret',
    kind: 'secret',
    logo: 'MP',
    logoBg: '#E37400',
    description:
      'Send important events (form submissions, signups) straight from your server to Google Analytics. Ad-blockers can’t block it, so lead numbers are always accurate.',
    helpUrl:
      'https://developers.google.com/analytics/devguides/collection/protocol/ga4',
    helpLabel: 'Measurement Protocol docs',
    steps: [
      'You must connect Google Analytics 4 first (in the Analytics & ads section above).',
      'In analytics.google.com → Admin → Data Streams, click your web stream.',
      'Scroll to Measurement Protocol API secrets → Create.',
      'Copy the Secret value and paste below. Then Save.',
    ],
    placeholder: 'XXXXXXXXXXXXXXXXXXXXXX',
  },
]

const fieldList = PROVIDERS.map((p) => p.field)

export default function VerificationPage() {
  const [original, setOriginal] = useState(null)
  const [form, setForm] = useState(null)
  const [openId, setOpenId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [siteUrl, setSiteUrl] = useState('')

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        const initial = {}
        PROVIDERS.forEach((p) => {
          const raw = data?.[p.field]
          initial[p.field] = p.kind === 'toggle' ? !!raw : raw || ''
        })
        setOriginal(initial)
        setForm(initial)
        setSiteUrl(data?.siteUrl || '')
      })
  }, [])

  const dirty = useMemo(() => {
    if (!form || !original) return false
    return PROVIDERS.some((p) => {
      const a = form[p.field]
      const b = original[p.field]
      if (p.kind === 'toggle') return !!a !== !!b
      return (a || '') !== (b || '')
    })
  }, [form, original])

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function isConnected(p) {
    const v = form[p.field]
    return p.kind === 'toggle' ? !!v : !!(v || '').toString().trim()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      setOriginal({ ...form })
      setMsg('Saved successfully')
    } else {
      setMsg('Failed to save')
    }
    setTimeout(() => setMsg(''), 3000)
  }

  if (!form)
    return <p className="text-sm" style={{ color: 'var(--dash-ink-dim)' }}>Loading...</p>

  const connectedCount = PROVIDERS.filter(isConnected).length
  const verification = PROVIDERS.filter((p) => p.category === 'verification')
  const analytics = PROVIDERS.filter((p) => p.category === 'analytics')
  const privacy = PROVIDERS.filter((p) => p.category === 'privacy')
  const server = PROVIDERS.filter((p) => p.category === 'server')

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Site Verification & Tracking"
        subtitle="Connect your site to search engines and analytics platforms. Each platform gives you a verification tag or measurement ID — paste it here and we add it to every page of your site automatically."
      />

      <div
        className="rounded-xl px-5 py-4 mb-6 flex items-center justify-between gap-4"
        style={{
          background: 'var(--dash-surface)',
          border: '1px solid var(--dash-line)',
        }}
      >
        <div>
          <div className="text-sm font-medium" style={{ color: 'var(--dash-ink)' }}>
            {connectedCount} of {PROVIDERS.length} platforms connected
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--dash-ink-dim)' }}>
            {siteUrl
              ? <>Tags are added to every page at <span className="font-mono">{siteUrl}</span>.</>
              : 'Set your Site URL in Site Settings so the tags know where they live.'}
          </div>
        </div>
        {!siteUrl && (
          <a
            href="/admin/settings"
            className="text-xs hover:underline whitespace-nowrap"
            style={{ color: 'var(--dash-accent)' }}
          >
            Set Site URL →
          </a>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <SectionHeading
          title="Search engines"
          subtitle="Prove you own this site so Google, Bing, and others let you see search data for it."
        />
        <div className="space-y-3 mb-8">
          {verification.map((p) => (
            <ProviderCard
              key={p.id}
              provider={p}
              value={form[p.field]}
              connected={isConnected(p)}
              open={openId === p.id}
              onToggle={() => setOpenId(openId === p.id ? null : p.id)}
              onChange={(v) => setField(p.field, v)}
            />
          ))}
        </div>

        <SectionHeading
          title="Privacy-first analytics"
          subtitle="Cookieless trackers. They count traffic without identifying visitors, so no cookie consent is needed."
        />
        <div className="space-y-3 mb-8">
          {privacy.map((p) => (
            <ProviderCard
              key={p.id}
              provider={p}
              value={form[p.field]}
              connected={isConnected(p)}
              open={openId === p.id}
              onToggle={() => setOpenId(openId === p.id ? null : p.id)}
              onChange={(v) => setField(p.field, v)}
            />
          ))}
        </div>

        <SectionHeading
          title="Analytics & ads"
          subtitle="Tracking scripts. Once added, they run on every page automatically — no code changes needed."
        />
        <div className="space-y-3 mb-8">
          {analytics.map((p) => (
            <ProviderCard
              key={p.id}
              provider={p}
              value={form[p.field]}
              connected={isConnected(p)}
              open={openId === p.id}
              onToggle={() => setOpenId(openId === p.id ? null : p.id)}
              onChange={(v) => setField(p.field, v)}
            />
          ))}
        </div>

        <SectionHeading
          title="Server-side tracking"
          subtitle="Events fired from your server straight to Google Analytics. Bypasses ad-blockers so lead and signup numbers stay accurate."
        />
        <div className="space-y-3 mb-8">
          {server.map((p) => (
            <ProviderCard
              key={p.id}
              provider={p}
              value={form[p.field]}
              connected={isConnected(p)}
              open={openId === p.id}
              onToggle={() => setOpenId(openId === p.id ? null : p.id)}
              onChange={(v) => setField(p.field, v)}
            />
          ))}
        </div>

        <SaveBar saving={saving} message={msg || (!dirty ? 'All changes saved' : '')} />
      </form>
    </div>
  )
}

function SectionHeading({ title, subtitle }) {
  return (
    <div className="mb-3">
      <h3 className="text-base font-semibold" style={{ color: 'var(--dash-cta)' }}>
        {title}
      </h3>
      {subtitle && (
        <p className="text-xs mt-0.5" style={{ color: 'var(--dash-ink-dim)' }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

function ProviderCard({ provider, value, connected, open, onToggle, onChange }) {
  const kind = provider.kind || 'tag'

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'var(--dash-surface)',
        border: '1px solid var(--dash-line)',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-4 py-3.5 text-left transition-colors"
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = 'rgba(168, 126, 83, 0.06)')
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <div
          className="flex items-center justify-center rounded-lg shrink-0 font-semibold text-white"
          style={{
            width: 40,
            height: 40,
            background: provider.logoBg,
            fontSize: provider.logo.length >= 3 ? 11 : provider.logo.length === 2 ? 13 : 18,
            letterSpacing: '-0.01em',
          }}
        >
          {provider.logo}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium" style={{ color: 'var(--dash-ink)' }}>
            {provider.name}
          </div>
          <div
            className="text-xs mt-0.5 truncate"
            style={{ color: 'var(--dash-ink-dim)' }}
          >
            {provider.description}
          </div>
        </div>
        <div className="shrink-0">
          <StatusPill connected={connected} kind={kind} />
        </div>
        <span
          className="shrink-0 text-lg leading-none transition-transform"
          style={{
            color: 'var(--dash-ink-dim)',
            transform: open ? 'rotate(90deg)' : 'rotate(0)',
          }}
        >
          ›
        </span>
      </button>

      {open && (
        <div
          className="px-4 pb-4 pt-4 border-t space-y-4"
          style={{ borderColor: 'var(--dash-line)' }}
        >
          <div>
            <div
              className="text-[11px] uppercase tracking-wide mb-2 font-semibold"
              style={{ color: 'var(--dash-ink-dim)' }}
            >
              How to add this
            </div>
            <ol
              className="text-sm space-y-1.5 list-decimal pl-5"
              style={{ color: 'var(--dash-ink)' }}
            >
              {provider.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            {provider.helpUrl && (
              <a
                href={provider.helpUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-2.5 text-xs font-medium hover:underline"
                style={{ color: 'var(--dash-accent)' }}
              >
                {provider.helpLabel} ↗
              </a>
            )}
          </div>

          {kind === 'toggle' ? (
            <ToggleField value={!!value} onChange={onChange} />
          ) : (
            <TagField
              value={value || ''}
              onChange={onChange}
              placeholder={provider.placeholder}
              secret={kind === 'secret'}
            />
          )}
        </div>
      )}
    </div>
  )
}

function TagField({ value, onChange, placeholder, secret }) {
  const [reveal, setReveal] = useState(false)
  const showAsPassword = secret && !reveal && !!value
  return (
    <div>
      <div
        className="text-[11px] uppercase tracking-wide mb-2 font-semibold"
        style={{ color: 'var(--dash-ink-dim)' }}
      >
        {secret ? 'API secret' : 'Tag value'}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            type={showAsPassword ? 'password' : 'text'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            style={{
              background: 'var(--dash-bg)',
              border: '1px solid var(--dash-line)',
              color: 'var(--dash-ink)',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 13,
            }}
          />
        </div>
        {secret && value && (
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            className="text-xs px-3 py-2 whitespace-nowrap hover:underline"
            style={{ color: 'var(--dash-accent)' }}
          >
            {reveal ? 'Hide' : 'Show'}
          </button>
        )}
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-xs px-3 py-2 whitespace-nowrap hover:underline"
            style={{ color: '#c1432a' }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}

function ToggleField({ value, onChange }) {
  return (
    <div>
      <div
        className="text-[11px] uppercase tracking-wide mb-2 font-semibold"
        style={{ color: 'var(--dash-ink-dim)' }}
      >
        Status
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className="inline-flex items-center gap-3 text-sm"
        style={{ color: 'var(--dash-ink)' }}
      >
        <span
          className="inline-block rounded-full transition-colors"
          style={{
            width: 40,
            height: 22,
            background: value ? 'var(--dash-accent-2)' : 'rgba(0,0,0,0.15)',
            position: 'relative',
          }}
        >
          <span
            className="inline-block rounded-full transition-all"
            style={{
              position: 'absolute',
              top: 2,
              left: value ? 20 : 2,
              width: 18,
              height: 18,
              background: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          />
        </span>
        <span className="font-medium">{value ? 'Enabled' : 'Disabled'}</span>
      </button>
    </div>
  )
}

function StatusPill({ connected, kind }) {
  const onLabel = kind === 'toggle' ? 'On' : 'Tag added'
  const offLabel = kind === 'toggle' ? 'Off' : 'Not connected'
  if (connected) {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide"
        style={{
          background: 'rgba(6, 125, 41, 0.12)',
          color: 'var(--dash-accent-2)',
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
        {onLabel}
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center text-[11px] px-2.5 py-1 rounded-full font-medium"
      style={{
        background: 'transparent',
        border: '1px solid var(--dash-line)',
        color: 'var(--dash-ink-dim)',
      }}
    >
      {offLabel}
    </span>
  )
}
