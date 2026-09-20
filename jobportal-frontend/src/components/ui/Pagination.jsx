import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/cn'

function pageList(page, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, page - 1, page, page + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const out = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('gap-' + p)
    out.push(p)
  })
  return out
}

export function Pagination({ page, pageCount, onChange }) {
  if (pageCount <= 1) return null
  const item = 'grid h-9 min-w-9 place-items-center rounded-lg px-2 text-sm font-medium transition-colors'
  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-1">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Previous page" className={cn(item, 'text-muted hover:bg-ink/5 disabled:opacity-40')}>
        <ChevronLeft className="size-4" />
      </button>
      {pageList(page, pageCount).map((p) =>
        typeof p === 'string' ? (
          <span key={p} className="px-1 text-faint" aria-hidden>...</span>
        ) : (
          <button key={p} type="button" onClick={() => onChange(p)} aria-current={p === page ? 'page' : undefined}
            className={cn(item, p === page ? 'bg-ink text-white' : 'text-muted hover:bg-ink/5')}>
            {p}
          </button>
        ),
      )}
      <button type="button" onClick={() => onChange(page + 1)} disabled={page === pageCount} aria-label="Next page" className={cn(item, 'text-muted hover:bg-ink/5 disabled:opacity-40')}>
        <ChevronRight className="size-4" />
      </button>
    </nav>
  )
}
