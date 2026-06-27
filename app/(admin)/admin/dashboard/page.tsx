import { createClient } from '@/lib/supabase/server'
import { Users, Coffee, Gift, QrCode } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // FR-01: 4 stat cards — Total Member, Total Stamp Given, Total Reward Redeemed, Total QR Generated
  const [
    { count: customerCount },
    { count: rewardCount },
    { count: qrCount },
    { data: earnData },
    { data: recentStamp },
    { data: recentRedeem }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('reward_redemptions').select('*', { count: 'exact', head: true }),
    supabase.from('stamp_tokens').select('*', { count: 'exact', head: true }),
    supabase.from('stamp_history').select('amount').eq('type', 'earn'),
    // Recent activity: stamp earn events, join profiles separately to avoid RLS cross-table issue
    supabase.from('stamp_history').select('id, type, amount, created_at, customer_id').order('created_at', { ascending: false }).limit(8),
    supabase.from('reward_redemptions').select('id, stamps_used, redeemed_at, customer_id').order('redeemed_at', { ascending: false }).limit(4)
  ])

  const totalStampsGiven = earnData?.reduce((acc, r) => acc + (r.amount || 0), 0) || 0

  const statCards = [
    { label: 'Total Member', value: customerCount || 0, icon: Users, color: 'bg-green-100 text-green-600' },
    { label: 'Total Stamp Diberikan', value: totalStampsGiven, icon: Coffee, color: 'bg-amber-100 text-amber-600' },
    { label: 'Reward Ditukar', value: rewardCount || 0, icon: Gift, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Total QR Digenerate', value: qrCount || 0, icon: QrCode, color: 'bg-sky-100 text-sky-600' },
  ]

  // Merge and sort recent activity
  type ActivityItem = { id: string; type: 'earn' | 'redeem'; amount: number; date: string; customer_id: string }
  const activities: ActivityItem[] = [
    ...(recentStamp || []).map(s => ({ id: s.id, type: 'earn' as const, amount: s.amount, date: s.created_at, customer_id: s.customer_id })),
    ...(recentRedeem || []).map(r => ({ id: r.id, type: 'redeem' as const, amount: r.stamps_used, date: r.redeemed_at, customer_id: r.customer_id }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Ringkasan aktivitas sistem</p>
      </div>

      {/* 4 Stat Cards per FR-01 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className={`h-12 w-12 ${card.color} rounded-full flex items-center justify-center mb-4`}>
              <card.icon size={24} />
            </div>
            <p className="text-3xl font-bold text-slate-900">{card.value}</p>
            <p className="text-slate-500 text-sm mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity per UF 2.2 */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100">
          {activities.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">Belum ada aktivitas</div>
          ) : (
            activities.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center ${
                    item.type === 'earn' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {item.type === 'earn' ? <Coffee size={16} /> : <Gift size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {item.type === 'earn' ? `+${item.amount} stempel` : `Reward ditukar (−${item.amount} stempel)`}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
