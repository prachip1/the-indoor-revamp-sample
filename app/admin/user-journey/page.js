'use client'
import { useEffect, useState } from 'react'
import { PageHeader } from '../_components/ui'

export default function UserJourneyPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetch('/api/contact-submissions')
      const data = res.ok ? await res.json() : []
      if (!cancelled) {
        setItems(Array.isArray(data) ? data : [])
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const q = query.trim().toLowerCase()
  const filtered = q
    ? items.filter(
        (i) =>
          (i.name || '').toLowerCase().includes(q) ||
          (i.email || '').toLowerCase().includes(q)
      )
    : items

  return (
    <div className="max-w-5xl">
      <PageHeader
        title={`User Journey ${items.length > 0 ? `(${items.length})` : ''}`}
        subtitle="Everyone who reached out through the contact form on your site, with name, email, and the date they got in touch."
      />

      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full md:w-80 px-3 py-2 rounded-lg text-sm focus:outline-none"
          style={{
            background: 'var(--dash-surface)',
            border: '1px solid var(--dash-line)',
            color: 'var(--dash-ink)',
          }}
        />
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--dash-surface)', border: '1px solid var(--dash-line)' }}
      >
        {loading ? (
          <p className="text-sm p-6" style={{ color: 'var(--dash-ink-dim)' }}>
            Loading…
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-sm p-6" style={{ color: 'var(--dash-ink-dim)' }}>
            {items.length === 0
              ? 'No one has contacted you through the site yet.'
              : 'No matches for that search.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--dash-bg)' }}>
                  <th
                    className="text-left px-4 py-3 font-medium"
                    style={{ color: 'var(--dash-ink-dim)' }}
                  >
                    Name
                  </th>
                  <th
                    className="text-left px-4 py-3 font-medium"
                    style={{ color: 'var(--dash-ink-dim)' }}
                  >
                    Email
                  </th>
                  <th
                    className="text-left px-4 py-3 font-medium"
                    style={{ color: 'var(--dash-ink-dim)' }}
                  >
                    Reached out
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <tr
                    key={item._id || idx}
                    style={{
                      borderTop: '1px solid var(--dash-line)',
                    }}
                  >
                    <td className="px-4 py-3" style={{ color: 'var(--dash-ink)' }}>
                      {item.name || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {item.email ? (
                        <a
                          href={`mailto:${item.email}`}
                          className="hover:underline"
                          style={{ color: 'var(--dash-accent)' }}
                        >
                          {item.email}
                        </a>
                      ) : (
                        <span style={{ color: 'var(--dash-ink-dim)' }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--dash-ink-dim)' }}>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
