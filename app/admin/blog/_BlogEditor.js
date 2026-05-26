'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Field,
  Input,
  Textarea,
  Select,
  Section,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  StatusMessage,
} from '../_components/ui'
import ImageUpload from '../_components/ImageUpload'

const empty = {
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  coverImage: '',
  author: '',
  tags: '',
  status: 'draft',
  metaTitle: '',
  metaDescription: '',
  ogImage: '',
}

export default function BlogEditor({ initial = null }) {
  const router = useRouter()
  const [form, setForm] = useState({
    ...empty,
    ...initial,
    tags: Array.isArray(initial?.tags) ? initial.tags.join(', ') : initial?.tags || '',
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const isEdit = Boolean(initial?._id)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function save(nextStatus) {
    setSaving(true)
    setMsg('')
    const payload = {
      ...form,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      status: nextStatus || form.status,
    }
    const url = isEdit ? `/api/blog/${initial._id}` : '/api/blog'
    const method = isEdit ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    setSaving(false)
    if (res.ok) {
      setMsg(isEdit ? 'Saved' : 'Created')
      if (!isEdit) router.push(`/admin/blog/${data._id}`)
      else setForm((prev) => ({ ...prev, status: data.status }))
    } else {
      setMsg(data.error || 'Failed to save')
    }
    setTimeout(() => setMsg(''), 3000)
  }

  async function handleDelete() {
    if (!confirm(`Delete "${form.title}"? This cannot be undone.`)) return
    const res = await fetch(`/api/blog/${initial._id}`, { method: 'DELETE' })
    if (res.ok) router.push('/admin/blog')
    else setMsg('Failed to delete')
  }

  const charsTitle = (form.metaTitle || form.title).length
  const charsDesc = (form.metaDescription || form.excerpt).length

  return (
    <div className="max-w-4xl">
      <div className="mb-4">
        <Link
          href="/admin/blog"
          className="text-sm hover:underline"
          style={{ color: 'var(--dash-accent)' }}
        >
          ← Back to all posts
        </Link>
      </div>

      <PageHeader
        title={isEdit ? 'Edit Post' : 'New Post'}
        subtitle={
          isEdit
            ? 'Update the post. Save as draft to keep it hidden, or publish to make it live.'
            : 'Write your post. You can save as a draft and publish later.'
        }
      />

      <div className="space-y-6">
        <Section title="Content" subtitle="The title, body, and details shown to readers.">
          <Field label="Title">
            <Input name="title" value={form.title} onChange={handleChange} placeholder="A Day in the Studio" />
          </Field>

          <Field
            label="URL Slug"
            hint="The URL path. Auto-generated from title if left blank."
          >
            <Input name="slug" value={form.slug} onChange={handleChange} placeholder="a-day-in-the-studio" />
          </Field>

          <Field label="Excerpt" hint="A short summary shown in listings and social shares.">
            <Textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={2} />
          </Field>

          <Field label="Cover Image" hint="Shown at the top of the post and in social shares. Landscape, ~1200×630px works best.">
            <ImageUpload
              value={form.coverImage}
              onChange={(url) => setForm((prev) => ({ ...prev, coverImage: url }))}
              folder="blog"
              aspect="wide"
              emptyLabel="Upload cover image"
            />
          </Field>

          <Field label="Author">
            <Input name="author" value={form.author} onChange={handleChange} placeholder="Your name" />
          </Field>

          <Field label="Tags" hint="Comma separated. e.g. lighting, kitchen, modern.">
            <Input name="tags" value={form.tags} onChange={handleChange} placeholder="design, interiors" />
          </Field>

          <Field label="Body" hint="Plain text or Markdown. Use blank lines for paragraphs.">
            <Textarea
              name="body"
              value={form.body}
              onChange={handleChange}
              rows={14}
              style={{
                background: 'var(--dash-surface)',
                border: '1px solid var(--dash-line)',
                color: 'var(--dash-ink)',
                fontFamily: 'var(--font-body)',
                lineHeight: 1.6,
              }}
            />
          </Field>
        </Section>

        <Section
          title="SEO Settings"
          subtitle="How this post appears on Google and social media. Falls back to title/excerpt/cover if blank."
        >
          {/* Google preview */}
          <div
            className="rounded-lg p-4 mb-4"
            style={{ background: 'var(--dash-bg)', border: '1px solid var(--dash-line)' }}
          >
            <p className="text-xs uppercase tracking-wide mb-3" style={{ color: 'var(--dash-ink-dim)' }}>
              Google Preview
            </p>
            <p
              className="text-lg leading-tight truncate"
              style={{ color: '#1a0dab' }}
            >
              {form.metaTitle || form.title || 'Post title'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#0d7c2c' }}>
              {(form.slug ? `/blog/${form.slug}` : '/blog/your-slug')}
            </p>
            <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--dash-ink)' }}>
              {form.metaDescription || form.excerpt || 'Post description will appear here...'}
            </p>
          </div>

          <Field label="SEO Title" hint="50-60 characters recommended.">
            <Input
              name="metaTitle"
              value={form.metaTitle}
              onChange={handleChange}
              placeholder={form.title || 'Override the title for search engines'}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--dash-ink-dim)' }}>{charsTitle} / 60</p>
          </Field>

          <Field label="SEO Description" hint="150-160 characters recommended.">
            <Textarea name="metaDescription" value={form.metaDescription} onChange={handleChange} rows={3} />
            <p className="text-xs mt-1" style={{ color: 'var(--dash-ink-dim)' }}>{charsDesc} / 160</p>
          </Field>

          <Field label="Share Image (OG Image)" hint="1200×630px recommended. Falls back to Cover Image if blank.">
            <ImageUpload
              value={form.ogImage}
              onChange={(url) => setForm((prev) => ({ ...prev, ogImage: url }))}
              folder="blog"
              aspect="wide"
              emptyLabel="Upload share image"
            />
          </Field>
        </Section>

        <div
          className="sticky bottom-0 -mx-4 px-4 md:-mx-8 md:px-8 py-4 flex flex-wrap items-center gap-3 border-t"
          style={{ background: 'var(--dash-bg)', borderColor: 'var(--dash-line)' }}
        >
          <PrimaryButton type="button" onClick={() => save()} disabled={saving}>
            {saving ? 'Saving...' : 'Save Draft'}
          </PrimaryButton>
          {form.status !== 'published' ? (
            <SecondaryButton type="button" onClick={() => save('published')} disabled={saving}>
              Publish
            </SecondaryButton>
          ) : (
            <SecondaryButton type="button" onClick={() => save('draft')} disabled={saving}>
              Unpublish
            </SecondaryButton>
          )}
          {isEdit && (
            <div className="ml-auto">
              <DangerButton type="button" onClick={handleDelete}>
                Delete
              </DangerButton>
            </div>
          )}
          <StatusMessage message={msg} />
        </div>
      </div>
    </div>
  )
}
