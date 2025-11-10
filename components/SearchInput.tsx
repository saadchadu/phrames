'use client'

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
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      aria-label="Search campaigns"
      className="w-full sm:w-[377px] bg-white rounded-lg px-[14px] py-[22px] text-primary text-sm sm:text-base font-medium placeholder:text-primary/50 focus:outline-none focus:ring-2 focus:ring-secondary border border-transparent transition-all min-h-[44px]"
    />
  )
}
