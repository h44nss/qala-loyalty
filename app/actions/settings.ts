'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateSettings(formData: FormData) {
  const supabase = await createClient()
  
  const target = formData.get('stamp_target') as string
  const expiration = formData.get('qr_expiration_seconds') as string

  if (target) {
    await supabase.from('settings').update({ value: target }).eq('key', 'stamp_target')
  }
  if (expiration) {
    await supabase.from('settings').update({ value: expiration }).eq('key', 'qr_expiration_seconds')
  }

  revalidatePath('/admin/settings')
  return { success: true, message: 'Pengaturan berhasil disimpan' }
}
