import { cn } from '../../lib/cn'
import { initials } from '../../lib/format'

const palette = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-800',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-teal-100 text-teal-700',
  'bg-orange-100 text-orange-700',
]

function hash(text = '') {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0
  return Math.abs(h)
}

const sizes = {
  sm: 'size-8 text-xs rounded-lg',
  md: 'size-10 text-sm rounded-xl',
  lg: 'size-14 text-lg rounded-2xl',
}

export function Avatar({ name, size = 'md', round = false, className }) {
  return (
    <span
      aria-hidden
      className={cn(
        'grid shrink-0 place-items-center font-display font-bold select-none',
        palette[hash(name) % palette.length],
        sizes[size],
        round && 'rounded-full',
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}
