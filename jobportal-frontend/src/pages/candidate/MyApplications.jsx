import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ClipboardList, Download, FileUp, Trash2 } from 'lucide-react'
import { ResumeUploadModal } from '../../components/applications/ResumeUploadModal'
import { StatusStepper } from '../../components/applications/StatusStepper'
import { Avatar } from '../../components/ui/Avatar'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { EmptyState, ErrorState, PageHeader, Skeleton } from '../../components/ui/Feedback'
import { ConfirmDialog } from '../../components/ui/Modal'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { cn } from '../../lib/cn'
import { saveBlob } from '../../lib/files'
import { formatDate, parseDate } from '../../lib/format'
import { STATUSES, STATUS_META, normalizeStatus } from '../../lib/status'
import { downloadResume, listApplications, withdrawApplication } from '../../services/applicationService'

export async function downloadResumeFile(application) {
  try {
    const { blob, filename } = await downloadResume(application.id)
    const ext = (filename && filename.includes('.') ? filename.slice(filename.lastIndexOf('.')) : '') || '.pdf'
    const owner = (application.userName || 'candidate').trim().replace(/\s+/g, '-').toLowerCase()
    saveBlob(blob, `${owner}-resume${ext}`)
  } catch (error) {
    toast.error(error.status === 404 ? 'No resume has been uploaded for this application yet.' : error.message)
  }
}

export default function MyApplications() {
  useDocumentTitle('My applications')
  const apps = useAsync(({ signal }) => listApplications({ signal }), [])
  const [tab, setTab] = useState('ALL')
  const [uploadFor, setUploadFor] = useState(null)
  const [withdrawFor, setWithdrawFor] = useState(null)

  const sorted = useMemo(
    () => [...(apps.data || [])].sort((a, b) => (parseDate(b.appliedAt) ?? 0) - (parseDate(a.appliedAt) ?? 0)),
    [apps.data],
  )
  const counts = useMemo(() => {
    const c = { ALL: sorted.length }
    STATUSES.forEach((s) => (c[s] = sorted.filter((a) => normalizeStatus(a.status) === s).length))
    return c
  }, [sorted])
  const visible = tab === 'ALL' ? sorted : sorted.filter((a) => normalizeStatus(a.status) === tab)

  return (
    <>
      <PageHeader title="My applications" description="Follow each application from Pending to a final decision."
        actions={<Button as={Link} to="/jobs" variant="secondary">Find more jobs</Button>} />

      {apps.error && !apps.data ? (
        <ErrorState error={apps.error} onRetry={apps.reload} title="We couldn't load your applications" />
      ) : !apps.data ? (
        <div className="space-y-4"><Skeleton className="h-44 rounded-2xl" /><Skeleton className="h-44 rounded-2xl" /></div>
      ) : sorted.length === 0 ? (
        <EmptyState icon={ClipboardList} title="You haven't applied yet" description="When you apply to a job it appears here, and you can watch its status change." action={<Button as={Link} to="/jobs">Find jobs</Button>} />
      ) : (
        <>
          <div className="mb-5 flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Filter by status">
            {['ALL', ...STATUSES].map((key) => (
              <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
                className={cn('shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors', tab === key ? 'bg-ink text-white' : 'bg-white text-muted ring-1 ring-line ring-inset hover:text-ink')}>
                {key === 'ALL' ? 'All' : STATUS_META[key].label} <span className={tab === key ? 'text-white/70' : 'text-faint'}>{counts[key]}</span>
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <EmptyState title="Nothing in this status" description="Applications will appear here when their status changes." />
          ) : (
            <ul className="space-y-4">
              {visible.map((a) => (
                <li key={a.id} className="rounded-2xl bg-white p-5 ring-1 ring-line sm:p-6">
                  <div className="flex flex-wrap items-start gap-3">
                    <Avatar name={a.company} />
                    <div className="min-w-0 flex-1">
                      <Link to={`/jobs/${a.jobId}`} className="text-lg font-semibold hover:text-brand">{a.jobTitle}</Link>
                      <p className="text-sm text-muted">{a.company} · Applied {formatDate(a.appliedAt)}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>

                  <div className="mt-6 max-w-xl"><StatusStepper status={a.status} /></div>

                  <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-4">
                    <Button variant="secondary" size="sm" icon={FileUp} onClick={() => setUploadFor(a)}>Upload resume</Button>
                    <Button variant="secondary" size="sm" icon={Download} onClick={() => downloadResumeFile(a)}>Download resume</Button>
                    <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setWithdrawFor(a)} className="ml-auto text-rose-600 hover:bg-rose-50">Withdraw</Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <ResumeUploadModal open={!!uploadFor} onClose={() => setUploadFor(null)} application={uploadFor} />
      <ConfirmDialog
        open={!!withdrawFor}
        onClose={() => setWithdrawFor(null)}
        title="Withdraw application?"
        message={withdrawFor ? `Your application for ${withdrawFor.jobTitle} at ${withdrawFor.company} will be deleted along with its resume.` : ''}
        confirmLabel="Withdraw"
        danger
        onConfirm={async () => {
          try {
            await withdrawApplication(withdrawFor.id)
            toast.success('Application withdrawn')
            apps.setData((list) => (list || []).filter((x) => x.id !== withdrawFor.id))
          } catch (error) {
            toast.error(error.message)
            throw error
          }
        }}
      />
    </>
  )
}
