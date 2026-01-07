import Dexie, { type EntityTable } from 'dexie'
import type { Portfolio, Holding, Category, TickerMemory, Settings } from '../types'

// Database class extending Dexie
class PortfolioDatabase extends Dexie {
  portfolios!: EntityTable<Portfolio, 'id'>
  holdings!: EntityTable<Holding, 'id'>
  categories!: EntityTable<Category, 'id'>
  tickerMemory!: EntityTable<TickerMemory, 'ticker'>
  settings!: EntityTable<Settings, 'id'>

  constructor() {
    super('PortfolioTracker')

    this.version(1).stores({
      portfolios: 'id, name, createdAt',
      holdings: 'id, portfolioId, ticker, categoryId, currency',
      categories: 'id, name, isDefault',
      tickerMemory: 'ticker, categoryId',
      settings: 'id',
    })
  }
}

// Create and export database instance
export const db = new PortfolioDatabase()

// Helper to generate unique IDs
export function generateId(): string {
  return crypto.randomUUID()
}

// Initialize database with default data if empty
export async function initializeDatabase(): Promise<void> {
  const settingsCount = await db.settings.count()

  if (settingsCount === 0) {
    // Initialize default settings
    await db.settings.add({
      id: 'settings',
      displayCurrency: 'USD',
      theme: 'dark',
      exchangeRates: {
        USD: 1,
        AUD: 1.55, // Default rates, will be updated from API
        BTC: 0.000024,
      },
      lastRateUpdate: null,
    })
  }

  const categoriesCount = await db.categories.count()

  if (categoriesCount === 0) {
    // Initialize default categories
    const defaultCategories: Category[] = [
      { id: generateId(), name: 'Crypto', color: '#F7931A', isDefault: true },
      { id: generateId(), name: 'Stock', color: '#4CAF50', isDefault: true },
      { id: generateId(), name: 'ETF', color: '#2196F3', isDefault: true },
      { id: generateId(), name: 'Bond', color: '#9C27B0', isDefault: true },
      { id: generateId(), name: 'Cash', color: '#607D8B', isDefault: true },
      { id: generateId(), name: 'Real Estate', color: '#795548', isDefault: true },
      { id: generateId(), name: 'Commodities', color: '#FFD700', isDefault: true },
      { id: generateId(), name: 'Options', color: '#E91E63', isDefault: true },
    ]

    await db.categories.bulkAdd(defaultCategories)
  }
}

export default db
