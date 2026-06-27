import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Gift, Coffee } from 'lucide-react'

export default async function CustomerRewards() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const [{ data: profile }, { data: settings }, { data: redemptions }] = await Promise.all([
    supabase.from('profiles').select('current_stamp, phone_number').eq('id', user.id).single(),
    supabase.from('settings').select('value').eq('key', 'stamp_target').single(),
    supabase.from('reward_redemptions').select('*').eq('customer_id', user.id).order('redeemed_at', { ascending: false })
  ])

  const target = settings ? parseInt(settings.value) : 10
  const stamps = profile?.current_stamp || 0
  const rewardsAvailable = Math.floor(stamps / target)

  return (
    <div className="p-5 space-y-6">
      <header className="pt-4 pb-2">
        <h1 className="text-xl font-semibold text-slate-900">Reward Saya</h1>
        <p className="text-sm text-slate-500 mt-1">Tukar stempel dengan minuman gratis</p>
      </header>

      {/* Status Reward */}
      {rewardsAvailable > 0 ? (
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-6 rounded-2xl text-white text-center shadow-lg shadow-emerald-500/20">
          <Gift size={48} className="mx-auto mb-4 text-emerald-100" />
          <h2 className="text-2xl font-bold mb-2">{rewardsAvailable}x Kopi Gratis</h2>
          <p className="text-emerald-100 text-sm mb-6">
            Selamat! Kamu berhak mendapatkan minuman gratis.
          </p>
          <div className="bg-white text-emerald-900 p-4 rounded-xl border-2 border-emerald-300 border-dashed">
            <p className="text-sm font-semibold">Tunjukkan layar ini ke Kasir</p>
            <p className="text-xs mt-1 text-slate-500">
              Atau sebutkan nomor HP: <span className="font-bold text-slate-900">{profile?.phone_number}</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center shrink-0">
              <Gift size={24} />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Belum ada reward</p>
              <p className="text-slate-500 text-sm">
                Kumpulkan <span className="font-bold text-green-600">{target - (stamps % target)}</span> stempel lagi untuk Kopi Gratis!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Riwayat Reward Ditukar (UF 1.5) */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Riwayat Penukaran</h2>
        {!redemptions || redemptions.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-2xl border border-slate-100">
            <Coffee className="mx-auto text-slate-300 mb-3" size={36} />
            <p className="text-slate-500 text-sm">Belum pernah menukar reward</p>
          </div>
        ) : (
          <div className="space-y-3">
            {redemptions.map((r) => (
              <div key={r.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <Gift size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">1x Kopi Gratis</p>
                    <p className="text-xs text-slate-500">
                      {new Date(r.redeemed_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg font-medium">
                  -{r.stamps_used} stempel
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
