import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'

export function useTickerMemory() {
  // Reactive query - all ticker memories
  const tickerMemories = useLiveQuery(() =>
    db.tickerMemory.toArray()
  ) ?? []

  const isLoading = tickerMemories === undefined

  // Create a lookup map for efficient ticker memory access
  const tickerMemoryMap = new Map(tickerMemories.map(tm => [tm.ticker, tm.categoryId]))

  // Get suggested category for a ticker
  const getSuggestedCategory = async (ticker: string): Promise<string | undefined> => {
    const normalizedTicker = ticker.toUpperCase().trim()
    const memory = await db.tickerMemory.get(normalizedTicker)
    return memory?.categoryId
  }

  // Get suggested category synchronously (from cached data)
  const getSuggestedCategorySync = (ticker: string): string | undefined => {
    const normalizedTicker = ticker.toUpperCase().trim()
    return tickerMemoryMap.get(normalizedTicker)
  }

  // Store ticker memory (called automatically when creating/updating holdings)
  const setTickerMemory = async (ticker: string, categoryId: string): Promise<void> => {
    const normalizedTicker = ticker.toUpperCase().trim()
    await db.tickerMemory.put({
      ticker: normalizedTicker,
      categoryId,
    })
  }

  // Remove ticker memory
  const removeTickerMemory = async (ticker: string): Promise<void> => {
    const normalizedTicker = ticker.toUpperCase().trim()
    await db.tickerMemory.delete(normalizedTicker)
  }

  // Clear all ticker memories
  const clearAllTickerMemory = async (): Promise<void> => {
    await db.tickerMemory.clear()
  }

  return {
    tickerMemories,
    tickerMemoryMap,
    isLoading,
    getSuggestedCategory,
    getSuggestedCategorySync,
    setTickerMemory,
    removeTickerMemory,
    clearAllTickerMemory,
  }
}

export default useTickerMemory
