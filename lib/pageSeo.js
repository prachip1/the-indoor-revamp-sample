import { cache } from 'react'
import { connectDB } from './mongodb'
import PageSeo from '@/models/PageSeo'

// The pages we know about by default. Seeded into the DB once so the DM
// can edit them from /admin/seo. Adding new entries here on next call also
// seeds them in (one-time per row).
const DEFAULT_PAGES = [
  { pagePath: '/', pageName: 'Home', isSystem: true, order: 1 },
  { pagePath: '/blog', pageName: 'Blog', isSystem: true, order: 2 },
  { pagePath: '/about', pageName: 'About', isSystem: false, order: 3 },
  { pagePath: '/services', pageName: 'Services', isSystem: false, order: 4 },
  { pagePath: '/case-studies', pageName: 'Case Studies', isSystem: false, order: 5 },
  { pagePath: '/projects', pageName: 'Projects', isSystem: false, order: 6 },
  { pagePath: '/contact', pageName: 'Contact', isSystem: false, order: 7 },
]

export async function ensureDefaultPages() {
  await connectDB()
  for (const p of DEFAULT_PAGES) {
    await PageSeo.updateOne(
      { pagePath: p.pagePath },
      { $setOnInsert: p },
      { upsert: true }
    )
  }
}

export const getPageSeo = cache(async (pagePath) => {
  try {
    await connectDB()
    return await PageSeo.findOne({ pagePath }).lean()
  } catch {
    return null
  }
})

export async function listAllPageSeo() {
  try {
    await ensureDefaultPages()
    return await PageSeo.find().sort({ order: 1, pageName: 1 }).lean()
  } catch {
    return []
  }
}
