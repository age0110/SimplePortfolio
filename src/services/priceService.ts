// Common crypto tickers mapped to CoinGecko IDs
const CRYPTO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  ADA: 'cardano',
  DOT: 'polkadot',
  DOGE: 'dogecoin',
  XRP: 'ripple',
  AVAX: 'avalanche-2',
  MATIC: 'matic-network',
  LINK: 'chainlink',
  UNI: 'uniswap',
  ATOM: 'cosmos',
  LTC: 'litecoin',
  BCH: 'bitcoin-cash',
  XLM: 'stellar',
  ALGO: 'algorand',
  FIL: 'filecoin',
  NEAR: 'near',
  APT: 'aptos',
  ARB: 'arbitrum',
  OP: 'optimism',
}

interface PriceResult {
  price: number | null
  currency: 'USD'
  error?: string
}

// Fetch crypto price from CoinGecko
async function fetchCryptoPrice(ticker: string): Promise<PriceResult> {
  const coinId = CRYPTO_IDS[ticker.toUpperCase()]
  if (!coinId) {
    return { price: null, currency: 'USD', error: 'Unknown crypto ticker' }
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
    )

    if (!response.ok) {
      return { price: null, currency: 'USD', error: 'Failed to fetch price' }
    }

    const data = await response.json()
    const price = data[coinId]?.usd

    if (typeof price === 'number') {
      return { price, currency: 'USD' }
    }

    return { price: null, currency: 'USD', error: 'Price not found' }
  } catch {
    return { price: null, currency: 'USD', error: 'Network error' }
  }
}

// Fetch stock/ETF price from Yahoo Finance
async function fetchStockPrice(ticker: string): Promise<PriceResult> {
  try {
    // Use Yahoo Finance's chart API endpoint
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`
    )

    if (!response.ok) {
      return { price: null, currency: 'USD', error: 'Ticker not found' }
    }

    const data = await response.json()
    const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice

    if (typeof price === 'number') {
      return { price, currency: 'USD' }
    }

    return { price: null, currency: 'USD', error: 'Price not found' }
  } catch {
    return { price: null, currency: 'USD', error: 'Network error' }
  }
}

// Check if ticker is a known crypto
export function isCryptoTicker(ticker: string): boolean {
  return ticker.toUpperCase() in CRYPTO_IDS
}

// Main function to fetch current price for any ticker
export async function fetchCurrentPrice(ticker: string): Promise<PriceResult> {
  const normalizedTicker = ticker.trim().toUpperCase()

  if (!normalizedTicker) {
    return { price: null, currency: 'USD', error: 'No ticker provided' }
  }

  // Try crypto first if it's a known crypto ticker
  if (isCryptoTicker(normalizedTicker)) {
    return fetchCryptoPrice(normalizedTicker)
  }

  // Otherwise try stock/ETF
  return fetchStockPrice(normalizedTicker)
}

// Debounced price fetcher hook helper
export function createDebouncedPriceFetcher(delayMs: number = 500) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return (ticker: string, callback: (result: PriceResult) => void) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(async () => {
      const result = await fetchCurrentPrice(ticker)
      callback(result)
    }, delayMs)

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }
}
