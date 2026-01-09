import type {
  Holding,
  HoldingWithCalculations,
  Category,
  Currency,
  ExchangeRates,
  PortfolioSummary,
  Portfolio,
} from '../types'

/**
 * Calculate total cost for a holding
 */
export function calculateTotalCost(holding: Holding): number {
  return holding.quantity * holding.avgCost
}

/**
 * Convert a value from one currency to another
 * Exchange rates are stored as USD to target currency
 */
export function convertCurrency(
  value: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  exchangeRates: ExchangeRates
): number {
  if (fromCurrency === toCurrency) return value

  // Convert to USD first (base currency)
  const valueInUSD = fromCurrency === 'USD'
    ? value
    : value / exchangeRates[fromCurrency]

  // Then convert to target currency
  return toCurrency === 'USD'
    ? valueInUSD
    : valueInUSD * exchangeRates[toCurrency]
}

/**
 * Convert holding value to display currency
 */
export function convertHoldingToDisplayCurrency(
  holding: Holding,
  displayCurrency: Currency,
  exchangeRates: ExchangeRates
): number {
  const totalCost = calculateTotalCost(holding)
  return convertCurrency(totalCost, holding.currency, displayCurrency, exchangeRates)
}

/**
 * Calculate total value of holdings in display currency
 */
export function calculateTotalValue(
  holdings: Holding[],
  displayCurrency: Currency,
  exchangeRates: ExchangeRates
): number {
  return holdings.reduce((total, holding) => {
    return total + convertHoldingToDisplayCurrency(holding, displayCurrency, exchangeRates)
  }, 0)
}

/**
 * Calculate percentage of total for each holding
 */
export function calculateHoldingPercentages(
  holdings: Holding[],
  displayCurrency: Currency,
  exchangeRates: ExchangeRates
): Map<string, number> {
  const total = calculateTotalValue(holdings, displayCurrency, exchangeRates)
  const percentages = new Map<string, number>()

  if (total === 0) {
    holdings.forEach(h => percentages.set(h.id, 0))
    return percentages
  }

  holdings.forEach(holding => {
    const value = convertHoldingToDisplayCurrency(holding, displayCurrency, exchangeRates)
    percentages.set(holding.id, (value / total) * 100)
  })

  return percentages
}

/**
 * Enrich holdings with calculated fields
 */
export function enrichHoldings(
  holdings: Holding[],
  categories: Category[],
  displayCurrency: Currency,
  exchangeRates: ExchangeRates
): HoldingWithCalculations[] {
  const categoryMap = new Map(categories.map(c => [c.id, c]))
  const totalValue = calculateTotalValue(holdings, displayCurrency, exchangeRates)

  return holdings.map(holding => {
    const totalCost = calculateTotalCost(holding)
    const valueInDisplayCurrency = convertHoldingToDisplayCurrency(
      holding,
      displayCurrency,
      exchangeRates
    )
    const percentageOfPortfolio = totalValue > 0
      ? (valueInDisplayCurrency / totalValue) * 100
      : 0

    return {
      ...holding,
      totalCost,
      totalValue: valueInDisplayCurrency, // For now, current value = cost (no live prices)
      percentageOfPortfolio,
      category: categoryMap.get(holding.categoryId),
    }
  })
}

/**
 * Group holdings by category and calculate totals
 */
export function groupByCategory(
  holdings: Holding[],
  categories: Category[],
  displayCurrency: Currency,
  exchangeRates: ExchangeRates
): Map<string, { category: Category; holdings: Holding[]; total: number; percentage: number }> {
  const categoryMap = new Map(categories.map(c => [c.id, c]))
  const groups = new Map<string, { category: Category; holdings: Holding[]; total: number; percentage: number }>()
  const totalValue = calculateTotalValue(holdings, displayCurrency, exchangeRates)

  holdings.forEach(holding => {
    const category = categoryMap.get(holding.categoryId)
    if (!category) return

    const existing = groups.get(holding.categoryId)
    const holdingValue = convertHoldingToDisplayCurrency(holding, displayCurrency, exchangeRates)

    if (existing) {
      existing.holdings.push(holding)
      existing.total += holdingValue
    } else {
      groups.set(holding.categoryId, {
        category,
        holdings: [holding],
        total: holdingValue,
        percentage: 0,
      })
    }
  })

  // Calculate percentages
  groups.forEach(group => {
    group.percentage = totalValue > 0 ? (group.total / totalValue) * 100 : 0
  })

  return groups
}

/**
 * Group holdings by currency and calculate totals
 */
export function groupByCurrency(
  holdings: Holding[],
  displayCurrency: Currency,
  exchangeRates: ExchangeRates
): Map<Currency, { holdings: Holding[]; total: number; percentage: number }> {
  const groups = new Map<Currency, { holdings: Holding[]; total: number; percentage: number }>()
  const totalValue = calculateTotalValue(holdings, displayCurrency, exchangeRates)

  holdings.forEach(holding => {
    const existing = groups.get(holding.currency)
    const holdingValue = convertHoldingToDisplayCurrency(holding, displayCurrency, exchangeRates)

    if (existing) {
      existing.holdings.push(holding)
      existing.total += holdingValue
    } else {
      groups.set(holding.currency, {
        holdings: [holding],
        total: holdingValue,
        percentage: 0,
      })
    }
  })

  // Calculate percentages
  groups.forEach(group => {
    group.percentage = totalValue > 0 ? (group.total / totalValue) * 100 : 0
  })

  return groups
}

/**
 * Group holdings by ticker (asset) and calculate totals
 */
export function groupByAsset(
  holdings: Holding[],
  displayCurrency: Currency,
  exchangeRates: ExchangeRates
): Map<string, { ticker: string; holdings: Holding[]; total: number; percentage: number; totalQuantity: number }> {
  const groups = new Map<string, { ticker: string; holdings: Holding[]; total: number; percentage: number; totalQuantity: number }>()
  const totalValue = calculateTotalValue(holdings, displayCurrency, exchangeRates)

  holdings.forEach(holding => {
    const existing = groups.get(holding.ticker)
    const holdingValue = convertHoldingToDisplayCurrency(holding, displayCurrency, exchangeRates)

    if (existing) {
      existing.holdings.push(holding)
      existing.total += holdingValue
      existing.totalQuantity += holding.quantity
    } else {
      groups.set(holding.ticker, {
        ticker: holding.ticker,
        holdings: [holding],
        total: holdingValue,
        percentage: 0,
        totalQuantity: holding.quantity,
      })
    }
  })

  // Calculate percentages
  groups.forEach(group => {
    group.percentage = totalValue > 0 ? (group.total / totalValue) * 100 : 0
  })

  return groups
}

/**
 * Create portfolio summaries
 */
export function createPortfolioSummaries(
  portfolios: Portfolio[],
  holdings: Holding[],
  categories: Category[],
  displayCurrency: Currency,
  exchangeRates: ExchangeRates
): PortfolioSummary[] {
  return portfolios.map(portfolio => {
    const portfolioHoldings = holdings.filter(h => h.portfolioId === portfolio.id)
    const enrichedHoldings = enrichHoldings(
      portfolioHoldings,
      categories,
      displayCurrency,
      exchangeRates
    )
    const totalValue = calculateTotalValue(portfolioHoldings, displayCurrency, exchangeRates)

    return {
      portfolio,
      totalValue,
      holdingsCount: portfolioHoldings.length,
      holdings: enrichedHoldings,
    }
  })
}
