import { useMemo } from 'react'

interface CategoryBadgeProps {
  name: string
  color: string
  size?: 'sm' | 'md'
  className?: string
}

export function CategoryBadge({
  name,
  color,
  size = 'sm',
  className = '',
}: CategoryBadgeProps) {
  // Convert hex color to RGB for opacity control
  const rgbColor = useMemo(() => {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    return `${r}, ${g}, ${b}`
  }, [color])

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1.5',
    md: 'px-2.5 py-1 text-sm gap-2',
  }

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
  }

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-md
        transition-all duration-200
        ${sizeClasses[size]}
        ${className}
      `}
      style={{
        backgroundColor: `rgba(${rgbColor}, 0.1)`,
        color: `rgba(${rgbColor}, 0.9)`,
      }}
    >
      {/* Colored dot with subtle glow */}
      <span
        className={`${dotSizes[size]} rounded-full flex-shrink-0`}
        style={{
          backgroundColor: color,
          boxShadow: `0 0 6px rgba(${rgbColor}, 0.4)`,
        }}
      />
      <span className="truncate">{name}</span>
    </span>
  )
}

export default CategoryBadge
