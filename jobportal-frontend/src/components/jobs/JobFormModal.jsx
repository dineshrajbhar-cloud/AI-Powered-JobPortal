import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../ui/Button'
import { Field, Input, Textarea } from '../ui/Field'
import { Modal } from '../ui/Modal'
import { createJob, updateJob } from '../../services/jobService'

const empty = { title: '', company: '', location: '', salary: '', description: '' }

function validate(values) {
  const errors = {}
  if (!values.title.trim()) errors.title = 'Enter a job title.'
  if (!values.company.trim()) errors.company = 'Enter the company name.'
  if (!values.location.trim()) errors.location = 'Enter a location.'
  if (!(Number(values.salary) > 0)) errors.salary = 'Enter a salary greater than 0.'
  if (!values.description.trim()) errors.description = 'Describe the role.'
  return errors
}

// Mounted only while open (see `key` usage) so the form always starts fresh.
export function JobFormModal({ open, onClose, job, onSaved }) {
  const editing = !!job
  const [values, setValues] = useState(() =>
    job ? { title: job.title, company: job.company, location: job.location, salary: String(job.salary ?? ''), description: job.description } : empty,
  )
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [busy, setBusy] = useState(false)

  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length) return

    setBusy(true)
    setFormError(null)
    const payload = {
      title: values.title.trim(),
      company: values.company.trim(),
      location: values.location.trim(),
      description: values.description.trim(),
      salary: Number(values.salary),
    }
    try {
      const saved = editing ? await updateJob(job.id, payload) : await createJob(payload)
      toast.success(editing ? 'Job updated' : 'Job posted')
      onSaved(saved)
      onClose()
    } catch (error) {
      if (error.fieldErrors) setErrors(error.fieldErrors)
      setFormError(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      dismissible={!busy}
      title={editing ? 'Edit job' : 'Post a job'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button type="submit" form="job-form" loading={busy}>{editing ? 'Save changes' : 'Post job'}</Button>
        </>
      }
    >
      <form id="job-form" onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field label="Job title" error={errors.title} className="sm:col-span-2">
          {(id) => <Input id={id} value={values.title} onChange={set('title')} placeholder="Java Backend Developer" invalid={!!errors.title} autoFocus />}
        </Field>
        <Field label="Company" error={errors.company}>
          {(id) => <Input id={id} value={values.company} onChange={set('company')} invalid={!!errors.company} />}
        </Field>
        <Field label="Location" error={errors.location}>
          {(id) => <Input id={id} value={values.location} onChange={set('location')} placeholder="Bengaluru or Remote" invalid={!!errors.location} />}
        </Field>
        <Field label="Salary" error={errors.salary} className="sm:col-span-2">
          {(id) => <Input id={id} type="number" inputMode="numeric" min="1" step="1000" value={values.salary} onChange={set('salary')} placeholder="800000" invalid={!!errors.salary} />}
        </Field>
        <Field label="Description" error={errors.description} className="sm:col-span-2">
          {(id) => <Textarea id={id} rows={7} value={values.description} onChange={set('description')} placeholder="What the role involves, the skills you need and how the team works." invalid={!!errors.description} />}
        </Field>
        {formError && <p className="rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700 sm:col-span-2" role="alert">{formError}</p>}
      </form>
    </Modal>
  )
}
