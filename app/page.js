import HomeClient from './_HomeClient'
import { getPageSeo } from '@/lib/pageSeo'
import { getGlobalSettings } from '@/lib/settings'
import { buildPageMetadata } from '@/lib/metadata'
import PageStructuredData from './_components/PageStructuredData'

export async function generateMetadata() {
  const [pageSeo, settings] = await Promise.all([
    getPageSeo('/'),
    getGlobalSettings(),
  ])
  return buildPageMetadata(pageSeo, settings)
}

export default async function HomePage() {
  const pageSeo = await getPageSeo('/')
  return (
    <>
      <PageStructuredData pageSeo={pageSeo} />
      <HomeClient />
    </>
  )
}
