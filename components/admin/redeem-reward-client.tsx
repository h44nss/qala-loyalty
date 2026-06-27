'use client'

import { useState, useRef } from 'react'
import { redeemRewardAction } from '@/app/actions/reward'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/types'
import { Search, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

type CustomerResult = {
  id: string
  full_name: string | null
  phone_number: string | null
  current_stamp: number | null
  target: number
}

export function RedeemRewardClient() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [customer, setCustomer] = useState<CustomerResult | null>(null)
  const [searchResults, setSearchResults] = useState<CustomerResult[]>([])
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const supabaseRef = useRef<ReturnType<typeof createBrowserClient<Database>> | null>(null)
  if (!supabaseRef.current) {
    supabaseRef.current = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  const supabase = supabaseRef.current

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMsg('')
    setCustomer(null)
    setSearchResults([])

    const searchQuery = phone.trim()
    if (!searchQuery) {
      setLoading(false)
      return
    }

    const { data, error: dbErr } = await supabase
      .from('profiles')
      .select('id, full_name, phone_number, current_stamp')
      .eq('role', 'customer')
      .or(`full_name.ilike.%${searchQuery}%,phone_number.ilike.%${searchQuery}%`)
      .limit(5)

    if (dbErr || !data || data.length === 0) {
      setError('Customer tidak ditemukan. Coba nama atau nomor HP lain.')
      toast.error('Customer tidak ditemukan')
      setLoading(false)
      return
    }

    const { data: set } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'stamp_target')
      .single()

    const target = set ? parseInt(set.value) : 10
    
    const results = data.map(d => ({ ...d, target }))
    
    if (results.length === 1) {
      setCustomer(results[0])
    } else {
      setSearchResults(results)
    }
    
    setLoading(false)
  }

  const selectCustomer = (c: CustomerResult) => {
    setCustomer(c)
    setSearchResults([])
  }

  const handleRedeem = async () => {
    if (!customer) return
    setLoading(true)
    setError('')

    const res = await redeemRewardAction(customer.id)
    if (res.success) {
      setSuccessMsg(`Reward berhasil ditukarkan! Sisa stempel: ${res.newBalance ?? 0}`)
      toast.success('Reward berhasil ditukarkan!', {
        description: `Sisa stempel: ${res.newBalance ?? 0}`
      })
      setCustomer(null)
      setPhone('')
    } else {
      setError(res.message || 'Terjadi kesalahan')
      toast.error(res.message || 'Terjadi kesalahan')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Penukaran Reward</h1>
        <p className="text-slate-500">Cari nomor HP customer untuk menukar reward</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <form onSubmit={handleSearch} className="flex gap-3">
          <Input
            type="text"
            placeholder="Ketik nama atau nomor HP..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="flex-1"
          />
          <Button type="submit" disabled={loading} className="w-32 gap-2 shrink-0">
            <Search size={16} />
            {loading ? '...' : 'Cari'}
          </Button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">{error}</div>
      )}

      {searchResults.length > 0 && !customer && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
          <h2 className="text-sm font-semibold text-slate-700 px-2">Pilih Customer:</h2>
          <div className="divide-y divide-slate-100">
            {searchResults.map((c) => (
              <button
                key={c.id}
                onClick={() => selectCustomer(c)}
                className="w-full text-left p-3 hover:bg-emerald-50 rounded-xl transition-colors flex justify-between items-center group"
              >
                <div>
                  <p className="font-semibold text-slate-900 group-hover:text-emerald-700">{c.full_name}</p>
                  <p className="text-xs text-slate-500">{c.phone_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">{c.current_stamp ?? 0} Stempel</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100 flex items-center gap-3 text-sm">
          <CheckCircle2 size={18} className="shrink-0" />
          {successMsg}
        </div>
      )}

      {customer && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
          <h2 className="text-lg font-bold text-slate-900">Hasil Pencarian</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="text-xs text-slate-500 mb-1">Nama Customer</p>
              <p className="font-semibold text-slate-900">{customer.full_name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Nomor HP</p>
              <p className="font-semibold text-slate-900">{customer.phone_number}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Saldo Stempel</p>
              <p className="font-bold text-2xl text-emerald-600">{customer.current_stamp ?? 0}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Target Reward</p>
              <p className="font-bold text-2xl text-slate-700">{customer.target}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            {(customer.current_stamp ?? 0) >= customer.target ? (
              <div className="space-y-3">
                <p className="text-emerald-600 font-medium text-sm">
                  ✅ Customer berhak menukar {Math.floor((customer.current_stamp ?? 0) / customer.target)}x Kopi Gratis!
                </p>
                <Button onClick={handleRedeem} disabled={loading} className="w-full">
                  {loading ? 'Memproses...' : `Proses Redeem (Kurangi ${customer.target} Stempel)`}
                </Button>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm space-y-3">
                {/* UF §2.5: disabled button + sisa stempel */}
                <p className="text-amber-700 font-medium">
                  Stempel belum cukup. Butuh{' '}
                  <span className="font-bold">{customer.target - ((customer.current_stamp ?? 0) % customer.target)}</span>{' '}
                  stempel lagi.
                </p>
                <Button disabled className="w-full opacity-50 cursor-not-allowed">
                  Redeem Reward (Tidak Tersedia)
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
