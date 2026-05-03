import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const BOT_UA_REGEX = /bot|crawler|spider|crawling|googlebot|bingbot|yandex|duckduckbot|slurp|baiduspider|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|applebot|petalbot|ahrefsbot|semrushbot|mj12bot|pingdom|uptimerobot|lighthouse|chrome-lighthouse|gtmetrix|pagespeed/i

function isExcludedFromGeo(pathname: string): boolean {
  return (
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/qrcode') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/og-image') ||
    pathname.includes('favicon') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/blocked'
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!isExcludedFromGeo(pathname)) {
    const country =
      request.headers.get('x-country') ||
      request.headers.get('x-nf-country') ||
      ''
    const userAgent = request.headers.get('user-agent') || ''
    const isBot = BOT_UA_REGEX.test(userAgent)
    // Empty country header => localhost / dev / unknown infrastructure → allow.
    const isSwissOrUnknown = country === '' || country === 'CH'

    if (!isBot && !isSwissOrUnknown) {
      const url = request.nextUrl.clone()
      url.pathname = '/blocked'
      return NextResponse.rewrite(url)
    }
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
    return await updateSession(request)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Run on every request except Next.js build output and image optimizer.
     * Other static assets are short-circuited inside the middleware via
     * isExcludedFromGeo.
     */
    '/((?!_next/static|_next/image).*)',
  ],
}
