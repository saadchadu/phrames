import { ReactNode } from 'react'

interface StatCardProps {
  icon?: ReactNode
  label: string
  value: string | number
  className?: string
  minimal?: boolean
}

export default function StatCard({ icon, label, value, className = '', minimal = false }: StatCardProps) {
  if (minimal) {
    return (
      <div className={`bg-white border border-[#00240010] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow ${className}`}>
        <p className="text-xs uppercase tracking-wide text-primary/50 mb-2">{label}</p>
        <p className="text-3xl font-bold text-primary">{value}</p>
      </div>
    )
  }

  return (
    <div className={`bg-white border border-[#00240010] rounded-xl p-4 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon && <div className="text-primary/60">{icon}</div>}
        <p className="text-sm text-primary/60">{label}</p>
      </div>
      <p className="text-2xl font-bold text-primary">{value}</p>
    </div>
  )
}
