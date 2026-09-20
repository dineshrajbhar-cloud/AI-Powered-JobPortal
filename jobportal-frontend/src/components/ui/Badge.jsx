import { cn } from '../../lib/cn'
import { STATUS_META, TONES, normalizeStatus } from '../../lib/status'

export function Badge({ children, className }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', className)}>
      {children}
    </span>
  )
}

export function StatusBadge({ status, className }) {
  const key = normalizeStatus(status)
  const meta = STATUS_META[key]
  const tone = TONES[meta.tone]
  return (
    <Badge className={cn(tone.badge, className)}>
      <span className={cn('size-1.5 rounded-full', tone.dot)} aria-hidden />
      {meta.label}
    </Badge>
  )
}
