import { getGlobalSettings } from '@/lib/settings'

export default async function robots() {
  const settings = await getGlobalSettings()
  const base = (settings.siteUrl || '').replace(/\/$/, '')

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: base ? `${base}/sitemap.xml` : undefined,
  }
}
