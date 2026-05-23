'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PageHeader, PrimaryButton, Badge, StatusMessage } from '../_components/ui'

export default function BlogListPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  async function refresh() {
    setLoading(true)
    const res = await fetch('/api/blog')
    setPosts(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleDelete(id, title) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    const res = await fetch(`/api/blog/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setMsg('Post deleted')
      refresh()
    } else {
      setMsg('Failed to delete')
    }
    setTimeout(() => setMsg(''), 3000)
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between mb-2">
        <PageHeader
          title="Blog"
          subtitle="Write, edit, and publish blog posts. Each post gets its own SEO settings and appears in the sitemap automatically."
        />
        <Link href="/admin/blog/new">
          <PrimaryButton>+ New Post</PrimaryButton>
        </Link>
      </div>

      <StatusMessage message={msg} />

      {loading ? (
        <p className="text-sm mt-6" style={{ color: 'var(--dash-ink-dim)' }}>
          Loading...
        </p>
      ) : posts.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center mt-6"
          style={{ background: 'var(--dash-surface)', border: '1px dashed var(--dash-line)' }}
        >
          <p className="text-base mb-2" style={{ color: 'var(--dash-ink)' }}>
            No blog posts yet
          </p>
          <p className="text-sm mb-5" style={{ color: 'var(--dash-ink-dim)' }}>
            Start by writing your first post.
          </p>
          <Link href="/admin/blog/new">
            <PrimaryButton>Write your first post</PrimaryButton>
          </Link>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden mt-6"
          style={{ background: 'var(--dash-surface)', border: '1px solid var(--dash-line)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--dash-line)' }}>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--dash-ink-dim)' }}>Title</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--dash-ink-dim)' }}>Status</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--dash-ink-dim)' }}>Published</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--dash-ink-dim)' }}>Slug</th>
                <th className="text-right px-4 py-3 font-medium" style={{ color: 'var(--dash-ink-dim)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post._id} style={{ borderTop: '1px solid var(--dash-line)' }}>
                  <td className="px-4 py-3" style={{ color: 'var(--dash-ink)' }}>{post.title}</td>
                  <td className="px-4 py-3">
                    <Badge tone={post.status === 'published' ? 'success' : 'warn'}>
                      {post.status === 'published' ? 'Published' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--dash-ink-dim)' }}>
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--dash-accent)' }}>/{post.slug}</td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <Link
                      href={`/admin/blog/${post._id}`}
                      className="text-xs font-medium hover:underline"
                      style={{ color: 'var(--dash-accent)' }}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(post._id, post.title)}
                      className="text-xs font-medium hover:underline"
                      style={{ color: '#c1432a' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
