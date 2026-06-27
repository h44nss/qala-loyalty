'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerCustomer } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { AlertCircle } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string; phone?: string; sosmed?: string }>({})
  const [serverError, setServerError] = useState('')

  const [noSosmed, setNoSosmed] = useState(false)
  const [sosmedType, setSosmedType] = useState<'instagram' | 'tiktok'>('instagram')

  const validate = (email: string, password: string, fullName: string, phone: string, instagram: string, tiktok: string, noSosmed: boolean) => {
    const errs: { email?: string; password?: string; fullName?: string; phone?: string; sosmed?: string } = {}
    if (!fullName.trim()) errs.fullName = 'Nama wajib diisi'
    if (!email.trim()) errs.email = 'Email wajib diisi'
    if (!password) errs.password = 'Password wajib diisi'
    else if (password.length < 6) errs.password = 'Minimal 6 karakter'

    const phoneClean = phone.replace(/\D/g, '')
    if (!phoneClean) errs.phone = 'Nomor HP wajib diisi'
    else if (phoneClean.length < 9) errs.phone = 'Nomor HP tidak valid'

    if (!noSosmed) {
      if (sosmedType === 'instagram' && !instagram.trim()) errs.sosmed = 'Username Instagram wajib diisi'
      if (sosmedType === 'tiktok' && !tiktok.trim()) errs.sosmed = 'Username TikTok wajib diisi'
    }

    return errs
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setServerError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string
    const instagram = formData.get('instagram') as string
    const tiktok = formData.get('tiktok') as string

    const fieldErrors = validate(email, password, fullName, phone, instagram, tiktok, noSosmed)
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    setLoading(true)

    const res = await registerCustomer(formData)
    if (res.success) {
      router.push('/customer/dashboard')
    } else {
      setServerError(res.message || 'Terjadi kesalahan')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50 py-10">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Daftar Akun</h1>
          <p className="mt-2 text-sm text-slate-600">Gabung sekarang dan kumpulkan stempel</p>
        </div>

        <div className="bg-white px-6 py-8 rounded-2xl shadow-sm border border-slate-100">
          {serverError && (
            <div className="mb-5 flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Nama Lengkap <span className="text-red-500">*</span></Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                className={errors.fullName ? 'border-red-400 focus:ring-red-400' : ''}
                onChange={() => setErrors(prev => ({ ...prev, fullName: undefined }))}
              />
              {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                className={errors.email ? 'border-red-400 focus:ring-red-400' : ''}
                onChange={() => setErrors(prev => ({ ...prev, email: undefined }))}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
              <PasswordInput
                id="password"
                name="password"
                placeholder="Minimal 6 karakter"
                className={errors.password ? 'border-red-400 focus:ring-red-400' : ''}
                onChange={() => setErrors(prev => ({ ...prev, password: undefined }))}
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Nomor HP (WhatsApp) <span className="text-red-500">*</span></Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="081234567890"
                className={errors.phone ? 'border-red-400 focus:ring-red-400' : ''}
                onChange={() => setErrors(prev => ({ ...prev, phone: undefined }))}
              />
              <p className="text-xs text-slate-400">Untuk mempermudah kasir menemukan akun Anda</p>
              {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
            </div>

            <div className="space-y-3 pt-2">
              <Label>Sosial Media</Label>
              
              <div className="flex items-center gap-2 mb-2">
                <input 
                  type="checkbox" 
                  id="noSosmed" 
                  name="noSosmed" 
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  checked={noSosmed}
                  onChange={(e) => {
                    setNoSosmed(e.target.checked)
                    setErrors(prev => ({ ...prev, sosmed: undefined }))
                  }}
                />
                <label htmlFor="noSosmed" className="text-sm text-slate-600 cursor-pointer">
                  Saya tidak ingin memberikan sosial media
                </label>
              </div>

              {!noSosmed && (
                <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant={sosmedType === 'instagram' ? 'default' : 'secondary'}
                      className={sosmedType === 'instagram' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                      size="sm"
                      onClick={() => { setSosmedType('instagram'); setErrors(prev => ({ ...prev, sosmed: undefined })) }}
                    >
                      Instagram
                    </Button>
                    <Button 
                      type="button" 
                      variant={sosmedType === 'tiktok' ? 'default' : 'secondary'}
                      className={sosmedType === 'tiktok' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                      size="sm"
                      onClick={() => { setSosmedType('tiktok'); setErrors(prev => ({ ...prev, sosmed: undefined })) }}
                    >
                      TikTok
                    </Button>
                  </div>

                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">@</span>
                    <Input
                      id={sosmedType}
                      name={sosmedType}
                      type="text"
                      placeholder="username"
                      className={`pl-8 ${errors.sosmed ? 'border-red-400 focus:ring-red-400' : ''}`}
                      onChange={(e) => {
                        e.target.value = e.target.value.replace('@', '')
                        setErrors(prev => ({ ...prev, sosmed: undefined }))
                      }}
                    />
                  </div>
                  {errors.sosmed && <p className="text-xs text-red-500">{errors.sosmed}</p>}
                </div>
              )}
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-4">
              {loading ? 'Memproses...' : 'Daftar Sekarang'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Sudah punya akun? <Link href="/login" className="text-emerald-600 font-medium hover:underline">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
