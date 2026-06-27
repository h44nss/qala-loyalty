import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Coffee, Gift } from 'lucide-react'

// Next.js 16: params must be awaited
export default async function CustomerDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: customer }, { data: stampHistory }, { data: rewardHistory }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('stamp_history').select('*').eq('customer_id', id).order('created_at', { ascending: false }),
    supabase.from('reward_redemptions').select('*').eq('customer_id', id).order('redeemed_at', { ascending: false })
  ])

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-slate-500">Customer tidak ditemukan</p>
          <Link href="/admin/customers" className="text-green-600 text-sm mt-2 block hover:underline">Kembali ke daftar</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/customers" className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Detail Customer</h1>
      </div>

      {/* Profile Summary */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-500 mb-1">Nama Lengkap</p>
          <p className="font-semibold text-slate-900">{customer.full_name}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Nomor HP</p>
          <p className="font-semibold text-slate-900">{customer.phone_number}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Instagram</p>
          <p className="font-semibold text-slate-900">{customer.instagram_username ? `@${customer.instagram_username}` : '-'}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Saldo Stempel</p>
          <p className="font-bold text-2xl text-emerald-600">{customer.current_stamp}</p>
        </div>
      </div>

      {/* Stamp History — SRS FR-09 */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Riwayat Stempel</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {!stampHistory || stampHistory.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">Belum ada riwayat stempel</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {stampHistory.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center ${
                      item.type === 'earn' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {item.type === 'earn' ? <Coffee size={16} /> : <Gift size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.type === 'earn' ? 'Stempel Masuk' : 'Tukar Reward'}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${item.type === 'earn' ? 'text-green-600' : 'text-amber-600'}`}>
                    {item.type === 'earn' ? '+' : ''}{item.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reward Redemptions — SRS FR-09 */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Riwayat Penukaran Reward</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {!rewardHistory || rewardHistory.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">Belum pernah menukar reward</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {rewardHistory.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                      <Gift size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">1x Kopi Gratis Ditukar</p>
                      <p className="text-xs text-slate-500">
                        {new Date(item.redeemed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg font-medium">
                    -{item.stamps_used} stempel
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
