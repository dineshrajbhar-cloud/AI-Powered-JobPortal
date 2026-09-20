import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../ui/Button'
import { FileDropzone } from '../ui/FileDropzone'
import { Modal } from '../ui/Modal'
import { MAX_RESUME_MB, RESUME_EXTENSIONS } from '../../config'
import { uploadResume } from '../../services/applicationService'

export function ResumeUploadModal({ open, onClose, application, onUploaded }) {
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState(null)
  const [progress, setProgress] = useState(0)
  const [busy, setBusy] = useState(false)

  function close() {
    if (busy) return
    setFile(null)
    setFileError(null)
    setProgress(0)
    onClose()
  }

  async function submit() {
    if (!file) return
    setBusy(true)
    try {
      await uploadResume(application.id, file, setProgress)
      toast.success('Resume uploaded')
      onUploaded?.(application)
      setFile(null)
      setProgress(0)
      onClose()
    } catch (error) {
      setFileError(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Upload resume"
      description={application ? `${application.jobTitle} at ${application.company}. A new upload replaces the previous file.` : undefined}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={busy}>Cancel</Button>
          <Button onClick={submit} disabled={!file} loading={busy}>
            {busy ? (progress > 0 && progress < 100 ? `Uploading ${progress}%` : 'Uploading') : 'Upload resume'}
          </Button>
        </>
      }
    >
      <FileDropzone file={file} onFile={setFile} extensions={RESUME_EXTENSIONS} maxMB={MAX_RESUME_MB} disabled={busy} error={fileError} onError={setFileError} />
    </Modal>
  )
}
