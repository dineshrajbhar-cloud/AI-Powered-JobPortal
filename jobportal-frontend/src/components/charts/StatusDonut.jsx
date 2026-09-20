import { STATUSES, STATUS_META, TONES } from '../../lib/status'

const KEY_BY_STATUS = {
  PENDING: 'pendingApplications',
  SHORTLISTED: 'shortlistedApplications',
  INTERVIEW: 'interviewApplications',
  SELECTED: 'selectedApplications',
  REJECTED: 'rejectedApplications',
}

export function statusCounts(stats) {
  return STATUSES.map((status) => ({
    status,
    label: STATUS_META[status].label,
    value: Number(stats?.[KEY_BY_STATUS[status]] ?? 0),
    color: TONES[STATUS_META[status].tone].hex,
    dot: TONES[STATUS_META[status].tone].dot,
  }))
}

export function StatusDonut({ stats, centerLabel = 'Applications', size = 176, thickness = 20 }) {
  const segments = statusCounts(stats)
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  const gap = total > segments.filter((s) => s.value > 0).length ? 3 : 0
  let offset = 0

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
          aria-label={`${total} ${centerLabel.toLowerCase()}: ` + segments.map((s) => `${s.value} ${s.label.toLowerCase()}`).join(', ')}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eceef6" strokeWidth={thickness} />
          {total > 0 && segments.filter((s) => s.value > 0).map((s) => {
            const length = (s.value / total) * c
            const dash = Math.max(length - gap, 0.5)
            const el = (
              <circle key={s.status} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={thickness}
                strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={-offset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`} />
            )
            offset += length
            return el
          })}
        </svg>
        <div className="absolute inset-0 grid place-content-center text-center">
          <span className="font-display text-4xl leading-none font-bold">{total}</span>
          <span className="mt-1 text-xs text-muted">{centerLabel}</span>
        </div>
      </div>

      <ul className="w-full min-w-0 flex-1 space-y-2.5">
        {segments.map((s) => (
          <li key={s.status} className="flex items-center gap-3 text-sm">
            <span className={`size-2.5 rounded-full ${s.dot}`} aria-hidden />
            <span className="flex-1 text-muted">{s.label}</span>
            <span className="font-semibold tabular-nums">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
