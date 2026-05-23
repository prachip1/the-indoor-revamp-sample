'use client'
import { useEffect, useState, use } from 'react'
import BlogEditor from '../_BlogEditor'

export default function EditBlogPage({ params }) {
  const { id } = use(params)
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/blog/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setPost(data)
        setLoading(false)
      })
  }, [id])

  if (loading) return <p className="text-sm" style={{ color: 'var(--dash-ink-dim)' }}>Loading...</p>
  if (!post || post.error) return <p className="text-sm" style={{ color: '#c1432a' }}>Post not found.</p>

  return <BlogEditor initial={post} />
}
