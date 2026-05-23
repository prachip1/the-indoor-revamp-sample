'use client'
import { useState, useRef } from 'react'

export default function ImageUpload({
  value,
  onChange,
  folder = 'uploads',
  accept = 'image/png,image/jpeg,image/webp,image/svg+xml,image/gif,image/x-icon',
  aspect = 'auto', // 'square' | 'wide' | 'auto'
  emptyLabel = 'Upload an image',
  emptyHelp = 'PNG, JPG, WebP, SVG, GIF up to 5 MB',
}) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [showUrlField, setShowUrlField] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const aspectStyle =
    aspect === 'square'
      ? { aspectRatio: '1 / 1' }
      : aspect === 'wide'
      ? { aspectRatio: '16 / 9' }
      : { minHeight: 160 }

  async function uploadFile(file) {
    setError('')
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Max 5 MB.')
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', folder)
      const res = await fetch('/api/uploads', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Upload failed.')
      } else {
        onChange(data.url)
      }
    } catch {
      setError('Upload failed. Check your connection and try again.')
    } finally {
      setUploading(false)
    }
  }

  function onPick(e) {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    e.target.value = ''
  }

  function onDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  function clear() {
    onChange('')
    setError('')
  }

  function applyUrl() {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    onChange(trimmed)
    setUrlInput('')
    setShowUrlField(false)
  }

  if (value) {
    return (
      <div>
        <div
          className="rounded-xl overflow-hidden relative group"
          style={{
            background: 'var(--dash-surface)',
            border: '1px solid var(--dash-line)',
            ...aspectStyle,
          }}
        >
          <img
            src={value}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
          {uploading && <UploadingOverlay />}
        </div>
        <div className="mt-2 flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="text-xs font-medium px-3 py-1.5 rounded-md cursor-pointer transition-colors"
            style={{
              background: 'var(--dash-cta)',
              color: 'white',
              opacity: uploading ? 0.6 : 1,
            }}
          >
            {uploading ? 'Uploading…' : 'Replace'}
          </button>
          <button
            type="button"
            onClick={clear}
            className="text-xs font-medium px-3 py-1.5 rounded-md cursor-pointer transition-colors"
            style={{
              background: 'transparent',
              border: '1px solid var(--dash-line)',
              color: '#c1432a',
            }}
          >
            Remove
          </button>
          <span
            className="text-xs truncate flex-1"
            style={{ color: 'var(--dash-ink-dim)', fontFamily: 'ui-monospace, monospace' }}
            title={value}
          >
            {value}
          </span>
        </div>
        {error && (
          <p className="text-xs mt-2" style={{ color: '#c1432a' }}>
            {error}
          </p>
        )}
        <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={onPick} />
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        disabled={uploading}
        className="w-full rounded-xl text-left transition-all cursor-pointer p-6 flex flex-col items-center justify-center gap-2"
        style={{
          background: dragOver ? 'rgba(168, 126, 83, 0.08)' : 'var(--dash-surface)',
          border: `2px dashed ${dragOver ? 'var(--dash-accent)' : 'var(--dash-line)'}`,
          ...aspectStyle,
        }}
      >
        {uploading ? (
          <span className="text-sm" style={{ color: 'var(--dash-ink)' }}>
            Uploading…
          </span>
        ) : (
          <>
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 40,
                height: 40,
                background: 'var(--dash-bg)',
                color: 'var(--dash-accent)',
                fontSize: 20,
              }}
            >
              ⬆
            </div>
            <div className="text-sm font-medium" style={{ color: 'var(--dash-ink)' }}>
              {emptyLabel}
            </div>
            <div className="text-xs" style={{ color: 'var(--dash-ink-dim)' }}>
              Click to choose, or drag and drop
            </div>
            <div className="text-[11px] mt-1" style={{ color: 'var(--dash-ink-dim)' }}>
              {emptyHelp}
            </div>
          </>
        )}
      </button>

      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setShowUrlField((v) => !v)}
          className="text-xs hover:underline cursor-pointer"
          style={{ color: 'var(--dash-accent)' }}
        >
          {showUrlField ? '× Cancel URL' : 'Or paste a URL'}
        </button>
      </div>

      {showUrlField && (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://..."
            className="flex-1 px-3 py-2 rounded-lg text-sm"
            style={{
              background: 'var(--dash-surface)',
              border: '1px solid var(--dash-line)',
              color: 'var(--dash-ink)',
            }}
          />
          <button
            type="button"
            onClick={applyUrl}
            className="text-xs font-medium px-3 py-2 rounded-md cursor-pointer"
            style={{ background: 'var(--dash-cta)', color: 'white' }}
          >
            Use URL
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs mt-2" style={{ color: '#c1432a' }}>
          {error}
        </p>
      )}

      <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={onPick} />
    </div>
  )
}

function UploadingOverlay() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: 13 }}
    >
      Uploading…
    </div>
  )
}
