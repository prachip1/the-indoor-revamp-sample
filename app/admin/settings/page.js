'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Field,
  Input,
  Textarea,
  Select,
  Section,
  PageHeader,
  SaveBar,
} from '../_components/ui'
import ImageUpload from '../_components/ImageUpload'

const emptyForm = {
  businessName: '',
  tagline: '',
  logoUrl: '',
  faviconUrl: '',
  email: '',
  phone: '',
  address: '',
  region: '',
  currency: 'INR',
  siteUrl: '',
  resendApiKey: '',
  resendFromEmail: '',
  notificationEmail: '',
  slackWebhookUrl: '',
  whatsappBusinessUrl: '',
  crmWebhookUrl: '',
}

export default function SettingsPage() {
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        const filtered = {}
        Object.keys(emptyForm).forEach((k) => {
          if (data?.[k] !== undefined) filtered[k] = data[k]
        })
        setForm((prev) => ({ ...prev, ...filtered }))
        setLoading(false)
      })
  }, [])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
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
    setMsg(res.ok ? 'Saved successfully' : 'Failed to save')
    setTimeout(() => setMsg(''), 3000)
  }

  if (loading)
    return <p className="text-sm" style={{ color: 'var(--dash-ink-dim)' }}>Loading...</p>

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Site Settings"
        subtitle="Business information, site identity, email, and webhook integrations. For search engine verification and analytics, use Site Verification."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section
          title="Business Information"
          subtitle="Used across the website, emails, and structured data for search engines."
        >
          <Field label="Business Name">
            <Input
              name="businessName"
              value={form.businessName}
              onChange={handleChange}
              placeholder="The Indoor Revamp"
            />
          </Field>

          <Field label="Tagline" hint="One short sentence describing what you do.">
            <Input
              name="tagline"
              value={form.tagline}
              onChange={handleChange}
              placeholder="Premium interior design studio"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Logo" hint="Shown in header and emails. PNG with transparent background, ~512×512px recommended.">
              <ImageUpload
                value={form.logoUrl}
                onChange={(url) => setForm((prev) => ({ ...prev, logoUrl: url }))}
                folder="brand"
                aspect="square"
                emptyLabel="Upload your logo"
              />
            </Field>
            <Field label="Favicon" hint="Small browser tab icon. 32×32 or 64×64 PNG / ICO.">
              <ImageUpload
                value={form.faviconUrl}
                onChange={(url) => setForm((prev) => ({ ...prev, faviconUrl: url }))}
                folder="brand"
                aspect="square"
                emptyLabel="Upload favicon"
                accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/svg+xml"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Contact Email">
              <Input type="email" name="email" value={form.email} onChange={handleChange} placeholder="hello@yourbusiness.com" />
            </Field>
            <Field label="Phone">
              <Input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 ..." />
            </Field>
          </div>

          <Field label="Address">
            <Textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={2}
              placeholder="Street, City, State, Postal Code"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Region / Country">
              <Input name="region" value={form.region} onChange={handleChange} placeholder="India" />
            </Field>
            <Field label="Currency">
              <Select name="currency" value={form.currency} onChange={handleChange}>
                <option value="INR">INR — Indian Rupee</option>
                <option value="USD">USD — US Dollar</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="EUR">EUR — Euro</option>
                <option value="AED">AED — UAE Dirham</option>
                <option value="AUD">AUD — Australian Dollar</option>
                <option value="CAD">CAD — Canadian Dollar</option>
              </Select>
            </Field>
          </div>
        </Section>

        <Section
          title="Site Identity"
          subtitle="The public address of your website. Used for canonical URLs and social sharing."
        >
          <Field
            label="Site URL"
            hint="Leave the Vercel preview URL here while developing; switch to your real domain on cutover day."
          >
            <Input
              name="siteUrl"
              value={form.siteUrl}
              onChange={handleChange}
              placeholder="https://yourwebsite.com"
            />
          </Field>
        </Section>

        <Link
          href="/admin/site-verification"
          className="block rounded-xl p-5 transition-colors"
          style={{
            background: 'var(--dash-surface)',
            border: '1px solid var(--dash-line)',
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center rounded-lg shrink-0 text-white font-semibold"
              style={{ width: 40, height: 40, background: 'var(--dash-cta)' }}
            >
              ✓
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold" style={{ color: 'var(--dash-ink)' }}>
                Site Verification & Tracking
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--dash-ink-dim)' }}>
                Connect Google Search Console, Bing, Google Analytics, Meta Pixel, and more.
              </div>
            </div>
            <span style={{ color: 'var(--dash-accent)' }}>Open →</span>
          </div>
        </Link>

        <Section
          title="Email Notifications"
          subtitle="Configure how your site sends transactional emails (form submissions, contact requests)."
        >
          <Field label="Resend API Key" hint="From resend.com → API Keys. Stored securely in your database.">
            <Input
              type="password"
              name="resendApiKey"
              value={form.resendApiKey}
              onChange={handleChange}
              placeholder="re_..."
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="From Email" hint="Must be a verified domain in Resend.">
              <Input type="email" name="resendFromEmail" value={form.resendFromEmail} onChange={handleChange} placeholder="hello@yourbusiness.com" />
            </Field>
            <Field label="Notification Email" hint="Where contact form submissions land.">
              <Input type="email" name="notificationEmail" value={form.notificationEmail} onChange={handleChange} placeholder="you@yourbusiness.com" />
            </Field>
          </div>
        </Section>

        <Section
          title="Webhook Integrations"
          subtitle="Forward important events (new contact, new order) to Slack, WhatsApp, or your CRM."
        >
          <Field label="Slack Webhook URL" hint="Incoming webhook from your Slack workspace.">
            <Input type="password" name="slackWebhookUrl" value={form.slackWebhookUrl} onChange={handleChange} placeholder="https://hooks.slack.com/services/..." />
          </Field>
          <Field label="WhatsApp Business Webhook" hint="Optional. Endpoint URL from WhatsApp Business API.">
            <Input type="password" name="whatsappBusinessUrl" value={form.whatsappBusinessUrl} onChange={handleChange} />
          </Field>
          <Field label="CRM Webhook" hint="Optional. Any external system that accepts a JSON POST.">
            <Input type="password" name="crmWebhookUrl" value={form.crmWebhookUrl} onChange={handleChange} />
          </Field>
        </Section>

        <SaveBar saving={saving} message={msg} />
      </form>
    </div>
  )
}
