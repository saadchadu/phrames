interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export default function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 sm:h-12 sm:w-12 border-2 sm:border-3',
    lg: 'h-14 w-14 sm:h-16 sm:w-16 border-3'
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`animate-spin rounded-full border-b-secondary ${sizeClasses[size]}`}></div>
      {text && (
        <p className="mt-3 sm:mt-4 text-gray-600 text-center text-sm sm:text-base px-4">{text}</p>
      )}
    </div>
  )
}