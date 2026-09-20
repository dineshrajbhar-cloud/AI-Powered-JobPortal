import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Briefcase, Eye, Pencil, Plus, Search, Trash2, Users } from 'lucide-react'
import { JobFormModal } from '../../components/jobs/JobFormModal'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Field'
import { EmptyState, ErrorState, PageHeader, Skeleton } from '../../components/ui/Feedback'
import { ConfirmDialog } from '../../components/ui/Modal'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { formatDate, formatSalary, parseDate } from '../../lib/format'
import { deleteJob, listJobs } from '../../services/jobService'

const ROW = 'md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]'

export default function ManageJobs() {
  useDocumentTitle('Jobs')
  const [params, setParams] = useSearchParams()
  const jobs = useAsync(({ signal }) => listJobs({}, { signal }), [])
  const [query, setQuery] = useState('')
  const [form, setForm] = useState(null) // null | { job? }
  const [deleting, setDeleting] = useState(null)

  // "Post a job" links from the dashboard land here with ?new=1
  useEffect(() => {
    if (params.get('new')) {
      setForm({})
      setParams({}, { replace: true })
    }
  }, [params, setParams])

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...(jobs.data || [])]
      .filter((j) => !q || `${j.title} ${j.company} ${j.location}`.toLowerCase().includes(q))
      .sort((a, b) => (parseDate(b.createdAt) ?? 0) - (parseDate(a.createdAt) ?? 0))
  }, [jobs.data, query])

  function handleSaved(saved) {
    jobs.setData((current) => {
      const rest = (current || []).filter((j) => j.id !== saved.id)
      return [saved, ...rest]
    })
  }

  return (
    <>
      <PageHeader title="Jobs" description="Post new roles and keep existing ones up to date." actions={<Button icon={Plus} onClick={() => setForm({})}>Post a job</Button>} />

      {jobs.error && !jobs.data ? (
        <ErrorState error={jobs.error} onRetry={jobs.reload} title="We couldn't load jobs" />
      ) : !jobs.data ? (
        <div className="space-y-3"><Skeleton className="h-12 rounded-xl" /><Skeleton className="h-16 rounded-xl" /><Skeleton className="h-16 rounded-xl" /></div>
      ) : jobs.data.length === 0 ? (
        <EmptyState icon={Briefcase} title="You haven't posted any jobs" description="Post your first role and candidates can start applying right away." action={<Button icon={Plus} onClick={() => setForm({})}>Post a job</Button>} />
      ) : (
        <>
          <div className="mb-4 max-w-sm"><Input icon={Search} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title, company or location" aria-label="Search jobs" /></div>

          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-line">
            <div className={`hidden gap-4 border-b border-line bg-canvas/70 px-5 py-3 text-sm font-medium text-muted md:grid ${ROW}`}>
              <span>Job</span><span>Location</span><span>Salary</span><span>Posted</span><span className="w-[132px]"><span className="sr-only">Actions</span></span>
            </div>

            {list.length === 0 ? (
              <p className="px-5 py-10 text-center text-muted">No jobs match "{query}".</p>
            ) : (
              <ul className="divide-y divide-line">
                {list.map((job) => (
                  <li key={job.id} className={`grid items-center gap-x-4 gap-y-2 px-5 py-4 ${ROW}`}>
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={job.company} size="sm" />
                      <div className="min-w-0">
                        <Link to={`/jobs/${job.id}`} className="block truncate font-medium hover:text-brand">{job.title}</Link>
                        <p className="truncate text-sm text-muted">{job.company}</p>
                      </div>
                    </div>
                    <p className="truncate text-sm text-muted">{job.location}</p>
                    <p className="text-sm font-medium">{formatSalary(job.salary)}</p>
                    <p className="text-sm text-muted">{formatDate(job.createdAt)}</p>
                    <div className="flex items-center gap-1 justify-self-start md:justify-self-end">
                      <Button as={Link} to={`/recruiter/applications?job=${job.id}`} variant="ghost" size="sm" className="size-10 px-0 md:size-8" aria-label={`Applicants for ${job.title}`} title="Applicants"><Users className="size-4" /></Button>
                      <Button as={Link} to={`/jobs/${job.id}`} variant="ghost" size="sm" className="size-10 px-0 md:size-8" aria-label={`View ${job.title}`} title="View"><Eye className="size-4" /></Button>
                      <Button variant="ghost" size="sm" className="size-10 px-0 md:size-8" onClick={() => setForm({ job })} aria-label={`Edit ${job.title}`} title="Edit"><Pencil className="size-4" /></Button>
                      <Button variant="ghost" size="sm" className="size-10 px-0 md:size-8 text-rose-600 hover:bg-rose-50" onClick={() => setDeleting(job)} aria-label={`Delete ${job.title}`} title="Delete"><Trash2 className="size-4" /></Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {form && <JobFormModal open job={form.job} onClose={() => setForm(null)} onSaved={handleSaved} />}

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete this job?"
        message={deleting ? `"${deleting.title}" at ${deleting.company} will be removed for everyone.` : ''}
        confirmLabel="Delete job"
        danger
        onConfirm={async () => {
          try {
            await deleteJob(deleting.id)
            toast.success('Job deleted')
            jobs.setData((list) => (list || []).filter((j) => j.id !== deleting.id))
          } catch (error) {
            // applications reference the job, so the database refuses to delete it
            toast.error(/constraint|foreign key|integrity/i.test(error.message) ? "This job has applications, so it can't be deleted." : error.message)
            throw error
          }
        }}
      />
    </>
  )
}
