const faviconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#111111"/>
  <circle cx="32" cy="32" r="16" fill="none" stroke="#fafafa" stroke-width="4"/>
  <circle cx="32" cy="32" r="4" fill="#fafafa"/>
  <path d="M50 14 43 21" stroke="#fafafa" stroke-width="4" stroke-linecap="round"/>
</svg>
`

export const dynamic = 'force-static'

export function GET() {
  return new Response(faviconSvg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}