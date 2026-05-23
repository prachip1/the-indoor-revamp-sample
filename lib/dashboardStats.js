import { connectDB } from './mongodb'
import { getGlobalSettings } from './settings'
import ContactSubmission from '@/models/ContactSubmission'
import BlogPost from '@/models/BlogPost'
import Project from '@/models/Project'
import Service from '@/models/Service'
import Redirect from '@/models/Redirect'
import PageSeo from '@/models/PageSeo'
import SiteContent from '@/models/SiteContent'
import ConsentLog from '@/models/ConsentLog'

const MS_PER_DAY = 1000 * 60 * 60 * 24

function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

// Returns an array of `days` numbers, oldest -> newest.
function dailySeries(items, days = 30) {
  const counts = Array(days).fill(0)
  const today = startOfDay(new Date()).getTime()
  for (const item of items) {
    const created = startOfDay(item.createdAt).getTime()
    const ago = Math.floor((today - created) / MS_PER_DAY)
    if (ago >= 0 && ago < days) counts[days - 1 - ago] += 1
  }
  return counts
}

function rangeCount(items, daysStart, daysEnd) {
  const now = Date.now()
  let n = 0
  for (const item of items) {
    const ago = (now - new Date(item.createdAt).getTime()) / MS_PER_DAY
    if (ago >= daysStart && ago < daysEnd) n++
  }
  return n
}

export function deltaPercent(current, prior) {
  if (!prior) return current > 0 ? 100 : 0
  return Math.round(((current - prior) / prior) * 100)
}

function todayCount(items) {
  const today = startOfDay(new Date()).getTime()
  return items.filter((i) => startOfDay(i.createdAt).getTime() === today).length
}

function yesterdayCount(items) {
  const yesterday = startOfDay(new Date()).getTime() - MS_PER_DAY
  return items.filter((i) => startOfDay(i.createdAt).getTime() === yesterday).length
}

export async function getDashboardStats() {
  try {
    await connectDB()

    const sixtyDaysAgo = new Date(Date.now() - 60 * MS_PER_DAY)

    const [
      leadsRecent,
      postsRecent,
      blogTotal,
      blogPublished,
      blogDrafts,
      projectsCount,
      servicesCount,
      redirectsCount,
      pageSeoCount,
      siteContentCount,
      consentCount,
      inboxUnread,
      inboxTotal,
      settings,
    ] = await Promise.all([
      ContactSubmission.find({ createdAt: { $gte: sixtyDaysAgo } }).select('createdAt').lean(),
      BlogPost.find({ createdAt: { $gte: sixtyDaysAgo } }).select('createdAt').lean(),
      BlogPost.countDocuments(),
      BlogPost.countDocuments({ status: 'published' }),
      BlogPost.countDocuments({ status: 'draft' }),
      Project.countDocuments(),
      Service.countDocuments(),
      Redirect.countDocuments(),
      PageSeo.countDocuments(),
      SiteContent.countDocuments(),
      ConsentLog.countDocuments(),
      ContactSubmission.countDocuments({ read: false }),
      ContactSubmission.countDocuments(),
      getGlobalSettings(),
    ])

    const analyticsFields = [
      'ga4MeasurementId',
      'gtmContainerId',
      'metaPixelId',
      'googleAdsId',
      'plausibleDomain',
      'vercelAnalyticsEnabled',
      'googleVerificationId',
      'bingVerificationId',
    ]
    const connectedProviders = analyticsFields.filter((f) => {
      const v = settings?.[f]
      return typeof v === 'boolean' ? v : !!(v || '').toString().trim()
    }).length

    return {
      leads: {
        current: rangeCount(leadsRecent, 0, 30),
        prior: rangeCount(leadsRecent, 30, 60),
        today: todayCount(leadsRecent),
        yesterday: yesterdayCount(leadsRecent),
        sparkline: dailySeries(leadsRecent, 30),
      },
      posts: {
        current: rangeCount(postsRecent, 0, 30),
        prior: rangeCount(postsRecent, 30, 60),
        today: todayCount(postsRecent),
        yesterday: yesterdayCount(postsRecent),
        sparkline: dailySeries(postsRecent, 30),
      },
      counts: {
        blog: { total: blogTotal, published: blogPublished, drafts: blogDrafts },
        projects: projectsCount,
        services: servicesCount,
        redirects: redirectsCount,
        pageSeo: pageSeoCount,
        siteContent: siteContentCount,
        consents: consentCount,
        inbox: { unread: inboxUnread, total: inboxTotal },
        connectedProviders,
        totalProviders: analyticsFields.length,
      },
      settings: {
        ga4Configured: !!settings?.ga4MeasurementId,
        plausibleConfigured: !!settings?.plausibleDomain,
        vercelConfigured: !!settings?.vercelAnalyticsEnabled,
        plausibleDomain: settings?.plausibleDomain || '',
      },
    }
  } catch {
    return null
  }
}

export function pickAnalyticsLink(settings) {
  if (settings?.ga4Configured) return { href: 'https://analytics.google.com', label: 'Open Google Analytics' }
  if (settings?.plausibleConfigured)
    return { href: `https://plausible.io/${settings.plausibleDomain}`, label: 'Open Plausible' }
  if (settings?.vercelConfigured) return { href: 'https://vercel.com/dashboard/analytics', label: 'Open Vercel Analytics' }
  return { href: '/admin/site-verification', label: 'Connect analytics' }
}
