import { useState, useMemo } from 'react'
import { Plus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { HoldingRow } from './HoldingRow'
import { Button } from '../ui/Button'
import type { Holding, Category, Currency } from '../../types'

type SortField = 'ticker' | 'quantity' | 'cost' | 'category'
type SortDirection = 'asc' | 'desc'

interface HoldingsTableProps {
  holdings: Holding[]
  categories: Category[]
  displayCurrency: Currency
  onAddHolding?: () => void
  onEditHolding?: (holding: Holding) => void
  onDeleteHolding?: (holding: Holding) => void
  emptyMessage?: string
}

export function HoldingsTable({
  holdings,
  categories,
  displayCurrency,
  onAddHolding,
  onEditHolding,
  onDeleteHolding,
  emptyMessage = 'No holdings yet',
}: HoldingsTableProps) {
  const [sortField, setSortField] = useState<SortField>('ticker')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [showTotalCost, setShowTotalCost] = useState(false)

  // Create a map of categories for quick lookup
  const categoryMap = useMemo(() => {
    return new Map(categories.map((cat) => [cat.id, cat]))
  }, [categories])

  // Sort holdings
  const sortedHoldings = useMemo(() => {
    return [...holdings].sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'ticker':
          comparison = a.ticker.localeCompare(b.ticker)
          break
        case 'quantity':
          comparison = a.quantity - b.quantity
          break
        case 'cost':
          const aCost = showTotalCost ? a.quantity * a.avgCost : a.avgCost
          const bCost = showTotalCost ? b.quantity * b.avgCost : b.avgCost
          comparison = aCost - bCost
          break
        case 'category':
          const aCat = categoryMap.get(a.categoryId)?.name || ''
          const bCat = categoryMap.get(b.categoryId)?.name || ''
          comparison = aCat.localeCompare(bCat)
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [holdings, sortField, sortDirection, showTotalCost, categoryMap])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="text-white/20" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={14} className="text-blue-400" />
    ) : (
      <ArrowDown size={14} className="text-blue-400" />
    )
  }

  // Empty state
  if (holdings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-white/20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">{emptyMessage}</h3>
        <p className="text-sm text-white/40 max-w-sm mx-auto mb-6">
          Add your first holding to start tracking your investments.
        </p>
        {onAddHolding && (
          <Button variant="primary" onClick={onAddHolding}>
            <Plus size={18} className="mr-2" />
            Add Holding
          </Button>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Holdings <span className="text-white/40 font-normal">({holdings.length})</span>
        </h3>
        <div className="flex items-center gap-3">
          {/* Cost toggle */}
          <div className="flex items-center bg-white/[0.04] rounded-lg p-0.5">
            <button
              onClick={() => setShowTotalCost(false)}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200
                ${!showTotalCost
                  ? 'bg-white/[0.1] text-white'
                  : 'text-white/40 hover:text-white/60'
                }
              `}
            >
              Avg Cost
            </button>
            <button
              onClick={() => setShowTotalCost(true)}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200
                ${showTotalCost
                  ? 'bg-white/[0.1] text-white'
                  : 'text-white/40 hover:text-white/60'
                }
              `}
            >
              Total Cost
            </button>
          </div>

          {onAddHolding && (
            <Button variant="primary" size="sm" onClick={onAddHolding}>
              <Plus size={16} className="mr-1.5" />
              Add
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.02]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('ticker')}
                  className="flex items-center gap-1.5 text-xs font-medium text-white/50 uppercase tracking-wider hover:text-white/70 transition-colors"
                >
                  Asset
                  <SortIcon field="ticker" />
                </button>
              </th>
              <th className="text-right py-3 px-4">
                <button
                  onClick={() => handleSort('quantity')}
                  className="flex items-center gap-1.5 text-xs font-medium text-white/50 uppercase tracking-wider hover:text-white/70 transition-colors ml-auto"
                >
                  Quantity
                  <SortIcon field="quantity" />
                </button>
              </th>
              <th className="text-right py-3 px-4">
                <button
                  onClick={() => handleSort('cost')}
                  className="flex items-center gap-1.5 text-xs font-medium text-white/50 uppercase tracking-wider hover:text-white/70 transition-colors ml-auto"
                >
                  {showTotalCost ? 'Total Cost' : 'Avg Cost'}
                  <SortIcon field="cost" />
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('category')}
                  className="flex items-center gap-1.5 text-xs font-medium text-white/50 uppercase tracking-wider hover:text-white/70 transition-colors"
                >
                  Category
                  <SortIcon field="category" />
                </button>
              </th>
              <th className="py-3 px-4 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {sortedHoldings.map((holding) => (
              <HoldingRow
                key={holding.id}
                holding={holding}
                category={categoryMap.get(holding.categoryId)}
                displayCurrency={displayCurrency}
                showTotalCost={showTotalCost}
                onEdit={onEditHolding}
                onDelete={onDeleteHolding}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default HoldingsTable
