'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function claimStampToken(token_code: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, message: 'Harap login' }

  // RPC claim_stamp_token returns jsonb: { success, message, new_balance }
  const { data, error } = await supabase.rpc('claim_stamp_token', {
    p_customer_id: user.id,
    p_token_code: token_code
  })

  if (error) return { success: false, message: error.message }

  // data is now typed correctly as { success, message, new_balance }
  if (!data?.success) {
    return { success: false, message: data?.message || 'QR tidak valid' }
  }

  revalidatePath('/customer/dashboard')
  revalidatePath('/customer/history')
  revalidatePath('/customer/rewards')
  return { success: true, newBalance: data.new_balance }
}

export async function generateStampToken(amount: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, message: 'Harap login sebagai admin' }

  const { data, error } = await supabase.rpc('generate_stamp_token', {
    p_admin_id: user.id,
    p_stamp_amount: amount
  })

  if (error) return { success: false, message: error.message }

  return { success: true, tokens: data }
}
