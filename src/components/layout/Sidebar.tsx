import { Plus, ChevronLeft, Layers, Check } from 'lucide-react'
import { useUIStore } from '../../store/useUIStore'
import { Button } from '../ui/Button'
import type { Portfolio } from '../../types'

interface SidebarProps {
  portfolios: Portfolio[]
  onCreatePortfolio: () => void
  isLoading?: boolean
}

export function Sidebar({ portfolios, onCreatePortfolio, isLoading = false }: SidebarProps) {
  const {
    selectedPortfolioIds,
    togglePortfolioSelection,
    selectAllPortfolios,
    deselectAllPortfolios,
    sidebarCollapsed,
    toggleSidebar,
  } = useUIStore()

  const allSelected = portfolios.length > 0 && selectedPortfolioIds.length === portfolios.length
  const someSelected = selectedPortfolioIds.length > 0 && selectedPortfolioIds.length < portfolios.length

  const handleSelectAll = () => {
    if (allSelected) {
      deselectAllPortfolios()
    } else {
      selectAllPortfolios(portfolios.map((p) => p.id))
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-72 lg:w-64
          bg-[#0a0a0a] lg:bg-transparent
          border-r border-white/[0.06]
          flex flex-col
          transition-transform duration-300 ease-out
          ${sidebarCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0' : 'translate-x-0'}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/[0.06] lg:hidden">
          <span className="text-sm font-medium text-white">Portfolios</span>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-white/50">
              <Layers size={14} />
              <span className="text-xs font-medium uppercase tracking-wider">Portfolios</span>
            </div>
            <span className="text-xs text-white/30">{portfolios.length}</span>
          </div>

          {/* Select All */}
          <button
            onClick={handleSelectAll}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors mb-2"
          >
            <div
              className={`
                w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200
                ${allSelected
                  ? 'bg-blue-500 border-blue-500'
                  : someSelected
                    ? 'bg-blue-500/30 border-blue-500/50'
                    : 'bg-white/[0.06] border border-white/[0.15]'
                }
              `}
            >
              {(allSelected || someSelected) && (
                <Check size={14} className="text-white" />
              )}
            </div>
            <span className="text-sm font-medium text-white/80">All Portfolios</span>
          </button>

          {/* Divider */}
          <div className="h-px bg-white/[0.06] my-3" />

          {/* Portfolio List */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 rounded-xl bg-white/[0.03] animate-pulse"
                />
              ))}
            </div>
          ) : portfolios.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
                <Layers size={24} className="text-white/20" />
              </div>
              <p className="text-sm text-white/40 mb-1">No portfolios yet</p>
              <p className="text-xs text-white/25">Create one to get started</p>
            </div>
          ) : (
            <div className="space-y-1">
              {portfolios.map((portfolio) => {
                const isSelected = selectedPortfolioIds.includes(portfolio.id)
                return (
                  <button
                    key={portfolio.id}
                    onClick={() => togglePortfolioSelection(portfolio.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                      transition-all duration-200
                      ${isSelected ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'}
                    `}
                  >
                    <div
                      className={`
                        w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200
                        ${isSelected
                          ? 'bg-blue-500 border-blue-500'
                          : 'bg-white/[0.06] border border-white/[0.15]'
                        }
                      `}
                    >
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>
                    <div className="flex-1 text-left">
                      <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-white/70'}`}>
                        {portfolio.name}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Add Portfolio Button */}
        <div className="p-4 border-t border-white/[0.06]">
          <Button
            variant="secondary"
            size="md"
            onClick={onCreatePortfolio}
            leftIcon={<Plus size={18} />}
            className="w-full"
          >
            New Portfolio
          </Button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
