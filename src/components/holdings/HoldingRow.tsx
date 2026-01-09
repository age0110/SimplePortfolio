import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { CategoryBadge } from './CategoryBadge'
import type { Holding, Category, Currency } from '../../types'
import { formatCurrency, formatQuantity } from '../../utils/formatters'

interface HoldingRowProps {
  holding: Holding
  category?: Category
  displayCurrency: Currency
  showTotalCost?: boolean // false = show avg cost, true = show total cost
  onEdit?: (holding: Holding) => void
  onDelete?: (holding: Holding) => void
}

export function HoldingRow({
  holding,
  category,
  displayCurrency,
  showTotalCost = false,
  onEdit,
  onDelete,
}: HoldingRowProps) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const totalCost = holding.quantity * holding.avgCost

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
    <tr className="group border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
      {/* Ticker */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center">
            <span className="text-sm font-bold text-white/80">
              {holding.ticker.substring(0, 2)}
            </span>
          </div>
          <div>
            <p className="font-semibold text-white">{holding.ticker}</p>
            <p className="text-xs text-white/40">{holding.currency}</p>
          </div>
        </div>
      </td>

      {/* Quantity */}
      <td className="py-4 px-4 text-right">
        <span className="text-white/80 font-medium tabular-nums">
          {formatQuantity(holding.quantity)}
        </span>
      </td>

      {/* Cost (avg or total based on toggle) */}
      <td className="py-4 px-4 text-right">
        <span className="text-white/80 font-medium tabular-nums">
          {formatCurrency(
            showTotalCost ? totalCost : holding.avgCost,
            displayCurrency,
            { compact: (showTotalCost ? totalCost : holding.avgCost) >= 10000 }
          )}
        </span>
        {showTotalCost && (
          <p className="text-xs text-white/30 mt-0.5">
            @ {formatCurrency(holding.avgCost, displayCurrency)} ea
          </p>
        )}
      </td>

      {/* Category */}
      <td className="py-4 px-4">
        {category && (
          <CategoryBadge name={category.name} color={category.color} size="sm" />
        )}
      </td>

      {/* Actions */}
      <td className="py-4 px-4 text-right">
        {(onEdit || onDelete) && (
          <div className="relative inline-block" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal size={16} />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div
                className="absolute right-0 top-full mt-1 w-36 bg-[#1a1a1a] border border-white/[0.08] rounded-xl shadow-xl overflow-hidden z-10"
                style={{
                  animation: 'rowMenuAppear 0.1s ease-out',
                }}
              >
                {onEdit && (
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onEdit(holding)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onDelete(holding)
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

        <style>{`
          @keyframes rowMenuAppear {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </td>
    </tr>
  )
}

export default HoldingRow
