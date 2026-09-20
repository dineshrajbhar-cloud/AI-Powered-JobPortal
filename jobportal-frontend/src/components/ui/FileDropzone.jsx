import { useRef, useState } from 'react'
import { FileText, Upload, X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { formatBytes } from '../../lib/format'
import { validateFile } from '../../lib/files'

export function FileDropzone({ file, onFile, extensions, maxMB, disabled, error, onError, prompt = 'Drop your resume here or browse' }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  function accept(candidate) {
    if (!candidate) return
    const problem = validateFile(candidate, { extensions, maxMB })
    if (problem) {
      onError?.(problem)
      return
    }
    onError?.(null)
    onFile(candidate)
  }

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-brand-soft/60 p-3 ring-1 ring-brand/20">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-brand">
          <FileText className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted">{formatBytes(file.size)}</p>
        </div>
        {!disabled && (
          <button type="button" onClick={() => onFile(null)} aria-label="Remove file" className="grid size-8 place-items-center rounded-lg text-muted hover:bg-white">
            <X className="size-4" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); if (!disabled) accept(e.dataTransfer.files?.[0]) }}
        className={cn(
          'flex flex-col items-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors',
          dragging ? 'border-brand bg-brand-soft' : 'border-line bg-white',
          error && 'border-rose-300',
        )}
      >
        <span className="mb-3 grid size-11 place-items-center rounded-xl bg-brand-soft text-brand">
          <Upload className="size-5" aria-hidden />
        </span>
        <p className="font-medium">{prompt}</p>
        <p className="mt-1 text-sm text-muted">
          {extensions.map((e) => e.slice(1).toUpperCase()).join(', ')} up to {maxMB} MB
        </p>
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="mt-4 rounded-lg bg-white px-3.5 py-2 text-sm font-medium ring-1 ring-line ring-inset hover:bg-canvas"
        >
          Choose file
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={extensions.join(',')}
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => { accept(e.target.files?.[0]); e.target.value = '' }}
        />
      </div>
      {error && <p className="mt-2 text-sm text-rose-600" role="alert">{error}</p>}
    </div>
  )
}
