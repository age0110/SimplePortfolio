import { useState, useRef, useEffect, useId, useMemo } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import type { Category } from '../../types'

interface CategoryPickerProps {
  categories: Category[]
  value: string
  onChange: (categoryId: string) => void
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  suggestedCategoryId?: string // From ticker memory
}

export function CategoryPicker({
  categories,
  value,
  onChange,
  label,
  placeholder = 'Select a category',
  error,
  disabled = false,
  suggestedCategoryId,
}: CategoryPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const id = useId()

  const selectedCategory = categories.find((cat) => cat.id === value)
  const suggestedCategory = categories.find((cat) => cat.id === suggestedCategoryId)

  // Sort categories: suggested first, then defaults, then custom
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      // Suggested category always first
      if (a.id === suggestedCategoryId) return -1
      if (b.id === suggestedCategoryId) return 1
      // Then defaults before custom
      if (a.isDefault && !b.isDefault) return -1
      if (!a.isDefault && b.isDefault) return 1
      // Then alphabetical
      return a.name.localeCompare(b.name)
    })
  }, [categories, suggestedCategoryId])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (isOpen && highlightedIndex >= 0) {
          onChange(sortedCategories[highlightedIndex].id)
          setIsOpen(false)
        } else {
          setIsOpen(true)
        }
        break
      case 'ArrowDown':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else {
          setHighlightedIndex((prev) =>
            prev < sortedCategories.length - 1 ? prev + 1 : prev
          )
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (isOpen) {
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev))
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  // Convert hex to RGB for opacity
  const hexToRgb = (hex: string) => {
    const clean = hex.replace('#', '')
    const r = parseInt(clean.substring(0, 2), 16)
    const g = parseInt(clean.substring(2, 4), 16)
    const b = parseInt(clean.substring(4, 6), 16)
    return `${r}, ${g}, ${b}`
  }

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-white/70 mb-2"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <button
          id={id}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={`
            w-full h-12
            flex items-center justify-between
            px-4
            bg-white/[0.05]
            border border-white/[0.08]
            rounded-xl
            text-left
            transition-all duration-200 ease-out
            focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07]
            focus:ring-2 focus:ring-blue-500/20
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isOpen ? 'border-blue-500/50 bg-white/[0.07] ring-2 ring-blue-500/20' : ''}
            ${error ? 'border-red-500/50' : ''}
          `}
        >
          <span className={`flex items-center gap-2.5 ${selectedCategory ? 'text-white' : 'text-white/30'}`}>
            {selectedCategory && (
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: selectedCategory.color,
                  boxShadow: `0 0 8px rgba(${hexToRgb(selectedCategory.color)}, 0.5)`,
                }}
              />
            )}
            {selectedCategory?.name || placeholder}
          </span>
          <ChevronDown
            size={18}
            className={`text-white/40 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <ul
            role="listbox"
            className={`
              absolute z-50 w-full mt-2
              py-2
              bg-[#1a1a1a]
              border border-white/[0.1]
              rounded-xl
              shadow-xl shadow-black/40
              max-h-60 overflow-auto
            `}
            style={{
              animation: 'categoryDropdown 0.15s ease-out',
            }}
          >
            {/* Suggested hint */}
            {suggestedCategory && !value && (
              <li className="px-4 py-1.5 text-xs text-white/30">
                Suggested based on previous use
              </li>
            )}

            {sortedCategories.map((category, index) => {
              const isSuggested = category.id === suggestedCategoryId
              const isSelected = category.id === value

              return (
                <li
                  key={category.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(category.id)
                    setIsOpen(false)
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`
                    flex items-center justify-between
                    px-4 py-2.5
                    cursor-pointer
                    transition-colors duration-100
                    ${highlightedIndex === index ? 'bg-white/[0.08]' : ''}
                    ${isSelected ? 'text-white' : 'text-white/70'}
                  `}
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: category.color,
                        boxShadow: `0 0 6px rgba(${hexToRgb(category.color)}, 0.4)`,
                      }}
                    />
                    <span>{category.name}</span>
                    {isSuggested && !isSelected && (
                      <span className="text-xs text-blue-400/70 ml-1">suggested</span>
                    )}
                  </span>
                  {isSelected && (
                    <Check size={16} className="text-blue-500" />
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      <style>{`
        @keyframes categoryDropdown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default CategoryPicker
