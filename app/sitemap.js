import { connectDB } from '@/lib/mongodb'
import { getGlobalSettings } from '@/lib/settings'
import BlogPost from '@/models/BlogPost'
import Project from '@/models/Project'

export default async function sitemap() {
  const settings = await getGlobalSettings()
  const base = (settings.siteUrl || '').replace(/\/$/, '')
  const now = new Date()

  const staticPages = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/services`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/projects`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
  ]

  let posts = []
  let projects = []
  try {
    await connectDB()
    posts = await BlogPost.find({ status: 'published' }).select('slug updatedAt publishedAt').lean()
    projects = await Project.find({ published: true }).select('_id updatedAt').lean()
  } catch {
    // DB unavailable — return static pages only
  }

  const blogUrls = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: p.updatedAt || p.publishedAt || now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const projectUrls = projects.map((p) => ({
    url: `${base}/projects/${p._id}`,
    lastModified: p.updatedAt || now,
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  return [...staticPages, ...blogUrls, ...projectUrls]
}
