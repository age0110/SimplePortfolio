import { useEffect, useState } from 'react'
import { Layout } from './components/layout'
import { Card } from './components/ui'
import { initializeDatabase } from './db/database'
import { usePortfolios, useHoldings, useCategories } from './hooks'
import { useSettingsStore } from './store'
import { useUIStore } from './store'
import { CreatePortfolioModal, ViewModeToggle, PortfolioCard } from './components/portfolio'
import { calculateTotalValue, createPortfolioSummaries } from './utils/calculations'
import { formatCurrency } from './utils/formatters'

function App() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Initialize database on mount
  useEffect(() => {
    initializeDatabase().then(() => {
      setIsInitialized(true)
    })
  }, [])

  // Data hooks
  const { portfolios, createPortfolio, isLoading: portfoliosLoading } = usePortfolios()
  const { holdings } = useHoldings()
  const { categories } = useCategories()

  // Settings
  const { displayCurrency, exchangeRates } = useSettingsStore()
  const { selectedPortfolioIds, viewMode } = useUIStore()

  // Calculate total value of selected portfolios
  const selectedHoldings = holdings.filter(h =>
    selectedPortfolioIds.length === 0 || selectedPortfolioIds.includes(h.portfolioId)
  )
  const totalValue = calculateTotalValue(selectedHoldings, displayCurrency, exchangeRates)

  // Create portfolio summaries for side-by-side view
  const portfolioSummaries = createPortfolioSummaries(
    portfolios.filter(p => selectedPortfolioIds.includes(p.id)),
    holdings,
    categories,
    displayCurrency,
    exchangeRates
  )

  // Loading state
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/50 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Layout
      portfolios={portfolios}
      totalValue={totalValue}
      onCreatePortfolio={() => setShowCreateModal(true)}
      isLoadingPortfolios={portfoliosLoading}
    >
      {/* View Mode Toggle */}
      {selectedPortfolioIds.length > 1 && (
        <div className="flex justify-end mb-6">
          <ViewModeToggle />
        </div>
      )}

      {/* Main content area */}
      {viewMode === 'sideBySide' && selectedPortfolioIds.length > 1 ? (
        // Side by Side View
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {portfolioSummaries.map((summary) => (
            <PortfolioCard
              key={summary.portfolio.id}
              portfolio={summary.portfolio}
              totalValue={summary.totalValue}
              holdingsCount={summary.holdingsCount}
              displayCurrency={displayCurrency}
            />
          ))}
        </div>
      ) : (
        // Combined View
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Holdings Section */}
          <div className="lg:col-span-2">
            <Card>
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
                <h3 className="text-lg font-medium text-white mb-2">
                  {selectedHoldings.length === 0 ? 'No holdings yet' : 'Holdings'}
                </h3>
                <p className="text-sm text-white/40 max-w-sm mx-auto">
                  {selectedHoldings.length === 0
                    ? 'Create a portfolio and start adding your holdings to track your investments.'
                    : `${selectedHoldings.length} holdings worth ${formatCurrency(totalValue, displayCurrency)}`
                  }
                </p>
              </div>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="lg:col-span-1">
            <Card>
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
                      d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Charts</h3>
                <p className="text-sm text-white/40">
                  Add holdings to see allocation charts
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Create Portfolio Modal */}
      <CreatePortfolioModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={async (name) => {
          await createPortfolio({ name })
        }}
      />
    </Layout>
  )
}

export default App
