import { type ReactNode } from 'react'
import { Menu } from 'lucide-react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { useUIStore } from '../../store/useUIStore'
import type { Portfolio } from '../../types'

interface LayoutProps {
  children: ReactNode
  portfolios: Portfolio[]
  totalValue?: number
  onCreatePortfolio: () => void
  onRefreshRates?: () => void
  isLoadingRates?: boolean
  isLoadingPortfolios?: boolean
}

export function Layout({
  children,
  portfolios,
  totalValue = 0,
  onCreatePortfolio,
  onRefreshRates,
  isLoadingRates = false,
  isLoadingPortfolios = false,
}: LayoutProps) {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <Header
        totalValue={totalValue}
        isLoadingRates={isLoadingRates}
        onRefreshRates={onRefreshRates}
      />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          portfolios={portfolios}
          onCreatePortfolio={onCreatePortfolio}
          isLoading={isLoadingPortfolios}
        />

        {/* Main Content */}
        <main
          className={`
            flex-1 min-h-[calc(100vh-4rem)]
            transition-all duration-300
            ${sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-0'}
          `}
        >
          {/* Mobile menu button */}
          <div className="lg:hidden sticky top-16 z-30 px-4 py-3 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/[0.06]">
            <button
              onClick={toggleSidebar}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.08] transition-all"
            >
              <Menu size={18} />
              <span className="text-sm font-medium">Portfolios</span>
            </button>
          </div>

          {/* Page Content */}
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
