import { useEffect, useState } from 'react'
import { Layout } from './components/layout'
import { Card } from './components/ui'
import { db, initializeDatabase } from './db/database'
import { useLiveQuery } from 'dexie-react-hooks'

function App() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Initialize database on mount
  useEffect(() => {
    initializeDatabase().then(() => {
      setIsInitialized(true)
    })
  }, [])

  // Live query for portfolios
  const portfolios = useLiveQuery(
    () => db.portfolios.toArray(),
    []
  ) ?? []

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
      totalValue={0}
      onCreatePortfolio={() => setShowCreateModal(true)}
      isLoadingPortfolios={false}
    >
      {/* Main content area */}
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
              <h3 className="text-lg font-medium text-white mb-2">No holdings yet</h3>
              <p className="text-sm text-white/40 max-w-sm mx-auto">
                Create a portfolio and start adding your holdings to track your investments.
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

      {/* Create Portfolio Modal placeholder - will be implemented in Phase 3 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-white mb-4">Coming in Phase 3</h2>
            <p className="text-white/60 text-sm mb-4">
              Portfolio creation will be implemented in Phase 3.
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              Close
            </button>
          </Card>
        </div>
      )}
    </Layout>
  )
}

export default App
