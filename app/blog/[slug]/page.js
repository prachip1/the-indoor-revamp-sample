import Link from 'next/link'
import { notFound } from 'next/navigation'
import { connectDB } from '@/lib/mongodb'
import { getGlobalSettings } from '@/lib/settings'
import BlogPost from '@/models/BlogPost'

async function getPost(slug) {
  try {
    await connectDB()
    return await BlogPost.findOne({ slug, status: 'published' }).lean()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Post not found' }

  const settings = await getGlobalSettings()
  const brand = settings.businessName || ''
  const title = post.metaTitle || post.title
  const description = post.metaDescription || post.excerpt || ''
  const image = post.ogImage || post.coverImage || settings.logoUrl || ''

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description,
    image: image || undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: post.author ? { '@type': 'Person', name: post.author } : { '@type': 'Organization', name: brand },
    publisher: brand ? { '@type': 'Organization', name: brand } : undefined,
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: post.author ? [post.author] : undefined,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
    other: {
      'application/ld+json': JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
    },
  }
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const paragraphs = (post.body || '').split(/\n\n+/).filter(Boolean)

  return (
    <main className="min-h-screen" style={{ background: '#fafaf6' }}>
      <article className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <div className="mb-8">
          <Link
            href="/blog"
            className="text-xs uppercase tracking-[0.2em] hover:underline"
            style={{ color: '#A87E53' }}
          >
            ← All Posts
          </Link>
        </div>

        <header className="mb-10">
          {post.tags && post.tags.length > 0 && (
            <p className="text-xs uppercase tracking-[0.22em] mb-4" style={{ color: '#A87E53' }}>
              {post.tags.join(' · ')}
            </p>
          )}
          <h1
            className="text-4xl md:text-5xl leading-tight mb-5"
            style={{ fontFamily: 'var(--font-display)', color: '#2a2622' }}
          >
            {post.title}
          </h1>
          <div className="flex items-center gap-3 text-sm" style={{ color: '#6b5d4e' }}>
            {post.author && <span>{post.author}</span>}
            {post.author && post.publishedAt && <span style={{ color: '#A87E53' }}>·</span>}
            {post.publishedAt && (
              <time dateTime={new Date(post.publishedAt).toISOString()}>
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            )}
          </div>
        </header>

        {post.coverImage && (
          <div className="mb-12 aspect-[16/9] overflow-hidden rounded-xl">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="space-y-6">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-lg leading-relaxed" style={{ color: '#2a2622' }}>
              {p}
            </p>
          ))}
        </div>
      </article>
    </main>
  )
}
