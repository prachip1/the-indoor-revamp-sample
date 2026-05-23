// Server-side GA4 events via Measurement Protocol.
// Bypasses ad-blockers and works without the client-side gtag script being loaded.
//
// Usage from a route handler:
//   import { sendServerEvent } from '@/lib/ga4'
//   import { cookies } from 'next/headers'
//   const clientId = await getOrCreateClientId()
//   await sendServerEvent({ name: 'generate_lead', params: { value: 0 }, clientId })
//
// Known GA4 recommended event names: sign_up, login, generate_lead, purchase, begin_checkout, page_view.
// See https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference/events

import { cookies } from 'next/headers'
import { getGlobalSettings } from '@/lib/settings'

const MP_ENDPOINT = 'https://www.google-analytics.com/mp/collect'

export async function sendServerEvent({ name, params = {}, clientId, userId }) {
  const settings = await getGlobalSettings()
  const measurementId = settings?.ga4MeasurementId
  const apiSecret = settings?.ga4ApiSecret

  if (!measurementId || !apiSecret) return { skipped: true, reason: 'ga4-not-configured' }
  if (!name) return { skipped: true, reason: 'missing-event-name' }

  const cid = clientId || (await getOrCreateClientId())

  const payload = {
    client_id: cid,
    ...(userId ? { user_id: userId } : {}),
    events: [{ name, params }],
  }

  try {
    const url = `${MP_ENDPOINT}?measurement_id=${encodeURIComponent(
      measurementId
    )}&api_secret=${encodeURIComponent(apiSecret)}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })
    return { ok: res.ok, status: res.status }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

// Stable per-visitor ID stored in our own cookie. If the GA4 client script has
// already set _ga, we reuse its client_id so client + server events stitch in
// the same GA4 session. Otherwise we mint a UUID and persist it.
export async function getOrCreateClientId() {
  const store = await cookies()
  const ga = store.get('_ga')?.value
  if (ga) {
    const parts = ga.split('.')
    if (parts.length >= 4) return `${parts[2]}.${parts[3]}`
  }
  const existing = store.get('ga4_cid')?.value
  if (existing) return existing
  const fresh = `${randomNum()}.${Math.floor(Date.now() / 1000)}`
  store.set('ga4_cid', fresh, {
    maxAge: 60 * 60 * 24 * 365 * 2,
    path: '/',
    sameSite: 'lax',
  })
  return fresh
}

function randomNum() {
  // Match GA's 10-digit numeric format.
  return Math.floor(1_000_000_000 + Math.random() * 9_000_000_000).toString()
}
