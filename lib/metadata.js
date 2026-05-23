// Build a Next 16 metadata object from a PageSeo doc + GlobalSettings fallback.
// Title/description/OG fall back through page → globals → defaults.
export function buildPageMetadata(pageSeo, globalSettings = {}) {
  const brand = globalSettings.businessName || ''
  const tagline = globalSettings.tagline || ''

  const title =
    pageSeo?.title || (pageSeo?.pageName && brand ? pageSeo.pageName : brand) || pageSeo?.pageName || 'Untitled'
  const description = pageSeo?.description || tagline || ''
  const ogTitle = pageSeo?.ogTitle || title
  const ogDescription = pageSeo?.ogDescription || description
  const ogImage = pageSeo?.ogImage || globalSettings.logoUrl || ''
  const canonical = pageSeo?.canonicalUrl || ''
  const indexable = pageSeo?.indexable !== false

  const metadata = {
    title,
    description,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      siteName: brand || undefined,
      type: 'website',
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  }

  if (canonical) {
    metadata.alternates = { canonical }
  }

  if (!indexable) {
    metadata.robots = { index: false, follow: false }
  }

  // Additional meta tags merged into `other`
  if (Array.isArray(pageSeo?.additionalTags) && pageSeo.additionalTags.length > 0) {
    metadata.other = pageSeo.additionalTags.reduce((acc, tag) => {
      if (tag?.name && tag?.content) acc[tag.name] = tag.content
      return acc
    }, {})
  }

  return metadata
}
