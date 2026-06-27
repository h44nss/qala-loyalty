'use client'

import { useState } from 'react'
import { updateProfile } from '@/app/actions/profile'
import { signOut } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, LogOut, Pencil, X, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmModal } from '@/components/ui/confirm-modal'

interface Profile {
  full_name: string | null
  phone_number: string | null
  instagram_username: string | null
}

export function ProfileClient({ profile }: { profile: Profile }) {
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    const ig = formData.get('instagram_username') as string
    if (!ig || ig.replace('@','').trim() === '') {
      setError('Username Instagram wajib diisi')
      return
    }
    setLoading(true)
    setError('')
    const res = await updateProfile(formData)
    if (res.success) {
      setSuccess(true)
      setEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(res.message || 'Terjadi kesalahan')
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    setShowLogoutConfirm(false)
    toast.success('Logout berhasil')
    await new Promise(r => setTimeout(r, 500))
    await signOut()
  }

  return (
    <div className="p-5 space-y-6">
      <header className="pt-4 pb-2">
        <h1 className="text-xl font-semibold text-slate-900">Profil Saya</h1>
      </header>

      {success && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-2 text-emerald-700 text-sm">
          <CheckCircle2 size={16}/> Profil berhasil diperbarui!
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{profile.full_name}</h2>
            <p className="text-slate-500 text-sm">{profile.phone_number}</p>
          </div>
          <button
            onClick={() => { setEditing(!editing); setError('') }}
            className="ml-auto p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            {editing ? <X size={20} /> : <Pencil size={20} />}
          </button>
        </div>

        {!editing ? (
          <div className="space-y-3">
            <div className="flex justify-between py-3 border-t border-slate-100">
              <span className="text-slate-500 text-sm">Instagram</span>
              <span className="font-medium text-slate-900 text-sm">
                {profile.instagram_username ? `@${profile.instagram_username}` : '-'}
              </span>
            </div>
          </div>
        ) : (
          <form action={handleSubmit} className="space-y-4 pt-2 border-t border-slate-100">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input name="full_name" defaultValue={profile.full_name || ''} required />
            </div>
            <div className="space-y-2">
              <Label>Username Instagram <span className="text-red-500">*</span></Label>
              <Input name="instagram_username" placeholder="@username" defaultValue={profile.instagram_username ? `@${profile.instagram_username}` : ''} />
              <p className="text-xs text-slate-400">Wajib diisi, tidak bisa dikosongkan</p>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </form>
        )}
      </div>

      <div>
        <Button variant="destructive" className="w-full gap-2" onClick={() => setShowLogoutConfirm(true)}>
          <LogOut size={18} />
          Keluar
        </Button>
      </div>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Keluar Akun?"
        description="Kamu yakin ingin keluar dari akun ini? Kamu harus login kembali untuk melihat stempelmu."
        confirmText="Ya, Keluar"
        cancelText="Batal"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  )
}
