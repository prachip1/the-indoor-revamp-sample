import { getGlobalSettings } from './settings'

// Send a transactional email via Resend.
// Returns { ok: true } on success, { ok: false, error } on failure.
// Silently no-ops if Resend isn't configured (so dev/staging don't error).
export async function sendEmail({ to, subject, html, text, replyTo } = {}) {
  const s = await getGlobalSettings()
  if (!s.resendApiKey || !s.resendFromEmail) {
    return { ok: false, error: 'Resend not configured', skipped: true }
  }
  const recipient = to || s.notificationEmail
  if (!recipient) return { ok: false, error: 'No recipient', skipped: true }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${s.resendApiKey}`,
      },
      body: JSON.stringify({
        from: s.resendFromEmail,
        to: recipient,
        subject,
        html: html || undefined,
        text: text || undefined,
        reply_to: replyTo || undefined,
      }),
    })
    if (!res.ok) {
      const errText = await res.text()
      return { ok: false, error: errText }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

// Send a webhook event to Slack (or any incoming webhook URL).
// Accepts a plain text message OR a Slack blocks payload.
export async function sendSlack({ text, blocks } = {}) {
  const s = await getGlobalSettings()
  if (!s.slackWebhookUrl) return { ok: false, error: 'Slack not configured', skipped: true }

  try {
    const res = await fetch(s.slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, blocks }),
    })
    if (!res.ok) return { ok: false, error: await res.text() }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

// Generic webhook fire (used for CRM, WhatsApp, etc.)
export async function fireWebhook(url, payload) {
  if (!url) return { ok: false, error: 'No webhook URL', skipped: true }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) return { ok: false, error: await res.text() }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

// Broadcast a "new contact" event to every configured channel.
export async function notifyNewContact(contact) {
  const s = await getGlobalSettings()
  const brand = s.businessName || 'Your site'

  const subject = `New contact form submission — ${contact.name || 'Visitor'}`
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 560px;">
      <h2 style="color: #3f4e4f;">New contact on ${brand}</h2>
      <p style="color: #2a2622;">Someone just reached out through the website.</p>
      <table style="border-collapse: collapse; width: 100%; margin-top: 16px;">
        <tr><td style="padding: 8px 0; color: #6b5d4e;">Name:</td><td style="padding: 8px 0; color: #2a2622;"><strong>${escape(contact.name || '—')}</strong></td></tr>
        <tr><td style="padding: 8px 0; color: #6b5d4e;">Email:</td><td style="padding: 8px 0; color: #2a2622;"><strong>${escape(contact.email || '—')}</strong></td></tr>
        ${contact.phone ? `<tr><td style="padding: 8px 0; color: #6b5d4e;">Phone:</td><td style="padding: 8px 0; color: #2a2622;"><strong>${escape(contact.phone)}</strong></td></tr>` : ''}
        ${contact.subject ? `<tr><td style="padding: 8px 0; color: #6b5d4e;">Subject:</td><td style="padding: 8px 0; color: #2a2622;"><strong>${escape(contact.subject)}</strong></td></tr>` : ''}
      </table>
      ${contact.message ? `<div style="margin-top: 20px; padding: 16px; background: #f5efe5; border-left: 3px solid #A87E53;"><p style="margin: 0; color: #2a2622; white-space: pre-wrap;">${escape(contact.message)}</p></div>` : ''}
    </div>
  `
  const slackText = `*New contact on ${brand}*\n*From:* ${contact.name || '—'} (${contact.email || '—'})\n${contact.message ? `>${contact.message.split('\n').slice(0, 4).join('\n>')}` : ''}`

  const results = await Promise.all([
    sendEmail({ subject, html, replyTo: contact.email }),
    sendSlack({ text: slackText }),
    fireWebhook(s.crmWebhookUrl, { event: 'new_contact', contact }),
    fireWebhook(s.whatsappBusinessUrl, { event: 'new_contact', contact }),
  ])
  return results
}

function escape(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
