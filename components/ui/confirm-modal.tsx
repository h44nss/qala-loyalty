'use client'

import { Button } from './button'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button variant="ghost" onClick={onCancel} className="flex-1">
            {cancelText}
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="flex-1">
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
