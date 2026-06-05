import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Get user to log security event
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Track login event in security_logs
        const { AppLogger } = await import('@/lib/logger')
        const { SecurityEvent } = await import('@/lib/constants/events')

        // We log 'unknown' for IP/UserAgent for now. In a real middleware we can extract headers.
        await AppLogger.trackSecurity(user.id, SecurityEvent.LOGIN_SUCCESS, 'unknown', 'unknown', { provider: 'email' })
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=AuthFailed`)
}
