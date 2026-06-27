import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/admin/settings-form'

export default async function SettingsPage() {
  const supabase = await createClient()
  
  const { data } = await supabase.from('settings').select('*')
  
  const target = data?.find(d => d.key === 'stamp_target')?.value || '10'
  const exp = data?.find(d => d.key === 'qr_expiration_seconds')?.value || '180'

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pengaturan Sistem</h1>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <SettingsForm defaultTarget={target} defaultExp={exp} />
      </div>
    </div>
  )
}
