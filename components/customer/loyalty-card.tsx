import { Coffee } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LoyaltyCard({
  name,
  currentStamp,
  targetStamp,
}: {
  name: string
  currentStamp: number
  targetStamp: number
}) {
  // Stamps within current cycle (0 to targetStamp-1).
  // Special case: show full card (all filled) when currentStamp is a multiple of target > 0
  const displayStamps = currentStamp > 0 && currentStamp % targetStamp === 0
    ? targetStamp
    : currentStamp % targetStamp

  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-green-500/20">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-green-100 text-sm font-medium mb-1">Loyalty Card</p>
          <p className="font-semibold text-lg">{name}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">
            {displayStamps}
            <span className="text-xl text-green-100 font-medium">/{targetStamp}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: targetStamp }).map((_, i) => {
          const isEarned = i < displayStamps
          return (
            <div
              key={i}
              className={cn(
                'aspect-square rounded-full flex items-center justify-center transition-all duration-300',
                isEarned
                  ? 'bg-white/20 text-white scale-105'
                  : 'bg-white/10 text-white/30 border border-white/20'
              )}
            >
              <Coffee size={20} className={isEarned ? 'fill-white' : ''} />
            </div>
          )
        })}
      </div>

      {displayStamps === targetStamp && (
        <p className="mt-4 text-xs text-green-100 text-center font-medium bg-white/10 rounded-lg py-1.5">
          🎉 Reward tersedia! Tunjukkan ke kasir untuk ditukar.
        </p>
      )}
    </div>
  )
}
