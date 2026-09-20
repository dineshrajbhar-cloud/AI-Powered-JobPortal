import { forwardRef, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn'

const control =
  'w-full bg-white text-sm text-ink ring-1 ring-inset ring-line placeholder:text-faint ' +
  'focus:outline-none focus:ring-2 focus:ring-brand disabled:bg-canvas disabled:text-faint'

export function Field({ label, hint, error, children, className, id }) {
  const generated = useId()
  const fieldId = id || generated
  return (
    <div className={className}>
      {label && (
        <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      {typeof children === 'function' ? children(fieldId) : children}
      {error ? (
        <p className="mt-1.5 text-sm text-rose-600" role="alert">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-sm text-muted">{hint}</p>
      ) : null}
    </div>
  )
}

export const Input = forwardRef(function Input({ icon: Icon, invalid, className, ...props }, ref) {
  return (
    <div className="relative">
      {Icon && <Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" aria-hidden />}
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(control, 'h-10 rounded-[10px] px-3', Icon && 'pl-9', invalid && 'ring-rose-400', className)}
        {...props}
      />
    </div>
  )
})

export const Textarea = forwardRef(function Textarea({ invalid, className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(control, 'min-h-28 rounded-[10px] px-3 py-2.5', invalid && 'ring-rose-400', className)}
      {...props}
    />
  )
})

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <div className="relative">
      <select ref={ref} className={cn(control, 'h-10 appearance-none rounded-[10px] pr-9 pl-3', className)} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-faint" aria-hidden />
    </div>
  )
})
