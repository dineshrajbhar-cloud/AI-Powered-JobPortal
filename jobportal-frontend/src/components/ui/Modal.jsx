import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Button } from './Button'

const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-2xl' }

// Built on the native <dialog>: focus trapping, Esc to close and an inert page behind it.
export function Modal({ open, onClose, title, description, children, footer, size = 'md', dismissible = true }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(e) => !dismissible && e.preventDefault()}
      onClick={(e) => dismissible && e.target === ref.current && onClose()}
      className={cn('m-auto w-[calc(100%-2rem)] rounded-2xl bg-white p-0 text-ink shadow-2xl', widths[size])}
    >
      {open && (
        <div className="flex max-h-[85dvh] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
            <div className="min-w-0">
              <h2 className="text-lg font-bold">{title}</h2>
              {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
            </div>
            {dismissible && (
              <button type="button" onClick={onClose} aria-label="Close" className="-mr-2 grid size-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-ink/5">
                <X className="size-4" />
              </button>
            )}
          </div>
          <div className="overflow-y-auto px-6 py-5">{children}</div>
          {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-canvas/60 px-6 py-4">{footer}</div>}
        </div>
      )}
    </dialog>
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) {
  const [busy, setBusy] = useState(false)

  async function handleConfirm() {
    setBusy(true)
    try {
      await onConfirm()
      onClose()
    } catch {
      /* the caller reports the failure (toast); keep the dialog open to retry */
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      title={title}
      size="sm"
      dismissible={!busy}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={handleConfirm} loading={busy}>{confirmLabel}</Button>
        </>
      }
    >
      <p className="text-muted">{message}</p>
    </Modal>
  )
}
