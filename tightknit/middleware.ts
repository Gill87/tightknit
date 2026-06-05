import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const protectedPrefixes = ['/home', '/onboarding', '/ask']
  const authPrefixes = ['/auth/sign-in', '/auth/sign-up', '/auth/forget-password']
  const isProtected = protectedPrefixes.some(p => pathname.startsWith(p))
  const isAuthPage = authPrefixes.some(p => pathname.startsWith(p))
  const isOnboarding = pathname.startsWith('/onboarding')

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }

  // Authenticated users: enforce onboarding gate
  if (user && (isAuthPage || (isProtected && !isOnboarding))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (isAuthPage) {
      return NextResponse.redirect(new URL(profile ? '/home' : '/onboarding/location', request.url))
    }

    if (!profile) {
      return NextResponse.redirect(new URL('/onboarding/location', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
