'use client'

import { useState } from 'react'
import { updateSettings } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export function SettingsForm({ defaultTarget, defaultExp }: { defaultTarget: string, defaultExp: string }) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      await updateSettings(formData)
      toast.success('Pengaturan berhasil disimpan')
    } catch (err) {
      toast.error('Gagal menyimpan pengaturan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Target Stempel per Reward</Label>
        <Input name="stamp_target" type="number" defaultValue={defaultTarget} required min={1} />
        <p className="text-xs text-slate-500">Berapa stempel yang dibutuhkan untuk 1 kopi gratis?</p>
      </div>
      <div className="space-y-2">
        <Label>Durasi Kadaluarsa QR (Detik)</Label>
        <Input name="qr_expiration_seconds" type="number" defaultValue={defaultExp} required min={10} />
        <p className="text-xs text-slate-500">Masa berlaku QR code stempel yang digenerate kasir.</p>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
      </Button>
    </form>
  )
}
