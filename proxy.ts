import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './lib/supabase/types'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  if (!user) {
    if (path.startsWith('/customer')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (path.startsWith('/admin') && path !== '/admin/login') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return supabaseResponse
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'customer'
  const isProfileIncomplete = profile?.full_name === 'Unknown'

  if (role === 'admin') {
    if (path.startsWith('/customer') || path === '/login' || path === '/admin/login' || path === '/register') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  } else {
    if (path.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/customer/dashboard', request.url))
    }
    if (isProfileIncomplete && path !== '/register') {
      return NextResponse.redirect(new URL('/register', request.url))
    }
    if (!isProfileIncomplete && (path === '/login' || path === '/register' || path === '/admin/login')) {
      return NextResponse.redirect(new URL('/customer/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
