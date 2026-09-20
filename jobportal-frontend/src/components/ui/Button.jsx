import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'

const variants = {
  primary: 'bg-brand text-white hover:bg-brand-strong disabled:hover:bg-brand',
  secondary: 'bg-white text-ink ring-1 ring-inset ring-line hover:bg-canvas',
  subtle: 'bg-brand-soft text-brand hover:bg-brand/15',
  ghost: 'text-ink hover:bg-ink/5',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
}

const sizes = {
  sm: 'h-8 gap-1.5 rounded-lg px-3 text-sm',
  md: 'h-10 gap-2 rounded-[10px] px-4 text-sm',
  lg: 'h-12 gap-2 rounded-xl px-6 text-base',
}

export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, icon: Icon, as: Comp = 'button', className, children, disabled, ...props },
  ref,
) {
  const isButton = Comp === 'button'
  return (
    <Comp
      ref={ref}
      type={isButton ? props.type || 'button' : undefined}
      disabled={isButton ? disabled || loading : undefined}
      aria-disabled={!isButton && (disabled || loading) ? true : undefined}
      className={cn(
        'inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-55',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : Icon ? <Icon className="size-4" aria-hidden /> : null}
      {children}
    </Comp>
  )
})
