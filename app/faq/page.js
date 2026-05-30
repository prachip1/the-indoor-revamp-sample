import FaqClient from './_FaqClient'
import { getPageSeo } from '@/lib/pageSeo'
import { getGlobalSettings } from '@/lib/settings'
import { buildPageMetadata } from '@/lib/metadata'
import PageStructuredData from '../_components/PageStructuredData'

export async function generateMetadata() {
  const [pageSeo, settings] = await Promise.all([
    getPageSeo('/faq'),
    getGlobalSettings(),
  ])
  return buildPageMetadata(pageSeo, settings)
}

export default async function FaqPage() {
  const pageSeo = await getPageSeo('/faq')
  return (
    <>
      <PageStructuredData pageSeo={pageSeo} />
      <FaqClient />
    </>
  )
}
