'use client'
import { useState, useEffect } from 'react'
import {
  Field,
  Input,
  Select,
  Section,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  StatusMessage,
  Badge,
} from '../_components/ui'

const blankForm = { sourceUrl: '', targetUrl: '', statusCode: 301, active: true, description: '' }

export default function RedirectsPage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(blankForm)
  const [editingId, setEditingId] = useState(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function refresh() {
    setLoading(true)
    const res = await fetch('/api/redirects')
    setList(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  function startEdit(item) {
    setEditingId(item._id)
    setForm({
      sourceUrl: item.sourceUrl,
      targetUrl: item.targetUrl,
      statusCode: item.statusCode,
      active: item.active,
      description: item.description || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(blankForm)
    setMsg('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    const url = editingId ? `/api/redirects/${editingId}` : '/api/redirects'
    const method = editingId ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setBusy(false)
    if (res.ok) {
      setMsg(editingId ? 'Redirect updated' : 'Redirect added')
      setForm(blankForm)
      setEditingId(null)
      refresh()
    } else {
      setMsg(data.error || 'Failed to save')
    }
    setTimeout(() => setMsg(''), 3000)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this redirect? Visitors will stop being redirected.')) return
    setBusy(true)
    const res = await fetch(`/api/redirects/${id}`, { method: 'DELETE' })
    setBusy(false)
    if (res.ok) {
      setMsg('Redirect deleted')
      refresh()
    } else {
      setMsg('Failed to delete')
    }
    setTimeout(() => setMsg(''), 3000)
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="URL Redirects"
        subtitle="Send visitors from old URLs to new ones. Essential before switching from Wix — paste every old URL here so search-engine bookmarks and Google rankings carry over."
      />

      <Section
        title={editingId ? 'Edit Redirect' : 'Add Redirect'}
        subtitle={editingId ? 'Update an existing redirect.' : 'A new redirect activates immediately for all visitors.'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="From (Source URL)" hint="The old path. Start with /">
              <Input
                name="sourceUrl"
                value={form.sourceUrl}
                onChange={handleChange}
                placeholder="/old-about-us"
                required
              />
            </Field>
            <Field label="To (Target URL)" hint="A path or a full https:// URL.">
              <Input
                name="targetUrl"
                value={form.targetUrl}
                onChange={handleChange}
                placeholder="/about or https://..."
                required
              />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4 items-end">
            <Field label="Status Code" hint="301 = permanent (preserves SEO). 302 = temporary.">
              <Select name="statusCode" value={form.statusCode} onChange={handleChange}>
                <option value={301}>301 — Permanent</option>
                <option value={302}>302 — Temporary</option>
                <option value={307}>307 — Temporary (preserve method)</option>
                <option value={308}>308 — Permanent (preserve method)</option>
              </Select>
            </Field>
            <Field label="Active">
              <label className="inline-flex items-center gap-2 text-sm" style={{ color: 'var(--dash-ink)' }}>
                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
                />
                Redirect is live
              </label>
            </Field>
            <Field label="Description" hint="Optional note for yourself.">
              <Input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="From Wix migration"
              />
            </Field>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <PrimaryButton type="submit" disabled={busy}>
              {busy ? 'Saving...' : editingId ? 'Update Redirect' : 'Add Redirect'}
            </PrimaryButton>
            {editingId && (
              <SecondaryButton type="button" onClick={cancelEdit}>
                Cancel
              </SecondaryButton>
            )}
            <StatusMessage message={msg} />
          </div>
        </form>
      </Section>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--dash-cta)' }}>
          All Redirects {list.length > 0 && <span style={{ color: 'var(--dash-ink-dim)' }}>({list.length})</span>}
        </h3>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--dash-ink-dim)' }}>
            Loading...
          </p>
        ) : list.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{ background: 'var(--dash-surface)', border: '1px dashed var(--dash-line)' }}
          >
            <p className="text-sm" style={{ color: 'var(--dash-ink-dim)' }}>
              No redirects yet. Add your first one above.
            </p>
          </div>
        ) : (
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: 'var(--dash-surface)', border: '1px solid var(--dash-line)' }}
          >
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--dash-line)' }}>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--dash-ink-dim)' }}>From</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--dash-ink-dim)' }}>To</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--dash-ink-dim)' }}>Status</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--dash-ink-dim)' }}>State</th>
                  <th className="text-right px-4 py-3 font-medium" style={{ color: 'var(--dash-ink-dim)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => (
                  <tr key={item._id} style={{ borderTop: '1px solid var(--dash-line)' }}>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--dash-ink)' }}>{item.sourceUrl}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--dash-accent)' }}>{item.targetUrl}</td>
                    <td className="px-4 py-3">
                      <Badge tone="muted">{item.statusCode}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={item.active ? 'success' : 'warn'}>
                        {item.active ? 'Active' : 'Paused'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => startEdit(item)}
                        className="text-xs font-medium hover:underline"
                        style={{ color: 'var(--dash-accent)' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-xs font-medium hover:underline"
                        style={{ color: '#c1432a' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
