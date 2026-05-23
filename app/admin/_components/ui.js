'use client'

export const inputCls =
  'w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition-colors'

export const inputStyle = {
  background: 'var(--dash-surface)',
  border: '1px solid var(--dash-line)',
  color: 'var(--dash-ink)',
}

export const inputFocusStyle = {
  borderColor: 'var(--dash-accent)',
}

export function Field({ label, hint, children }) {
  return (
    <div>
      <label
        className="block text-sm font-medium mb-1"
        style={{ color: 'var(--dash-ink)' }}
      >
        {label}
      </label>
      {hint && (
        <p className="text-xs mb-1.5" style={{ color: 'var(--dash-ink-dim)' }}>
          {hint}
        </p>
      )}
      {children}
    </div>
  )
}

export function Input({ ...props }) {
  return <input className={inputCls} style={inputStyle} {...props} />
}

export function Textarea({ ...props }) {
  return <textarea className={inputCls} style={inputStyle} {...props} />
}

export function Select({ children, ...props }) {
  return (
    <select className={inputCls} style={inputStyle} {...props}>
      {children}
    </select>
  )
}

export function Section({ title, subtitle, children }) {
  return (
    <div
      className="rounded-xl p-6"
      style={{
        background: 'var(--dash-surface)',
        border: '1px solid var(--dash-line)',
      }}
    >
      <div className="mb-5">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--dash-cta)' }}>
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs mt-1" style={{ color: 'var(--dash-ink-dim)' }}>
            {subtitle}
          </p>
        )}
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  )
}

export function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl mb-1" style={{ color: 'var(--dash-cta)' }}>
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm" style={{ color: 'var(--dash-ink-dim)' }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

export function PrimaryButton({ children, disabled, ...props }) {
  return (
    <button
      disabled={disabled}
      className="px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
      style={{
        background: 'var(--dash-cta)',
        color: 'var(--dash-bg)',
      }}
      onMouseOver={(e) => {
        if (!disabled) e.currentTarget.style.background = 'var(--dash-cta-hover)'
      }}
      onMouseOut={(e) => {
        if (!disabled) e.currentTarget.style.background = 'var(--dash-cta)'
      }}
      {...props}
    >
      {children}
    </button>
  )
}

export function SecondaryButton({ children, ...props }) {
  return (
    <button
      className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      style={{
        background: 'transparent',
        color: 'var(--dash-accent)',
        border: '1px solid var(--dash-accent)',
      }}
      {...props}
    >
      {children}
    </button>
  )
}

export function DangerButton({ children, ...props }) {
  return (
    <button
      className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      style={{
        background: 'transparent',
        color: '#c1432a',
        border: '1px solid rgba(193, 67, 42, 0.4)',
      }}
      {...props}
    >
      {children}
    </button>
  )
}

export function StatusMessage({ message }) {
  if (!message) return null
  const isSuccess = message.toLowerCase().includes('success') || message.toLowerCase().includes('saved')
  return (
    <p
      className="text-sm"
      style={{
        color: isSuccess ? 'var(--dash-accent-2)' : '#c1432a',
      }}
    >
      {message}
    </p>
  )
}

export function SaveBar({ saving, message }) {
  return (
    <div
      className="sticky bottom-0 -mx-8 px-8 py-4 flex items-center gap-4 border-t"
      style={{
        background: 'var(--dash-bg)',
        borderColor: 'var(--dash-line)',
      }}
    >
      <PrimaryButton type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </PrimaryButton>
      <StatusMessage message={message} />
    </div>
  )
}

export function Badge({ children, tone = 'default' }) {
  const tones = {
    default: { background: 'var(--dash-bg)', color: 'var(--dash-cta)' },
    success: { background: 'rgba(6, 125, 41, 0.12)', color: 'var(--dash-accent-2)' },
    warn: { background: 'rgba(168, 126, 83, 0.15)', color: 'var(--dash-accent)' },
    muted: { background: 'transparent', color: 'var(--dash-ink-dim)' },
  }
  return (
    <span
      className="inline-block text-xs px-2 py-0.5 rounded-full font-medium"
      style={tones[tone] || tones.default}
    >
      {children}
    </span>
  )
}
