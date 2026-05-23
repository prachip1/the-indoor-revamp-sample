import { unstable_cache, revalidateTag } from 'next/cache'
import { connectDB } from './mongodb'
import Redirect from '@/models/Redirect'

function normalize(path) {
  if (!path) return '/'
  let p = path.trim()
  if (!p.startsWith('/')) p = '/' + p
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1)
  return p
}

export const getRedirectMap = unstable_cache(
  async () => {
    await connectDB()
    const redirects = await Redirect.find({ active: true }).lean()
    const map = {}
    for (const r of redirects) {
      map[normalize(r.sourceUrl)] = {
        target: r.targetUrl,
        status: r.statusCode || 301,
      }
    }
    return map
  },
  ['redirect-map'],
  { revalidate: 60, tags: ['redirects'] }
)

export function bustRedirectsCache() {
  revalidateTag('redirects')
}

export { normalize as normalizePath }
