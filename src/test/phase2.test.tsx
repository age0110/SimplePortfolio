import { describe, it, expect, beforeEach } from 'vitest'
import { db, generateId, initializeDatabase } from '../db/database'
import type { Holding, Portfolio, Category, ExchangeRates } from '../types'
import {
  calculateTotalCost,
  convertCurrency,
  calculateTotalValue,
  enrichHoldings,
  groupByCategory,
  groupByCurrency,
  groupByAsset,
} from '../utils/calculations'
import {
  formatCurrency,
  formatNumber,
  formatCompactNumber,
  formatPercentage,
  formatQuantity,
  formatDate,
  getCurrencySymbol,
  parseCurrencyString,
} from '../utils/formatters'

// Test data
const TEST_EXCHANGE_RATES: ExchangeRates = {
  USD: 1,
  AUD: 1.55,
  BTC: 0.000024,
}

// Reset database before each test
beforeEach(async () => {
  await db.delete()
  await db.open()
  await initializeDatabase()
})

describe('Phase 2: Core Data Layer Tests', () => {
  describe('Portfolio CRUD', () => {
    it('should create a portfolio', async () => {
      const now = new Date()
      const portfolio: Portfolio = {
        id: generateId(),
        name: 'Test Portfolio',
        createdAt: now,
        updatedAt: now,
      }

      await db.portfolios.add(portfolio)

      const saved = await db.portfolios.get(portfolio.id)
      expect(saved).toBeDefined()
      expect(saved?.name).toBe('Test Portfolio')
    })

    it('should read portfolios', async () => {
      const now = new Date()

      await db.portfolios.bulkAdd([
        { id: generateId(), name: 'Portfolio 1', createdAt: now, updatedAt: now },
        { id: generateId(), name: 'Portfolio 2', createdAt: now, updatedAt: now },
      ])

      const portfolios = await db.portfolios.toArray()
      expect(portfolios.length).toBe(2)
    })

    it('should update a portfolio', async () => {
      const now = new Date()
      const id = generateId()

      await db.portfolios.add({
        id,
        name: 'Original Name',
        createdAt: now,
        updatedAt: now,
      })

      await db.portfolios.update(id, { name: 'Updated Name', updatedAt: new Date() })

      const updated = await db.portfolios.get(id)
      expect(updated?.name).toBe('Updated Name')
    })

    it('should delete a portfolio', async () => {
      const now = new Date()
      const id = generateId()

      await db.portfolios.add({
        id,
        name: 'To Delete',
        createdAt: now,
        updatedAt: now,
      })

      await db.portfolios.delete(id)

      const deleted = await db.portfolios.get(id)
      expect(deleted).toBeUndefined()
    })
  })

  describe('Holdings CRUD', () => {
    let portfolioId: string
    let categoryId: string

    beforeEach(async () => {
      const now = new Date()
      portfolioId = generateId()
      const categories = await db.categories.toArray()
      categoryId = categories[0].id

      await db.portfolios.add({
        id: portfolioId,
        name: 'Test Portfolio',
        createdAt: now,
        updatedAt: now,
      })
    })

    it('should create a holding', async () => {
      const now = new Date()
      const holding: Holding = {
        id: generateId(),
        portfolioId,
        ticker: 'AAPL',
        quantity: 10,
        avgCost: 150,
        currency: 'USD',
        categoryId,
        createdAt: now,
        updatedAt: now,
      }

      await db.holdings.add(holding)

      const saved = await db.holdings.get(holding.id)
      expect(saved).toBeDefined()
      expect(saved?.ticker).toBe('AAPL')
      expect(saved?.quantity).toBe(10)
    })

    it('should read holdings by portfolio', async () => {
      const now = new Date()

      await db.holdings.bulkAdd([
        { id: generateId(), portfolioId, ticker: 'AAPL', quantity: 10, avgCost: 150, currency: 'USD', categoryId, createdAt: now, updatedAt: now },
        { id: generateId(), portfolioId, ticker: 'GOOGL', quantity: 5, avgCost: 140, currency: 'USD', categoryId, createdAt: now, updatedAt: now },
      ])

      const holdings = await db.holdings.where('portfolioId').equals(portfolioId).toArray()
      expect(holdings.length).toBe(2)
    })

    it('should update a holding', async () => {
      const now = new Date()
      const id = generateId()

      await db.holdings.add({
        id,
        portfolioId,
        ticker: 'AAPL',
        quantity: 10,
        avgCost: 150,
        currency: 'USD',
        categoryId,
        createdAt: now,
        updatedAt: now,
      })

      await db.holdings.update(id, { quantity: 20, avgCost: 160 })

      const updated = await db.holdings.get(id)
      expect(updated?.quantity).toBe(20)
      expect(updated?.avgCost).toBe(160)
    })

    it('should delete a holding', async () => {
      const now = new Date()
      const id = generateId()

      await db.holdings.add({
        id,
        portfolioId,
        ticker: 'AAPL',
        quantity: 10,
        avgCost: 150,
        currency: 'USD',
        categoryId,
        createdAt: now,
        updatedAt: now,
      })

      await db.holdings.delete(id)

      const deleted = await db.holdings.get(id)
      expect(deleted).toBeUndefined()
    })
  })

  describe('Categories CRUD', () => {
    it('should have default categories seeded', async () => {
      const categories = await db.categories.toArray()
      expect(categories.length).toBe(8)

      const names = categories.map(c => c.name)
      expect(names).toContain('Crypto')
      expect(names).toContain('Stock')
    })

    it('should create a custom category', async () => {
      const category: Category = {
        id: generateId(),
        name: 'Custom Category',
        color: '#FF0000',
        isDefault: false,
      }

      await db.categories.add(category)

      const categories = await db.categories.toArray()
      expect(categories.length).toBe(9)
    })

    it('should update a category', async () => {
      const categories = await db.categories.toArray()
      const categoryToUpdate = categories[0]

      await db.categories.update(categoryToUpdate.id, { color: '#00FF00' })

      const updated = await db.categories.get(categoryToUpdate.id)
      expect(updated?.color).toBe('#00FF00')
    })

    it('should delete a custom category', async () => {
      const customCategory: Category = {
        id: generateId(),
        name: 'To Delete',
        color: '#FF0000',
        isDefault: false,
      }

      await db.categories.add(customCategory)
      await db.categories.delete(customCategory.id)

      const deleted = await db.categories.get(customCategory.id)
      expect(deleted).toBeUndefined()
    })
  })

  describe('Ticker Memory', () => {
    it('should store ticker memory', async () => {
      const categories = await db.categories.toArray()
      const categoryId = categories[0].id

      await db.tickerMemory.put({
        ticker: 'AAPL',
        categoryId,
      })

      const memory = await db.tickerMemory.get('AAPL')
      expect(memory).toBeDefined()
      expect(memory?.categoryId).toBe(categoryId)
    })

    it('should retrieve ticker memory', async () => {
      const categories = await db.categories.toArray()
      const stockCategory = categories.find(c => c.name === 'Stock')!

      await db.tickerMemory.put({
        ticker: 'GOOGL',
        categoryId: stockCategory.id,
      })

      const memory = await db.tickerMemory.get('GOOGL')
      expect(memory?.categoryId).toBe(stockCategory.id)
    })

    it('should update ticker memory when category changes', async () => {
      const categories = await db.categories.toArray()
      const stockCategory = categories.find(c => c.name === 'Stock')!
      const etfCategory = categories.find(c => c.name === 'ETF')!

      await db.tickerMemory.put({ ticker: 'VTI', categoryId: stockCategory.id })
      await db.tickerMemory.put({ ticker: 'VTI', categoryId: etfCategory.id })

      const memory = await db.tickerMemory.get('VTI')
      expect(memory?.categoryId).toBe(etfCategory.id)
    })
  })

  describe('Calculation Utilities', () => {
    it('should calculate total cost', () => {
      const holding: Holding = {
        id: '1',
        portfolioId: '1',
        ticker: 'AAPL',
        quantity: 10,
        avgCost: 150,
        currency: 'USD',
        categoryId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(calculateTotalCost(holding)).toBe(1500)
    })

    it('should convert currency USD to AUD', () => {
      const result = convertCurrency(100, 'USD', 'AUD', TEST_EXCHANGE_RATES)
      expect(result).toBe(155) // 100 * 1.55
    })

    it('should convert currency AUD to USD', () => {
      const result = convertCurrency(155, 'AUD', 'USD', TEST_EXCHANGE_RATES)
      expect(result).toBe(100) // 155 / 1.55
    })

    it('should not convert same currency', () => {
      const result = convertCurrency(100, 'USD', 'USD', TEST_EXCHANGE_RATES)
      expect(result).toBe(100)
    })

    it('should calculate total value of holdings', () => {
      const holdings: Holding[] = [
        { id: '1', portfolioId: '1', ticker: 'AAPL', quantity: 10, avgCost: 100, currency: 'USD', categoryId: '1', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', portfolioId: '1', ticker: 'BTC', quantity: 1, avgCost: 50000, currency: 'USD', categoryId: '2', createdAt: new Date(), updatedAt: new Date() },
      ]

      const total = calculateTotalValue(holdings, 'USD', TEST_EXCHANGE_RATES)
      expect(total).toBe(51000) // 1000 + 50000
    })

    it('should enrich holdings with calculations', async () => {
      const categories = await db.categories.toArray()
      const stockCategory = categories.find(c => c.name === 'Stock')!

      const holdings: Holding[] = [
        { id: '1', portfolioId: '1', ticker: 'AAPL', quantity: 10, avgCost: 100, currency: 'USD', categoryId: stockCategory.id, createdAt: new Date(), updatedAt: new Date() },
      ]

      const enriched = enrichHoldings(holdings, categories, 'USD', TEST_EXCHANGE_RATES)

      expect(enriched[0].totalCost).toBe(1000)
      expect(enriched[0].totalValue).toBe(1000)
      expect(enriched[0].percentageOfPortfolio).toBe(100)
      expect(enriched[0].category?.name).toBe('Stock')
    })

    it('should group holdings by category', async () => {
      const categories = await db.categories.toArray()
      const stockCategory = categories.find(c => c.name === 'Stock')!
      const cryptoCategory = categories.find(c => c.name === 'Crypto')!

      const holdings: Holding[] = [
        { id: '1', portfolioId: '1', ticker: 'AAPL', quantity: 10, avgCost: 100, currency: 'USD', categoryId: stockCategory.id, createdAt: new Date(), updatedAt: new Date() },
        { id: '2', portfolioId: '1', ticker: 'BTC', quantity: 1, avgCost: 1000, currency: 'USD', categoryId: cryptoCategory.id, createdAt: new Date(), updatedAt: new Date() },
      ]

      const grouped = groupByCategory(holdings, categories, 'USD', TEST_EXCHANGE_RATES)

      expect(grouped.size).toBe(2)
      expect(grouped.get(stockCategory.id)?.total).toBe(1000)
      expect(grouped.get(cryptoCategory.id)?.total).toBe(1000)
      expect(grouped.get(stockCategory.id)?.percentage).toBe(50)
    })

    it('should group holdings by currency', () => {
      const holdings: Holding[] = [
        { id: '1', portfolioId: '1', ticker: 'AAPL', quantity: 10, avgCost: 100, currency: 'USD', categoryId: '1', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', portfolioId: '1', ticker: 'CBA', quantity: 10, avgCost: 100, currency: 'AUD', categoryId: '1', createdAt: new Date(), updatedAt: new Date() },
      ]

      const grouped = groupByCurrency(holdings, 'USD', TEST_EXCHANGE_RATES)

      expect(grouped.size).toBe(2)
      expect(grouped.get('USD')?.total).toBe(1000)
      // AUD holding: 1000 AUD / 1.55 = ~645.16 USD
      expect(grouped.get('AUD')?.total).toBeCloseTo(645.16, 1)
    })

    it('should group holdings by asset', () => {
      const holdings: Holding[] = [
        { id: '1', portfolioId: '1', ticker: 'AAPL', quantity: 10, avgCost: 100, currency: 'USD', categoryId: '1', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', portfolioId: '2', ticker: 'AAPL', quantity: 5, avgCost: 110, currency: 'USD', categoryId: '1', createdAt: new Date(), updatedAt: new Date() },
      ]

      const grouped = groupByAsset(holdings, 'USD', TEST_EXCHANGE_RATES)

      expect(grouped.size).toBe(1)
      expect(grouped.get('AAPL')?.totalQuantity).toBe(15)
      expect(grouped.get('AAPL')?.total).toBe(1550) // 1000 + 550
    })
  })

  describe('Formatting Utilities', () => {
    it('should format USD currency', () => {
      expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56')
    })

    it('should format AUD currency', () => {
      expect(formatCurrency(1234.56, 'AUD')).toBe('A$1,234.56')
    })

    it('should format BTC currency with 8 decimals', () => {
      expect(formatCurrency(0.12345678, 'BTC')).toBe('₿0.12345678')
    })

    it('should format compact numbers', () => {
      expect(formatCompactNumber(1234, 2)).toBe('1.23K')
      expect(formatCompactNumber(1234567, 2)).toBe('1.23M')
      expect(formatCompactNumber(1234567890, 2)).toBe('1.23B')
    })

    it('should format currency in compact form', () => {
      expect(formatCurrency(1234567, 'USD', { compact: true })).toBe('$1.23M')
    })

    it('should format percentages', () => {
      expect(formatPercentage(45.678, 2)).toBe('45.68%')
      expect(formatPercentage(100, 0)).toBe('100%')
    })

    it('should format numbers with separators', () => {
      expect(formatNumber(1234567.89, 2)).toBe('1,234,567.89')
    })

    it('should format quantities appropriately', () => {
      expect(formatQuantity(0.00001)).toBe('0.00001000')
      expect(formatQuantity(0.5)).toBe('0.500000')
      expect(formatQuantity(50)).toBe('50.0000')
      expect(formatQuantity(1000)).toBe('1,000.00')
    })

    it('should format dates', () => {
      const date = new Date('2025-06-15T12:00:00')
      const formatted = formatDate(date)
      expect(formatted).toContain('Jun')
      expect(formatted).toContain('15')
      expect(formatted).toContain('2025')
    })

    it('should get currency symbol', () => {
      expect(getCurrencySymbol('USD')).toBe('$')
      expect(getCurrencySymbol('AUD')).toBe('A$')
      expect(getCurrencySymbol('BTC')).toBe('₿')
    })

    it('should parse currency string to number', () => {
      expect(parseCurrencyString('$1,234.56')).toBe(1234.56)
      expect(parseCurrencyString('A$999.00')).toBe(999)
      expect(parseCurrencyString('₿0.12345678')).toBe(0.12345678)
    })
  })
})
