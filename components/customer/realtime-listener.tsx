'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/types'
import { Gift, Coffee, X } from 'lucide-react'

export function RealtimeListener({ customerId }: { customerId: string }) {
  const router = useRouter()
  const [notification, setNotification] = useState<{ type: 'earn' | 'redeem', title: string, message: string } | null>(null)
  
  const supabaseRef = useRef<ReturnType<typeof createBrowserClient<Database>> | null>(null)
  if (!supabaseRef.current) {
    supabaseRef.current = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  const supabase = supabaseRef.current

  useEffect(() => {
    // Listen for inserts on stamp_history
    const channel = supabase
      .channel('customer-history-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stamp_history',
          filter: `customer_id=eq.${customerId}`,
        },
        (payload) => {
          const newData = payload.new as any
          
          if (newData.type === 'earn') {
            setNotification({
              type: 'earn',
              title: 'Stempel Diterima! 🎉',
              message: `Kamu mendapatkan +${newData.amount} stempel baru. Total: ${newData.balance_after}`
            })
          } else if (newData.type === 'redeem') {
            setNotification({
              type: 'redeem',
              title: 'Reward Ditukar! ☕',
              message: `1x Kopi Gratis berhasil ditukarkan. Sisa stempel: ${newData.balance_after}`
            })
          }
          
          // Memaksa Next.js untuk me-refresh data Server Components di latar belakang
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [customerId, router, supabase])

  if (!notification) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
      <div className={`p-4 rounded-2xl shadow-xl flex items-start gap-4 border ${
        notification.type === 'earn' 
          ? 'bg-green-50 border-green-200' 
          : 'bg-amber-50 border-amber-200'
      }`}>
        <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${
          notification.type === 'earn' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
        }`}>
          {notification.type === 'earn' ? <Coffee size={20} /> : <Gift size={20} />}
        </div>
        <div className="flex-1 pt-1">
          <h3 className={`font-bold text-sm ${
            notification.type === 'earn' ? 'text-green-800' : 'text-amber-800'
          }`}>{notification.title}</h3>
          <p className={`text-xs mt-0.5 ${
            notification.type === 'earn' ? 'text-green-700' : 'text-amber-700'
          }`}>{notification.message}</p>
        </div>
        <button 
          onClick={() => setNotification(null)}
          className={`p-1 rounded-md opacity-70 hover:opacity-100 ${
            notification.type === 'earn' ? 'hover:bg-green-200' : 'hover:bg-amber-200'
          }`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
