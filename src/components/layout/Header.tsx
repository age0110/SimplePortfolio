import { Moon, Sun, RefreshCw, TrendingUp } from 'lucide-react'
import { useSettingsStore } from '../../store/useSettingsStore'
import { Select, type SelectOption } from '../ui/Select'
import type { Currency } from '../../types'

interface HeaderProps {
  totalValue?: number
  isLoadingRates?: boolean
  onRefreshRates?: () => void
}

const currencyOptions: SelectOption[] = [
  { value: 'USD', label: 'USD', icon: <span className="text-green-400">$</span> },
  { value: 'AUD', label: 'AUD', icon: <span className="text-yellow-400">$</span> },
  { value: 'BTC', label: 'BTC', icon: <span className="text-orange-400">₿</span> },
]

const currencySymbols: Record<Currency, string> = {
  USD: '$',
  AUD: 'A$',
  BTC: '₿',
}

export function Header({ totalValue = 0, isLoadingRates = false, onRefreshRates }: HeaderProps) {
  const { displayCurrency, setDisplayCurrency, theme, toggleTheme } = useSettingsStore()

  const formattedValue = displayCurrency === 'BTC'
    ? totalValue.toFixed(6)
    : totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <header className="h-16 border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left: Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white tracking-tight">
              Portfolio
            </h1>
            <p className="text-[11px] text-white/40 -mt-0.5">Tracker</p>
          </div>
        </div>

        {/* Center: Total Value */}
        <div className="hidden md:flex flex-col items-center">
          <span className="text-[11px] text-white/40 uppercase tracking-wider">Total Value</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold text-white tabular-nums">
              {currencySymbols[displayCurrency]}{formattedValue}
            </span>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {/* Currency Selector */}
          <div className="w-28">
            <Select
              options={currencyOptions}
              value={displayCurrency}
              onChange={(val) => setDisplayCurrency(val as Currency)}
            />
          </div>

          {/* Refresh Rates */}
          {onRefreshRates && (
            <button
              onClick={onRefreshRates}
              disabled={isLoadingRates}
              className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.08] transition-all duration-200 disabled:opacity-50"
              title="Refresh exchange rates"
            >
              <RefreshCw size={18} className={isLoadingRates ? 'animate-spin' : ''} />
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.08] transition-all duration-200"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
