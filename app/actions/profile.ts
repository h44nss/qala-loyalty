'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Harap login' }

  const full_name = formData.get('full_name') as string
  const instagram_username = formData.get('instagram_username') as string

  if (!instagram_username || instagram_username.trim() === '') {
    return { success: false, message: 'Username Instagram wajib diisi' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name, instagram_username: instagram_username.replace('@', '') })
    .eq('id', user.id)

  if (error) return { success: false, message: error.message }

  revalidatePath('/customer/profile')
  return { success: true }
}
