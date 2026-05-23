import { connectDB } from '@/lib/mongodb'
import { getGlobalSettings } from '@/lib/settings'
import BlogPost from '@/models/BlogPost'
import Project from '@/models/Project'
import Service from '@/models/Service'

export const dynamic = 'force-dynamic'

export async function GET() {
  const s = await getGlobalSettings()
  if (s.llmsTxtEnabled === false) {
    return new Response('Not found', { status: 404 })
  }
  const brand = s.businessName || 'Our Studio'
  const tagline = s.tagline || ''
  const base = (s.siteUrl || '').replace(/\/$/, '')

  let posts = []
  let projects = []
  let services = []
  try {
    await connectDB()
    posts = await BlogPost.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(20)
      .select('slug title excerpt')
      .lean()
    projects = await Project.find({ published: true })
      .sort({ order: 1, createdAt: -1 })
      .limit(10)
      .select('_id title description')
      .lean()
    services = await Service.find({ published: true })
      .sort({ order: 1 })
      .select('name description')
      .lean()
  } catch {
    // DB unavailable — return minimal llms.txt
  }

  const lines = []
  lines.push(`# ${brand}`)
  lines.push('')
  if (tagline) {
    lines.push(`> ${tagline}`)
    lines.push('')
  }

  if (s.address || s.email || s.phone) {
    lines.push('## Contact')
    if (s.address) lines.push(`- Address: ${s.address.replace(/\n/g, ', ')}`)
    if (s.email) lines.push(`- Email: ${s.email}`)
    if (s.phone) lines.push(`- Phone: ${s.phone}`)
    lines.push('')
  }

  if (services.length > 0) {
    lines.push('## Services')
    for (const svc of services) {
      const desc = svc.description ? `: ${svc.description}` : ''
      lines.push(`- **${svc.name}**${desc}`)
    }
    lines.push('')
  }

  lines.push('## Key Pages')
  lines.push(`- [Home](${base}/): The main landing page`)
  lines.push(`- [About](${base}/about): About ${brand}`)
  lines.push(`- [Services](${base}/services): What we offer`)
  lines.push(`- [Projects](${base}/projects): Portfolio of completed work`)
  lines.push(`- [Blog](${base}/blog): Articles and insights`)
  lines.push(`- [Contact](${base}/contact): Get in touch`)
  lines.push('')

  if (projects.length > 0) {
    lines.push('## Featured Projects')
    for (const p of projects) {
      const url = `${base}/projects/${p._id}`
      const desc = p.description ? `: ${p.description.slice(0, 140)}` : ''
      lines.push(`- [${p.title}](${url})${desc}`)
    }
    lines.push('')
  }

  if (posts.length > 0) {
    lines.push('## Recent Articles')
    for (const post of posts) {
      const url = `${base}/blog/${post.slug}`
      const desc = post.excerpt ? `: ${post.excerpt.slice(0, 140)}` : ''
      lines.push(`- [${post.title}](${url})${desc}`)
    }
    lines.push('')
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
