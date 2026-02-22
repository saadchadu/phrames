'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

interface InvoiceDownloadToastProps {
  onComplete: () => void
}

export default function InvoiceDownloadToast({ onComplete }: InvoiceDownloadToastProps) {
  const [count, setCount] = useState(5)

  useEffect(() => {
    if (count === 0) {
      onComplete()
      return
    }

    const timer = setTimeout(() => {
      setCount((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [count, onComplete])

  return (
    <div className="fixed bottom-6 right-6 bg-primary text-white p-5 rounded-2xl shadow-2xl z-50 animate-slideIn border border-white/10 backdrop-blur-md min-w-[320px]">
      <div className="flex items-center gap-4">
        <div className="relative flex items-center justify-center w-12 h-12 bg-secondary/10 rounded-full border border-secondary/20 shrink-0">
          <Download className="w-5 h-5 text-secondary animate-bounce" />
          {/* Subtle pulse effect covering the whole icon container */}
          <div className="absolute inset-0 rounded-full border-2 border-secondary/30 animate-ping"></div>
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold leading-tight text-white">
            Your invoice PDF is getting ready...
          </div>
          <div className="text-xs mt-1 text-white/60 font-medium">
            Ready in {count} second{count !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-secondary transition-all duration-1000 ease-linear rounded-full"
          style={{ width: `${((5 - count) / 5) * 100}%` }}
        ></div>
      </div>
    </div>
  )
}
