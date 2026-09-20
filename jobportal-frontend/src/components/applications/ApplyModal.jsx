import { useState } from 'react'
import { toast } from 'sonner'
import { Building2, MapPin } from 'lucide-react'
import { Button } from '../ui/Button'
import { FileDropzone } from '../ui/FileDropzone'
import { Modal } from '../ui/Modal'
import { MAX_RESUME_MB, RESUME_EXTENSIONS } from '../../config'
import { formatSalary } from '../../lib/format'
import { applyToJob, uploadResume } from '../../services/applicationService'

export function ApplyModal({ open, onClose, job, onApplied }) {
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState(null)
  const [step, setStep] = useState('idle') // idle | applying | uploading
  const [error, setError] = useState(null)
  const busy = step !== 'idle'

  function close() {
    if (busy) return
    setFile(null)
    setFileError(null)
    setError(null)
    onClose()
  }

  async function submit() {
    setError(null)
    setStep('applying')
    let application
    try {
      application = await applyToJob(job.id)
    } catch (e) {
      setError(e.message)
      setStep('idle')
      return
    }

    if (file) {
      setStep('uploading')
      try {
        await uploadResume(application.id, file)
        toast.success('Application submitted', { description: 'Your resume was attached.' })
      } catch (e) {
        toast.warning('Application submitted, but the resume upload failed', {
          description: `${e.message} You can upload it again from My applications.`,
          duration: 8000,
        })
      }
    } else {
      toast.success('Application submitted')
    }

    setStep('idle')
    setFile(null)
    onApplied(application)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Apply for this role"
      dismissible={!busy}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={busy}>Cancel</Button>
          <Button onClick={submit} loading={busy}>
            {step === 'applying' ? 'Submitting' : step === 'uploading' ? 'Uploading resume' : 'Submit application'}
          </Button>
        </>
      }
    >
      {job && (
        <div className="mb-5 rounded-xl bg-canvas p-4">
          <p className="font-display text-lg font-semibold">{job.title}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5"><Building2 className="size-3.5" aria-hidden />{job.company}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" aria-hidden />{job.location}</span>
            <span>{formatSalary(job.salary)}</span>
          </p>
        </div>
      )}

      <p className="mb-2 text-sm font-medium">Resume <span className="font-normal text-muted">(optional, you can add it later)</span></p>
      <FileDropzone file={file} onFile={setFile} extensions={RESUME_EXTENSIONS} maxMB={MAX_RESUME_MB} disabled={busy} error={fileError} onError={setFileError} />

      {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700" role="alert">{error}</p>}
    </Modal>
  )
}
