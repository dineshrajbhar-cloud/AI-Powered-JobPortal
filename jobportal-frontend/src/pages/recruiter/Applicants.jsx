import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Download, Inbox, Search, X } from 'lucide-react'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Field'
import { EmptyState, ErrorState, PageHeader, Skeleton } from '../../components/ui/Feedback'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { cn } from '../../lib/cn'
import { formatDate, parseDate } from '../../lib/format'
import { STATUSES, STATUS_META, TONES, normalizeStatus } from '../../lib/status'
import { listApplications, updateApplicationStatus } from '../../services/applicationService'
import { downloadResumeFile } from '../candidate/MyApplications'

const ROW = 'md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)_minmax(0,0.8fr)_170px_auto]'

export default function Applicants() {
  useDocumentTitle('Applications')
  const [params, setParams] = useSearchParams()
  const jobFilter = params.get('job')
  const tab = STATUSES.includes(params.get('status')) ? params.get('status') : 'ALL'
  const [query, setQuery] = useState('')
  const [updating, setUpdating] = useState(() => new Set())
  const apps = useAsync(({ signal }) => listApplications({ signal }), [])

  const base = useMemo(
    () => (apps.data || []).filter((a) => !jobFilter || String(a.jobId) === jobFilter),
    [apps.data, jobFilter],
  )
  const counts = useMemo(() => {
    const c = { ALL: base.length }
    STATUSES.forEach((s) => (c[s] = base.filter((a) => normalizeStatus(a.status) === s).length))
    return c
  }, [base])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return base
      .filter((a) => tab === 'ALL' || normalizeStatus(a.status) === tab)
      .filter((a) => !q || `${a.userName} ${a.jobTitle} ${a.company}`.toLowerCase().includes(q))
      .sort((a, b) => (parseDate(b.appliedAt) ?? 0) - (parseDate(a.appliedAt) ?? 0))
  }, [base, tab, query])

  const jobName = jobFilter ? base[0]?.jobTitle || (apps.data || []).find((a) => String(a.jobId) === jobFilter)?.jobTitle : null

  const setParam = (key, value) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      value ? next.set(key, value) : next.delete(key)
      return next
    }, { replace: true })

  async function changeStatus(application, status) {
    const previous = application.status
    if (normalizeStatus(previous) === status) return

    setUpdating((s) => new Set(s).add(application.id))
    apps.setData((list) => list.map((a) => (a.id === application.id ? { ...a, status } : a)))
    try {
      await updateApplicationStatus(application.id, status)
      toast.success(`${application.userName} marked ${STATUS_META[status].label.toLowerCase()}`, { description: 'The candidate was notified by email.' })
    } catch (error) {
      // The backend saves the status first and then sends the email, so a mail
      // failure returns an error even though the change went through. Check.
      let saved = false
      try {
        const fresh = await listApplications()
        apps.setData(fresh)
        saved = normalizeStatus(fresh.find((a) => a.id === application.id)?.status) === status
      } catch {
        apps.setData((list) => list.map((a) => (a.id === application.id ? { ...a, status: previous } : a)))
      }
      if (saved) toast.warning(`Status changed to ${STATUS_META[status].label.toLowerCase()}, but the email failed`, { description: error.message })
      else toast.error("Couldn't update the status", { description: error.message })
    } finally {
      setUpdating((s) => { const next = new Set(s); next.delete(application.id); return next })
    }
  }

  return (
    <>
      <PageHeader title="Applications" description="Review candidates, download resumes and move applications through the pipeline." />

      {apps.error && !apps.data ? (
        <ErrorState error={apps.error} onRetry={apps.reload} title="We couldn't load applications" />
      ) : !apps.data ? (
        <div className="space-y-3"><Skeleton className="h-12 rounded-xl" /><Skeleton className="h-16 rounded-xl" /><Skeleton className="h-16 rounded-xl" /></div>
      ) : apps.data.length === 0 ? (
        <EmptyState icon={Inbox} title="No applications yet" description="When candidates apply to your jobs they will show up here." />
      ) : (
        <>
          {jobFilter && (
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-soft py-1 pr-1.5 pl-3.5 text-sm font-medium text-brand">
              Job: {jobName || `#${jobFilter}`}
              <button type="button" onClick={() => setParam('job', '')} aria-label="Show all jobs" className="grid size-6 place-items-center rounded-full hover:bg-brand/15"><X className="size-3.5" /></button>
            </div>
          )}

          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Filter by status">
              {['ALL', ...STATUSES].map((key) => (
                <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setParam('status', key === 'ALL' ? '' : key)}
                  className={cn('shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors', tab === key ? 'bg-ink text-white' : 'bg-white text-muted ring-1 ring-line ring-inset hover:text-ink')}>
                  {key === 'ALL' ? 'All' : STATUS_META[key].label} <span className={tab === key ? 'text-white/70' : 'text-faint'}>{counts[key]}</span>
                </button>
              ))}
            </div>
            <div className="w-full lg:max-w-xs"><Input icon={Search} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search candidate or job" aria-label="Search applications" /></div>
          </div>

          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-line">
            <div className={`hidden gap-4 border-b border-line bg-canvas/70 px-5 py-3 text-sm font-medium text-muted md:grid ${ROW}`}>
              <span>Candidate</span><span>Job</span><span>Applied</span><span>Status</span><span className="w-9"><span className="sr-only">Resume</span></span>
            </div>

            {visible.length === 0 ? (
              <p className="px-5 py-10 text-center text-muted">No applications match these filters.</p>
            ) : (
              <ul className="divide-y divide-line">
                {visible.map((a) => {
                  const status = normalizeStatus(a.status)
                  return (
                    <li key={a.id} className={`grid items-center gap-x-4 gap-y-3 px-5 py-4 ${ROW}`}>
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar name={a.userName} size="sm" round />
                        <p className="truncate font-medium">{a.userName}</p>
                      </div>
                      <div className="min-w-0">
                        <Link to={`/jobs/${a.jobId}`} className="block truncate text-sm font-medium hover:text-brand">{a.jobTitle}</Link>
                        <p className="truncate text-sm text-muted">{a.company}</p>
                      </div>
                      <p className="text-sm text-muted">{formatDate(a.appliedAt)}</p>
                      <div className="relative">
                        <span className={cn('pointer-events-none absolute top-1/2 left-3 z-10 size-2 -translate-y-1/2 rounded-full', TONES[STATUS_META[status].tone].dot)} aria-hidden />
                        <Select value={status} disabled={updating.has(a.id)} onChange={(e) => changeStatus(a, e.target.value)} aria-label={`Status for ${a.userName}`} className="h-9 pl-7">
                          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                        </Select>
                      </div>
                      <Button variant="secondary" size="sm" className="size-9 px-0 justify-self-start md:justify-self-end" onClick={() => downloadResumeFile(a)} aria-label={`Download resume of ${a.userName}`} title="Download resume"><Download className="size-4" /></Button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </>
  )
}
