import CaseStudiesClient from './_CaseStudiesClient'
import { getPageSeo } from '@/lib/pageSeo'
import { getGlobalSettings } from '@/lib/settings'
import { buildPageMetadata } from '@/lib/metadata'
import PageStructuredData from '../_components/PageStructuredData'

export async function generateMetadata() {
  const [pageSeo, settings] = await Promise.all([
    getPageSeo('/case-studies'),
    getGlobalSettings(),
  ])
  return buildPageMetadata(pageSeo, settings)
}

export default async function CaseStudiesPage() {
  const pageSeo = await getPageSeo('/case-studies')
  return (
    <>
      <PageStructuredData pageSeo={pageSeo} />
      <CaseStudiesClient />
    </>
  )
}
