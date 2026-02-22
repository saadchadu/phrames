'use client'

import { useState, useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

let toasts: Toast[] = []
let listeners: ((toasts: Toast[]) => void)[] = []

export function toast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const id = Math.random().toString(36).substr(2, 9)
  const newToast = { id, message, type }

  toasts = [...toasts, newToast]
  listeners.forEach(listener => listener(toasts))

  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id)
    listeners.forEach(listener => listener(toasts))
  }, 5000)
}

function removeToast(id: string) {
  toasts = toasts.filter(t => t.id !== id)
  listeners.forEach(listener => listener(toasts))
}

export function Toaster() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([])

  useEffect(() => {
    const listener = (newToasts: Toast[]) => setCurrentToasts(newToasts)
    listeners.push(listener)

    return () => {
      listeners = listeners.filter(l => l !== listener)
    }
  }, [])

  return (
    <div className="fixed bottom-6 right-6 sm:left-auto z-[9999] space-y-3 sm:w-96 max-w-full pointer-events-none flex flex-col items-end">
      {currentToasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-4 p-5 rounded-2xl shadow-2xl bg-primary text-white border border-white/10 backdrop-blur-md w-full min-w-[320px] pointer-events-auto transition-all animate-slideIn relative overflow-hidden"
          )}
        >
          <div className={cn(
            "relative flex items-center justify-center w-12 h-12 rounded-full border shrink-0",
            toast.type === 'success' && 'bg-secondary/10 border-secondary/20',
            toast.type === 'error' && 'bg-red-500/10 border-red-500/20',
            toast.type === 'info' && 'bg-blue-500/10 border-blue-500/20'
          )}>
            {toast.type === 'success' && (
              <CheckCircleIcon className="h-5 w-5 text-secondary" />
            )}
            {toast.type === 'error' && (
              <XCircleIcon className="h-5 w-5 text-red-400" />
            )}
            {toast.type === 'info' && (
              <InformationCircleIcon className="h-5 w-5 text-blue-400" />
            )}
            <div className={cn(
              "absolute inset-0 rounded-full border-2 animate-ping",
              toast.type === 'success' && 'border-secondary/30',
              toast.type === 'error' && 'border-red-500/30',
              toast.type === 'info' && 'border-blue-500/30'
            )}></div>
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <p className="text-sm font-semibold leading-tight text-white mb-1">
              {toast.type === 'success' && 'Success'}
              {toast.type === 'error' && 'Error'}
              {toast.type === 'info' && 'Information'}
            </p>
            <p className="text-xs text-white/60 font-medium break-words">
              {toast.message}
            </p>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            aria-label="Close notification"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}