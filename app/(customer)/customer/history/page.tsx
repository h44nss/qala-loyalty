import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Gift, Coffee } from 'lucide-react'
import { HistoryTabs } from '@/components/customer/history-tabs'

export default async function CustomerHistory() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const [{ data: stampHistory }, { data: rewardHistory }] = await Promise.all([
    supabase
      .from('stamp_history')
      .select('*')
      .eq('customer_id', user.id)
      .eq('type', 'earn')
      .order('created_at', { ascending: false }),
    supabase
      .from('reward_redemptions')
      .select('*')
      .eq('customer_id', user.id)
      .order('redeemed_at', { ascending: false })
  ])

  return (
    <div className="p-5 space-y-6">
      <header className="pt-4 pb-2">
        <h1 className="text-xl font-semibold text-slate-900">Riwayat</h1>
        <p className="text-sm text-slate-500 mt-1">Aktivitas stempel kamu</p>
      </header>
      <HistoryTabs stampHistory={stampHistory || []} rewardHistory={rewardHistory || []} />
    </div>
  )
}
