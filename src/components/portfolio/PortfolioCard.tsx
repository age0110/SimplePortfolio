import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { Card } from '../ui/Card'
import type { Portfolio } from '../../types'
import { formatCurrency, formatDate } from '../../utils/formatters'
import type { Currency } from '../../types'

interface PortfolioCardProps {
  portfolio: Portfolio
  totalValue: number
  holdingsCount: number
  displayCurrency: Currency
  onEdit?: (portfolio: Portfolio) => void
  onDelete?: (portfolio: Portfolio) => void
  className?: string
}

export function PortfolioCard({
  portfolio,
  totalValue,
  holdingsCount,
  displayCurrency,
  onEdit,
  onDelete,
  className = '',
}: PortfolioCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  return (
    <Card variant="default" className={`relative ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{portfolio.name}</h3>
          <p className="text-xs text-white/40 mt-0.5">
            Created {formatDate(portfolio.createdAt)}
          </p>
        </div>

        {/* Menu Button */}
        {(onEdit || onDelete) && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <MoreHorizontal size={18} />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-[#1a1a1a] border border-white/[0.08] rounded-xl shadow-xl overflow-hidden z-10">
                {onEdit && (
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onEdit(portfolio)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <Pencil size={14} />
                    Rename
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onDelete(portfolio)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-white/40 mb-1">Total Value</p>
          <p className="text-xl font-semibold text-white">
            {formatCurrency(totalValue, displayCurrency, { compact: totalValue >= 10000 })}
          </p>
        </div>
        <div>
          <p className="text-xs text-white/40 mb-1">Holdings</p>
          <p className="text-xl font-semibold text-white">
            {holdingsCount}
          </p>
        </div>
      </div>
    </Card>
  )
}

export default PortfolioCard
