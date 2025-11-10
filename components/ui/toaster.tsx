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
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 space-y-3 sm:w-96 max-w-full">
      {currentToasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-start gap-3 p-4 rounded-xl border untitled-ui-shadow-lg bg-white animate-slide-in-right",
            toast.type === 'success' && 'border-green-200',
            toast.type === 'error' && 'border-red-200',
            toast.type === 'info' && 'border-blue-200'
          )}
        >
          <div className="flex-shrink-0">
            {toast.type === 'success' && (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            )}
            {toast.type === 'error' && (
              <XCircleIcon className="h-5 w-5 text-red-500" />
            )}
            {toast.type === 'info' && (
              <InformationCircleIcon className="h-5 w-5 text-blue-500" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              {toast.type === 'success' && 'Success'}
              {toast.type === 'error' && 'Error'}
              {toast.type === 'info' && 'Info'}
            </p>
            <p className="text-sm text-gray-600 mt-1 break-words">
              {toast.message}
            </p>
          </div>
          
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
            aria-label="Close notification"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}