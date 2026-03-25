import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  // Only run middleware on protected routes — avoids executing auth checks
  // on every static page, API route, and public asset request.
  matcher: ['/admin/:path*', '/dashboard/:path*'],
}
