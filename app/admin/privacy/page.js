'use client'
import { useState } from 'react'
import {
  Field,
  Input,
  Select,
  Section,
  PageHeader,
  PrimaryButton,
  StatusMessage,
} from '../_components/ui'

export default function PrivacyPage() {
  const [email, setEmail] = useState('')
  const [mode, setMode] = useState('anonymize')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [msg, setMsg] = useState('')

  async function handleErase(e) {
    e.preventDefault()
    if (!email) return
    const verb = mode === 'erase' ? 'permanently delete' : 'anonymize'
    if (!confirm(`This will ${verb} all records matching ${email}. Continue?`)) return

    setBusy(true)
    setMsg('')
    setResult(null)
    const res = await fetch('/api/gdpr/erase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, mode }),
    })
    const data = await res.json()
    setBusy(false)
    if (res.ok) {
      setResult(data)
      setMsg('Request completed.')
    } else {
      setMsg(data.error || 'Failed.')
    }
    setTimeout(() => setMsg(''), 3000)
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Privacy & Compliance"
        subtitle="Handle data subject access requests under GDPR / CCPA. All actions are logged."
      />

      <Section
        title="Data Erasure Request"
        subtitle="Erase or anonymize personal data linked to an email address. Used when a visitor requests deletion under GDPR Article 17 or CCPA."
      >
        <form onSubmit={handleErase} className="space-y-5">
          <Field
            label="Email Address"
            hint="The email address of the visitor who requested deletion."
          >
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="visitor@example.com"
              required
            />
          </Field>

          <Field
            label="Mode"
            hint="Anonymize keeps the record but removes personal fields. Erase permanently deletes the record. Anonymize is usually safer for audit trail."
          >
            <Select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="anonymize">Anonymize (recommended)</option>
              <option value="erase">Permanently erase</option>
            </Select>
          </Field>

          <div className="flex items-center gap-3">
            <PrimaryButton type="submit" disabled={busy || !email}>
              {busy ? 'Processing...' : `${mode === 'erase' ? 'Erase' : 'Anonymize'} records`}
            </PrimaryButton>
            <StatusMessage message={msg} />
          </div>
        </form>

        {result && (
          <div
            className="mt-5 rounded-lg p-4 text-sm"
            style={{
              background: 'var(--dash-bg)',
              border: '1px solid var(--dash-line)',
              color: 'var(--dash-ink)',
            }}
          >
            <p className="font-medium mb-2" style={{ color: 'var(--dash-cta)' }}>
              {result.mode === 'erase' ? 'Erased' : 'Anonymized'}:
            </p>
            <ul className="space-y-1">
              <li>Contact submissions: {result.affected?.contactSubmissions || 0}</li>
            </ul>
          </div>
        )}
      </Section>

      <Section
        title="Cookie Consent Log"
        subtitle="Every visitor's cookie consent choice is recorded with a hashed IP, timestamp, and category preferences. This data is your audit trail proving lawful basis under GDPR."
      >
        <p className="text-sm" style={{ color: 'var(--dash-ink-dim)' }}>
          Consent records are stored in the database. IPs are never stored in raw form — only a salted SHA-256 prefix. Export tools can be added on request.
        </p>
      </Section>
    </div>
  )
}
