'use client'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'cookie-consent-v1'

function getVisitorId() {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('visitor-id')
  if (!id) {
    id = 'v_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('visitor-id', id)
  }
  return id
}

export default function CookieConsent() {
  const [show, setShow] = useState(false)
  const [customizing, setCustomizing] = useState(false)
  const [prefs, setPrefs] = useState({
    essential: true,
    analytics: false,
    marketing: false,
    preferences: false,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const existing = localStorage.getItem(STORAGE_KEY)
    if (!existing) setShow(true)
  }, [])

  async function recordChoice(choice, categories) {
    try {
      await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId: getVisitorId(),
          choice,
          categories,
          pageUrl: window.location.href,
        }),
      })
    } catch {}
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, categories, at: new Date().toISOString() }))
    setShow(false)
  }

  function acceptAll() {
    const allOn = { essential: true, analytics: true, marketing: true, preferences: true }
    recordChoice('accept-all', allOn)
  }

  function rejectNonEssential() {
    const onlyEssential = { essential: true, analytics: false, marketing: false, preferences: false }
    recordChoice('reject-non-essential', onlyEssential)
  }

  function saveCustom() {
    recordChoice('custom', prefs)
  }

  if (!show) return null

  return (
    <div
      className="cookie-banner fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-[10000] rounded-xl shadow-2xl"
      style={{
        background: '#f1e6d7',
        border: '1px solid #A87E53',
        color: '#2a2622',
        fontFamily: 'var(--font-body)',
      }}
    >
      <div className="p-5">
        <p className="text-sm leading-relaxed">
          We use cookies to make this site work, understand how visitors use it, and improve your experience. You can accept all, reject non-essential, or choose which categories to allow.
        </p>

        {customizing && (
          <div className="mt-4 space-y-2 text-sm">
            <label className="flex items-center justify-between cursor-not-allowed opacity-70">
              <span>Essential (required)</span>
              <input type="checkbox" checked readOnly />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span>Analytics</span>
              <input
                type="checkbox"
                checked={prefs.analytics}
                onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span>Marketing</span>
              <input
                type="checkbox"
                checked={prefs.marketing}
                onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })}
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span>Preferences</span>
              <input
                type="checkbox"
                checked={prefs.preferences}
                onChange={(e) => setPrefs({ ...prefs, preferences: e.target.checked })}
              />
            </label>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={acceptAll}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ background: '#3f4e4f', color: '#f1e6d7' }}
          >
            Accept all
          </button>
          <button
            onClick={rejectNonEssential}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ background: 'transparent', color: '#3f4e4f', border: '1px solid #3f4e4f' }}
          >
            Reject non-essential
          </button>
          {customizing ? (
            <button
              onClick={saveCustom}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ background: '#A87E53', color: '#f1e6d7' }}
            >
              Save preferences
            </button>
          ) : (
            <button
              onClick={() => setCustomizing(true)}
              className="px-2 py-2 text-sm font-medium underline transition-colors"
              style={{ color: '#A87E53' }}
            >
              Customize
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
