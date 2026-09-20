export const STATUSES = ['PENDING', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED']
export const PIPELINE = ['PENDING', 'SHORTLISTED', 'INTERVIEW', 'SELECTED']

export const STATUS_META = {
  PENDING: { label: 'Pending', tone: 'slate' },
  SHORTLISTED: { label: 'Shortlisted', tone: 'sky' },
  INTERVIEW: { label: 'Interview', tone: 'amber' },
  SELECTED: { label: 'Selected', tone: 'emerald' },
  REJECTED: { label: 'Rejected', tone: 'rose' },
}

// Full class names so Tailwind can detect them
export const TONES = {
  slate: { badge: 'bg-slate-100 text-slate-700 ring-slate-200', dot: 'bg-slate-400', hex: '#94a3b8' },
  sky: { badge: 'bg-sky-50 text-sky-700 ring-sky-200', dot: 'bg-sky-500', hex: '#0ea5e9' },
  amber: { badge: 'bg-amber-50 text-amber-800 ring-amber-200', dot: 'bg-amber-500', hex: '#f59e0b' },
  emerald: { badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500', hex: '#10b981' },
  rose: { badge: 'bg-rose-50 text-rose-700 ring-rose-200', dot: 'bg-rose-500', hex: '#f43f5e' },
}

export function normalizeStatus(status) {
  const value = String(status || 'PENDING').toUpperCase()
  return STATUS_META[value] ? value : 'PENDING'
}
