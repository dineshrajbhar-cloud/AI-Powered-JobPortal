import { Check, XCircle } from 'lucide-react'
import { cn } from '../../lib/cn'
import { PIPELINE, STATUS_META, normalizeStatus } from '../../lib/status'

export function StatusStepper({ status }) {
  const current = normalizeStatus(status)

  if (current === 'REJECTED') {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
        <XCircle className="size-4 shrink-0" aria-hidden />
        The recruiter didn't move this application forward.
      </div>
    )
  }

  const index = PIPELINE.indexOf(current)
  const finished = current === 'SELECTED'

  return (
    <ol className="flex w-full" aria-label={`Application progress: ${STATUS_META[current].label}`}>
      {PIPELINE.map((step, i) => {
        const done = i < index || finished
        const active = i === index && !finished
        return (
          <li key={step} className="relative flex flex-1 flex-col items-center gap-1.5 text-center" aria-current={i === index ? 'step' : undefined}>
            {i > 0 && (
              <span aria-hidden className={cn('absolute top-[11px] right-1/2 left-[-50%] h-0.5', i <= index || finished ? 'bg-brand' : 'bg-line')} />
            )}
            <span
              className={cn(
                'relative z-10 grid size-6 place-items-center rounded-full text-[11px] font-semibold',
                done && (finished && i === PIPELINE.length - 1 ? 'bg-emerald-500 text-white' : 'bg-brand text-white'),
                active && 'bg-white text-brand ring-2 ring-brand',
                !done && !active && 'bg-white text-faint ring-1 ring-line',
              )}
            >
              {done ? <Check className="size-3.5" aria-hidden /> : i + 1}
            </span>
            <span className={cn('text-xs', i === index ? 'font-semibold text-ink' : 'text-muted')}>{STATUS_META[step].label}</span>
          </li>
        )
      })}
    </ol>
  )
}
