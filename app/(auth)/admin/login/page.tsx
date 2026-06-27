'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminLogin } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { AlertCircle } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const validate = (email: string, password: string) => {
    const errs: { email?: string; password?: string } = {}
    if (!email.trim()) {
      errs.email = 'Email wajib diisi'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Format email tidak valid'
    }
    if (!password) {
      errs.password = 'Password wajib diisi'
    } else if (password.length < 6) {
      errs.password = 'Password minimal 6 karakter'
    }
    return errs
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const fieldErrors = validate(email, password)
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    setLoading(true)

    try {
      const res = await adminLogin(formData)
      if (res.success) {
        // Navigate client-side after confirmed success from server
        router.push('/admin/dashboard')
      } else {
        setError(res.message)
        setLoading(false)
      }
    } catch {
      setError('Terjadi kesalahan jaringan. Silakan coba lagi.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Admin / Kasir</h1>
          <p className="mt-2 text-sm text-slate-600">Silakan login untuk kelola sistem</p>
        </div>

        <div className="bg-white px-6 py-8 rounded-2xl shadow-sm border border-slate-200">
          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@coffeeloyalty.com"
                autoComplete="email"
                className={errors.email ? 'border-red-400 focus:ring-red-400' : ''}
                onChange={() => setErrors(prev => ({ ...prev, email: undefined }))}
              />
              {errors.email && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle size={12} /> {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <PasswordInput
                id="password"
                name="password"
                placeholder="Minimal 6 karakter"
                autoComplete="current-password"
                className={errors.password ? 'border-red-400 focus:ring-red-400' : ''}
                onChange={() => setErrors(prev => ({ ...prev, password: undefined }))}
              />
              {errors.password && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle size={12} /> {errors.password}
                </p>
              )}
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? 'Memproses...' : 'Login Admin'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
