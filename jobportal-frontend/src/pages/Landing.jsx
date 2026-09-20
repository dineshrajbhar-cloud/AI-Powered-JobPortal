import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Briefcase, Download, FileUp, MapPin, Search, Send, Sparkles, Users, Mail } from 'lucide-react'
import { MatchRing } from '../components/ai/MatchRing'
import { JobCard } from '../components/jobs/JobCard'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Field'
import { useAuth } from '../context/AuthContext'
import { useAsync } from '../hooks/useAsync'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { listPublicJobs } from '../services/jobService'

function ExampleMatch() {
  return (
    <div className="rounded-3xl bg-white p-6 ring-1 ring-line shadow-xl shadow-brand/10">
      <p className="mb-4 text-xs font-medium text-faint">Example result</p>
      <div className="flex items-center gap-5">
        <MatchRing value={92} size={104} stroke={10} delay={400} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-emerald-700">Strong match</p>
          <h3 className="mt-0.5 text-xl font-semibold">Java Backend Developer</h3>
          <p className="text-sm text-muted">Sample Company, Bengaluru</p>
        </div>
      </div>
      <div className="mt-5 rounded-xl bg-canvas p-4">
        <p className="mb-1 text-sm font-semibold">Why it fits</p>
        <p className="text-sm leading-relaxed text-muted">
          Your Spring Boot and JPA projects line up with the stack in this role, and your JWT work covers the security requirement.
        </p>
      </div>
    </div>
  )
}

export default function Landing() {
  useDocumentTitle('')
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [q, setQ] = useState('')
  const [loc, setLoc] = useState('')
  const jobs = useAsync(({ signal }) => listPublicJobs({ signal }), [])

  const latest = [...(jobs.data || [])].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 3)

  function search(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (loc.trim()) params.set('loc', loc.trim())
    navigate(`/jobs${params.size ? `?${params}` : ''}`)
  }

  return (
    <>
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:py-20">
          <div>
            <h1 className="text-4xl leading-[1.05] font-bold sm:text-5xl lg:text-[3.4rem]">
              Upload your resume. See which open roles fit, and why.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              Search openings by title and location, or let the AI matcher rank every open role against your resume and explain each score.
            </p>

            <form onSubmit={search} className="mt-8 flex max-w-xl flex-col gap-2 rounded-2xl bg-canvas p-2 ring-1 ring-line sm:flex-row" role="search">
              <div className="flex-1"><Input icon={Search} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Job title" aria-label="Job title" className="h-11 ring-0" /></div>
              <div className="flex-1"><Input icon={MapPin} value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="Location" aria-label="Location" className="h-11 ring-0" /></div>
              <Button type="submit" size="lg" className="h-11 rounded-xl">Search jobs</Button>
            </form>

            <Link to="/matcher" className="mt-5 inline-flex items-center gap-2 font-medium text-brand hover:underline">
              <Sparkles className="size-4" aria-hidden /> Or match your resume with AI <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          <div className="lg:pl-4"><ExampleMatch /></div>
        </div>
      </section>

      {jobs.data && latest.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Latest openings</h2>
              <p className="mt-1 text-muted">{jobs.data.length} open {jobs.data.length === 1 ? 'role' : 'roles'} right now.</p>
            </div>
            <Button as={Link} to="/jobs" variant="secondary">{isAuthenticated ? 'Browse all jobs' : 'Sign in to browse all'}</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {latest.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-7 ring-1 ring-line">
            <h2 className="text-2xl font-bold">For candidates</h2>
            <ol className="mt-6 space-y-5">
              {[
                { icon: FileUp, title: 'Upload your resume', text: 'Drop in a PDF. No account needed to try the matcher.' },
                { icon: Sparkles, title: 'Review ranked matches', text: 'Each role gets a match percentage and a plain-language reason.' },
                { icon: Send, title: 'Apply and follow along', text: 'Track every application from Pending to Shortlisted, Interview and Selected.' },
              ].map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="flex gap-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft font-display font-bold text-brand">{i + 1}</span>
                  <div><h3 className="flex items-center gap-2 text-base font-semibold"><Icon className="size-4 text-muted" aria-hidden />{title}</h3><p className="mt-0.5 text-muted">{text}</p></div>
                </li>
              ))}
            </ol>
            <Button as={Link} to={isAuthenticated ? '/matcher' : '/register'} className="mt-7">{isAuthenticated ? 'Open the matcher' : 'Create a candidate account'}</Button>
          </div>

          <div className="rounded-3xl bg-ink p-7 text-white">
            <h2 className="text-2xl font-bold">For recruiters</h2>
            <ul className="mt-6 space-y-5">
              {[
                { icon: Briefcase, title: 'Post a role in one form', text: 'Title, company, location, salary and a description. Edit it whenever you need.' },
                { icon: Download, title: 'Review every applicant', text: 'See who applied to which job and download their resumes.' },
                { icon: Mail, title: 'Move candidates forward', text: 'Change an application status and the candidate gets an email.' },
              ].map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10"><Icon className="size-4" aria-hidden /></span>
                  <div><h3 className="text-base font-semibold">{title}</h3><p className="mt-0.5 text-white/70">{text}</p></div>
                </li>
              ))}
            </ul>
            <Button as={Link} to="/login" variant="secondary" icon={Users} className="mt-7">Recruiter sign in</Button>
          </div>
        </div>
      </section>
    </>
  )
}
