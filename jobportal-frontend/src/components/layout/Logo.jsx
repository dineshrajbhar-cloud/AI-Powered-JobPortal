import { Link } from 'react-router-dom'
import { APP_NAME } from '../../config'

export function LogoMark({ className = 'size-8' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="9" fill="#2540f0" />
      <path d="M11 9h10v2.2H11zM11 13.4h10v2.2H11zM11 17.8h6.2V20H11z" fill="#fff" />
      <circle cx="21.5" cy="21" r="3.2" fill="#fff" />
    </svg>
  )
}

export function Logo({ to = '/' }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2.5 rounded-lg">
      <LogoMark />
      <span className="font-display text-xl font-bold tracking-tight">{APP_NAME}</span>
    </Link>
  )
}
