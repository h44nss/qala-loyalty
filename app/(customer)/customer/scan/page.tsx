'use client'

import { useState, useEffect, Suspense } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import { claimStampToken } from '@/app/actions/stamp'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ScanLine, CheckCircle2, XCircle, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

function ScanContent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pendingToken, setPendingToken] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Jalur A: deep-link dari kamera HP (?token=xxx)
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token')
    if (tokenFromUrl) {
      setPendingToken(tokenFromUrl)
    }
  }, [searchParams])

  const handleClaim = async (tokenCode: string) => {
    setLoading(true)
    setError('')
    const res = await claimStampToken(tokenCode)
    if (res.success) {
      setSuccess('Stempel berhasil ditambahkan! 🎉')
      toast.success('Stempel Berhasil Diklaim! 🎉')
      setPendingToken(null)
      setTimeout(() => router.push('/customer/dashboard'), 2500)
    } else {
      setError(res.message || 'Terjadi kesalahan')
      toast.error(res.message || 'Gagal klaim stempel')
      setLoading(false)
    }
  }

  // Jalur B: scanner in-app langsung klaim
  const handleScan = async (text: string) => {
    if (loading || success || confirmed) return
    let token = text
    try {
      const url = new URL(text)
      token = url.searchParams.get('token') || text
    } catch {}
    await handleClaim(token)
  }

  const handleRetry = () => {
    setError('')
    setPendingToken(null)
    setConfirmed(false)
    setLoading(false)
  }

  // Tampilan konfirmasi untuk Jalur A (deep-link)
  if (pendingToken && !confirmed) {
    return (
      <div className="p-5 flex flex-col items-center justify-center h-[calc(100vh-80px)]">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center w-full max-w-sm shadow-sm space-y-4">
          <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <ScanLine size={32} />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Klaim Stempel?</h1>
          <p className="text-slate-500 text-sm">Token QR terdeteksi. Tap Klaim untuk menambahkan stempel ke loyalty card kamu.</p>
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600 flex items-center gap-2">
              <XCircle size={16} />{error}
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => router.push('/customer/dashboard')} className="flex-1">Batal</Button>
            <Button onClick={() => { setConfirmed(true); handleClaim(pendingToken) }} disabled={loading} className="flex-1">
              {loading ? 'Memproses...' : 'Klaim'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Tampilan sukses
  if (success) {
    return (
      <div className="p-5 flex flex-col items-center justify-center h-[calc(100vh-80px)]">
        <div className="bg-white rounded-2xl border border-emerald-100 p-8 text-center w-full max-w-sm shadow-sm space-y-4">
          <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Stempel Bertambah!</h1>
          <p className="text-slate-500 text-sm">{success}</p>
          <p className="text-xs text-slate-400">Mengalihkan ke dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 flex flex-col h-[calc(100vh-80px)]">
      <header className="pt-4 pb-6 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Scan QR Code</h1>
        <p className="text-sm text-slate-500 mt-1">Arahkan kamera ke layar kasir</p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center -mt-10">
        <div className="w-full max-w-sm aspect-square relative rounded-3xl overflow-hidden border-4 border-green-500 shadow-xl bg-slate-900">
          <Scanner
            onScan={(result) => {
              if (result && result.length > 0) {
                handleScan(result[0].rawValue)
              }
            }}
          />
        </div>

        {loading && <p className="mt-6 text-emerald-600 font-medium animate-pulse">Memproses stempel...</p>}

        {error && (
          <div className="mt-6 w-full max-w-sm bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600 space-y-3">
            <div className="flex items-center gap-2"><XCircle size={16}/><span>{error}</span></div>
            <Button variant="secondary" onClick={handleRetry} className="w-full gap-2">
              <RotateCcw size={16}/> Coba Lagi
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><p className="text-slate-500">Memuat...</p></div>}>
      <ScanContent />
    </Suspense>
  )
}
