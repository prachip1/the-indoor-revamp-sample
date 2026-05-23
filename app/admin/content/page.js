'use client'
import { useState, useEffect } from 'react'
import {
  Field,
  Input,
  Textarea,
  Section,
  PageHeader,
  SaveBar,
} from '../_components/ui'

const emptyForm = {
  heroTitle: '',
  heroSubtitle: '',
  aboutTitle: '',
  aboutText: '',
  contactEmail: '',
  contactPhone: '',
  contactAddress: '',
  socialInstagram: '',
  socialFacebook: '',
  socialLinkedin: '',
}

export default function ContentPage() {
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('/api/content')
      .then((r) => r.json())
      .then((data) => {
        setForm((prev) => ({ ...prev, ...data }))
        setLoading(false)
      })
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    const res = await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setMsg(res.ok ? 'Saved successfully' : 'Failed to save')
    setTimeout(() => setMsg(''), 3000)
  }

  if (loading)
    return <p className="text-sm" style={{ color: 'var(--dash-ink-dim)' }}>Loading...</p>

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Site Content"
        subtitle="Edit the text and contact information shown on the website."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="Hero Section">
          <Field label="Hero Title">
            <Input
              name="heroTitle"
              value={form.heroTitle}
              onChange={handleChange}
              placeholder="Transforming Spaces Into Stories"
            />
          </Field>
          <Field label="Hero Subtitle">
            <Textarea
              name="heroSubtitle"
              value={form.heroSubtitle}
              onChange={handleChange}
              rows={2}
              placeholder="Short tagline under the hero title"
            />
          </Field>
        </Section>

        <Section title="About Section">
          <Field label="About Title">
            <Input
              name="aboutTitle"
              value={form.aboutTitle}
              onChange={handleChange}
              placeholder="About Me"
            />
          </Field>
          <Field label="About Text">
            <Textarea
              name="aboutText"
              value={form.aboutText}
              onChange={handleChange}
              rows={5}
              placeholder="Write about the designer..."
            />
          </Field>
        </Section>

        <Section title="Contact Information">
          <Field label="Email">
            <Input type="email" name="contactEmail" value={form.contactEmail} onChange={handleChange} />
          </Field>
          <Field label="Phone">
            <Input name="contactPhone" value={form.contactPhone} onChange={handleChange} />
          </Field>
          <Field label="Address">
            <Textarea name="contactAddress" value={form.contactAddress} onChange={handleChange} rows={2} />
          </Field>
        </Section>

        <Section title="Social Links">
          <Field label="Instagram URL">
            <Input
              name="socialInstagram"
              value={form.socialInstagram}
              onChange={handleChange}
              placeholder="https://instagram.com/..."
            />
          </Field>
          <Field label="Facebook URL">
            <Input
              name="socialFacebook"
              value={form.socialFacebook}
              onChange={handleChange}
              placeholder="https://facebook.com/..."
            />
          </Field>
          <Field label="LinkedIn URL">
            <Input
              name="socialLinkedin"
              value={form.socialLinkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/..."
            />
          </Field>
        </Section>

        <SaveBar saving={saving} message={msg} />
      </form>
    </div>
  )
}
