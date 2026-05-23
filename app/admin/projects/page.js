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
import ImageGallery from '../_components/ImageGallery'

const empty = {
  title: '',
  description: '',
  images: [],
  altText: '',
  tags: '',
  order: 0,
  published: true,
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function load() {
    const res = await fetch('/api/projects')
    setProjects(await res.json())
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

  function openEdit(p) {
    setForm({
      ...p,
      images: Array.isArray(p.images) ? p.images : [],
      tags: p.tags?.join(', ') || '',
    })
    setEditId(p._id)
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    const payload = {
      ...form,
      images: Array.isArray(form.images) ? form.images : [],
      tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
    }
    const url = editId ? `/api/projects/${editId}` : '/api/projects'
    const method = editId ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
    if (!confirm('Delete this project?')) return
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    load()
  }

  if (loading)
    return <p className="text-sm" style={{ color: 'var(--dash-ink-dim)' }}>Loading...</p>

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between mb-2">
        <PageHeader
          title="Projects"
          subtitle="Portfolio projects shown on your website. Drag-and-drop image uploads can be added later."
        />
        <PrimaryButton onClick={openAdd}>+ Add Project</PrimaryButton>
      </div>

      <StatusMessage message={msg} />

      {showForm && (
        <div className="mt-6">
          <Section
            title={editId ? 'Edit Project' : 'New Project'}
            subtitle="Fill in the project details. You can save as draft if it's not ready to publish."
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Title">
                <Input name="title" value={form.title} onChange={handleChange} required />
              </Field>
              <Field label="Description">
                <Textarea name="description" value={form.description} onChange={handleChange} rows={3} />
              </Field>
              <Field label="Images" hint="Drag to reorder. The first image is the cover shown on the project listing.">
                <ImageGallery
                  value={form.images}
                  onChange={(urls) => setForm((prev) => ({ ...prev, images: urls }))}
                  folder="projects"
                  maxImages={20}
                />
              </Field>
              <Field label="Alt Text" hint="Describes the images for screen readers and search engines.">
                <Input
                  name="altText"
                  value={form.altText}
                  onChange={handleChange}
                  placeholder="Modern living room interior design"
                />
              </Field>
              <Field label="Tags" hint="Comma-separated.">
                <Input
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="living room, modern, minimal"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Display Order" hint="Lower numbers appear first.">
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
                    Published (visible on site)
                  </label>
                </Field>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <PrimaryButton type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Project'}
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
        {projects.length === 0 ? (
          <div
            className="rounded-xl p-12 text-center"
            style={{ background: 'var(--dash-surface)', border: '1px dashed var(--dash-line)' }}
          >
            <p className="text-sm" style={{ color: 'var(--dash-ink-dim)' }}>
              No projects yet. Add your first one above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => (
              <div
                key={p._id}
                className="rounded-xl p-4 flex items-start justify-between gap-4"
                style={{ background: 'var(--dash-surface)', border: '1px solid var(--dash-line)' }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm" style={{ color: 'var(--dash-ink)' }}>
                      {p.title}
                    </p>
                    <Badge tone={p.published ? 'success' : 'warn'}>
                      {p.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  {p.description && (
                    <p className="text-xs line-clamp-1" style={{ color: 'var(--dash-ink-dim)' }}>
                      {p.description}
                    </p>
                  )}
                  {p.tags?.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {p.tags.map((t) => (
                        <Badge key={t} tone="warn">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-3 shrink-0">
                  <button
                    onClick={() => openEdit(p)}
                    className="text-xs font-medium hover:underline"
                    style={{ color: 'var(--dash-accent)' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
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
