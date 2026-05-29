import ServicesClient from './_ServicesClient'
import { getPageSeo } from '@/lib/pageSeo'
import { getGlobalSettings } from '@/lib/settings'
import { buildPageMetadata } from '@/lib/metadata'
import PageStructuredData from '../_components/PageStructuredData'

export async function generateMetadata() {
  const [pageSeo, settings] = await Promise.all([
    getPageSeo('/services'),
    getGlobalSettings(),
  ])
  return buildPageMetadata(pageSeo, settings)
}

export default async function ServicesPage() {
  const pageSeo = await getPageSeo('/services')
  return (
    <>
      <PageStructuredData pageSeo={pageSeo} />
      <ServicesClient />
    </>
  )
}
