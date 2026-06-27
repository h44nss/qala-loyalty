import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (error) {
              // Ignore
            }
          }
        }
      }
    )
    
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Setelah login google, kita cek apakah profile sudah lengkap (ada nomor HP).
  // Cek ini akan ditangani oleh middleware atau saat render dashboard, 
  // tapi untuk aman kita redirect ke customer/dashboard dulu (yang nanti bisa redirect ke complete-profile jika perlu)
  return NextResponse.redirect(`${origin}/customer/dashboard`)
}
