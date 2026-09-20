import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Field, Input } from '../components/ui/Field'
import { DEMO_RECRUITER, SHOW_DEMO_LOGIN } from '../config'
import { homeFor, useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function Login() {
  useDocumentTitle('Sign in')
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)

  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    const found = {}
    if (!/^\S+@\S+\.\S+$/.test(values.email)) found.email = 'Enter a valid email address.'
    if (!values.password) found.password = 'Enter your password.'
    setErrors(found)
    if (Object.keys(found).length) return

    setBusy(true)
    setFormError(null)
    try {
      const session = await signIn({ email: values.email.trim(), password: values.password })
      const target = from ? from.pathname + (from.search || '') : homeFor(session.role)
      navigate(target, { replace: true })
    } catch (error) {
      setFormError(error.message)
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-3xl font-bold">Sign in</h1>
      <p className="mt-2 text-muted">Pick up where you left off.</p>

      <form onSubmit={submit} noValidate className="mt-8 space-y-4 rounded-2xl bg-white p-6 ring-1 ring-line">
        <Field label="Email" error={errors.email}>
          {(id) => <Input id={id} type="email" autoComplete="email" icon={Mail} value={values.email} onChange={set('email')} placeholder="you@example.com" invalid={!!errors.email} autoFocus />}
        </Field>

        <Field label="Password" error={errors.password}>
          {(id) => (
            <div className="relative">
              <Input id={id} type={showPassword ? 'text' : 'password'} autoComplete="current-password" icon={Lock} value={values.password} onChange={set('password')} invalid={!!errors.password} className="pr-10" />
              <button type="button" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-faint hover:text-ink">
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          )}
        </Field>

        {formError && <p className="rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700" role="alert">{formError}</p>}

        <Button type="submit" size="lg" loading={busy} className="w-full">Sign in</Button>
      </form>

      {SHOW_DEMO_LOGIN && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-line bg-white/60 p-3.5 text-sm">
          <ShieldCheck className="size-5 shrink-0 text-brand" aria-hidden />
          <p className="flex-1 text-muted">Reviewing this project? Try the seeded recruiter account.</p>
          <Button variant="subtle" size="sm" onClick={() => { setValues(DEMO_RECRUITER); setErrors({}) }}>Fill demo login</Button>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        New here? <Link to="/register" state={{ from }} className="font-medium text-brand hover:underline">Create a candidate account</Link>
      </p>
    </div>
  )
}
