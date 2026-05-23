import Link from 'next/link'
import { connectDB } from '@/lib/mongodb'
import { getGlobalSettings } from '@/lib/settings'
import { getPageSeo } from '@/lib/pageSeo'
import { buildPageMetadata } from '@/lib/metadata'
import PageStructuredData from '../_components/PageStructuredData'
import BlogPost from '@/models/BlogPost'

export async function generateMetadata() {
  const [pageSeo, settings] = await Promise.all([
    getPageSeo('/blog'),
    getGlobalSettings(),
  ])
  const fallback = {
    pageName: 'Blog',
    description: settings.tagline
      ? `Design notes from ${settings.businessName || 'our studio'}.`
      : '',
  }
  return buildPageMetadata(pageSeo || fallback, settings)
}

async function getPosts() {
  try {
    await connectDB()
    return await BlogPost.find({ status: 'published' })
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean()
  } catch {
    return []
  }
}

export default async function BlogIndexPage() {
  const [posts, settings, pageSeo] = await Promise.all([
    getPosts(),
    getGlobalSettings(),
    getPageSeo('/blog'),
  ])
  const brand = settings.businessName || 'Our'

  return (
    <main className="min-h-screen" style={{ background: '#fafaf6' }}>
      <PageStructuredData pageSeo={pageSeo} />
      <div className="max-w-5xl mx-auto px-6 py-20">
        <header className="mb-14">
          <p
            className="text-xs uppercase tracking-[0.22em] mb-3"
            style={{ color: '#A87E53' }}
          >
            Journal
          </p>
          <h1 className="text-5xl md:text-6xl mb-4" style={{ fontFamily: 'var(--font-display)', color: '#2a2622' }}>
            {brand} Blog
          </h1>
          <p className="text-base max-w-xl" style={{ color: '#6b5d4e' }}>
            Design notes, project highlights, and the thinking behind our work.
          </p>
        </header>

        {posts.length === 0 ? (
          <p className="text-sm" style={{ color: '#6b5d4e' }}>
            No posts yet. Check back soon.
          </p>
        ) : (
          <ul className="space-y-12">
            {posts.map((post) => (
              <li key={post._id.toString()} className="group">
                <Link href={`/blog/${post.slug}`} className="grid md:grid-cols-3 gap-6">
                  {post.coverImage ? (
                    <div className="md:col-span-1 aspect-[4/3] overflow-hidden rounded-lg bg-stone-100">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="md:col-span-1 aspect-[4/3] rounded-lg bg-stone-100" />
                  )}
                  <div className="md:col-span-2 flex flex-col justify-center">
                    <p className="text-xs uppercase tracking-[0.18em] mb-2" style={{ color: '#A87E53' }}>
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                      {post.tags && post.tags.length > 0 && ` · ${post.tags[0]}`}
                    </p>
                    <h2
                      className="text-3xl mb-3 transition-colors"
                      style={{ fontFamily: 'var(--font-display)', color: '#2a2622' }}
                    >
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-base" style={{ color: '#6b5d4e' }}>
                        {post.excerpt}
                      </p>
                    )}
                    <p
                      className="text-xs uppercase tracking-[0.2em] mt-4"
                      style={{ color: '#3f4e4f' }}
                    >
                      Read more →
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
