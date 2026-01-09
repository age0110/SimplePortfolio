import { useState } from 'react'
import { Briefcase } from 'lucide-react'
import { Modal, ModalFooter } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

interface CreatePortfolioModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string) => Promise<void>
}

export function CreatePortfolioModal({
  isOpen,
  onClose,
  onSubmit,
}: CreatePortfolioModalProps) {
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedName = name.trim()

    if (!trimmedName) {
      setError('Portfolio name is required')
      return
    }

    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters')
      return
    }

    if (trimmedName.length > 50) {
      setError('Name must be less than 50 characters')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmit(trimmedName)
      setName('')
      onClose()
    } catch (err) {
      setError('Failed to create portfolio. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setName('')
      setError(null)
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Portfolio"
      description="Add a new portfolio to track your investments"
      size="sm"
    >
      <form onSubmit={handleSubmit}>
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/[0.08] flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        {/* Name Input */}
        <Input
          label="Portfolio Name"
          placeholder="e.g., Retirement Fund"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setError(null)
          }}
          error={error ?? undefined}
          disabled={isSubmitting}
          autoFocus
        />

        {/* Suggestions */}
        <div className="mt-4">
          <p className="text-xs text-white/40 mb-2">Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {['Main Portfolio', 'Long Term', 'Trading', 'Crypto'].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setName(suggestion)}
                disabled={isSubmitting}
                className="px-3 py-1.5 text-xs font-medium text-white/60 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg transition-colors disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
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
            disabled={!name.trim() || isSubmitting}
          >
            Create Portfolio
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}

export default CreatePortfolioModal
