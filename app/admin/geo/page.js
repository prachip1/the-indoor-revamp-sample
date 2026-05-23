'use client'
import { useState, useEffect, useCallback } from 'react'
import { PageHeader } from '../_components/ui'

const NLWEB_TOOLS = [
  { id: 'business', label: 'Business info', desc: 'LocalBusiness schema with contact details' },
  { id: 'services', label: 'Services', desc: 'List of services with descriptions' },
  { id: 'projects', label: 'Projects', desc: 'Portfolio entries with images' },
  { id: 'blog', label: 'Blog posts', desc: 'All published blog content' },
]

export default function GeoPage() {
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState(null)
  const [busy, setBusy] = useState({})
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        setSettings(data)
        setLoading(false)
      })
  }, [])

  const flash = useCallback((text) => {
    setMsg(text)
    setTimeout(() => setMsg(''), 2500)
  }, [])

  async function toggle(field, value) {
    const prev = settings?.[field]
    setSettings((s) => ({ ...s, [field]: value }))
    setBusy((b) => ({ ...b, [field]: true }))
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })
      if (!res.ok) throw new Error('failed')
      flash(value ? 'Enabled' : 'Disabled')
    } catch {
      setSettings((s) => ({ ...s, [field]: prev }))
      flash('Failed to save — try again')
    } finally {
      setBusy((b) => ({ ...b, [field]: false }))
    }
  }

  if (loading)
    return <p className="text-sm" style={{ color: 'var(--dash-ink-dim)' }}>Loading...</p>

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const publicBase = (settings?.siteUrl || origin).replace(/\/$/, '')
  const llmsUrl = `${publicBase}/llms.txt`
  const nlwebUrl = `${publicBase}/api/nlweb/mcp`

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="AI Visibility"
        subtitle="Make your site discoverable by AI search engines and agents — ChatGPT, Claude, Perplexity, and custom AI tools. This is what people call GEO: Generative Engine Optimization."
      />

      {msg && (
        <div
          className="rounded-lg px-4 py-2 mb-5 text-sm font-medium"
          style={{
            background: msg.startsWith('Failed') ? 'rgba(193, 67, 42, 0.1)' : 'rgba(6, 125, 41, 0.1)',
            color: msg.startsWith('Failed') ? '#c1432a' : 'var(--dash-accent-2)',
          }}
        >
          {msg}
        </div>
      )}

      <div className="space-y-6">
        <FeatureCard
          icon="✦"
          iconBg="#5850EC"
          title="llms.txt"
          tagline="The standard AI tools look for to discover your content"
          enabled={settings?.llmsTxtEnabled !== false}
          busy={busy.llmsTxtEnabled}
          onToggle={(v) => toggle('llmsTxtEnabled', v)}
          fileUrl={llmsUrl}
          fileUrlLabel="llms.txt"
          helpUrl="https://llmstxt.org"
          helpLabel="What is llms.txt?"
          bullets={[
            'Plain-text index auto-generated from your business info, services, projects, and blog posts.',
            'Updates instantly whenever you publish or edit content — no manual upload needed.',
            'Respected by Perplexity, ChatGPT browsing, Claude with web search, and custom AI agents.',
          ]}
          previewLoader={() => fetch(llmsUrl).then((r) => (r.ok ? r.text() : null))}
          previewLanguage="markdown"
        />

        <FeatureCard
          icon="◈"
          iconBg="#0866FF"
          title="NLWeb"
          tagline="A structured corpus of your site that AI agents can query"
          enabled={settings?.nlwebEnabled !== false}
          busy={busy.nlwebEnabled}
          onToggle={(v) => toggle('nlwebEnabled', v)}
          fileUrl={nlwebUrl}
          fileUrlLabel="NLWeb JSON"
          helpUrl="https://github.com/microsoft/NLWeb"
          helpLabel="What is NLWeb?"
          bullets={[
            'JSON corpus using schema.org types (LocalBusiness, Service, BlogPosting, CreativeWork).',
            'Tool-style filtering — AI agents can request just business info, services, blog posts, etc.',
            'Auto-updates as you change content in admin. Designed for MCP-compatible AI clients.',
          ]}
          extras={<NLWebTools baseUrl={nlwebUrl} />}
          previewLoader={() =>
            fetch(`${nlwebUrl}?tool=business`).then((r) => (r.ok ? r.text() : null))
          }
          previewLanguage="json"
        />
      </div>

      {!settings?.siteUrl && (
        <div
          className="mt-6 rounded-lg px-4 py-3 text-sm"
          style={{
            background: 'rgba(168, 126, 83, 0.08)',
            border: '1px solid var(--dash-line)',
            color: 'var(--dash-ink)',
          }}
        >
          <span style={{ color: 'var(--dash-accent)', fontWeight: 600 }}>Tip:</span> Set your{' '}
          <a
            href="/admin/settings"
            className="underline cursor-pointer"
            style={{ color: 'var(--dash-accent)' }}
          >
            Site URL
          </a>{' '}
          in Site Settings so the URLs above show your live domain instead of localhost.
        </div>
      )}
    </div>
  )
}

function FeatureCard({
  icon,
  iconBg,
  title,
  tagline,
  enabled,
  busy,
  onToggle,
  fileUrl,
  fileUrlLabel,
  helpUrl,
  helpLabel,
  bullets,
  previewLoader,
  previewLanguage,
  extras,
}) {
  const [showPreview, setShowPreview] = useState(false)
  const [preview, setPreview] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function loadPreview() {
    if (!showPreview) {
      setShowPreview(true)
      if (!preview) {
        setPreviewLoading(true)
        try {
          const text = await previewLoader()
          setPreview(text || '(empty — endpoint disabled or no content)')
        } catch {
          setPreview('Could not load preview.')
        } finally {
          setPreviewLoading(false)
        }
      }
    } else {
      setShowPreview(false)
    }
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(fileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {}
  }

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: 'var(--dash-surface)',
        border: '1px solid var(--dash-line)',
        boxShadow: '0 4px 16px -8px rgba(63, 78, 79, 0.1), 0 1px 2px rgba(63, 78, 79, 0.04)',
      }}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div
            className="flex items-center justify-center rounded-xl shrink-0 text-white"
            style={{
              width: 48,
              height: 48,
              background: iconBg,
              fontSize: 22,
              lineHeight: 1,
            }}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3
                className="text-xl font-semibold"
                style={{ color: 'var(--dash-ink)' }}
              >
                {title}
              </h3>
              <StatusPill enabled={enabled} />
            </div>
            <p
              className="text-sm mt-1"
              style={{ color: 'var(--dash-ink-dim)' }}
            >
              {tagline}
            </p>
          </div>
          <Toggle enabled={enabled} busy={busy} onToggle={onToggle} />
        </div>

        <ul className="mt-5 space-y-2">
          {bullets.map((b, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-sm"
              style={{ color: 'var(--dash-ink)' }}
            >
              <span
                className="inline-flex items-center justify-center rounded-full shrink-0 mt-0.5"
                style={{
                  width: 18,
                  height: 18,
                  background: 'rgba(6, 125, 41, 0.12)',
                  color: 'var(--dash-accent-2)',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                ✓
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {extras && <div className="mt-5">{extras}</div>}

        <div
          className="mt-5 rounded-lg p-3 flex items-center gap-2 flex-wrap"
          style={{
            background: 'var(--dash-bg)',
            border: '1px solid var(--dash-line)',
          }}
        >
          <div className="flex-1 min-w-0">
            <div
              className="text-[10px] uppercase tracking-wide font-semibold mb-0.5"
              style={{ color: 'var(--dash-ink-dim)' }}
            >
              Public URL
            </div>
            <div
              className="text-xs truncate"
              style={{
                color: enabled ? 'var(--dash-ink)' : 'var(--dash-ink-dim)',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              }}
            >
              {fileUrl}
            </div>
          </div>
          <button
            type="button"
            onClick={copyUrl}
            className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer"
            style={{
              background: 'transparent',
              border: '1px solid var(--dash-line)',
              color: 'var(--dash-ink)',
            }}
            title="Copy URL to clipboard"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${enabled ? 'cursor-pointer' : 'pointer-events-none opacity-50'}`}
            style={{
              background: 'var(--dash-cta)',
              color: 'white',
            }}
          >
            View {fileUrlLabel} ↗
          </a>
        </div>

        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={loadPreview}
            className="text-xs hover:underline cursor-pointer font-medium"
            style={{ color: 'var(--dash-accent)' }}
          >
            {showPreview ? 'Hide live preview' : 'Show live preview'}
          </button>
          <span style={{ color: 'var(--dash-line)' }}>·</span>
          <a
            href={helpUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs hover:underline"
            style={{ color: 'var(--dash-accent)' }}
          >
            {helpLabel} ↗
          </a>
        </div>

        {showPreview && (
          <div
            className="mt-3 rounded-lg overflow-hidden"
            style={{
              background: '#1a1a1a',
              border: '1px solid var(--dash-line)',
            }}
          >
            <div
              className="px-3 py-2 flex items-center justify-between text-[11px]"
              style={{
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.6)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span className="uppercase tracking-wide font-semibold">
                {previewLanguage} · live
              </span>
              <span>refreshed just now</span>
            </div>
            <pre
              className="overflow-auto text-xs p-4 leading-relaxed"
              style={{
                color: '#e8e6e1',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                maxHeight: 360,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {previewLoading ? 'Loading…' : (preview || '').slice(0, 5000)}
              {!previewLoading && preview && preview.length > 5000 && '\n\n…truncated.'}
            </pre>
          </div>
        )}
      </div>

      {!enabled && (
        <div
          className="px-6 py-3 text-xs"
          style={{
            background: 'rgba(193, 67, 42, 0.06)',
            borderTop: '1px solid var(--dash-line)',
            color: '#9a3a26',
          }}
        >
          ⚠ This file is currently disabled — AI tools requesting it will get a 404 response. Toggle on to make it available again.
        </div>
      )}
    </div>
  )
}

function StatusPill({ enabled }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide"
      style={{
        background: enabled ? 'rgba(6, 125, 41, 0.12)' : 'rgba(107, 93, 78, 0.12)',
        color: enabled ? 'var(--dash-accent-2)' : 'var(--dash-ink-dim)',
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
      {enabled ? 'Enabled' : 'Disabled'}
    </span>
  )
}

function Toggle({ enabled, busy, onToggle }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={busy}
      onClick={() => onToggle(!enabled)}
      className="shrink-0 cursor-pointer"
      style={{
        opacity: busy ? 0.6 : 1,
        transition: 'opacity 0.15s',
      }}
      title={enabled ? 'Click to disable' : 'Click to enable'}
    >
      <span
        className="inline-block rounded-full transition-colors"
        style={{
          width: 44,
          height: 24,
          background: enabled ? 'var(--dash-accent-2)' : 'rgba(0,0,0,0.18)',
          position: 'relative',
        }}
      >
        <span
          className="inline-block rounded-full transition-all"
          style={{
            position: 'absolute',
            top: 2,
            left: enabled ? 22 : 2,
            width: 20,
            height: 20,
            background: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        />
      </span>
    </button>
  )
}

function NLWebTools({ baseUrl }) {
  return (
    <div>
      <div
        className="text-[11px] uppercase tracking-wide font-semibold mb-2"
        style={{ color: 'var(--dash-ink-dim)' }}
      >
        Try a tool
      </div>
      <div className="flex flex-wrap gap-2">
        {NLWEB_TOOLS.map((t) => (
          <a
            key={t.id}
            href={`${baseUrl}?tool=${t.id}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
            style={{
              background: 'var(--dash-bg)',
              border: '1px solid var(--dash-line)',
              color: 'var(--dash-ink)',
            }}
            title={t.desc}
          >
            <span className="font-medium">{t.label}</span>
            <span style={{ color: 'var(--dash-ink-dim)', fontSize: 10 }}>↗</span>
          </a>
        ))}
      </div>
    </div>
  )
}
