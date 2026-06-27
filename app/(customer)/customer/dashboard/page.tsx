import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LoyaltyCard } from '@/components/customer/loyalty-card'
import { Gift, ScanLine } from 'lucide-react'
import Link from 'next/link'

export default async function CustomerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  const [{ data: profile }, { data: settings }] = await Promise.all([
    supabase.from('profiles').select('full_name, current_stamp').eq('id', user.id).single(),
    supabase.from('settings').select('value').eq('key', 'stamp_target').single()
  ])

  const target = settings ? parseInt(settings.value) : 10
  const stamps = profile?.current_stamp || 0
  const rewardsAvailable = Math.floor(stamps / target)

  return (
    <div className="p-5 space-y-6">
      <header className="pt-4 pb-2">
        <h1 className="text-xl font-semibold text-slate-900">Halo, {profile?.full_name} 👋</h1>
        <p className="text-sm text-slate-500 mt-1">Waktunya ngopi hari ini?</p>
      </header>

      <LoyaltyCard
        name={profile?.full_name || ''}
        currentStamp={stamps}
        targetStamp={target}
      />

      {/* Quick Action — Scan QR (UF §1.3) */}
      <Link
        href="/customer/scan"
        className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg shadow-green-500/20 hover:opacity-90 transition-opacity"
      >
        <ScanLine size={22} />
        Scan QR Stempel
      </Link>

      {/* Reward Badge (UF §1.3) */}
      {rewardsAvailable > 0 && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <Gift size={20} />
            </div>
            <div>
              <p className="font-semibold text-emerald-900 text-sm">Reward Tersedia!</p>
              <p className="text-xs text-emerald-700">Kamu punya {rewardsAvailable}x kopi gratis.</p>
            </div>
          </div>
          <Link
            href="/customer/rewards"
            className="text-sm font-medium text-emerald-700 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors"
          >
            Lihat
          </Link>
        </div>
      )}
    </div>
  )
}
