'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginCustomer(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, message: error.message }
  }

  // Jika admin mencoba login lewat sini, tolak
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()
    
  if (profile?.role === 'admin') {
    await supabase.auth.signOut()
    return { success: false, message: 'Admin harus login lewat halaman khusus admin' }
  }

  return { success: true }
}

export async function registerCustomer(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string
  const instagram = formData.get('instagram') as string
  const tiktok = formData.get('tiktok') as string
  const noSosmed = formData.get('noSosmed') === 'on'

  let finalSosmed = 'tidak_ada'
  if (!noSosmed) {
    if (instagram) finalSosmed = instagram.replace('@', '').trim()
    else if (tiktok) finalSosmed = `tiktok:${tiktok.replace('@', '').trim()}`
  }
  
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone_number: phone,
        instagram_username: finalSosmed,
        role: 'customer'
      }
    }
  })

  if (error) {
    if (error.message.includes('unique constraint') || error.message.toLowerCase().includes('already registered')) {
      return { success: false, message: 'Email atau Nomor HP sudah terdaftar' }
    }
    return { success: false, message: error.message }
  }

  return { success: true }
}

export async function adminLogin(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, message: 'Email atau password salah' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()
    
  if (profile?.role !== 'admin') {
    await supabase.auth.signOut()
    return { success: false, message: 'Email atau password salah' }
  }

  return { success: true, message: 'Login berhasil' }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/login')
}
