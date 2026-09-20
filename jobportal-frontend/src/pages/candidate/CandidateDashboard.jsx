import { Link } from 'react-router-dom'
import { ArrowRight, ClipboardList, Search, Sparkles } from 'lucide-react'
import { StatusDonut } from '../../components/charts/StatusDonut'
import { Avatar } from '../../components/ui/Avatar'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { EmptyState, ErrorState, PageHeader, Skeleton } from '../../components/ui/Feedback'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { firstName, parseDate, timeAgo } from '../../lib/format'
import { listApplications } from '../../services/applicationService'
import { getCandidateDashboard } from '../../services/dashboardService'

function Tile({ label, value, hint }) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-line">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  )
}

export default function CandidateDashboard() {
  useDocumentTitle('Dashboard')
  const { user } = useAuth()
  const stats = useAsync(({ signal }) => getCandidateDashboard({ signal }), [])
  const apps = useAsync(({ signal }) => listApplications({ signal }), [])

  const recent = [...(apps.data || [])].sort((a, b) => (parseDate(b.appliedAt) ?? 0) - (parseDate(a.appliedAt) ?? 0)).slice(0, 4)
  const s = stats.data

  return (
    <>
      <PageHeader title={`Welcome back, ${firstName(user?.name)}`} description="Here's where your applications stand." />

      {stats.error && !s ? (
        <ErrorState error={stats.error} onRetry={stats.reload} title="We couldn't load your dashboard" />
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-line lg:col-span-2">
            <h2 className="mb-5 text-lg font-semibold">Application status</h2>
            {s ? <StatusDonut stats={s} /> : <Skeleton className="h-44" />}
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
            {s ? (
              <>
                <Tile label="Applications sent" value={s.totalApplications} />
                <Tile label="Interviews" value={s.interviewApplications} hint="Currently at interview stage" />
                <div className="col-span-2 lg:col-span-1"><Tile label="Selected" value={s.selectedApplications} /></div>
              </>
            ) : (
              <><Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-24 rounded-2xl" /></>
            )}
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl bg-white p-6 ring-1 ring-line">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent applications</h2>
            {recent.length > 0 && <Link to="/candidate/applications" className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">View all <ArrowRight className="size-3.5" /></Link>}
          </div>

          {apps.error && !apps.data ? (
            <ErrorState error={apps.error} onRetry={apps.reload} className="border-0 bg-transparent py-6" />
          ) : !apps.data ? (
            <div className="space-y-3"><Skeleton className="h-14" /><Skeleton className="h-14" /></div>
          ) : recent.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No applications yet" description="Find a role you like and apply. It will show up here." action={<Button as={Link} to="/jobs">Find jobs</Button>} className="border-0 bg-canvas/60" />
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-3">
                  <Avatar name={a.company} size="sm" />
                  <div className="min-w-0 flex-1">
                    <Link to={`/jobs/${a.jobId}`} className="block truncate font-medium hover:text-brand">{a.jobTitle}</Link>
                    <p className="truncate text-sm text-muted">{a.company} · {timeAgo(a.appliedAt)}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-5">
          <section className="rounded-2xl bg-ink p-6 text-white">
            <Sparkles className="size-6 text-white/80" aria-hidden />
            <h2 className="mt-4 text-xl font-bold">Check your resume against open roles</h2>
            <p className="mt-2 text-white/70">Get a match percentage and a short reason for every role that fits.</p>
            <Button as={Link} to="/matcher" variant="secondary" className="mt-5">Open the matcher</Button>
          </section>
          <section className="rounded-2xl bg-white p-6 ring-1 ring-line">
            <Search className="size-5 text-brand" aria-hidden />
            <h2 className="mt-3 text-lg font-semibold">Browse all jobs</h2>
            <p className="mt-1 text-muted">Filter by location, company and salary.</p>
            <Button as={Link} to="/jobs" variant="subtle" className="mt-4">Find jobs</Button>
          </section>
        </div>
      </div>
    </>
  )
}
