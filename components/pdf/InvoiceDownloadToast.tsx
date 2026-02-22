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
    <div className="fixed bottom-6 right-6 bg-primary text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-slideIn border border-white/10 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Download className="w-5 h-5 animate-bounce" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full animate-ping"></div>
        </div>
        <div>
          <div className="text-sm font-semibold">
            Your invoice PDF is getting ready...
          </div>
          <div className="text-xs mt-0.5 opacity-80">
            Ready in {count} second{count !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-secondary transition-all duration-1000 ease-linear"
          style={{ width: `${((5 - count) / 5) * 100}%` }}
        ></div>
      </div>
    </div>
  )
}
