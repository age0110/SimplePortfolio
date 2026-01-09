import { useState, useEffect } from 'react'
import { Pencil, DollarSign, Hash, Tag } from 'lucide-react'
import { Modal, ModalFooter } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { CategoryPicker } from './CategoryPicker'
import type { Category, Currency, Holding } from '../../types'

interface EditHoldingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (id: string, data: {
    ticker: string
    quantity: number
    avgCost: number
    currency: Currency
    categoryId: string
  }) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  holding: Holding | null
  categories: Category[]
}

type CostType = 'average' | 'total'

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'AUD', label: 'AUD (A$)' },
  { value: 'BTC', label: 'BTC (₿)' },
]

export function EditHoldingModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  holding,
  categories,
}: EditHoldingModalProps) {
  const [ticker, setTicker] = useState('')
  const [quantity, setQuantity] = useState('')
  const [costValue, setCostValue] = useState('')
  const [costType, setCostType] = useState<CostType>('average')
  const [currency, setCurrency] = useState<Currency>('USD')
  const [categoryId, setCategoryId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Populate form when holding changes
  useEffect(() => {
    if (holding) {
      setTicker(holding.ticker)
      setQuantity(holding.quantity.toString())
      setCostValue(holding.avgCost.toString())
      setCostType('average')
      setCurrency(holding.currency)
      setCategoryId(holding.categoryId)
    }
  }, [holding])

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

    if (!validate() || !holding) return

    setIsSubmitting(true)

    try {
      const finalAvgCost = costType === 'total' ? avgCost : costNum
      await onSubmit(holding.id, {
        ticker: ticker.trim().toUpperCase(),
        quantity: quantityNum,
        avgCost: finalAvgCost,
        currency,
        categoryId,
      })
      handleClose()
    } catch {
      setErrors({ submit: 'Failed to update holding. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!holding || !onDelete) return

    setIsDeleting(true)
    try {
      await onDelete(holding.id)
      handleClose()
    } catch {
      setErrors({ submit: 'Failed to delete holding. Please try again.' })
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting && !isDeleting) {
      setTicker('')
      setQuantity('')
      setCostValue('')
      setCostType('average')
      setCurrency('USD')
      setCategoryId('')
      setErrors({})
      setShowDeleteConfirm(false)
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

  if (!holding) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Holding"
      description={`Update ${holding.ticker} in your portfolio`}
      size="md"
    >
      {showDeleteConfirm ? (
        // Delete confirmation view
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Delete {holding.ticker}?</h3>
          <p className="text-sm text-white/50 mb-6">
            This will permanently remove this holding from your portfolio.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Delete
            </Button>
          </div>
        </div>
      ) : (
        // Edit form view
        <form onSubmit={handleSubmit}>
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/[0.08] flex items-center justify-center">
              <Pencil className="w-8 h-8 text-blue-400" />
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
              placeholder="Select category"
            />
          </div>

          <ModalFooter>
            <div className="flex justify-between w-full">
              {onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSubmitting}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  Delete
                </Button>
              )}
              <div className="flex gap-3 ml-auto">
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
                  Save Changes
                </Button>
              </div>
            </div>
          </ModalFooter>
        </form>
      )}
    </Modal>
  )
}

export default EditHoldingModal
