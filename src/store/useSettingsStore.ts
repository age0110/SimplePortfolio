import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Currency, Theme, ExchangeRates } from '../types'

interface SettingsState {
  // Settings
  displayCurrency: Currency
  theme: Theme
  exchangeRates: ExchangeRates
  lastRateUpdate: Date | null

  // Actions
  setDisplayCurrency: (currency: Currency) => void
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setExchangeRates: (rates: ExchangeRates) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Default values
      displayCurrency: 'USD',
      theme: 'dark',
      exchangeRates: {
        USD: 1,
        AUD: 1.55,
        BTC: 0.000024,
      },
      lastRateUpdate: null,

      // Actions
      setDisplayCurrency: (currency) => set({ displayCurrency: currency }),

      setTheme: (theme) => {
        // Update document class for Tailwind dark mode
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        set({ theme })
      },

      toggleTheme: () => {
        const currentTheme = get().theme
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark'

        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        set({ theme: newTheme })
      },

      setExchangeRates: (rates) =>
        set({
          exchangeRates: rates,
          lastRateUpdate: new Date(),
        }),
    }),
    {
      name: 'portfolio-settings',
      // Initialize theme on hydration
      onRehydrateStorage: () => (state) => {
        if (state?.theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
    }
  )
)

export default useSettingsStore
