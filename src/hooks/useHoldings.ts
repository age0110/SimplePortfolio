import { useLiveQuery } from 'dexie-react-hooks'
import { db, generateId } from '../db/database'
import type { Holding, Currency, HoldingFormData } from '../types'

export interface CreateHoldingInput {
  portfolioId: string
  ticker: string
  quantity: number
  avgCost: number
  currency: Currency
  categoryId: string
}

export interface UpdateHoldingInput {
  ticker?: string
  quantity?: number
  avgCost?: number
  currency?: Currency
  categoryId?: string
}

export function useHoldings(portfolioId?: string) {
  // Reactive query - filtered by portfolioId if provided
  const holdings = useLiveQuery(
    () => {
      if (portfolioId) {
        return db.holdings.where('portfolioId').equals(portfolioId).toArray()
      }
      return db.holdings.toArray()
    },
    [portfolioId]
  ) ?? []

  const isLoading = holdings === undefined

  // Create a new holding
  const createHolding = async (input: CreateHoldingInput): Promise<Holding> => {
    const now = new Date()
    const holding: Holding = {
      id: generateId(),
      portfolioId: input.portfolioId,
      ticker: input.ticker.toUpperCase().trim(),
      quantity: input.quantity,
      avgCost: input.avgCost,
      currency: input.currency,
      categoryId: input.categoryId,
      createdAt: now,
      updatedAt: now,
    }
    await db.holdings.add(holding)

    // Update ticker memory for auto-categorization
    await db.tickerMemory.put({
      ticker: holding.ticker,
      categoryId: holding.categoryId,
    })

    return holding
  }

  // Create holding from form data (handles cost type conversion)
  const createHoldingFromForm = async (formData: HoldingFormData): Promise<Holding> => {
    const avgCost = formData.costType === 'total'
      ? formData.costValue / formData.quantity
      : formData.costValue

    return createHolding({
      portfolioId: formData.portfolioId,
      ticker: formData.ticker,
      quantity: formData.quantity,
      avgCost,
      currency: formData.currency,
      categoryId: formData.categoryId,
    })
  }

  // Update an existing holding
  const updateHolding = async (id: string, input: UpdateHoldingInput): Promise<void> => {
    const updates: Partial<Holding> = {
      updatedAt: new Date(),
    }

    if (input.ticker !== undefined) {
      updates.ticker = input.ticker.toUpperCase().trim()
    }
    if (input.quantity !== undefined) {
      updates.quantity = input.quantity
    }
    if (input.avgCost !== undefined) {
      updates.avgCost = input.avgCost
    }
    if (input.currency !== undefined) {
      updates.currency = input.currency
    }
    if (input.categoryId !== undefined) {
      updates.categoryId = input.categoryId

      // Update ticker memory if category changed
      const holding = await db.holdings.get(id)
      if (holding) {
        await db.tickerMemory.put({
          ticker: holding.ticker,
          categoryId: input.categoryId,
        })
      }
    }

    await db.holdings.update(id, updates)
  }

  // Delete a holding
  const deleteHolding = async (id: string): Promise<void> => {
    await db.holdings.delete(id)
  }

  // Get a single holding by ID
  const getHolding = async (id: string): Promise<Holding | undefined> => {
    return db.holdings.get(id)
  }

  // Get holdings for multiple portfolios
  const getHoldingsForPortfolios = async (portfolioIds: string[]): Promise<Holding[]> => {
    if (portfolioIds.length === 0) return []
    return db.holdings.where('portfolioId').anyOf(portfolioIds).toArray()
  }

  return {
    holdings,
    isLoading,
    createHolding,
    createHoldingFromForm,
    updateHolding,
    deleteHolding,
    getHolding,
    getHoldingsForPortfolios,
  }
}

// Hook to get holdings for multiple selected portfolios (reactive)
export function useSelectedHoldings(portfolioIds: string[]) {
  const holdings = useLiveQuery(
    () => {
      if (portfolioIds.length === 0) return []
      return db.holdings.where('portfolioId').anyOf(portfolioIds).toArray()
    },
    [portfolioIds.join(',')]
  ) ?? []

  return { holdings, isLoading: holdings === undefined }
}

export default useHoldings
