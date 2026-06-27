'use client'

import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { generateStampToken } from '@/app/actions/stamp'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RotateCcw } from 'lucide-react'

export default function GenerateQRPage() {
  const [amount, setAmount] = useState(1)
  const [loading, setLoading] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [tokenCode, setTokenCode] = useState('')
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!expiresAt) return
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))
      setTimeLeft(diff)
      if (diff === 0) {
        setQrDataUrl('')
        setTokenCode('')
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setLoading(true)
    setError('')
    setQrDataUrl('')
    setTokenCode('')

    const res = await generateStampToken(amount)
    if (res.success && res.tokens && res.tokens.length > 0) {
      const token = res.tokens[0]
      // SRS 3.3: QR berisi deep-link URL, bukan string token mentah
      const deepLink = `${window.location.origin}/customer/scan?token=${token.token_code}`
      const url = await QRCode.toDataURL(deepLink, { width: 280, margin: 2 })
      setQrDataUrl(url)
      setTokenCode(token.token_code)
      setExpiresAt(new Date(token.expires_at))
      setTimeLeft(Math.floor((new Date(token.expires_at).getTime() - Date.now()) / 1000))
    } else {
      setError(res.message || 'Gagal generate token. Coba lagi.')
    }
    setLoading(false)
  }

  const timerColor = timeLeft > 60 ? 'text-green-600' : timeLeft > 30 ? 'text-amber-500' : 'text-red-500'
  const borderColor = timeLeft > 60 ? 'border-green-500' : timeLeft > 30 ? 'border-amber-500' : 'border-red-500'

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Generate QR Stempel</h1>
        <p className="text-slate-500">Buat token QR untuk discan oleh customer</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-2">
            <Label>Jumlah Stempel</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
            <p className="text-xs text-slate-500">Sesuaikan dengan jumlah item minuman yang dibeli.</p>
          </div>
          {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Memproses...' : 'Generate QR Code'}
          </Button>
        </form>
      </div>

      {qrDataUrl && timeLeft > 0 && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <p className="text-slate-500 text-sm font-medium">Berlaku selama</p>
            <p className={`text-2xl font-bold tabular-nums ${timerColor}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </p>
          </div>

          <div className={`inline-block p-2 rounded-2xl border-4 ${borderColor} transition-colors duration-500`}>
            <img src={qrDataUrl} alt="QR Code Stempel" className="w-64 h-64 rounded-xl" />
          </div>

          <p className="text-sm text-slate-500">
            Persilakan customer scan QR ini dengan kamera HP atau scanner in-app.
          </p>

          <Button variant="secondary" onClick={() => handleGenerate()} className="gap-2">
            <RotateCcw size={16} /> Generate Ulang
          </Button>
        </div>
      )}

      {/* Tombol generate ulang saat QR expired (UF 2.3) */}
      {tokenCode && timeLeft === 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center space-y-3">
          <p className="text-red-600 font-medium">QR Code telah kedaluwarsa</p>
          <Button onClick={() => handleGenerate()} className="gap-2">
            <RotateCcw size={16} /> Generate QR Baru
          </Button>
        </div>
      )}
    </div>
  )
}
