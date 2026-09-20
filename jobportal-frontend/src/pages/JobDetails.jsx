import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Banknote, Building2, Clock, FileUp, MapPin, Pencil, Send, Trash2, Users } from 'lucide-react'
import { ApplyModal } from '../components/applications/ApplyModal'
import { ResumeUploadModal } from '../components/applications/ResumeUploadModal'
import { StatusStepper } from '../components/applications/StatusStepper'
import { JobFormModal } from '../components/jobs/JobFormModal'
import { Avatar } from '../components/ui/Avatar'
import { StatusBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ErrorState, Skeleton } from '../components/ui/Feedback'
import { ConfirmDialog } from '../components/ui/Modal'
import { useAuth } from '../context/AuthContext'
import { useAsync } from '../hooks/useAsync'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { formatDate, formatSalary, timeAgo } from '../lib/format'
import { listApplications, withdrawApplication } from '../services/applicationService'
import { getJob } from '../services/jobService'

function Meta({ icon: Icon, children }) {
  return <span className="inline-flex items-center gap-1.5"><Icon className="size-4 text-faint" aria-hidden />{children}</span>
}

export default function JobDetails() {
  const { id } = useParams()
  const { isCandidate, isRecruiter } = useAuth()
  const job = useAsync(({ signal }) => getJob(id, { signal }), [id])
  const mine = useAsync(({ signal }) => (isCandidate ? listApplications({ signal }) : Promise.resolve([])), [isCandidate])
  useDocumentTitle(job.data?.title || 'Job details')

  const [applyOpen, setApplyOpen] = useState(false)
  const [resumeOpen, setResumeOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const application = (mine.data || []).find((a) => String(a.jobId) === String(id))
  const backTo = isRecruiter ? '/recruiter/jobs' : '/jobs'

  if (job.error && !job.data) {
    return (
      <>
        <Link to={backTo} className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"><ArrowLeft className="size-4" />All jobs</Link>
        <ErrorState error={job.error} onRetry={job.reload} title="We couldn't load this job" />
      </>
    )
  }

  if (!job.data) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4 rounded-2xl bg-white p-7 ring-1 ring-line"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-4 w-1/3" /><Skeleton className="mt-8 h-32" /></div>
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    )
  }

  const j = job.data

  return (
    <>
      <Link to={backTo} className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"><ArrowLeft className="size-4" />All jobs</Link>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <article className="rounded-2xl bg-white p-6 ring-1 ring-line sm:p-8">
          <div className="flex items-start gap-4">
            <Avatar name={j.company} size="lg" />
            <div className="min-w-0">
              <h1 className="text-2xl font-bold sm:text-3xl">{j.title}</h1>
              <p className="mt-1 text-lg text-muted">{j.company}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-y border-line py-4 text-sm">
            <Meta icon={MapPin}>{j.location}</Meta>
            <Meta icon={Banknote}><span className="font-medium">{formatSalary(j.salary)}</span></Meta>
            <Meta icon={Clock}>Posted {timeAgo(j.createdAt)}</Meta>
          </div>

          <h2 className="mt-7 text-lg font-semibold">About this role</h2>
          <p className="mt-3 max-w-[70ch] leading-relaxed whitespace-pre-line text-muted">{j.description}</p>
        </article>

        <aside className="rounded-2xl bg-white p-6 ring-1 ring-line lg:sticky lg:top-8">
          {isRecruiter ? (
            <>
              <h2 className="text-lg font-semibold">Manage this job</h2>
              <p className="mt-1 text-sm text-muted">Posted {formatDate(j.createdAt)}</p>
              <div className="mt-5 flex flex-col gap-2">
                <Button as={Link} to={`/recruiter/applications?job=${j.id}`} icon={Users}>View applicants</Button>
                <Button variant="secondary" icon={Pencil} onClick={() => setEditOpen(true)}>Edit job</Button>
              </div>
            </>
          ) : application ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Your application</h2>
                <StatusBadge status={application.status} />
              </div>
              <p className="mt-1 text-sm text-muted">Applied {timeAgo(application.appliedAt)}</p>
              <div className="mt-6"><StatusStepper status={application.status} /></div>
              <div className="mt-6 flex flex-col gap-2">
                <Button variant="secondary" icon={FileUp} onClick={() => setResumeOpen(true)}>Upload resume</Button>
                <Button variant="ghost" icon={Trash2} onClick={() => setWithdrawOpen(true)} className="text-rose-600 hover:bg-rose-50">Withdraw application</Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted">Salary</p>
              <p className="font-display text-3xl font-bold">{formatSalary(j.salary)}</p>
              <Button size="lg" icon={Send} className="mt-5 w-full" onClick={() => setApplyOpen(true)} disabled={mine.loading && !mine.data}>Apply now</Button>
              <p className="mt-3 text-center text-sm text-muted">You can attach your resume while applying, or add it later.</p>
            </>
          )}
        </aside>
      </div>

      {isCandidate && (
        <>
          <ApplyModal open={applyOpen} onClose={() => setApplyOpen(false)} job={j} onApplied={() => mine.reload()} />
          {application && (
            <>
              <ResumeUploadModal open={resumeOpen} onClose={() => setResumeOpen(false)} application={application} />
              <ConfirmDialog
                open={withdrawOpen}
                onClose={() => setWithdrawOpen(false)}
                title="Withdraw application?"
                message={`Your application for ${j.title} will be deleted along with its resume. You can apply again later.`}
                confirmLabel="Withdraw"
                danger
                onConfirm={async () => {
                  try {
                    await withdrawApplication(application.id)
                    toast.success('Application withdrawn')
                    mine.setData((list) => (list || []).filter((a) => a.id !== application.id))
                  } catch (error) {
                    toast.error(error.message)
                    throw error
                  }
                }}
              />
            </>
          )}
        </>
      )}

      {isRecruiter && editOpen && <JobFormModal open job={j} onClose={() => setEditOpen(false)} onSaved={(saved) => job.setData(saved)} />}
    </>
  )
}
