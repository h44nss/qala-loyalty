'use client'

import { useState } from 'react'
import { Coffee, Gift } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StampItem {
  id: string
  amount: number
  created_at: string
}

interface RewardItem {
  id: string
  stamps_used: number
  redeemed_at: string
}

export function HistoryTabs({
  stampHistory,
  rewardHistory,
}: {
  stampHistory: StampItem[]
  rewardHistory: RewardItem[]
}) {
  const [tab, setTab] = useState<'stamp' | 'reward'>('stamp')

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl mb-4">
        <button
          onClick={() => setTab('stamp')}
          className={cn(
            'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
            tab === 'stamp' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          )}
        >
          Stamp Timeline
        </button>
        <button
          onClick={() => setTab('reward')}
          className={cn(
            'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
            tab === 'reward' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          )}
        >
          Reward Timeline
        </button>
      </div>

      {/* Stamp Tab */}
      {tab === 'stamp' && (
        <div className="space-y-3">
          {stampHistory.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
              <Coffee className="mx-auto text-slate-300 mb-3" size={40} />
              <p className="text-slate-500 text-sm">Belum ada riwayat stempel</p>
            </div>
          ) : (
            stampHistory.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <Coffee size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Stempel Masuk</p>
                    <p className="text-xs text-slate-500">
                      {new Date(item.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="font-bold text-green-600">+{item.amount}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reward Tab */}
      {tab === 'reward' && (
        <div className="space-y-3">
          {rewardHistory.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
              <Gift className="mx-auto text-slate-300 mb-3" size={40} />
              <p className="text-slate-500 text-sm">Belum ada reward yang ditukar</p>
            </div>
          ) : (
            rewardHistory.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Gift size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Reward Ditukar</p>
                    <p className="text-xs text-slate-500">
                      {new Date(item.redeemed_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="font-bold text-emerald-600">-{item.stamps_used}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
