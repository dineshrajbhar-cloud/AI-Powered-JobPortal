import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Field, Input } from '../components/ui/Field'
import { homeFor, useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function Register() {
  useDocumentTitle('Create account')
  const { register } = useAuth()
  const navigate = useNavigate()
  const from = useLocation().state?.from
  const [values, setValues] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)

  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    const found = {}
    if (!values.name.trim()) found.name = 'Enter your name.'
    if (!/^\S+@\S+\.\S+$/.test(values.email)) found.email = 'Enter a valid email address.'
    if (values.password.length < 6) found.password = 'Use at least 6 characters.'
    setErrors(found)
    if (Object.keys(found).length) return

    setBusy(true)
    setFormError(null)
    try {
      const session = await register({ name: values.name.trim(), email: values.email.trim(), password: values.password })
      toast.success(`Welcome, ${session.name}`)
      navigate(from ? from.pathname + (from.search || '') : homeFor(session.role), { replace: true })
    } catch (error) {
      if (error.fieldErrors) setErrors(error.fieldErrors)
      setFormError(error.status === 409 ? 'An account with this email already exists. Try signing in.' : error.message)
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-3xl font-bold">Create your account</h1>
      <p className="mt-2 text-muted">Apply to jobs, upload your resume and follow every application.</p>

      <form onSubmit={submit} noValidate className="mt-8 space-y-4 rounded-2xl bg-white p-6 ring-1 ring-line">
        <Field label="Full name" error={errors.name}>
          {(id) => <Input id={id} autoComplete="name" icon={User} value={values.name} onChange={set('name')} invalid={!!errors.name} autoFocus />}
        </Field>
        <Field label="Email" error={errors.email}>
          {(id) => <Input id={id} type="email" autoComplete="email" icon={Mail} value={values.email} onChange={set('email')} placeholder="you@example.com" invalid={!!errors.email} />}
        </Field>
        <Field label="Password" error={errors.password} hint="At least 6 characters.">
          {(id) => (
            <div className="relative">
              <Input id={id} type={showPassword ? 'text' : 'password'} autoComplete="new-password" icon={Lock} value={values.password} onChange={set('password')} invalid={!!errors.password} className="pr-10" />
              <button type="button" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-faint hover:text-ink">
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          )}
        </Field>

        {formError && <p className="rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700" role="alert">{formError}</p>}

        <Button type="submit" size="lg" loading={busy} className="w-full">Create account</Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted">Registration creates a candidate account. Recruiter accounts are set up by an existing recruiter.</p>
      <p className="mt-4 text-center text-sm text-muted">
        Already registered? <Link to="/login" state={{ from }} className="font-medium text-brand hover:underline">Sign in</Link>
      </p>
    </div>
  )
}
