// Currency types
export type Currency = 'AUD' | 'USD' | 'BTC'

// Theme types
export type Theme = 'dark' | 'light'

// Portfolio model
export interface Portfolio {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

// Holding model
export interface Holding {
  id: string
  portfolioId: string
  ticker: string
  quantity: number
  avgCost: number // per unit in the specified currency
  currency: Currency
  categoryId: string
  createdAt: Date
  updatedAt: Date
}

// Category model
export interface Category {
  id: string
  name: string
  color: string // hex color for charts
  isDefault: boolean // true for system categories, false for custom
}

// Ticker memory for auto-categorization
export interface TickerMemory {
  ticker: string
  categoryId: string
}

// Settings model
export interface Settings {
  id: string // always 'settings' for single record
  displayCurrency: Currency
  theme: Theme
  exchangeRates: ExchangeRates
  lastRateUpdate: Date | null
}

// Exchange rates record
export interface ExchangeRates {
  // Base currency is USD
  AUD: number // USD to AUD rate
  BTC: number // USD to BTC rate
  USD: number // Always 1
}

// Default categories with colors
export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Crypto', color: '#F7931A', isDefault: true },
  { name: 'Stock', color: '#4CAF50', isDefault: true },
  { name: 'ETF', color: '#2196F3', isDefault: true },
  { name: 'Bond', color: '#9C27B0', isDefault: true },
  { name: 'Cash', color: '#607D8B', isDefault: true },
  { name: 'Real Estate', color: '#795548', isDefault: true },
  { name: 'Commodities', color: '#FFD700', isDefault: true },
  { name: 'Options', color: '#E91E63', isDefault: true },
]

// Chart view types
export type ChartView = 'asset' | 'category' | 'currency' | 'portfolio'

// Dashboard view mode
export type ViewMode = 'combined' | 'sideBySide'

// Form data for adding/editing holdings
export interface HoldingFormData {
  ticker: string
  quantity: number
  costType: 'average' | 'total' // whether user entered avg cost or total cost
  costValue: number
  currency: Currency
  categoryId: string
  portfolioId: string
}

// Calculated holding with additional computed fields
export interface HoldingWithCalculations extends Holding {
  totalCost: number // quantity * avgCost
  totalValue: number // current value (future: from API)
  percentageOfPortfolio: number
  category?: Category
}

// Portfolio summary
export interface PortfolioSummary {
  portfolio: Portfolio
  totalValue: number
  holdingsCount: number
  holdings: HoldingWithCalculations[]
}

// CSV row for import/export
export interface CSVRow {
  portfolio: string
  ticker: string
  quantity: number
  avg_cost: number
  currency: Currency
  category: string
}
