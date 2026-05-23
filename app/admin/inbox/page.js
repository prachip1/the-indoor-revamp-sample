'use client'
import { useState, useEffect } from 'react'
import { PageHeader, Badge, StatusMessage } from '../_components/ui'

export default function InboxPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [msg, setMsg] = useState('')

  async function refresh() {
    setLoading(true)
    const res = await fetch('/api/contact-submissions')
    setItems(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function toggleRead(item) {
    const res = await fetch(`/api/contact-submissions/${item._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: !item.read }),
    })
    if (res.ok) {
      setItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, read: !i.read } : i))
      )
      if (selected?._id === item._id) setSelected({ ...selected, read: !item.read })
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this message? This cannot be undone.')) return
    const res = await fetch(`/api/contact-submissions/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setMsg('Deleted')
      if (selected?._id === id) setSelected(null)
      refresh()
    }
    setTimeout(() => setMsg(''), 3000)
  }

  const unreadCount = items.filter((i) => !i.read).length

  return (
    <div className="max-w-6xl">
      <PageHeader
        title={`Inbox ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        subtitle="All contact form submissions received from your website. Submissions are auto-delivered to your notification email and Slack."
      />
      <StatusMessage message={msg} />

      <div className="grid grid-cols-3 gap-6 mt-2">
        <div className="col-span-1 space-y-2 max-h-[70vh] overflow-y-auto pr-2">
          {loading ? (
            <p className="text-sm" style={{ color: 'var(--dash-ink-dim)' }}>Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--dash-ink-dim)' }}>No messages yet.</p>
          ) : (
            items.map((item) => (
              <button
                key={item._id}
                onClick={() => {
                  setSelected(item)
                  if (!item.read) toggleRead(item)
                }}
                className="w-full text-left p-3 rounded-lg transition-colors"
                style={{
                  background:
                    selected?._id === item._id ? 'var(--dash-surface)' : 'transparent',
                  border:
                    selected?._id === item._id
                      ? '1px solid var(--dash-accent)'
                      : '1px solid var(--dash-line)',
                }}
              >
                <div className="flex items-start justify-between mb-1">
                  <span
                    className="text-sm font-medium truncate"
                    style={{
                      color: item.read ? 'var(--dash-ink-dim)' : 'var(--dash-ink)',
                    }}
                  >
                    {item.name || item.email || 'Anonymous'}
                  </span>
                  {!item.read && <span className="w-2 h-2 rounded-full mt-1.5" style={{ background: 'var(--dash-accent)' }} />}
                </div>
                <p className="text-xs truncate" style={{ color: 'var(--dash-ink-dim)' }}>
                  {item.subject || item.message?.slice(0, 60) || '(no message)'}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--dash-ink-dim)' }}>
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </button>
            ))
          )}
        </div>

        <div className="col-span-2">
          {selected ? (
            <div
              className="rounded-xl p-6"
              style={{ background: 'var(--dash-surface)', border: '1px solid var(--dash-line)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg" style={{ color: 'var(--dash-cta)' }}>
                    {selected.subject || 'Contact submission'}
                  </h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--dash-ink-dim)' }}>
                    {new Date(selected.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleRead(selected)}
                    className="text-xs hover:underline"
                    style={{ color: 'var(--dash-accent)' }}
                  >
                    {selected.read ? 'Mark unread' : 'Mark read'}
                  </button>
                  <button
                    onClick={() => handleDelete(selected._id)}
                    className="text-xs hover:underline"
                    style={{ color: '#c1432a' }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <dl className="grid grid-cols-3 gap-3 text-sm mb-5">
                <dt style={{ color: 'var(--dash-ink-dim)' }}>From</dt>
                <dd className="col-span-2" style={{ color: 'var(--dash-ink)' }}>{selected.name || '—'}</dd>
                <dt style={{ color: 'var(--dash-ink-dim)' }}>Email</dt>
                <dd className="col-span-2" style={{ color: 'var(--dash-ink)' }}>
                  {selected.email ? (
                    <a href={`mailto:${selected.email}`} style={{ color: 'var(--dash-accent)' }} className="hover:underline">
                      {selected.email}
                    </a>
                  ) : '—'}
                </dd>
                {selected.phone && (
                  <>
                    <dt style={{ color: 'var(--dash-ink-dim)' }}>Phone</dt>
                    <dd className="col-span-2" style={{ color: 'var(--dash-ink)' }}>{selected.phone}</dd>
                  </>
                )}
                {selected.pageUrl && (
                  <>
                    <dt style={{ color: 'var(--dash-ink-dim)' }}>Page</dt>
                    <dd className="col-span-2 font-mono text-xs" style={{ color: 'var(--dash-ink)' }}>{selected.pageUrl}</dd>
                  </>
                )}
              </dl>

              {selected.message && (
                <div
                  className="p-4 rounded-lg text-sm whitespace-pre-wrap"
                  style={{ background: 'var(--dash-bg)', color: 'var(--dash-ink)' }}
                >
                  {selected.message}
                </div>
              )}

              {selected.deliveryResults && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries(selected.deliveryResults).map(([channel, result]) => (
                    <Badge
                      key={channel}
                      tone={result?.ok ? 'success' : result?.skipped ? 'muted' : 'warn'}
                    >
                      {channel}: {result?.ok ? 'sent' : result?.skipped ? 'not configured' : 'failed'}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div
              className="rounded-xl p-12 text-center"
              style={{ background: 'var(--dash-surface)', border: '1px dashed var(--dash-line)' }}
            >
              <p className="text-sm" style={{ color: 'var(--dash-ink-dim)' }}>
                Select a message to view details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
