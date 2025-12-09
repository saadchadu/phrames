'use client'

import { Search } from 'lucide-react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  placeholder?: string
}

export default function SearchInput({ 
  value, 
  onChange, 
  onSearch, 
  placeholder = 'Search your campaigns' 
}: SearchInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch()
    }
  }

  return (
    <div className="relative w-full sm:w-[377px]">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/50" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label="Search campaigns"
        className="w-full bg-white rounded-lg pl-12 pr-4 py-[22px] text-primary text-sm sm:text-base font-medium placeholder:text-primary/50 focus:outline-none focus:ring-2 focus:ring-secondary border border-transparent transition-all min-h-[44px]"
      />
    </div>
  )
}
