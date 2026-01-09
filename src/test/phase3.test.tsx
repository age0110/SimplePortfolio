import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { db, initializeDatabase, generateId } from '../db/database'
import { useUIStore } from '../store/useUIStore'
import { CreatePortfolioModal } from '../components/portfolio/CreatePortfolioModal'
import { ViewModeToggle } from '../components/portfolio/ViewModeToggle'
import { PortfolioCard } from '../components/portfolio/PortfolioCard'
import type { Portfolio } from '../types'

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

describe('Phase 3: Portfolio Management UI Tests', () => {
  describe('CreatePortfolioModal', () => {
    it('should render modal when open', () => {
      render(
        <CreatePortfolioModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={async () => {}}
        />
      )

      // Modal title
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByLabelText(/portfolio name/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create portfolio/i })).toBeInTheDocument()
    })

    it('should not render modal when closed', () => {
      render(
        <CreatePortfolioModal
          isOpen={false}
          onClose={() => {}}
          onSubmit={async () => {}}
        />
      )

      expect(screen.queryByText('Create Portfolio')).not.toBeInTheDocument()
    })

    it('should call onSubmit with portfolio name', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      const onClose = vi.fn()

      render(
        <CreatePortfolioModal
          isOpen={true}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )

      const input = screen.getByLabelText(/portfolio name/i)
      await user.type(input, 'My New Portfolio')

      const submitButton = screen.getByRole('button', { name: /create portfolio/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith('My New Portfolio')
      })
    })

    it('should show error for empty name', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()

      render(
        <CreatePortfolioModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={onSubmit}
        />
      )

      // Try to submit with empty input
      const input = screen.getByLabelText(/portfolio name/i)
      await user.type(input, '   ') // Just spaces
      await user.clear(input)

      const submitButton = screen.getByRole('button', { name: /create portfolio/i })
      await user.click(submitButton)

      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('should fill input when clicking suggestion', async () => {
      const user = userEvent.setup()

      render(
        <CreatePortfolioModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={async () => {}}
        />
      )

      const suggestionButton = screen.getByRole('button', { name: 'Main Portfolio' })
      await user.click(suggestionButton)

      const input = screen.getByLabelText(/portfolio name/i)
      expect(input).toHaveValue('Main Portfolio')
    })

    it('should call onClose when cancel is clicked', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()

      render(
        <CreatePortfolioModal
          isOpen={true}
          onClose={onClose}
          onSubmit={async () => {}}
        />
      )

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('ViewModeToggle', () => {
    it('should render both view mode options', () => {
      render(<ViewModeToggle />)

      expect(screen.getByTitle('Combined')).toBeInTheDocument()
      expect(screen.getByTitle('Side by Side')).toBeInTheDocument()
    })

    it('should have combined mode active by default', () => {
      render(<ViewModeToggle />)

      const combinedButton = screen.getByTitle('Combined')
      expect(combinedButton).toHaveClass('bg-white/[0.1]')
    })

    it('should switch to side-by-side mode when clicked', async () => {
      const user = userEvent.setup()
      render(<ViewModeToggle />)

      const sideBySideButton = screen.getByTitle('Side by Side')
      await user.click(sideBySideButton)

      expect(useUIStore.getState().viewMode).toBe('sideBySide')
    })

    it('should switch back to combined mode', async () => {
      const user = userEvent.setup()
      useUIStore.setState({ viewMode: 'sideBySide' })

      render(<ViewModeToggle />)

      const combinedButton = screen.getByTitle('Combined')
      await user.click(combinedButton)

      expect(useUIStore.getState().viewMode).toBe('combined')
    })
  })

  describe('PortfolioCard', () => {
    const mockPortfolio: Portfolio = {
      id: generateId(),
      name: 'Test Portfolio',
      createdAt: new Date('2025-01-15'),
      updatedAt: new Date('2025-01-15'),
    }

    it('should render portfolio name', () => {
      render(
        <PortfolioCard
          portfolio={mockPortfolio}
          totalValue={10000}
          holdingsCount={5}
          displayCurrency="USD"
        />
      )

      expect(screen.getByText('Test Portfolio')).toBeInTheDocument()
    })

    it('should render total value formatted', () => {
      render(
        <PortfolioCard
          portfolio={mockPortfolio}
          totalValue={10000}
          holdingsCount={5}
          displayCurrency="USD"
        />
      )

      expect(screen.getByText('$10.00K')).toBeInTheDocument()
    })

    it('should render holdings count', () => {
      render(
        <PortfolioCard
          portfolio={mockPortfolio}
          totalValue={10000}
          holdingsCount={5}
          displayCurrency="USD"
        />
      )

      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should render creation date', () => {
      render(
        <PortfolioCard
          portfolio={mockPortfolio}
          totalValue={10000}
          holdingsCount={5}
          displayCurrency="USD"
        />
      )

      expect(screen.getByText(/Jan 15, 2025/)).toBeInTheDocument()
    })

    it('should show menu button when onEdit or onDelete provided', () => {
      render(
        <PortfolioCard
          portfolio={mockPortfolio}
          totalValue={10000}
          holdingsCount={5}
          displayCurrency="USD"
          onEdit={() => {}}
        />
      )

      // Menu button should be present
      const menuButtons = screen.getAllByRole('button')
      expect(menuButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Portfolio Selection (UI Store)', () => {
    it('should select a portfolio', () => {
      const { selectPortfolio, selectedPortfolioIds } = useUIStore.getState()

      selectPortfolio('portfolio-1')

      expect(useUIStore.getState().selectedPortfolioIds).toContain('portfolio-1')
    })

    it('should deselect a portfolio', () => {
      useUIStore.setState({ selectedPortfolioIds: ['portfolio-1', 'portfolio-2'] })

      const { deselectPortfolio } = useUIStore.getState()
      deselectPortfolio('portfolio-1')

      expect(useUIStore.getState().selectedPortfolioIds).not.toContain('portfolio-1')
      expect(useUIStore.getState().selectedPortfolioIds).toContain('portfolio-2')
    })

    it('should toggle portfolio selection', () => {
      const { togglePortfolioSelection } = useUIStore.getState()

      // Select
      togglePortfolioSelection('portfolio-1')
      expect(useUIStore.getState().selectedPortfolioIds).toContain('portfolio-1')

      // Deselect
      togglePortfolioSelection('portfolio-1')
      expect(useUIStore.getState().selectedPortfolioIds).not.toContain('portfolio-1')
    })

    it('should select all portfolios', () => {
      const { selectAllPortfolios } = useUIStore.getState()

      selectAllPortfolios(['p1', 'p2', 'p3'])

      expect(useUIStore.getState().selectedPortfolioIds).toEqual(['p1', 'p2', 'p3'])
    })

    it('should deselect all portfolios', () => {
      useUIStore.setState({ selectedPortfolioIds: ['p1', 'p2', 'p3'] })

      const { deselectAllPortfolios } = useUIStore.getState()
      deselectAllPortfolios()

      expect(useUIStore.getState().selectedPortfolioIds).toEqual([])
    })

    it('should persist selection state', () => {
      const { selectPortfolio } = useUIStore.getState()

      selectPortfolio('portfolio-1')
      selectPortfolio('portfolio-2')

      // Get fresh state
      const state = useUIStore.getState()
      expect(state.selectedPortfolioIds).toContain('portfolio-1')
      expect(state.selectedPortfolioIds).toContain('portfolio-2')
    })
  })

  describe('Portfolio CRUD via Database', () => {
    it('should create a portfolio in database', async () => {
      const now = new Date()
      const portfolio: Portfolio = {
        id: generateId(),
        name: 'New Portfolio',
        createdAt: now,
        updatedAt: now,
      }

      await db.portfolios.add(portfolio)

      const saved = await db.portfolios.get(portfolio.id)
      expect(saved?.name).toBe('New Portfolio')
    })

    it('should rename a portfolio', async () => {
      const now = new Date()
      const id = generateId()

      await db.portfolios.add({
        id,
        name: 'Original Name',
        createdAt: now,
        updatedAt: now,
      })

      await db.portfolios.update(id, { name: 'Renamed Portfolio' })

      const updated = await db.portfolios.get(id)
      expect(updated?.name).toBe('Renamed Portfolio')
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
})
