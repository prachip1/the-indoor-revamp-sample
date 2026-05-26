'use client'
import { useState, useEffect } from 'react'
import {
  Field,
  Input,
  Textarea,
  Section,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  StatusMessage,
  Badge,
} from '../_components/ui'

const empty = { name: '', description: '', icon: '', order: 0, published: true }

export default function ServicesPage() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function load() {
    const res = await fetch('/api/services')
    setServices(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  function openAdd() {
    setForm(empty)
    setEditId(null)
    setShowForm(true)
  }

  function openEdit(s) {
    setForm(s)
    setEditId(s._id)
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    const url = editId ? `/api/services/${editId}` : '/api/services'
    const method = editId ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      setMsg('Saved')
      setShowForm(false)
      load()
    } else {
      setMsg('Failed to save')
    }
    setTimeout(() => setMsg(''), 3000)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this service?')) return
    await fetch(`/api/services/${id}`, { method: 'DELETE' })
    load()
  }

  if (loading)
    return <p className="text-sm" style={{ color: 'var(--dash-ink-dim)' }}>Loading...</p>

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between mb-2">
        <PageHeader
          title="Services"
          subtitle="Services offered by the studio. Shown on the public site and in structured data for search engines."
        />
        <PrimaryButton onClick={openAdd}>+ Add Service</PrimaryButton>
      </div>

      <StatusMessage message={msg} />

      {showForm && (
        <div className="mt-6">
          <Section title={editId ? 'Edit Service' : 'New Service'}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Service Name">
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Living Room Design"
                />
              </Field>
              <Field label="Description">
                <Textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                />
              </Field>
              <Field label="Icon" hint="An emoji or icon character that represents this service.">
                <Input
                  name="icon"
                  value={form.icon}
                  onChange={handleChange}
                  placeholder="🛋️"
                />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Display Order">
                  <Input type="number" name="order" value={form.order} onChange={handleChange} />
                </Field>
                <Field label="Status">
                  <label className="inline-flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--dash-ink)' }}>
                    <input
                      type="checkbox"
                      name="published"
                      checked={form.published}
                      onChange={handleChange}
                    />
                    Published
                  </label>
                </Field>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <PrimaryButton type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Service'}
                </PrimaryButton>
                <SecondaryButton type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </SecondaryButton>
              </div>
            </form>
          </Section>
        </div>
      )}

      <div className="mt-8">
        {services.length === 0 ? (
          <div
            className="rounded-xl p-12 text-center"
            style={{ background: 'var(--dash-surface)', border: '1px dashed var(--dash-line)' }}
          >
            <p className="text-sm" style={{ color: 'var(--dash-ink-dim)' }}>
              No services yet. Add your first one above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((s) => (
              <div
                key={s._id}
                className="rounded-xl p-4 flex items-start justify-between gap-4"
                style={{ background: 'var(--dash-surface)', border: '1px solid var(--dash-line)' }}
              >
                <div className="flex items-start gap-3 flex-1">
                  {s.icon && <span className="text-2xl">{s.icon}</span>}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm" style={{ color: 'var(--dash-ink)' }}>
                        {s.name}
                      </p>
                      <Badge tone={s.published ? 'success' : 'warn'}>
                        {s.published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                    {s.description && (
                      <p className="text-xs" style={{ color: 'var(--dash-ink-dim)' }}>
                        {s.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 shrink-0">
                  <button
                    onClick={() => openEdit(s)}
                    className="text-xs font-medium hover:underline"
                    style={{ color: 'var(--dash-accent)' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(s._id)}
                    className="text-xs font-medium hover:underline"
                    style={{ color: '#c1432a' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
