import { useState, useEffect } from 'react'
import { Plus, DollarSign, Hash, Tag } from 'lucide-react'
import { Modal, ModalFooter } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { CategoryPicker } from './CategoryPicker'
import type { Category, Currency, HoldingFormData } from '../../types'

interface AddHoldingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: HoldingFormData) => Promise<void>
  portfolioId: string
  categories: Category[]
  getSuggestedCategory?: (ticker: string) => string | undefined
}

type CostType = 'average' | 'total'

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'AUD', label: 'AUD (A$)' },
  { value: 'BTC', label: 'BTC (₿)' },
]

export function AddHoldingModal({
  isOpen,
  onClose,
  onSubmit,
  portfolioId,
  categories,
  getSuggestedCategory,
}: AddHoldingModalProps) {
  const [ticker, setTicker] = useState('')
  const [quantity, setQuantity] = useState('')
  const [costValue, setCostValue] = useState('')
  const [costType, setCostType] = useState<CostType>('average')
  const [currency, setCurrency] = useState<Currency>('USD')
  const [categoryId, setCategoryId] = useState('')
  const [suggestedCategoryId, setSuggestedCategoryId] = useState<string | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Look up suggested category when ticker changes
  useEffect(() => {
    if (ticker.trim() && getSuggestedCategory) {
      const suggested = getSuggestedCategory(ticker.trim().toUpperCase())
      setSuggestedCategoryId(suggested)
      // Auto-select if no category chosen yet
      if (suggested && !categoryId) {
        setCategoryId(suggested)
      }
    } else {
      setSuggestedCategoryId(undefined)
    }
  }, [ticker, getSuggestedCategory, categoryId])

  // Calculate displayed values
  const quantityNum = parseFloat(quantity) || 0
  const costNum = parseFloat(costValue) || 0
  const totalCost = costType === 'average' ? quantityNum * costNum : costNum
  const avgCost = costType === 'total' && quantityNum > 0 ? costNum / quantityNum : costNum

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!ticker.trim()) {
      newErrors.ticker = 'Ticker is required'
    } else if (ticker.trim().length > 10) {
      newErrors.ticker = 'Ticker too long'
    }

    if (!quantity || quantityNum <= 0) {
      newErrors.quantity = 'Quantity must be positive'
    }

    if (!costValue || costNum < 0) {
      newErrors.costValue = 'Cost must be zero or positive'
    }

    if (!categoryId) {
      newErrors.categoryId = 'Category is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)

    try {
      await onSubmit({
        portfolioId,
        ticker: ticker.trim().toUpperCase(),
        quantity: quantityNum,
        costType,
        costValue: costNum,
        currency,
        categoryId,
      })
      handleClose()
    } catch {
      setErrors({ submit: 'Failed to add holding. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setTicker('')
      setQuantity('')
      setCostValue('')
      setCostType('average')
      setCurrency('USD')
      setCategoryId('')
      setSuggestedCategoryId(undefined)
      setErrors({})
      onClose()
    }
  }

  const formatPreview = (value: number) => {
    if (currency === 'BTC') {
      return `₿${value.toFixed(8)}`
    }
    const symbol = currency === 'AUD' ? 'A$' : '$'
    return `${symbol}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Holding"
      description="Add a new asset to your portfolio"
      size="md"
    >
      <form onSubmit={handleSubmit}>
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/[0.08] flex items-center justify-center">
            <Plus className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        {errors.submit && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            {errors.submit}
          </div>
        )}

        {/* Ticker & Quantity Row */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input
            label="Ticker"
            placeholder="BTC, AAPL, VTI..."
            value={ticker}
            onChange={(e) => {
              setTicker(e.target.value.toUpperCase())
              setErrors((prev) => ({ ...prev, ticker: '' }))
            }}
            error={errors.ticker}
            disabled={isSubmitting}
            leftElement={<Tag size={16} />}
          />
          <Input
            label="Quantity"
            type="number"
            placeholder="0.00"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value)
              setErrors((prev) => ({ ...prev, quantity: '' }))
            }}
            error={errors.quantity}
            disabled={isSubmitting}
            step="any"
            min="0"
            leftElement={<Hash size={16} />}
          />
        </div>

        {/* Cost Input with Toggle */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-white/70">Cost</label>
            <div className="flex items-center bg-white/[0.04] rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setCostType('average')}
                disabled={isSubmitting}
                className={`
                  px-3 py-1 text-xs font-medium rounded-md transition-all duration-200
                  ${costType === 'average'
                    ? 'bg-white/[0.1] text-white'
                    : 'text-white/40 hover:text-white/60'
                  }
                `}
              >
                Per Unit
              </button>
              <button
                type="button"
                onClick={() => setCostType('total')}
                disabled={isSubmitting}
                className={`
                  px-3 py-1 text-xs font-medium rounded-md transition-all duration-200
                  ${costType === 'total'
                    ? 'bg-white/[0.1] text-white'
                    : 'text-white/40 hover:text-white/60'
                  }
                `}
              >
                Total
              </button>
            </div>
          </div>
          <Input
            type="number"
            placeholder={costType === 'average' ? 'Cost per unit' : 'Total cost'}
            value={costValue}
            onChange={(e) => {
              setCostValue(e.target.value)
              setErrors((prev) => ({ ...prev, costValue: '' }))
            }}
            error={errors.costValue}
            disabled={isSubmitting}
            step="any"
            min="0"
            leftElement={<DollarSign size={16} />}
          />
          {/* Preview calculation */}
          {quantityNum > 0 && costNum > 0 && (
            <div className="mt-2 text-xs text-white/40">
              {costType === 'average' ? (
                <span>Total: {formatPreview(totalCost)}</span>
              ) : (
                <span>Per unit: {formatPreview(avgCost)}</span>
              )}
            </div>
          )}
        </div>

        {/* Currency & Category Row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Select
            label="Currency"
            options={CURRENCY_OPTIONS}
            value={currency}
            onChange={(val) => setCurrency(val as Currency)}
            disabled={isSubmitting}
          />
          <CategoryPicker
            label="Category"
            categories={categories}
            value={categoryId}
            onChange={(val) => {
              setCategoryId(val)
              setErrors((prev) => ({ ...prev, categoryId: '' }))
            }}
            error={errors.categoryId}
            disabled={isSubmitting}
            suggestedCategoryId={suggestedCategoryId}
            placeholder="Select category"
          />
        </div>

        <ModalFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Add Holding
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}

export default AddHoldingModal
