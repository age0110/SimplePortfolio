import { useLiveQuery } from 'dexie-react-hooks'
import { db, generateId } from '../db/database'
import type { Portfolio } from '../types'

export interface CreatePortfolioInput {
  name: string
}

export interface UpdatePortfolioInput {
  name?: string
}

export function usePortfolios() {
  // Reactive query - automatically updates when data changes
  const portfolios = useLiveQuery(() =>
    db.portfolios.orderBy('createdAt').reverse().toArray()
  ) ?? []

  const isLoading = portfolios === undefined

  // Create a new portfolio
  const createPortfolio = async (input: CreatePortfolioInput): Promise<Portfolio> => {
    const now = new Date()
    const portfolio: Portfolio = {
      id: generateId(),
      name: input.name.trim(),
      createdAt: now,
      updatedAt: now,
    }
    await db.portfolios.add(portfolio)
    return portfolio
  }

  // Update an existing portfolio
  const updatePortfolio = async (id: string, input: UpdatePortfolioInput): Promise<void> => {
    const updates: Partial<Portfolio> = {
      updatedAt: new Date(),
    }
    if (input.name !== undefined) {
      updates.name = input.name.trim()
    }
    await db.portfolios.update(id, updates)
  }

  // Delete a portfolio and all its holdings
  const deletePortfolio = async (id: string): Promise<void> => {
    await db.transaction('rw', [db.portfolios, db.holdings], async () => {
      // Delete all holdings in this portfolio
      await db.holdings.where('portfolioId').equals(id).delete()
      // Delete the portfolio
      await db.portfolios.delete(id)
    })
  }

  // Get a single portfolio by ID
  const getPortfolio = async (id: string): Promise<Portfolio | undefined> => {
    return db.portfolios.get(id)
  }

  return {
    portfolios,
    isLoading,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    getPortfolio,
  }
}

export default usePortfolios
