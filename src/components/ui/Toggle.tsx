import { useId } from 'react'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  size?: 'sm' | 'md'
}

const sizeStyles = {
  sm: {
    track: 'w-9 h-5',
    thumb: 'w-4 h-4',
    translate: 'translate-x-4',
  },
  md: {
    track: 'w-11 h-6',
    thumb: 'w-5 h-5',
    translate: 'translate-x-5',
  },
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
}: ToggleProps) {
  const id = useId()
  const styles = sizeStyles[size]

  return (
    <div className="flex items-center justify-between gap-4">
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <label
              htmlFor={id}
              className="block text-sm font-medium text-white cursor-pointer"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-white/50 mt-0.5">{description}</p>
          )}
        </div>
      )}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative inline-flex flex-shrink-0
          ${styles.track}
          rounded-full
          transition-colors duration-200 ease-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${checked ? 'bg-blue-500' : 'bg-white/[0.15]'}
        `}
      >
        <span
          className={`
            ${styles.thumb}
            rounded-full
            bg-white
            shadow-sm
            transition-transform duration-200 ease-out
            ${checked ? styles.translate : 'translate-x-0.5'}
          `}
          style={{
            marginTop: size === 'md' ? '2px' : '2px',
          }}
        />
      </button>
    </div>
  )
}

export default Toggle
