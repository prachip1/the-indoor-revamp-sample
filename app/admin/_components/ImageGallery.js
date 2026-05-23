'use client'
import { useState, useRef } from 'react'

export default function ImageGallery({
  value = [],
  onChange,
  folder = 'gallery',
  maxImages = 30,
  accept = 'image/png,image/jpeg,image/webp,image/svg+xml,image/gif',
}) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragIndex, setDragIndex] = useState(null)
  const [overIndex, setOverIndex] = useState(null)

  async function uploadFiles(files) {
    setError('')
    const remaining = maxImages - value.length
    if (remaining <= 0) {
      setError(`Limit reached (${maxImages} images).`)
      return
    }
    const toUpload = Array.from(files).slice(0, remaining)
    setUploading(true)
    const newUrls = []
    for (const file of toUpload) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} is over 5 MB and was skipped.`)
        continue
      }
      try {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('folder', folder)
        const res = await fetch('/api/uploads', { method: 'POST', body: fd })
        const data = await res.json()
        if (res.ok) newUrls.push(data.url)
        else setError(data.error || 'One or more uploads failed.')
      } catch {
        setError('Upload failed. Check connection.')
      }
    }
    if (newUrls.length) onChange([...value, ...newUrls])
    setUploading(false)
  }

  function onPick(e) {
    if (e.target.files?.length) uploadFiles(e.target.files)
    e.target.value = ''
  }

  function onDropZone(e) {
    e.preventDefault()
    if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files)
  }

  function removeAt(i) {
    onChange(value.filter((_, idx) => idx !== i))
  }

  function moveItem(from, to) {
    if (from === to || from == null || to == null) return
    const next = [...value]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {value.map((url, i) => (
          <div
            key={i}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => {
              e.preventDefault()
              if (overIndex !== i) setOverIndex(i)
            }}
            onDragLeave={() => setOverIndex(null)}
            onDrop={(e) => {
              e.preventDefault()
              moveItem(dragIndex, i)
              setDragIndex(null)
              setOverIndex(null)
            }}
            onDragEnd={() => {
              setDragIndex(null)
              setOverIndex(null)
            }}
            className="relative rounded-lg overflow-hidden group cursor-move"
            style={{
              aspectRatio: '1 / 1',
              background: 'var(--dash-surface)',
              border: `1px solid ${overIndex === i ? 'var(--dash-accent)' : 'var(--dash-line)'}`,
              boxShadow: dragIndex === i ? '0 0 0 2px var(--dash-accent)' : 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
          >
            <img
              src={url}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                pointerEvents: 'none',
              }}
            />
            {i === 0 && (
              <span
                className="absolute top-1.5 left-1.5 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
                style={{
                  background: 'rgba(0,0,0,0.65)',
                  color: 'white',
                  letterSpacing: '0.05em',
                }}
              >
                Cover
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeAt(i)
              }}
              className="absolute top-1.5 right-1.5 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                width: 22,
                height: 22,
                fontSize: 14,
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Remove image"
            >
              ×
            </button>
          </div>
        ))}

        {value.length < maxImages && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDropZone}
            disabled={uploading}
            className="rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
            style={{
              aspectRatio: '1 / 1',
              background: 'var(--dash-surface)',
              border: '2px dashed var(--dash-line)',
              color: 'var(--dash-ink-dim)',
            }}
          >
            {uploading ? (
              <span className="text-xs">Uploading…</span>
            ) : (
              <>
                <span style={{ fontSize: 24, color: 'var(--dash-accent)' }}>＋</span>
                <span className="text-xs font-medium">Add images</span>
                <span className="text-[10px]">Click or drop</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs" style={{ color: 'var(--dash-ink-dim)' }}>
          {value.length} of {maxImages} image{value.length === 1 ? '' : 's'}
          {value.length > 1 ? ' · drag to reorder · first image is the cover' : ''}
        </p>
      </div>

      {error && (
        <p className="text-xs mt-2" style={{ color: '#c1432a' }}>
          {error}
        </p>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={onPick}
      />
    </div>
  )
}
