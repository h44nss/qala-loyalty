'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import Link from 'next/link'

interface Customer {
  id: string
  full_name: string | null
  phone_number: string | null
  instagram_username: string | null
  current_stamp: number | null
  created_at: string | null
}

export function CustomersClient({ initialCustomers }: { initialCustomers: Customer[] }) {
  const [query, setQuery] = useState('')
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const q = query.trim()
    let req = supabase.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false })

    if (q) {
      req = req.or(`full_name.ilike.%${q}%,phone_number.ilike.%${q}%`)
    }

    const { data } = await req
    setCustomers(data || [])
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Daftar Customer</h1>
        <p className="text-slate-500">Cari dan kelola semua customer</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <Input
          placeholder="Cari nama atau nomor HP..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={loading} className="gap-2 w-28">
          <Search size={16} />
          {loading ? '...' : 'Cari'}
        </Button>
      </form>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Nama</th>
                <th className="px-6 py-4 font-medium">Nomor HP</th>
                <th className="px-6 py-4 font-medium">Stempel</th>
                <th className="px-6 py-4 font-medium">Instagram</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Tidak ada customer ditemukan</td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <Link href={`/admin/customers/${c.id}`} className="font-medium text-green-700 hover:underline">
                        {c.full_name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{c.phone_number}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">{c.current_stamp || 0}</td>
                    <td className="px-6 py-4 text-slate-600">{c.instagram_username ? `@${c.instagram_username}` : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
