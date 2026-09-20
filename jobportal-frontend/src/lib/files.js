import { formatBytes } from './format'

export function validateFile(file, { extensions, maxMB }) {
  const name = file.name.toLowerCase()
  const ok = extensions.some((ext) => name.endsWith(ext))
  if (!ok) {
    return `Use a ${extensions.map((e) => e.slice(1).toUpperCase()).join(', ')} file.`
  }
  if (file.size === 0) return 'That file is empty.'
  if (file.size > maxMB * 1024 * 1024) {
    return `That file is ${formatBytes(file.size)}. The limit is ${maxMB} MB.`
  }
  return null
}

export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function parseFilename(disposition) {
  if (!disposition) return null
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition)
  return match ? decodeURIComponent(match[1]) : null
}
