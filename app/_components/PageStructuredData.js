// Server component that injects a JSON-LD <script> for the given PageSeo doc.
// Use inside a server page.js to enable per-page structured data managed
// from the admin dashboard.
export default function PageStructuredData({ pageSeo }) {
  if (!pageSeo?.structuredData) return null
  const json = String(pageSeo.structuredData).trim()
  if (!json) return null

  // Escape `<` to defeat any HTML injection through the JSON body.
  const safe = json.replace(/</g, '\\u003c')

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  )
}
