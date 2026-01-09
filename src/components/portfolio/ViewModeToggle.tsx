import { LayoutGrid, Layers } from 'lucide-react'
import { useUIStore } from '../../store/useUIStore'
import type { ViewMode } from '../../types'

interface ViewModeToggleProps {
  className?: string
}

export function ViewModeToggle({ className = '' }: ViewModeToggleProps) {
  const { viewMode, setViewMode } = useUIStore()

  const options: { value: ViewMode; icon: typeof Layers; label: string }[] = [
    { value: 'combined', icon: Layers, label: 'Combined' },
    { value: 'sideBySide', icon: LayoutGrid, label: 'Side by Side' },
  ]

  return (
    <div className={`inline-flex items-center gap-1 p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl ${className}`}>
      {options.map(({ value, icon: Icon, label }) => {
        const isActive = viewMode === value
        return (
          <button
            key={value}
            onClick={() => setViewMode(value)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg
              text-sm font-medium
              transition-all duration-200
              ${isActive
                ? 'bg-white/[0.1] text-white shadow-sm'
                : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
              }
            `}
            title={label}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default ViewModeToggle
