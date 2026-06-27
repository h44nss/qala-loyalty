'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function redeemRewardAction(customerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, message: 'Harap login' }

  // RPC redeem_reward returns jsonb: { success, message, new_balance }
  const { data, error } = await supabase.rpc('redeem_reward', {
    p_customer_id: customerId,
    p_admin_id: user.id
  })

  if (error) return { success: false, message: error.message }

  if (!data?.success) {
    return { success: false, message: data?.message || 'Gagal menukar reward' }
  }

  revalidatePath('/admin/rewards')
  revalidatePath('/admin/dashboard')
  return { success: true, newBalance: data.new_balance }
}
