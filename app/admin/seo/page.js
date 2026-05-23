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
  DangerButton,
  StatusMessage,
  Badge,
} from '../_components/ui'
import ImageUpload from '../_components/ImageUpload'

const emptyPage = {
  pagePath: '',
  pageName: '',
  focusKeyword: '',
  title: '',
  description: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  indexable: true,
  canonicalUrl: '',
  structuredData: '',
  additionalTags: [],
}

export default function SeoPage() {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(emptyPage)
  const [filter, setFilter] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function refresh() {
    setLoading(true)
    const res = await fetch('/api/page-seo')
    const data = await res.json()
    setPages(data)
    setLoading(false)
    if (selected) {
      const fresh = data.find((p) => p._id === selected._id)
      if (fresh) {
        setSelected(fresh)
        setForm({ ...emptyPage, ...fresh })
      }
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  function openEdit(page) {
    setSelected(page)
    setCreating(false)
    setForm({ ...emptyPage, ...page })
    setMsg('')
  }

  function openCreate() {
    setSelected(null)
    setCreating(true)
    setForm(emptyPage)
    setMsg('')
  }

  function close() {
    setSelected(null)
    setCreating(false)
    setForm(emptyPage)
    setMsg('')
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  function addTag() {
    setForm((prev) => ({
      ...prev,
      additionalTags: [...(prev.additionalTags || []), { name: '', content: '' }],
    }))
  }

  function updateTag(index, field, value) {
    setForm((prev) => {
      const tags = [...(prev.additionalTags || [])]
      tags[index] = { ...tags[index], [field]: value }
      return { ...prev, additionalTags: tags }
    })
  }

  function removeTag(index) {
    setForm((prev) => ({
      ...prev,
      additionalTags: (prev.additionalTags || []).filter((_, i) => i !== index),
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    const url = creating ? '/api/page-seo' : `/api/page-seo/${selected._id}`
    const method = creating ? 'POST' : 'PUT'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (res.ok) {
      setMsg('Saved')
      if (creating) {
        setCreating(false)
        setSelected(data)
      }
      refresh()
    } else {
      setMsg(data.error || 'Failed to save')
    }
    setTimeout(() => setMsg(''), 3000)
  }

  async function handleDelete() {
    if (!selected || selected.isSystem) return
    if (!confirm(`Delete SEO settings for "${selected.pageName}"?`)) return
    const res = await fetch(`/api/page-seo/${selected._id}`, { method: 'DELETE' })
    if (res.ok) {
      close()
      refresh()
    }
  }

  const filtered = pages.filter((p) => {
    if (!filter) return true
    const f = filter.toLowerCase()
    return (
      p.pageName?.toLowerCase().includes(f) ||
      p.pagePath?.toLowerCase().includes(f) ||
      p.title?.toLowerCase().includes(f)
    )
  })

  if (loading)
    return <p className="text-sm" style={{ color: 'var(--dash-ink-dim)' }}>Loading...</p>

  // ---------- Detail panel ----------
  if (selected || creating) {
    const isSystem = selected?.isSystem
    return (
      <div className="max-w-3xl">
        <div className="mb-4">
          <button
            onClick={close}
            className="text-sm hover:underline"
            style={{ color: 'var(--dash-accent)' }}
          >
            ← Back to all pages
          </button>
        </div>

        <PageHeader
          title={creating ? 'New Page SEO' : form.pageName || 'Page SEO'}
          subtitle={
            creating
              ? 'Add SEO metadata for a custom page on your website.'
              : `Manage how ${form.pagePath} appears in search results and on social media.`
          }
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Google preview */}
          <div
            className="rounded-xl p-4"
            style={{
              background: 'var(--dash-surface)',
              border: '1px solid var(--dash-line)',
            }}
          >
            <p
              className="text-xs uppercase tracking-wide mb-3"
              style={{ color: 'var(--dash-ink-dim)' }}
            >
              Google Preview
            </p>
            <p className="text-lg leading-tight truncate" style={{ color: '#1a0dab' }}>
              {form.title || form.pageName || 'Page title'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#0d7c2c' }}>
              {form.canonicalUrl || `yourwebsite.com${form.pagePath || '/page'}`}
            </p>
            <p
              className="text-sm mt-1 line-clamp-2"
              style={{ color: 'var(--dash-ink)' }}
            >
              {form.description || 'Meta description will appear here...'}
            </p>
          </div>

          <Section
            title="Page details"
            subtitle="The page name and URL are how this entry maps to a real page on your site."
          >
            <div className="grid grid-cols-2 gap-4">
              <Field label="Page Name">
                <Input
                  name="pageName"
                  value={form.pageName}
                  onChange={handleChange}
                  required
                  disabled={isSystem}
                  placeholder="About"
                />
              </Field>
              <Field label="Page URL" hint="Path on the site. Starts with /">
                <Input
                  name="pagePath"
                  value={form.pagePath}
                  onChange={handleChange}
                  required
                  disabled={isSystem}
                  placeholder="/about"
                />
              </Field>
            </div>
            {isSystem && (
              <p className="text-xs" style={{ color: 'var(--dash-ink-dim)' }}>
                This is a built-in page. The name and URL are fixed, but you can edit all SEO fields below.
              </p>
            )}
          </Section>

          <Section
            title="Search engine basics"
            subtitle="What Google shows for this page. Focus keyword is your reminder of what topic this page targets."
          >
            <Field
              label="Focus Keyword"
              hint="The main keyword this page targets. Internal reference only; not added to the page."
            >
              <Input
                name="focusKeyword"
                value={form.focusKeyword}
                onChange={handleChange}
                placeholder="interior design mumbai"
              />
            </Field>

            <Field label="Title Tag" hint="50–60 characters recommended.">
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Mumbai's Most Loved Interior Studio | Brand"
              />
              <p className="text-xs mt-1" style={{ color: 'var(--dash-ink-dim)' }}>
                {(form.title || '').length} / 60
              </p>
            </Field>

            <Field label="Meta Description" hint="150–160 characters recommended.">
              <Textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Describe what this page is about in a way a visitor would understand."
              />
              <p className="text-xs mt-1" style={{ color: 'var(--dash-ink-dim)' }}>
                {(form.description || '').length} / 160
              </p>
            </Field>

            <Field
              label="Indexable"
              hint="Off = ask search engines to skip this page. Useful for thank-you pages, private content."
            >
              <label
                className="inline-flex items-center gap-2 text-sm cursor-pointer"
                style={{ color: 'var(--dash-ink)' }}
              >
                <input
                  type="checkbox"
                  name="indexable"
                  checked={form.indexable}
                  onChange={handleChange}
                />
                Allow search engines to index this page
              </label>
            </Field>
          </Section>

          <Section
            title="Social sharing (Open Graph)"
            subtitle="How this page looks when shared on Facebook, WhatsApp, LinkedIn. Leave blank to fall back to the title/description above."
          >
            <Field label="OG Title">
              <Input
                name="ogTitle"
                value={form.ogTitle}
                onChange={handleChange}
                placeholder={form.title || 'Falls back to title tag'}
              />
            </Field>
            <Field label="OG Description">
              <Textarea
                name="ogDescription"
                value={form.ogDescription}
                onChange={handleChange}
                rows={2}
                placeholder={form.description || 'Falls back to meta description'}
              />
            </Field>
            <Field label="OG Image" hint="1200×630px recommended. Falls back to site default if blank.">
              <ImageUpload
                value={form.ogImage}
                onChange={(url) => setForm((prev) => ({ ...prev, ogImage: url }))}
                folder="og"
                aspect="wide"
                emptyLabel="Upload share image"
              />
            </Field>
          </Section>

          <Section
            title="Structured data"
            subtitle="JSON-LD that helps Google and AI tools understand this page (LocalBusiness, FAQ, BreadcrumbList, etc.)."
          >
            <Field
              label="JSON-LD"
              hint="Paste valid schema.org JSON. Validate it at schema.org's validator."
            >
              <Textarea
                name="structuredData"
                value={form.structuredData}
                onChange={handleChange}
                rows={8}
                placeholder='{"@context":"https://schema.org","@type":"WebPage",...}'
                style={{
                  background: 'var(--dash-surface)',
                  border: '1px solid var(--dash-line)',
                  color: 'var(--dash-ink)',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}
              />
            </Field>
          </Section>

          <Section
            title="Additional meta tags"
            subtitle="Any extra meta tag — e.g. theme-color, twitter:site. Custom rel/property tags can be added too."
          >
            {(form.additionalTags || []).map((tag, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-4">
                  <Field label={idx === 0 ? 'Name' : ''} hint={idx === 0 ? '"name" or "property"' : ''}>
                    <Input
                      value={tag.name}
                      onChange={(e) => updateTag(idx, 'name', e.target.value)}
                      placeholder="twitter:site"
                    />
                  </Field>
                </div>
                <div className="col-span-7">
                  <Field label={idx === 0 ? 'Content' : ''}>
                    <Input
                      value={tag.content}
                      onChange={(e) => updateTag(idx, 'content', e.target.value)}
                      placeholder="@yourbrand"
                    />
                  </Field>
                </div>
                <div className="col-span-1 pb-2">
                  <button
                    type="button"
                    onClick={() => removeTag(idx)}
                    className="text-xs"
                    style={{ color: '#c1432a' }}
                    title="Remove tag"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addTag}
              className="text-sm hover:underline"
              style={{ color: 'var(--dash-accent)' }}
            >
              + Add tag
            </button>
          </Section>

          <Section
            title="Canonical URL (advanced)"
            subtitle="Only fill this in if you want this page to point its SEO credit at a different URL."
          >
            <Field label="Canonical URL">
              <Input
                name="canonicalUrl"
                value={form.canonicalUrl}
                onChange={handleChange}
                placeholder="https://yourwebsite.com/canonical-page"
              />
            </Field>
          </Section>

          <div
            className="sticky bottom-0 -mx-8 px-8 py-4 flex items-center gap-3 border-t"
            style={{ background: 'var(--dash-bg)', borderColor: 'var(--dash-line)' }}
          >
            <PrimaryButton type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </PrimaryButton>
            <SecondaryButton type="button" onClick={close}>
              Cancel
            </SecondaryButton>
            {!creating && !isSystem && (
              <div className="ml-auto">
                <DangerButton type="button" onClick={handleDelete}>
                  Delete page SEO
                </DangerButton>
              </div>
            )}
            <StatusMessage message={msg} />
          </div>
        </form>
      </div>
    )
  }

  // ---------- List view ----------
  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between mb-2">
        <PageHeader
          title="SEO Settings"
          subtitle="Manage SEO for every page on your website. Click any page to edit its title, description, OG image, structured data, and more."
        />
        <PrimaryButton onClick={openCreate}>+ Add page</PrimaryButton>
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--dash-surface)', border: '1px solid var(--dash-line)' }}
      >
        <div
          className="px-4 py-3 flex items-center gap-3"
          style={{ borderBottom: '1px solid var(--dash-line)' }}
        >
          <Input
            placeholder="Search pages..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <span className="text-xs whitespace-nowrap" style={{ color: 'var(--dash-ink-dim)' }}>
            {filtered.length} page{filtered.length === 1 ? '' : 's'}
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--dash-line)' }}>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--dash-ink-dim)' }}>
                Page name
              </th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--dash-ink-dim)' }}>
                Page URL
              </th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--dash-ink-dim)' }}>
                Focus keyword
              </th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--dash-ink-dim)' }}>
                Title tag
              </th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--dash-ink-dim)' }}>
                Meta description
              </th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--dash-ink-dim)' }}>
                Indexable
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const titleEdited = !!p.title
              const descEdited = !!p.description
              return (
                <tr
                  key={p._id}
                  onClick={() => openEdit(p)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      openEdit(p)
                    }
                  }}
                  className="cursor-pointer transition-colors"
                  style={{
                    borderTop: '1px solid var(--dash-line)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dash-bg)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-4 py-3" style={{ color: 'var(--dash-ink)' }}>
                    <div className="flex items-center gap-2">
                      {p.pageName}
                      {p.isSystem && <Badge tone="muted">Built-in</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--dash-accent)' }}>
                    {p.pagePath}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--dash-ink-dim)' }}>
                    {p.focusKeyword || (
                      <span className="hover:underline" style={{ color: 'var(--dash-accent)' }}>
                        + Add keyword
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Badge tone={titleEdited ? 'success' : 'muted'}>
                        {titleEdited ? 'EDITED' : 'Not set'}
                      </Badge>
                      {titleEdited && (
                        <span className="truncate max-w-[200px]" style={{ color: 'var(--dash-ink-dim)' }}>
                          {p.title}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Badge tone={descEdited ? 'success' : 'muted'}>
                        {descEdited ? 'EDITED' : 'Not set'}
                      </Badge>
                      {descEdited && (
                        <span className="truncate max-w-[200px]" style={{ color: 'var(--dash-ink-dim)' }}>
                          {p.description}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {p.indexable ? (
                      <span style={{ color: 'var(--dash-accent-2)' }}>✓</span>
                    ) : (
                      <span style={{ color: '#c1432a' }}>✗</span>
                    )}
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--dash-ink-dim)' }}>
                  No pages match that search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-xs space-y-2" style={{ color: 'var(--dash-ink-dim)' }}>
        <p>
          <strong style={{ color: 'var(--dash-ink)' }}>About this page:</strong> Each row here represents one URL on your website. The title and description are what Google shows in search results. Open Graph fields (in the editor) are what shows when the page is shared on WhatsApp or Facebook.
        </p>
        <p>
          Blog posts have their own SEO settings inside the blog editor, not here.
        </p>
      </div>
    </div>
  )
}
