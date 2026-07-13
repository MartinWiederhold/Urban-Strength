import { NextResponse } from 'next/server'

// Runs weekly via Vercel Cron. Hits Supabase with a light-weight query so the
// project doesn't get auto-paused on the Free tier (7 days of inactivity).
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return NextResponse.json(
      { ok: false, error: 'Supabase env vars missing' },
      { status: 500 },
    )
  }

  // Verify the request comes from Vercel Cron (optional but nice to have).
  // Vercel sets a bearer token via CRON_SECRET when calling scheduled jobs.
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }
  }

  const started = Date.now()
  try {
    // Cheap read against a public table — enough to reset the inactivity timer.
    const res = await fetch(`${url}/rest/v1/qr_scans?select=id&limit=1`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      cache: 'no-store',
    })

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      supabase: new URL(url).hostname,
      durationMs: Date.now() - started,
      timestamp: new Date().toISOString(),
    })
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: (e as Error).message ?? 'unknown',
        durationMs: Date.now() - started,
      },
      { status: 500 },
    )
  }
}
