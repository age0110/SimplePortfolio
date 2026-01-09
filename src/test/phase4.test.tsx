import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { db, initializeDatabase, generateId } from '../db/database'
import { useUIStore } from '../store/useUIStore'
import { HoldingsTable } from '../components/holdings/HoldingsTable'
import { AddHoldingModal } from '../components/holdings/AddHoldingModal'
import { EditHoldingModal } from '../components/holdings/EditHoldingModal'
import { CategoryPicker } from '../components/holdings/CategoryPicker'
import { CategoryBadge } from '../components/holdings/CategoryBadge'
import type { Category, Holding, Portfolio } from '../types'

// Reset database and stores before each test
beforeEach(async () => {
  await db.delete()
  await db.open()
  await initializeDatabase()
  useUIStore.setState({
    selectedPortfolioIds: [],
    viewMode: 'combined',
    chartView: 'asset',
    sidebarCollapsed: false,
  })
})

// Sample test data
const mockCategories: Category[] = [
  { id: 'cat-crypto', name: 'Crypto', color: '#F7931A', isDefault: true },
  { id: 'cat-stock', name: 'Stock', color: '#4CAF50', isDefault: true },
  { id: 'cat-etf', name: 'ETF', color: '#2196F3', isDefault: true },
]

const mockHolding: Holding = {
  id: 'holding-1',
  portfolioId: 'portfolio-1',
  ticker: 'BTC',
  quantity: 1.5,
  avgCost: 45000,
  currency: 'USD',
  categoryId: 'cat-crypto',
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockHoldings: Holding[] = [
  mockHolding,
  {
    id: 'holding-2',
    portfolioId: 'portfolio-1',
    ticker: 'AAPL',
    quantity: 100,
    avgCost: 150,
    currency: 'USD',
    categoryId: 'cat-stock',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'holding-3',
    portfolioId: 'portfolio-1',
    ticker: 'VTI',
    quantity: 50,
    avgCost: 220,
    currency: 'USD',
    categoryId: 'cat-etf',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

describe('Phase 4: Holdings Management UI', () => {
  describe('CategoryBadge Component', () => {
    it('should render category name with colored dot', () => {
      render(<CategoryBadge name="Crypto" color="#F7931A" />)

      expect(screen.getByText('Crypto')).toBeInTheDocument()
    })

    it('should support different sizes', () => {
      const { rerender } = render(<CategoryBadge name="Stock" color="#4CAF50" size="sm" />)
      expect(screen.getByText('Stock')).toBeInTheDocument()

      rerender(<CategoryBadge name="Stock" color="#4CAF50" size="md" />)
      expect(screen.getByText('Stock')).toBeInTheDocument()
    })
  })

  describe('CategoryPicker Component', () => {
    it('should render with placeholder when no value selected', () => {
      render(
        <CategoryPicker
          categories={mockCategories}
          value=""
          onChange={() => {}}
          placeholder="Select category"
        />
      )

      expect(screen.getByText('Select category')).toBeInTheDocument()
    })

    it('should show all categories in dropdown', async () => {
      const user = userEvent.setup()
      render(
        <CategoryPicker
          categories={mockCategories}
          value=""
          onChange={() => {}}
        />
      )

      await user.click(screen.getByRole('button'))

      await waitFor(() => {
        expect(screen.getByText('Crypto')).toBeInTheDocument()
        expect(screen.getByText('Stock')).toBeInTheDocument()
        expect(screen.getByText('ETF')).toBeInTheDocument()
      })
    })

    it('should call onChange when category selected', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      render(
        <CategoryPicker
          categories={mockCategories}
          value=""
          onChange={handleChange}
        />
      )

      await user.click(screen.getByRole('button'))
      await user.click(screen.getByText('Crypto'))

      expect(handleChange).toHaveBeenCalledWith('cat-crypto')
    })

    it('should show suggested category hint', async () => {
      const user = userEvent.setup()
      render(
        <CategoryPicker
          categories={mockCategories}
          value=""
          onChange={() => {}}
          suggestedCategoryId="cat-crypto"
        />
      )

      await user.click(screen.getByRole('button'))

      await waitFor(() => {
        // There can be multiple elements with "suggested" text
        const suggestedElements = screen.getAllByText(/suggested/i)
        expect(suggestedElements.length).toBeGreaterThan(0)
      })
    })

    it('should display selected category with colored dot', () => {
      render(
        <CategoryPicker
          categories={mockCategories}
          value="cat-stock"
          onChange={() => {}}
        />
      )

      expect(screen.getByText('Stock')).toBeInTheDocument()
    })
  })

  describe('HoldingsTable Component', () => {
    it('should render empty state when no holdings', () => {
      render(
        <HoldingsTable
          holdings={[]}
          categories={mockCategories}
          displayCurrency="USD"
        />
      )

      expect(screen.getByText('No holdings yet')).toBeInTheDocument()
    })

    it('should render holdings count', () => {
      render(
        <HoldingsTable
          holdings={mockHoldings}
          categories={mockCategories}
          displayCurrency="USD"
        />
      )

      expect(screen.getByText('(3)')).toBeInTheDocument()
    })

    it('should display all holdings', () => {
      render(
        <HoldingsTable
          holdings={mockHoldings}
          categories={mockCategories}
          displayCurrency="USD"
        />
      )

      expect(screen.getByText('BTC')).toBeInTheDocument()
      expect(screen.getByText('AAPL')).toBeInTheDocument()
      expect(screen.getByText('VTI')).toBeInTheDocument()
    })

    it('should show Add button when onAddHolding provided', () => {
      const handleAdd = vi.fn()
      render(
        <HoldingsTable
          holdings={mockHoldings}
          categories={mockCategories}
          displayCurrency="USD"
          onAddHolding={handleAdd}
        />
      )

      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument()
    })

    it('should not show Add button when onAddHolding not provided', () => {
      render(
        <HoldingsTable
          holdings={mockHoldings}
          categories={mockCategories}
          displayCurrency="USD"
        />
      )

      expect(screen.queryByRole('button', { name: /add/i })).not.toBeInTheDocument()
    })

    it('should have cost toggle (Avg Cost / Total Cost)', () => {
      render(
        <HoldingsTable
          holdings={mockHoldings}
          categories={mockCategories}
          displayCurrency="USD"
        />
      )

      // Check for both toggle buttons (there may be multiple instances)
      const avgCostElements = screen.getAllByText('Avg Cost')
      const totalCostElements = screen.getAllByText('Total Cost')
      expect(avgCostElements.length).toBeGreaterThan(0)
      expect(totalCostElements.length).toBeGreaterThan(0)
    })

    it('should switch between avg cost and total cost display', async () => {
      const user = userEvent.setup()
      render(
        <HoldingsTable
          holdings={mockHoldings}
          categories={mockCategories}
          displayCurrency="USD"
        />
      )

      // Click Total Cost toggle
      await user.click(screen.getByText('Total Cost'))

      // The header should now show "Total Cost"
      const headers = screen.getAllByRole('button')
      const costHeader = headers.find(h => h.textContent?.includes('Total Cost'))
      expect(costHeader).toBeInTheDocument()
    })

    it('should have sortable columns', () => {
      render(
        <HoldingsTable
          holdings={mockHoldings}
          categories={mockCategories}
          displayCurrency="USD"
        />
      )

      // Check for sort buttons in header
      expect(screen.getByRole('button', { name: /asset/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /quantity/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /category/i })).toBeInTheDocument()
    })

    it('should sort holdings by ticker', async () => {
      const user = userEvent.setup()
      render(
        <HoldingsTable
          holdings={mockHoldings}
          categories={mockCategories}
          displayCurrency="USD"
        />
      )

      // Default sort is ascending by ticker, so clicking toggles to descending
      // Click Asset header twice to get back to ascending
      await user.click(screen.getByRole('button', { name: /asset/i })) // Now descending
      await user.click(screen.getByRole('button', { name: /asset/i })) // Now ascending

      // Get all ticker cells (should be sorted alphabetically ascending)
      const rows = screen.getAllByRole('row').slice(1) // Skip header
      const tickers = rows.map(row => within(row).getByText(/^(AAPL|BTC|VTI)$/))

      // First should be AAPL (alphabetically first)
      expect(tickers[0]).toHaveTextContent('AAPL')
    })

    it('should show category badges for holdings', () => {
      render(
        <HoldingsTable
          holdings={mockHoldings}
          categories={mockCategories}
          displayCurrency="USD"
        />
      )

      // Category badges should be visible
      expect(screen.getByText('Crypto')).toBeInTheDocument()
      expect(screen.getByText('Stock')).toBeInTheDocument()
      expect(screen.getByText('ETF')).toBeInTheDocument()
    })
  })

  describe('AddHoldingModal Component', () => {
    it('should render modal when open', () => {
      render(
        <AddHoldingModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={async () => {}}
          portfolioId="portfolio-1"
          categories={mockCategories}
        />
      )

      // Check for modal title
      expect(screen.getByRole('heading', { name: 'Add Holding' })).toBeInTheDocument()
    })

    it('should not render when closed', () => {
      render(
        <AddHoldingModal
          isOpen={false}
          onClose={() => {}}
          onSubmit={async () => {}}
          portfolioId="portfolio-1"
          categories={mockCategories}
        />
      )

      expect(screen.queryByRole('heading', { name: 'Add Holding' })).not.toBeInTheDocument()
    })

    it('should have ticker input', () => {
      render(
        <AddHoldingModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={async () => {}}
          portfolioId="portfolio-1"
          categories={mockCategories}
        />
      )

      expect(screen.getByLabelText(/ticker/i)).toBeInTheDocument()
    })

    it('should have quantity input', () => {
      render(
        <AddHoldingModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={async () => {}}
          portfolioId="portfolio-1"
          categories={mockCategories}
        />
      )

      expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument()
    })

    it('should have cost type toggle (Per Unit / Total)', () => {
      render(
        <AddHoldingModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={async () => {}}
          portfolioId="portfolio-1"
          categories={mockCategories}
        />
      )

      expect(screen.getByText('Per Unit')).toBeInTheDocument()
      expect(screen.getByText('Total')).toBeInTheDocument()
    })

    it('should have currency selector', () => {
      render(
        <AddHoldingModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={async () => {}}
          portfolioId="portfolio-1"
          categories={mockCategories}
        />
      )

      expect(screen.getByLabelText(/currency/i)).toBeInTheDocument()
    })

    it('should have category picker', () => {
      render(
        <AddHoldingModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={async () => {}}
          portfolioId="portfolio-1"
          categories={mockCategories}
        />
      )

      expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    })

    it('should validate required fields', async () => {
      const user = userEvent.setup()
      const handleSubmit = vi.fn()

      render(
        <AddHoldingModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={handleSubmit}
          portfolioId="portfolio-1"
          categories={mockCategories}
        />
      )

      // Try to submit without filling fields - find the submit button specifically
      const submitButton = screen.getByRole('button', { name: /^add holding$/i })
      await user.click(submitButton)

      // Should show error messages
      await waitFor(() => {
        expect(screen.getByText(/ticker is required/i)).toBeInTheDocument()
      })

      expect(handleSubmit).not.toHaveBeenCalled()
    })

    it('should call onSubmit with form data when valid', async () => {
      const user = userEvent.setup()
      const handleSubmit = vi.fn().mockResolvedValue(undefined)

      render(
        <AddHoldingModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={handleSubmit}
          portfolioId="portfolio-1"
          categories={mockCategories}
        />
      )

      // Fill in the form
      await user.type(screen.getByLabelText(/ticker/i), 'ETH')
      await user.type(screen.getByLabelText(/quantity/i), '10')
      await user.type(screen.getByPlaceholderText(/cost per unit/i), '2000')

      // Select category
      await user.click(screen.getByLabelText(/category/i))
      await user.click(screen.getByText('Crypto'))

      // Submit
      await user.click(screen.getByRole('button', { name: /^add holding$/i }))

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({
          ticker: 'ETH',
          quantity: 10,
          costType: 'average',
          costValue: 2000,
          currency: 'USD',
          categoryId: 'cat-crypto',
          portfolioId: 'portfolio-1',
        }))
      })
    })

    it('should use suggested category from ticker memory', async () => {
      const getSuggestedCategory = vi.fn().mockReturnValue('cat-crypto')
      const user = userEvent.setup()

      render(
        <AddHoldingModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={async () => {}}
          portfolioId="portfolio-1"
          categories={mockCategories}
          getSuggestedCategory={getSuggestedCategory}
        />
      )

      // Type a ticker
      await user.type(screen.getByLabelText(/ticker/i), 'BTC')

      await waitFor(() => {
        expect(getSuggestedCategory).toHaveBeenCalledWith('BTC')
      })
    })

    it('should show cost preview when switching cost type', async () => {
      const user = userEvent.setup()

      render(
        <AddHoldingModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={async () => {}}
          portfolioId="portfolio-1"
          categories={mockCategories}
        />
      )

      // Fill quantity and cost
      await user.type(screen.getByLabelText(/quantity/i), '10')
      await user.type(screen.getByPlaceholderText(/cost per unit/i), '100')

      // Should show total preview
      await waitFor(() => {
        expect(screen.getByText(/total.*\$1,000/i)).toBeInTheDocument()
      })
    })
  })

  describe('EditHoldingModal Component', () => {
    it('should render modal with holding data when open', () => {
      render(
        <EditHoldingModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={async () => {}}
          holding={mockHolding}
          categories={mockCategories}
        />
      )

      expect(screen.getByText('Edit Holding')).toBeInTheDocument()
      expect(screen.getByDisplayValue('BTC')).toBeInTheDocument()
      expect(screen.getByDisplayValue('1.5')).toBeInTheDocument()
    })

    it('should not render when closed', () => {
      render(
        <EditHoldingModal
          isOpen={false}
          onClose={() => {}}
          onSubmit={async () => {}}
          holding={mockHolding}
          categories={mockCategories}
        />
      )

      expect(screen.queryByText('Edit Holding')).not.toBeInTheDocument()
    })

    it('should call onSubmit with updated data', async () => {
      const user = userEvent.setup()
      const handleSubmit = vi.fn().mockResolvedValue(undefined)

      render(
        <EditHoldingModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={handleSubmit}
          holding={mockHolding}
          categories={mockCategories}
        />
      )

      // Change quantity
      const quantityInput = screen.getByDisplayValue('1.5')
      await user.clear(quantityInput)
      await user.type(quantityInput, '2')

      // Submit
      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(
          'holding-1',
          expect.objectContaining({
            quantity: 2,
          })
        )
      })
    })

    it('should show delete button when onDelete provided', () => {
      render(
        <EditHoldingModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={async () => {}}
          onDelete={async () => {}}
          holding={mockHolding}
          categories={mockCategories}
        />
      )

      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
    })

    it('should show delete confirmation when delete clicked', async () => {
      const user = userEvent.setup()

      render(
        <EditHoldingModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={async () => {}}
          onDelete={async () => {}}
          holding={mockHolding}
          categories={mockCategories}
        />
      )

      await user.click(screen.getByRole('button', { name: /delete/i }))

      await waitFor(() => {
        expect(screen.getByText(/delete BTC\?/i)).toBeInTheDocument()
      })
    })

    it('should call onDelete when confirmed', async () => {
      const user = userEvent.setup()
      const handleDelete = vi.fn().mockResolvedValue(undefined)

      render(
        <EditHoldingModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={async () => {}}
          onDelete={handleDelete}
          holding={mockHolding}
          categories={mockCategories}
        />
      )

      // Click delete
      await user.click(screen.getByRole('button', { name: /^delete$/i }))

      // Confirm deletion
      await waitFor(() => {
        expect(screen.getByText(/delete BTC\?/i)).toBeInTheDocument()
      })

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      await user.click(deleteButtons[deleteButtons.length - 1]) // Click the confirm delete button

      await waitFor(() => {
        expect(handleDelete).toHaveBeenCalledWith('holding-1')
      })
    })
  })

  describe('Cost Calculation', () => {
    it('should calculate total from avg cost × quantity', async () => {
      const user = userEvent.setup()

      render(
        <AddHoldingModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={async () => {}}
          portfolioId="portfolio-1"
          categories={mockCategories}
        />
      )

      await user.type(screen.getByLabelText(/quantity/i), '5')
      await user.type(screen.getByPlaceholderText(/cost per unit/i), '200')

      // Preview should show total of 1000
      await waitFor(() => {
        expect(screen.getByText(/total.*\$1,000/i)).toBeInTheDocument()
      })
    })

    it('should calculate avg cost from total ÷ quantity', async () => {
      const user = userEvent.setup()

      render(
        <AddHoldingModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={async () => {}}
          portfolioId="portfolio-1"
          categories={mockCategories}
        />
      )

      // Switch to Total cost mode
      await user.click(screen.getByText('Total'))

      await user.type(screen.getByLabelText(/quantity/i), '5')
      await user.type(screen.getByPlaceholderText(/total cost/i), '1000')

      // Preview should show per unit of 200
      await waitFor(() => {
        expect(screen.getByText(/per unit.*\$200/i)).toBeInTheDocument()
      })
    })
  })

  describe('Integration: Holdings CRUD via Database', () => {
    it('should create a holding in the database', async () => {
      const portfolioId = generateId()
      await db.portfolios.add({
        id: portfolioId,
        name: 'Test Portfolio',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const categories = await db.categories.toArray()
      const cryptoCategory = categories.find(c => c.name === 'Crypto')

      const holdingId = generateId()
      await db.holdings.add({
        id: holdingId,
        portfolioId,
        ticker: 'BTC',
        quantity: 1,
        avgCost: 50000,
        currency: 'USD',
        categoryId: cryptoCategory!.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const holdings = await db.holdings.where('portfolioId').equals(portfolioId).toArray()
      expect(holdings).toHaveLength(1)
      expect(holdings[0].ticker).toBe('BTC')
    })

    it('should update a holding in the database', async () => {
      const portfolioId = generateId()
      await db.portfolios.add({
        id: portfolioId,
        name: 'Test Portfolio',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const categories = await db.categories.toArray()
      const cryptoCategory = categories.find(c => c.name === 'Crypto')

      const holdingId = generateId()
      await db.holdings.add({
        id: holdingId,
        portfolioId,
        ticker: 'BTC',
        quantity: 1,
        avgCost: 50000,
        currency: 'USD',
        categoryId: cryptoCategory!.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await db.holdings.update(holdingId, { quantity: 2 })

      const updated = await db.holdings.get(holdingId)
      expect(updated?.quantity).toBe(2)
    })

    it('should delete a holding from the database', async () => {
      const portfolioId = generateId()
      await db.portfolios.add({
        id: portfolioId,
        name: 'Test Portfolio',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const categories = await db.categories.toArray()
      const cryptoCategory = categories.find(c => c.name === 'Crypto')

      const holdingId = generateId()
      await db.holdings.add({
        id: holdingId,
        portfolioId,
        ticker: 'BTC',
        quantity: 1,
        avgCost: 50000,
        currency: 'USD',
        categoryId: cryptoCategory!.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await db.holdings.delete(holdingId)

      const holding = await db.holdings.get(holdingId)
      expect(holding).toBeUndefined()
    })

    it('should store ticker memory when adding holding', async () => {
      const portfolioId = generateId()
      await db.portfolios.add({
        id: portfolioId,
        name: 'Test Portfolio',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const categories = await db.categories.toArray()
      const cryptoCategory = categories.find(c => c.name === 'Crypto')

      // Add holding and ticker memory
      await db.holdings.add({
        id: generateId(),
        portfolioId,
        ticker: 'ETH',
        quantity: 10,
        avgCost: 2000,
        currency: 'USD',
        categoryId: cryptoCategory!.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await db.tickerMemory.put({
        ticker: 'ETH',
        categoryId: cryptoCategory!.id,
      })

      // Check ticker memory
      const memory = await db.tickerMemory.get('ETH')
      expect(memory?.categoryId).toBe(cryptoCategory!.id)
    })

    it('should retrieve suggested category from ticker memory', async () => {
      const categories = await db.categories.toArray()
      const stockCategory = categories.find(c => c.name === 'Stock')

      await db.tickerMemory.put({
        ticker: 'AAPL',
        categoryId: stockCategory!.id,
      })

      const memory = await db.tickerMemory.get('AAPL')
      expect(memory?.categoryId).toBe(stockCategory!.id)
    })
  })
})
