import { useEffect, useState } from 'react'

export function matchTone(pct) {
  if (pct >= 80) return { label: 'Strong match', color: '#059669', text: 'text-emerald-700' }
  if (pct >= 60) return { label: 'Good match', color: '#d97706', text: 'text-amber-700' }
  return { label: 'Partial match', color: '#64748b', text: 'text-slate-600' }
}

export function MatchRing({ value, size = 92, stroke = 9, delay = 0 }) {
  const pct = Math.min(100, Math.max(0, Math.round(Number(value) || 0)))
  const tone = matchTone(pct)
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const [drawn, setDrawn] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setDrawn(true), 60 + delay)
    return () => clearTimeout(id)
  }, [delay])

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${pct}% match`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eceef6" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone.color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={drawn ? c * (1 - pct / 100) : c}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1000ms cubic-bezier(.2,.8,.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-display text-2xl font-bold tabular-nums" style={{ color: tone.color }}>
          {pct}<span className="text-sm">%</span>
        </span>
      </div>
    </div>
  )
}
