import AboutClient from './_AboutClient'
import { getPageSeo } from '@/lib/pageSeo'
import { getGlobalSettings } from '@/lib/settings'
import { buildPageMetadata } from '@/lib/metadata'
import PageStructuredData from '../_components/PageStructuredData'

export async function generateMetadata() {
  const [pageSeo, settings] = await Promise.all([
    getPageSeo('/about'),
    getGlobalSettings(),
  ])
  return buildPageMetadata(pageSeo, settings)
}

export default async function AboutPage() {
  const pageSeo = await getPageSeo('/about')
  return (
    <>
      <PageStructuredData pageSeo={pageSeo} />
      <AboutClient />
    </>
  )
}
