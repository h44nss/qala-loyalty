'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ScanLine, Gift, History, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
      <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between relative">
        <Link 
          href="/customer/dashboard" 
          className={cn("flex flex-col items-center", isActive('/customer/dashboard') ? "text-green-600" : "text-slate-400 hover:text-green-600")}
        >
          <Home size={24} />
          <span className="text-[10px] font-medium mt-1">Home</span>
        </Link>
        
        <Link 
          href="/customer/history" 
          className={cn("flex flex-col items-center mr-8", isActive('/customer/history') ? "text-green-600" : "text-slate-400 hover:text-green-600")}
        >
          <History size={24} />
          <span className="text-[10px] font-medium mt-1">Riwayat</span>
        </Link>
        
        {/* Scan Button (Floating) */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-6">
          <Link 
            href="/customer/scan" 
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 hover:opacity-90 transition-opacity"
          >
            <ScanLine size={28} />
          </Link>
        </div>

        <Link 
          href="/customer/rewards" 
          className={cn("flex flex-col items-center ml-8", isActive('/customer/rewards') ? "text-green-600" : "text-slate-400 hover:text-green-600")}
        >
          <Gift size={24} />
          <span className="text-[10px] font-medium mt-1">Reward</span>
        </Link>
        
        <Link 
          href="/customer/profile" 
          className={cn("flex flex-col items-center", isActive('/customer/profile') ? "text-green-600" : "text-slate-400 hover:text-green-600")}
        >
          <User size={24} />
          <span className="text-[10px] font-medium mt-1">Profil</span>
        </Link>
      </div>
    </nav>
  )
}
