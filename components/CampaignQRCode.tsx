'use client'

import { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { useDialog } from '@/hooks/useDialog'
import AlertDialog from '@/components/ui/AlertDialog'

interface CampaignQRCodeProps {
  slug: string
  campaignName: string
  size?: number
  showDownloadButton?: boolean
}

export default function CampaignQRCode({ 
  slug, 
  campaignName, 
  size = 180,
  showDownloadButton = true 
}: CampaignQRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null)
  const url = `https://phrames.cleffon.com/campaign/${slug}`
  const { alertState, showAlert, closeAlert } = useDialog()

  const handleDownload = () => {
    try {
      const canvas = qrRef.current?.querySelector('canvas')
      if (!canvas) {
        console.error('Canvas not found')
        return
      }

      const pngUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = pngUrl
      link.download = `${slug}-qr.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading QR code:', error)
      showAlert({
        title: 'Download Failed',
        message: 'Failed to download QR code. Please try again.',
        type: 'error',
      })
    }
  }

  return (
    <>
      <div className="flex flex-col items-center space-y-4">
        <div ref={qrRef} className="bg-white p-4 rounded-xl border border-[#00240010] shadow-sm">
          <QRCodeCanvas 
            value={url} 
            size={size} 
            bgColor="#ffffff" 
            fgColor="#000000"
            level="M"
            includeMargin={false}
          />
        </div>
        
        {showDownloadButton && (
          <button
            onClick={handleDownload}
            className="inline-flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#059669] active:scale-95 text-white px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-semibold transition-all shadow-sm"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            <span>Download QR Code</span>
          </button>
        )}
        
        <p className="text-xs sm:text-sm text-primary/60 text-center max-w-xs">
          Scan this QR code to visit the campaign page
        </p>
      </div>

      <AlertDialog
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />
    </>
  )
}
