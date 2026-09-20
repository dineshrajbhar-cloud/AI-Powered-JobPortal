import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Briefcase, MapPin, Building2, Search, SlidersHorizontal, X } from 'lucide-react'
import { JobCard, JobCardSkeleton } from '../components/jobs/JobCard'
import { Button } from '../components/ui/Button'
import { Field, Input, Select } from '../components/ui/Field'
import { EmptyState, ErrorState, PageHeader } from '../components/ui/Feedback'
import { Pagination } from '../components/ui/Pagination'
import { useAuth } from '../context/AuthContext'
import { useAsync } from '../hooks/useAsync'
import { useDebounce } from '../hooks/useDebounce'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { cn } from '../lib/cn'
import { parseDate } from '../lib/format'
import { listApplications } from '../services/applicationService'
import { listJobs } from '../services/jobService'

const PAGE_SIZE = 9
const SORTS = {
  newest: { label: 'Newest first', fn: (a, b) => (parseDate(b.createdAt) ?? 0) - (parseDate(a.createdAt) ?? 0) },
  salaryDesc: { label: 'Salary: high to low', fn: (a, b) => b.salary - a.salary },
  salaryAsc: { label: 'Salary: low to high', fn: (a, b) => a.salary - b.salary },
  title: { label: 'Title: A to Z', fn: (a, b) => a.title.localeCompare(b.title) },
}

export default function Jobs() {
  useDocumentTitle('Find jobs')
  const { isCandidate } = useAuth()
  const [params, setParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)

  const applied = {
    q: params.get('q') || '', loc: params.get('loc') || '', co: params.get('co') || '',
    min: params.get('min') || '', max: params.get('max') || '',
  }
  const sort = SORTS[params.get('sort')] ? params.get('sort') : 'newest'
  const page = Math.max(1, Number(params.get('page')) || 1)

  // Form state is debounced into the URL, which drives the request.
  const [form, setForm] = useState(applied)
  const debounced = useDebounce(form, 350)

  useEffect(() => {
    const changed = Object.keys(debounced).some((k) => debounced[k] !== applied[k])
    if (!changed) return
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries(debounced).forEach(([k, v]) => (v.trim() ? next.set(k, v.trim()) : next.delete(k)))
      next.delete('page')
      return next
    }, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  const jobs = useAsync(
    ({ signal }) =>
      listJobs({ title: applied.q, location: applied.loc, company: applied.co, minSalary: applied.min, maxSalary: applied.max }, { signal }),
    [applied.q, applied.loc, applied.co, applied.min, applied.max],
  )

  const mine = useAsync(({ signal }) => (isCandidate ? listApplications({ signal }) : Promise.resolve([])), [isCandidate])
  const appliedIds = useMemo(() => new Set((mine.data || []).map((a) => a.jobId)), [mine.data])

  const sorted = useMemo(() => [...(jobs.data || [])].sort(SORTS[sort].fn), [jobs.data, sort])
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const visible = sorted.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const activeCount = Object.values(applied).filter(Boolean).length
  const setParam = (key, value) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      value ? next.set(key, value) : next.delete(key)
      if (key !== 'page') next.delete('page')
      return next
    })

  function clearAll() {
    setForm({ q: '', loc: '', co: '', min: '', max: '' })
    setParams({}, { replace: true })
  }

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <>
      <PageHeader title="Find jobs" description="Search by title, then narrow down by location, company and salary." />

      <div className="rounded-2xl bg-white p-4 ring-1 ring-line">
        <div className="flex gap-2">
          <div className="flex-1"><Input icon={Search} value={form.q} onChange={set('q')} placeholder="Search job titles" aria-label="Search job titles" /></div>
          <Button variant="secondary" icon={SlidersHorizontal} className="md:hidden" onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters}>
            Filters{activeCount > 0 ? ` (${activeCount})` : ''}
          </Button>
        </div>

        <div className={cn('mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-5', showFilters ? 'grid' : 'hidden md:grid')}>
          <Field label="Location">{(id) => <Input id={id} icon={MapPin} value={form.loc} onChange={set('loc')} placeholder="Any" />}</Field>
          <Field label="Company">{(id) => <Input id={id} icon={Building2} value={form.co} onChange={set('co')} placeholder="Any" />}</Field>
          <Field label="Min salary">{(id) => <Input id={id} type="number" min="0" step="10000" value={form.min} onChange={set('min')} placeholder="0" />}</Field>
          <Field label="Max salary">{(id) => <Input id={id} type="number" min="0" step="10000" value={form.max} onChange={set('max')} placeholder="Any" />}</Field>
          <Field label="Sort by">
            {(id) => (
              <Select id={id} value={sort} onChange={(e) => setParam('sort', e.target.value === 'newest' ? '' : e.target.value)}>
                {Object.entries(SORTS).map(([key, s]) => <option key={key} value={key}>{s.label}</option>)}
              </Select>
            )}
          </Field>
        </div>
      </div>

      <div className="mt-5 mb-4 flex min-h-8 flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          {jobs.data ? `${sorted.length} ${sorted.length === 1 ? 'job' : 'jobs'} found` : 'Searching...'}
        </p>
        {activeCount > 0 && <Button variant="ghost" size="sm" icon={X} onClick={clearAll}>Clear filters</Button>}
      </div>

      {jobs.error && !jobs.data ? (
        <ErrorState error={jobs.error} onRetry={jobs.reload} title="We couldn't load jobs" />
      ) : !jobs.data ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <JobCardSkeleton key={i} />)}</div>
      ) : sorted.length === 0 ? (
        <EmptyState icon={Briefcase} title={activeCount ? 'No jobs match these filters' : 'No jobs posted yet'}
          description={activeCount ? 'Try a broader title or remove a filter.' : 'Check back soon. New roles show up here as recruiters post them.'}
          action={activeCount ? <Button variant="secondary" onClick={clearAll}>Clear filters</Button> : null} />
      ) : (
        <>
          <div className={cn('grid gap-4 transition-opacity md:grid-cols-2 xl:grid-cols-3', jobs.loading && 'opacity-60')}>
            {visible.map((job) => <JobCard key={job.id} job={job} applied={appliedIds.has(job.id)} />)}
          </div>
          <Pagination page={current} pageCount={pageCount} onChange={(p) => { setParam('page', p === 1 ? '' : String(p)); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
        </>
      )}
    </>
  )
}
