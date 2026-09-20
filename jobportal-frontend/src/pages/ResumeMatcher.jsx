import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Banknote, FileText, MapPin, RefreshCw, Sparkles } from 'lucide-react'
import { MatchRing, matchTone } from '../components/ai/MatchRing'
import { Button } from '../components/ui/Button'
import { EmptyState, PageHeader } from '../components/ui/Feedback'
import { FileDropzone } from '../components/ui/FileDropzone'
import { MATCHER_EXTENSIONS, MAX_RESUME_MB } from '../config'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { cn } from '../lib/cn'
import { formatSalaryCompact, timeAgo } from '../lib/format'
import { isCancelled } from '../lib/api'
import { matchJobs } from '../services/aiService'

const STORAGE_KEY = 'jobportal.matcher'
const STAGES = [
  'Reading your resume',
  'Comparing it with the open roles',
  'Scoring each match',
  'Writing the explanations',
]
const THRESHOLDS = [0, 60, 75, 90]

function loadSaved() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null')
  } catch {
    return null
  }
}

function friendlyError(error) {
  if (/^AI service failed/i.test(error.message)) {
    return {
      title: "The AI service didn't respond",
      body: 'Check that the FastAPI service is running (uvicorn main:app --port 8000) and that its Groq API key is set, then try again.',
      detail: error.message,
    }
  }
  return { title: "We couldn't analyze that resume", body: error.message }
}

function MatchCard({ match, rank, delay }) {
  const tone = matchTone(match.matchPercentage)
  return (
    <li className="rounded-2xl bg-white p-5 ring-1 ring-line sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="flex items-center gap-4 sm:flex-col sm:gap-2">
          <MatchRing value={match.matchPercentage} delay={delay} />
          <p className={cn('text-sm font-medium', tone.text)}>{tone.label}</p>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              {rank === 0 && <p className="mb-1 text-sm font-medium text-brand">Best match for your resume</p>}
              <h3 className="text-xl font-semibold">{match.title}</h3>
              <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                <span>{match.company}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" aria-hidden />{match.location}</span>
                <span className="inline-flex items-center gap-1.5"><Banknote className="size-3.5" aria-hidden />{formatSalaryCompact(match.salary)}</span>
              </p>
            </div>
            <Button as={Link} to={`/jobs/${match.jobId}`} variant="subtle" size="sm">View job <ArrowRight className="size-3.5" aria-hidden /></Button>
          </div>

          <div className="mt-4 rounded-xl bg-canvas p-4">
            <p className="mb-1 text-sm font-semibold">Why it fits</p>
            <p className="max-w-[68ch] leading-relaxed text-muted">{match.reason}</p>
          </div>
        </div>
      </div>
    </li>
  )
}

export default function ResumeMatcher() {
  useDocumentTitle('Resume matcher')
  const { isAuthenticated, isCandidate } = useAuth()
  const saved = useRef(loadSaved()).current

  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState(null)
  const [phase, setPhase] = useState(saved ? 'done' : 'idle') // idle | analyzing | done | error
  const [results, setResults] = useState(saved?.results || [])
  const [meta, setMeta] = useState(saved ? { fileName: saved.fileName, at: saved.at } : null)
  const [error, setError] = useState(null)
  const [stage, setStage] = useState(0)
  const [minMatch, setMinMatch] = useState(0)
  const controller = useRef(null)

  useEffect(() => {
    if (phase !== 'analyzing') return
    setStage(0)
    const id = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 2600)
    return () => clearInterval(id)
  }, [phase])

  useEffect(() => () => controller.current?.abort(), [])

  async function analyze() {
    if (!file) return
    controller.current?.abort()
    controller.current = new AbortController()
    setPhase('analyzing')
    setError(null)
    try {
      const matches = await matchJobs(file, { signal: controller.current.signal })
      const sorted = [...matches].sort((a, b) => b.matchPercentage - a.matchPercentage)
      const info = { fileName: file.name, at: new Date().toISOString() }
      setResults(sorted)
      setMeta(info)
      setMinMatch(0)
      setPhase('done')
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...info, results: sorted }))
      } catch { /* storage full or unavailable */ }
    } catch (e) {
      if (isCancelled(e)) return
      setError(friendlyError(e))
      setPhase('error')
    }
  }

  function reset() {
    try { sessionStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
    setFile(null)
    setFileError(null)
    setResults([])
    setMeta(null)
    setPhase('idle')
  }

  const shown = results.filter((m) => m.matchPercentage >= minMatch)

  return (
    <>
      <PageHeader
        title="Resume matcher"
        description="Upload your resume as a PDF. Every open role is scored against it, with a short explanation for each match."
      />

      {(phase === 'idle' || phase === 'error') && (
        <section className="rounded-2xl bg-white p-6 ring-1 ring-line sm:p-8">
          <FileDropzone file={file} onFile={setFile} extensions={MATCHER_EXTENSIONS} maxMB={MAX_RESUME_MB} error={fileError} onError={setFileError} prompt="Drop your resume PDF here" />

          {phase === 'error' && error && (
            <div className="mt-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-800" role="alert">
              <p className="font-semibold">{error.title}</p>
              <p className="mt-1">{error.body}</p>
              {error.detail && <p className="mt-2 text-xs break-words text-rose-700/80">{error.detail}</p>}
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button size="lg" icon={Sparkles} onClick={analyze} disabled={!file}>{phase === 'error' ? 'Try again' : 'Match my resume'}</Button>
            <p className="text-sm text-muted">Your file is sent to the AI service for analysis. It isn't attached to any application.</p>
          </div>
        </section>
      )}

      {phase === 'analyzing' && (
        <section className="rounded-2xl bg-white p-8 ring-1 ring-line" aria-live="polite" aria-busy="true">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand"><FileText className="size-5" aria-hidden /></span>
            <p className="min-w-0 truncate font-medium">{file?.name}</p>
          </div>
          <div className="relative mt-7 h-2 overflow-hidden rounded-full bg-brand-soft">
            <div className="scan-bar absolute inset-y-0 w-1/3 rounded-full bg-brand" />
          </div>
          <p className="mt-4 font-display text-xl font-semibold">{STAGES[stage]}...</p>
          <p className="mt-1 text-sm text-muted">This usually takes 10 to 30 seconds.</p>
        </section>
      )}

      {phase === 'done' && (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 ring-1 ring-line">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><FileText className="size-5" aria-hidden /></span>
              <div className="min-w-0">
                <p className="truncate font-medium">{meta?.fileName}</p>
                <p className="text-sm text-muted">{results.length} {results.length === 1 ? 'match' : 'matches'} · analyzed {timeAgo(meta?.at)}</p>
              </div>
            </div>
            <Button variant="secondary" icon={RefreshCw} onClick={reset}>Analyze another resume</Button>
          </div>

          {results.length > 0 && (
            <div className="mb-5 flex flex-wrap items-center gap-2" role="group" aria-label="Minimum match">
              <span className="mr-1 text-sm text-muted">Show matches of</span>
              {THRESHOLDS.map((t) => (
                <button key={t} type="button" onClick={() => setMinMatch(t)} aria-pressed={minMatch === t}
                  className={cn('rounded-full px-3 py-1 text-sm font-medium transition-colors', minMatch === t ? 'bg-ink text-white' : 'bg-white text-muted ring-1 ring-line ring-inset hover:text-ink')}>
                  {t === 0 ? 'Any %' : `${t}%+`}
                </button>
              ))}
            </div>
          )}

          {results.length === 0 ? (
            <EmptyState icon={Sparkles} title="No suitable roles found" description="None of the open roles fit this resume well. Check back after new jobs are posted, or try a more detailed resume." action={<Button variant="secondary" onClick={reset}>Try another resume</Button>} />
          ) : shown.length === 0 ? (
            <EmptyState title={`No matches of ${minMatch}% or more`} description="Lower the minimum to see the rest of your matches." action={<Button variant="secondary" onClick={() => setMinMatch(0)}>Show all matches</Button>} />
          ) : (
            <ul className="space-y-4">
              {shown.map((m, i) => <MatchCard key={`${m.jobId}-${i}`} match={m} rank={i} delay={i * 120} />)}
            </ul>
          )}

          {results.length > 0 && !isCandidate && (
            <p className="mt-6 text-center text-sm text-muted">
              {isAuthenticated ? 'Sign in with a candidate account to apply.' : <>To apply, <Link to="/register" className="font-medium text-brand hover:underline">create a free account</Link> or <Link to="/login" className="font-medium text-brand hover:underline">sign in</Link>.</>}
            </p>
          )}
        </>
      )}
    </>
  )
}
