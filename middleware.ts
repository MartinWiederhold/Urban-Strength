import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Auth session refresh only for protected areas.
  if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
    return await updateSession(request)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Run on every request except Next.js build output and image optimizer.
     */
    '/((?!_next/static|_next/image).*)',
  ],
}
