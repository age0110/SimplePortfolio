import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChartView, ViewMode } from '../types'

interface UIState {
  // Portfolio selection
  selectedPortfolioIds: string[]

  // View modes
  viewMode: ViewMode
  chartView: ChartView

  // Sidebar state
  sidebarCollapsed: boolean

  // Actions
  selectPortfolio: (id: string) => void
  deselectPortfolio: (id: string) => void
  togglePortfolioSelection: (id: string) => void
  selectAllPortfolios: (ids: string[]) => void
  deselectAllPortfolios: () => void

  setViewMode: (mode: ViewMode) => void
  setChartView: (view: ChartView) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Default values
      selectedPortfolioIds: [],
      viewMode: 'combined',
      chartView: 'asset',
      sidebarCollapsed: false,

      // Portfolio selection actions
      selectPortfolio: (id) =>
        set((state) => ({
          selectedPortfolioIds: state.selectedPortfolioIds.includes(id)
            ? state.selectedPortfolioIds
            : [...state.selectedPortfolioIds, id],
        })),

      deselectPortfolio: (id) =>
        set((state) => ({
          selectedPortfolioIds: state.selectedPortfolioIds.filter(
            (pid) => pid !== id
          ),
        })),

      togglePortfolioSelection: (id) => {
        const { selectedPortfolioIds } = get()
        if (selectedPortfolioIds.includes(id)) {
          set({
            selectedPortfolioIds: selectedPortfolioIds.filter((pid) => pid !== id),
          })
        } else {
          set({
            selectedPortfolioIds: [...selectedPortfolioIds, id],
          })
        }
      },

      selectAllPortfolios: (ids) => set({ selectedPortfolioIds: ids }),

      deselectAllPortfolios: () => set({ selectedPortfolioIds: [] }),

      // View mode actions
      setViewMode: (mode) => set({ viewMode: mode }),
      setChartView: (view) => set({ chartView: view }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'portfolio-ui',
    }
  )
)

export default useUIStore
