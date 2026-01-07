import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { db, initializeDatabase } from '../db/database'
import { useSettingsStore } from '../store/useSettingsStore'
import { Button, Input, Card, Toggle } from '../components/ui'

// Reset database before each test
beforeEach(async () => {
  await db.delete()
  await db.open()
  useSettingsStore.setState({
    displayCurrency: 'USD',
    theme: 'dark',
    exchangeRates: { USD: 1, AUD: 1.55, BTC: 0.000024 },
    lastRateUpdate: null,
  })
})

describe('Phase 1: Project Setup Tests', () => {
  describe('Database', () => {
    it('should initialize database with default categories', async () => {
      await initializeDatabase()

      const categories = await db.categories.toArray()
      expect(categories.length).toBe(8)

      const categoryNames = categories.map((c) => c.name)
      expect(categoryNames).toContain('Crypto')
      expect(categoryNames).toContain('Stock')
      expect(categoryNames).toContain('ETF')
      expect(categoryNames).toContain('Bond')
    })

    it('should initialize database with default settings', async () => {
      await initializeDatabase()

      const settings = await db.settings.get('settings')
      expect(settings).toBeDefined()
      expect(settings?.displayCurrency).toBe('USD')
      expect(settings?.theme).toBe('dark')
    })

    it('should not duplicate data on multiple initializations', async () => {
      await initializeDatabase()
      await initializeDatabase()
      await initializeDatabase()

      const categories = await db.categories.toArray()
      expect(categories.length).toBe(8)
    })
  })

  describe('UI Components', () => {
    it('should render Button component', () => {
      render(<Button>Test Button</Button>)
      expect(screen.getByRole('button', { name: /test button/i })).toBeInTheDocument()
    })

    it('should render Button variants', () => {
      const { rerender } = render(<Button variant="primary">Primary</Button>)
      expect(screen.getByRole('button')).toHaveClass('from-blue-500')

      rerender(<Button variant="secondary">Secondary</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-white/[0.08]')

      rerender(<Button variant="ghost">Ghost</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-transparent')
    })

    it('should render Input component', () => {
      render(<Input label="Test Label" placeholder="Enter text" />)
      expect(screen.getByLabelText(/test label/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/enter text/i)).toBeInTheDocument()
    })

    it('should render Card component', () => {
      render(<Card data-testid="card">Card Content</Card>)
      expect(screen.getByTestId('card')).toBeInTheDocument()
      expect(screen.getByText('Card Content')).toBeInTheDocument()
    })

    it('should render Toggle component', () => {
      let checked = false
      const onChange = (val: boolean) => { checked = val }

      render(<Toggle checked={checked} onChange={onChange} label="Test Toggle" />)
      expect(screen.getByRole('switch')).toBeInTheDocument()
      expect(screen.getByText('Test Toggle')).toBeInTheDocument()
    })
  })

  describe('Settings Store', () => {
    it('should have default theme as dark', () => {
      const { theme } = useSettingsStore.getState()
      expect(theme).toBe('dark')
    })

    it('should toggle theme', () => {
      const { toggleTheme } = useSettingsStore.getState()

      toggleTheme()
      expect(useSettingsStore.getState().theme).toBe('light')

      toggleTheme()
      expect(useSettingsStore.getState().theme).toBe('dark')
    })

    it('should change display currency', () => {
      const { setDisplayCurrency } = useSettingsStore.getState()

      setDisplayCurrency('AUD')
      expect(useSettingsStore.getState().displayCurrency).toBe('AUD')

      setDisplayCurrency('BTC')
      expect(useSettingsStore.getState().displayCurrency).toBe('BTC')
    })

    it('should update exchange rates', () => {
      const { setExchangeRates } = useSettingsStore.getState()

      setExchangeRates({ USD: 1, AUD: 1.60, BTC: 0.00003 })

      const state = useSettingsStore.getState()
      expect(state.exchangeRates.AUD).toBe(1.60)
      expect(state.exchangeRates.BTC).toBe(0.00003)
      expect(state.lastRateUpdate).not.toBeNull()
    })
  })
})
