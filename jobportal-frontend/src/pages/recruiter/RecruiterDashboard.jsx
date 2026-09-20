import { Link } from 'react-router-dom'
import { ArrowRight, Inbox, Plus } from 'lucide-react'
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
import { getRecruiterDashboard } from '../../services/dashboardService'

function Tile({ label, value, to, hint }) {
  const body = (
    <>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </>
  )
  const cls = 'block rounded-2xl bg-white p-5 ring-1 ring-line'
  return to ? <Link to={to} className={`${cls} transition-shadow hover:ring-brand/40`}>{body}</Link> : <div className={cls}>{body}</div>
}

export default function RecruiterDashboard() {
  useDocumentTitle('Dashboard')
  const { user } = useAuth()
  const stats = useAsync(({ signal }) => getRecruiterDashboard({ signal }), [])
  const apps = useAsync(({ signal }) => listApplications({ signal }), [])
  const s = stats.data

  const latest = [...(apps.data || [])].sort((a, b) => (parseDate(b.appliedAt) ?? 0) - (parseDate(a.appliedAt) ?? 0)).slice(0, 6)

  return (
    <>
      <PageHeader
        title={`Hello, ${firstName(user?.name)}`}
        description={s ? (s.pendingApplications > 0 ? `${s.pendingApplications} ${s.pendingApplications === 1 ? 'application is' : 'applications are'} waiting for your review.` : 'You are all caught up on applications.') : 'Your hiring pipeline at a glance.'}
        actions={<Button as={Link} to="/recruiter/jobs?new=1" icon={Plus}>Post a job</Button>}
      />

      {stats.error && !s ? (
        <ErrorState error={stats.error} onRetry={stats.reload} title="We couldn't load your dashboard" />
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-line lg:col-span-2">
            <h2 className="mb-5 text-lg font-semibold">Pipeline</h2>
            {s ? <StatusDonut stats={s} centerLabel="Applications" /> : <Skeleton className="h-44" />}
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
            {s ? (
              <>
                <Tile label="Open jobs" value={s.totalJobs} to="/recruiter/jobs" />
                <Tile label="Total applications" value={s.totalApplications} to="/recruiter/applications" />
                <div className="col-span-2 lg:col-span-1"><Tile label="Needs review" value={s.pendingApplications} to="/recruiter/applications?status=PENDING" hint="Pending applications" /></div>
              </>
            ) : (<><Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-24 rounded-2xl" /></>)}
          </div>
        </div>
      )}

      <section className="mt-5 rounded-2xl bg-white p-6 ring-1 ring-line">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Latest applications</h2>
          {latest.length > 0 && <Link to="/recruiter/applications" className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">View all <ArrowRight className="size-3.5" /></Link>}
        </div>
        {apps.error && !apps.data ? (
          <ErrorState error={apps.error} onRetry={apps.reload} className="border-0 bg-transparent py-6" />
        ) : !apps.data ? (
          <div className="space-y-3"><Skeleton className="h-12" /><Skeleton className="h-12" /></div>
        ) : latest.length === 0 ? (
          <EmptyState icon={Inbox} title="No applications yet" description="Applications appear here as soon as candidates apply to your jobs." className="border-0 bg-canvas/60" />
        ) : (
          <ul className="divide-y divide-line">
            {latest.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-3">
                <Avatar name={a.userName} size="sm" round />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{a.userName}</p>
                  <p className="truncate text-sm text-muted">{a.jobTitle} at {a.company} · {timeAgo(a.appliedAt)}</p>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
