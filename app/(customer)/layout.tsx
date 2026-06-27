import { BottomNav } from '@/components/customer/bottom-nav'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RealtimeListener } from '@/components/customer/realtime-listener'

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Kita tidak perlu cek complete-profile lagi karena semua data diinput saat register
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <RealtimeListener customerId={user.id} />
      <main className="max-w-md mx-auto min-h-screen">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
