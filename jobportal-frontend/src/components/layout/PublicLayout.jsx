import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { APP_NAME, REPO_URL } from '../../config'
import { homeFor, useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/cn'
import { Button } from '../ui/Button'
import { Logo } from './Logo'

const linkClass = ({ isActive }) =>
  cn('rounded-lg px-3 py-2 text-sm font-medium transition-colors', isActive ? 'bg-ink/5 text-ink' : 'text-muted hover:text-ink')

export function PublicLayout({ contained = false }) {
  const { isAuthenticated, role } = useAuth()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
              <NavLink to="/jobs" className={linkClass}>Browse jobs</NavLink>
              <NavLink to="/matcher" className={linkClass}>Resume matcher</NavLink>
            </nav>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {isAuthenticated ? (
              <Button as={Link} to={homeFor(role)}>Go to dashboard</Button>
            ) : (
              <>
                <Button as={Link} to="/login" variant="ghost">Sign in</Button>
                <Button as={Link} to="/register">Create account</Button>
              </>
            )}
          </div>

          <button type="button" className="grid size-10 place-items-center rounded-lg hover:bg-ink/5 md:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Toggle menu">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-line bg-white px-4 pt-2 pb-4 md:hidden">
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              <NavLink to="/jobs" className={linkClass} onClick={close}>Browse jobs</NavLink>
              <NavLink to="/matcher" className={linkClass} onClick={close}>Resume matcher</NavLink>
            </nav>
            <div className="mt-3 flex gap-2">
              {isAuthenticated ? (
                <Button as={Link} to={homeFor(role)} onClick={close} className="flex-1">Go to dashboard</Button>
              ) : (
                <>
                  <Button as={Link} to="/login" variant="secondary" onClick={close} className="flex-1">Sign in</Button>
                  <Button as={Link} to="/register" onClick={close} className="flex-1">Create account</Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className={cn('flex-1', contained && 'mx-auto w-full max-w-4xl px-4 py-10 sm:px-6')}><Outlet /></main>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted sm:px-6">
          <p>{APP_NAME}: a job portal built with React and Spring Boot.</p>
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="font-medium text-ink hover:text-brand">View the backend on GitHub</a>
        </div>
      </footer>
    </div>
  )
}
