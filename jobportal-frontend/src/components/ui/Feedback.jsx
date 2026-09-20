import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Button } from './Button'

export function Spinner({ className }) {
  return <Loader2 className={cn('size-5 animate-spin text-brand', className)} aria-label="Loading" />
}

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-lg bg-ink/8', className)} aria-hidden />
}

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center', className)}>
      {Icon && (
        <span className="mb-4 grid size-12 place-items-center rounded-xl bg-brand-soft text-brand">
          <Icon className="size-6" aria-hidden />
        </span>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1.5 max-w-md text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({ error, onRetry, title = "We couldn't load this", className }) {
  return (
    <div className={cn('flex flex-col items-center rounded-2xl border border-rose-200 bg-rose-50/60 px-6 py-12 text-center', className)}>
      <span className="mb-4 grid size-12 place-items-center rounded-xl bg-rose-100 text-rose-600">
        <AlertTriangle className="size-6" aria-hidden />
      </span>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-md text-muted">{error?.message || 'Something went wrong. Try again.'}</p>
      {onRetry && (
        <Button variant="secondary" icon={RefreshCw} onClick={onRetry} className="mt-5">
          Try again
        </Button>
      )}
    </div>
  )
}

export function PageHeader({ title, description, actions, className }) {
  return (
    <div className={cn('mb-7 flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
