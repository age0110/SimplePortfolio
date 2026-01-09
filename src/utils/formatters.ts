import type { Currency } from '../types'

/**
 * Currency display configuration
 */
const CURRENCY_CONFIG: Record<Currency, { symbol: string; decimals: number; position: 'before' | 'after' }> = {
  USD: { symbol: '$', decimals: 2, position: 'before' },
  AUD: { symbol: 'A$', decimals: 2, position: 'before' },
  BTC: { symbol: '₿', decimals: 8, position: 'before' },
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  value: number,
  currency: Currency,
  options?: {
    showSymbol?: boolean
    compact?: boolean
    decimals?: number
  }
): string {
  const config = CURRENCY_CONFIG[currency]
  const showSymbol = options?.showSymbol ?? true
  const compact = options?.compact ?? false
  const decimals = options?.decimals ?? config.decimals

  let formattedValue: string

  if (compact && Math.abs(value) >= 1000) {
    formattedValue = formatCompactNumber(value, decimals)
  } else {
    formattedValue = formatNumber(value, decimals)
  }

  if (!showSymbol) return formattedValue

  return config.position === 'before'
    ? `${config.symbol}${formattedValue}`
    : `${formattedValue} ${config.symbol}`
}

/**
 * Format a number with thousands separators
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format a number in compact form (1K, 1M, etc.)
 */
export function formatCompactNumber(value: number, decimals: number = 2): string {
  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''

  if (absValue >= 1_000_000_000) {
    return `${sign}${formatNumber(absValue / 1_000_000_000, decimals)}B`
  }
  if (absValue >= 1_000_000) {
    return `${sign}${formatNumber(absValue / 1_000_000, decimals)}M`
  }
  if (absValue >= 1_000) {
    return `${sign}${formatNumber(absValue / 1_000, decimals)}K`
  }
  return formatNumber(value, decimals)
}

/**
 * Format a percentage value
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${formatNumber(value, decimals)}%`
}

/**
 * Format a quantity (handles different decimal places for crypto vs stocks)
 */
export function formatQuantity(value: number, _ticker?: string): string {
  // For very small quantities (like BTC), show more decimals
  if (value < 0.001) {
    return formatNumber(value, 8)
  }
  if (value < 1) {
    return formatNumber(value, 6)
  }
  if (value < 100) {
    return formatNumber(value, 4)
  }
  // For larger quantities, show fewer decimals
  return formatNumber(value, 2)
}

/**
 * Format a date
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

/**
 * Format a date with time
 */
export function formatDateTime(date: Date | string | null): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string | null): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return formatDate(d)
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_CONFIG[currency].symbol
}

/**
 * Parse a currency string back to number
 */
export function parseCurrencyString(value: string): number {
  // Remove currency symbols and whitespace
  const cleaned = value.replace(/[^0-9.-]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 3)}...`
}
