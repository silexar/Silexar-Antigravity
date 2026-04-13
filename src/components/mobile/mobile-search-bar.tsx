'use client'

/**
 * MobileSearchBar — Search input optimized for mobile
 *
 * Neumorphic inset style (feels sunken/active by default).
 * Supports debounced onChange and clear button.
 */

import { useRef, useState } from 'react'
import { Search, X } from 'lucide-react'

interface MobileSearchBarProps {
  placeholder?: string
  value?: string
  onChange: (value: string) => void
  onClear?: () => void
  className?: string
  autoFocus?: boolean
}

export function MobileSearchBar({
  placeholder = 'Buscar…',
  value = '',
  onChange,
  onClear,
  className = '',
  autoFocus = false,
}: MobileSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClear = () => {
    onChange('')
    onClear?.()
    inputRef.current?.focus()
  }

  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-3 py-2.5
        bg-[#E8E5E0] transition-shadow duration-150
        ${isFocused
          ? 'shadow-[inset_3px_3px_8px_#D4D1CC,inset_-3px_-3px_8px_#FFFFFF] ring-2 ring-[#1D5AE8]/20'
          : 'shadow-[inset_2px_2px_6px_#D4D1CC,inset_-2px_-2px_6px_#FFFFFF]'}
        ${className}`}
    >
      <Search
        size={16}
        className={`flex-shrink-0 transition-colors ${isFocused ? 'text-[#1D5AE8]' : 'text-[#888780]'}`}
      />
      <input
        ref={inputRef}
        type="search"
        autoFocus={autoFocus}
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent text-sm text-[#2C2C2A] placeholder-[#888780]
          outline-none border-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value.length > 0 && (
        <button
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
          className="flex h-5 w-5 flex-shrink-0 items-center justify-center
            rounded-full bg-[#D4D1CC] hover:bg-[#C8C5C0] transition-colors"
        >
          <X size={12} className="text-[#5F5E5A]" />
        </button>
      )}
    </div>
  )
}
