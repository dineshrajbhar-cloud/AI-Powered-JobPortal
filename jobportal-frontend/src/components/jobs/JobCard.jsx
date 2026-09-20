import { Link } from 'react-router-dom'
import { Banknote, CheckCircle2, Clock, MapPin } from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { formatSalaryCompact, isRecent, timeAgo } from '../../lib/format'

export function JobCard({ job, applied }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="flex flex-col rounded-2xl bg-white p-5 ring-1 ring-line transition-shadow hover:shadow-lg hover:shadow-ink/5 hover:ring-brand/40"
    >
      <div className="flex items-start gap-3">
        <Avatar name={job.company} />
        <div className="min-w-0 flex-1">
          <h3 className="text-lg leading-snug font-semibold">{job.title}</h3>
          <p className="truncate text-sm text-muted">{job.company}</p>
        </div>
        {applied ? (
          <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-200"><CheckCircle2 className="size-3" aria-hidden />Applied</Badge>
        ) : isRecent(job.createdAt) ? (
          <Badge className="bg-brand-soft text-brand ring-brand/20">New</Badge>
        ) : null}
      </div>

      <p className="mt-4 line-clamp-2 text-sm text-muted">{job.description}</p>

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-5 text-sm text-muted">
        <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" aria-hidden />{job.location}</span>
        <span className="inline-flex items-center gap-1.5 font-medium text-ink"><Banknote className="size-3.5 text-muted" aria-hidden />{formatSalaryCompact(job.salary)}</span>
        <span className="inline-flex items-center gap-1.5"><Clock className="size-3.5" aria-hidden />{timeAgo(job.createdAt)}</span>
      </div>
    </Link>
  )
}

export function JobCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-line" aria-hidden>
      <div className="flex gap-3">
        <div className="size-10 animate-pulse rounded-xl bg-ink/8" />
        <div className="flex-1 space-y-2"><div className="h-4 w-2/3 animate-pulse rounded bg-ink/8" /><div className="h-3 w-1/3 animate-pulse rounded bg-ink/8" /></div>
      </div>
      <div className="mt-5 space-y-2"><div className="h-3 animate-pulse rounded bg-ink/8" /><div className="h-3 w-5/6 animate-pulse rounded bg-ink/8" /></div>
      <div className="mt-6 h-3 w-1/2 animate-pulse rounded bg-ink/8" />
    </div>
  )
}
