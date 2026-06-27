'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, QrCode, Users, Gift, Settings, LogOut, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { signOut } from '@/app/actions/auth'

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Generate QR', href: '/admin/generate-qr', icon: QrCode },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Redeem Reward', href: '/admin/rewards', icon: Gift },
  { name: 'Pengaturan', href: '/admin/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center px-4 z-50 justify-between">
        <h1 className="font-bold text-slate-900">Coffee Loyalty Admin</h1>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 bg-slate-100 rounded-lg text-slate-600">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:pt-0 pt-16 flex flex-col"
      )}>
        <div className="p-6 hidden md:block">
          <h1 className="text-xl font-bold text-slate-900">Coffee Loyalty</h1>
          <p className="text-xs text-slate-500 mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4 md:mt-0 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors",
                  active 
                    ? "bg-green-50 text-green-700" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon size={20} className={active ? "text-green-600" : "text-slate-400"} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <form action={signOut}>
             <button type="submit" className="flex items-center w-full gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
               <LogOut size={20} />
               Logout
             </button>
          </form>
        </div>
      </div>
      
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
