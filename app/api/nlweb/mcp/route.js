import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getGlobalSettings } from '@/lib/settings'
import BlogPost from '@/models/BlogPost'
import Project from '@/models/Project'
import Service from '@/models/Service'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const s = await getGlobalSettings()
  if (s.nlwebEnabled === false) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const base = (s.siteUrl || '').replace(/\/$/, '')
  const url = new URL(request.url)
  const tool = url.searchParams.get('tool')

  let posts = []
  let projects = []
  let services = []
  try {
    await connectDB()
    posts = await BlogPost.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .select('slug title excerpt body coverImage tags author publishedAt')
      .lean()
    projects = await Project.find({ published: true })
      .sort({ order: 1, createdAt: -1 })
      .select('_id title description tags images')
      .lean()
    services = await Service.find({ published: true })
      .sort({ order: 1 })
      .select('name description')
      .lean()
  } catch {
    // DB unavailable — continue with empty arrays
  }

  const business = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: s.businessName || undefined,
    description: s.tagline || undefined,
    url: base || undefined,
    email: s.email || undefined,
    telephone: s.phone || undefined,
    image: s.logoUrl || undefined,
    address: s.address
      ? { '@type': 'PostalAddress', streetAddress: s.address, addressRegion: s.region }
      : undefined,
  }

  const postsData = posts.map((p) => ({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: p.title,
    description: p.excerpt,
    articleBody: p.body,
    image: p.coverImage || undefined,
    keywords: p.tags?.join(', '),
    author: p.author ? { '@type': 'Person', name: p.author } : undefined,
    datePublished: p.publishedAt,
    url: base ? `${base}/blog/${p.slug}` : undefined,
  }))

  const projectsData = projects.map((p) => ({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: p.title,
    description: p.description,
    image: p.images?.[0] || undefined,
    keywords: p.tags?.join(', '),
    url: base ? `${base}/projects/${p._id}` : undefined,
  }))

  const servicesData = services.map((svc) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: svc.name,
    description: svc.description,
    provider: business.name ? { '@type': 'LocalBusiness', name: business.name } : undefined,
  }))

  // Tool-style filtering: ?tool=blog | services | projects | business
  if (tool === 'blog') return NextResponse.json({ items: postsData })
  if (tool === 'projects') return NextResponse.json({ items: projectsData })
  if (tool === 'services') return NextResponse.json({ items: servicesData })
  if (tool === 'business') return NextResponse.json(business)

  // Default: full machine-readable corpus
  return NextResponse.json({
    protocol: 'nlweb-simplified',
    version: '0.1',
    description:
      'Structured content corpus for AI agents. Use ?tool=blog|projects|services|business to filter.',
    business,
    services: servicesData,
    projects: projectsData,
    blog: postsData,
  })
}
