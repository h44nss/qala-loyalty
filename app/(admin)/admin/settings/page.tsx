import { createClient } from '@/lib/supabase/server'
import { updateSettings } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
        <form action={async (fd) => {
          'use server'
          await updateSettings(fd)
        }} className="space-y-6">
          <div className="space-y-2">
            <Label>Target Stempel per Reward</Label>
            <Input name="stamp_target" type="number" defaultValue={target} required min={1} />
            <p className="text-xs text-slate-500">Berapa stempel yang dibutuhkan untuk 1 kopi gratis?</p>
          </div>
          <div className="space-y-2">
            <Label>Durasi Kadaluarsa QR (Detik)</Label>
            <Input name="qr_expiration_seconds" type="number" defaultValue={exp} required min={10} />
            <p className="text-xs text-slate-500">Masa berlaku QR code stempel yang digenerate kasir.</p>
          </div>
          <Button type="submit">Simpan Pengaturan</Button>
        </form>
      </div>
    </div>
  )
}
