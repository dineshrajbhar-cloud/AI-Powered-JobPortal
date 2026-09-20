import { CURRENCY } from '../config'

const full = new Intl.NumberFormat(CURRENCY.locale, {
  style: 'currency', currency: CURRENCY.code, maximumFractionDigits: 0,
})
const compact = new Intl.NumberFormat(CURRENCY.locale, {
  style: 'currency', currency: CURRENCY.code, notation: 'compact', maximumFractionDigits: 1,
})

export function formatSalary(value) {
  return value == null || Number.isNaN(Number(value)) ? '-' : full.format(Number(value))
}

export function formatSalaryCompact(value) {
  return value == null || Number.isNaN(Number(value)) ? '-' : compact.format(Number(value))
}

// Spring serialises LocalDateTime as an ISO string without a zone (with up to
// 9 fractional digits) - trim it so every browser can parse it.
export function parseDate(value) {
  if (!value) return null
  if (Array.isArray(value)) {
    const [y, mo, d, h = 0, mi = 0, s = 0] = value
    return new Date(y, mo - 1, d, h, mi, s)
  }
  const date = new Date(String(value).replace(/(\.\d{3})\d+/, '$1'))
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(value) {
  const date = parseDate(value)
  return date ? date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '-'
}

export function timeAgo(value) {
  const date = parseDate(value)
  if (!date) return ''
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000))
  if (seconds < 60) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days} d ago`
  return formatDate(value)
}

export function isRecent(value, days = 3) {
  const date = parseDate(value)
  return !!date && Date.now() - date.getTime() < days * 86400000
}

export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

export function firstName(name = '') {
  return name.trim().split(/\s+/)[0] || 'there'
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
