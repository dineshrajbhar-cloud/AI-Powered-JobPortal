import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ClipboardList, LayoutDashboard, LogOut, Menu, Search, Sparkles, Users, Briefcase, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/cn'
import { Avatar } from '../ui/Avatar'
import { Logo, LogoMark } from './Logo'

const NAV = {
  CANDIDATE: [
    { to: '/candidate', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/jobs', label: 'Find jobs', icon: Search },
    { to: '/matcher', label: 'Resume matcher', icon: Sparkles },
    { to: '/candidate/applications', label: 'My applications', icon: ClipboardList },
  ],
  RECRUITER: [
    { to: '/recruiter', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/recruiter/jobs', label: 'Jobs', icon: Briefcase },
    { to: '/recruiter/applications', label: 'Applications', icon: Users },
  ],
}

function SidebarContent({ onNavigate }) {
  const { user, role, signOut } = useAuth()
  const navigate = useNavigate()
  const items = NAV[role] || []

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-5 pb-6"><Logo to={role === 'RECRUITER' ? '/recruiter' : '/candidate'} /></div>

      <nav className="flex-1 space-y-1 px-3" aria-label="Sidebar">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-brand-soft text-brand' : 'text-muted hover:bg-ink/5 hover:text-ink',
              )
            }
          >
            <Icon className="size-[18px]" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-3 rounded-xl p-2">
          <Avatar name={user?.name} round size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="truncate text-xs text-muted">{role === 'RECRUITER' ? 'Recruiter' : 'Candidate'}</p>
          </div>
          <button
            type="button"
            onClick={() => { signOut(); navigate('/', { replace: true }) }}
            className="grid size-9 place-items-center rounded-lg text-muted hover:bg-ink/5 hover:text-ink"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="size-[18px]" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const drawerRef = useRef(null)
  const { pathname } = useLocation()

  useEffect(() => {
    const dialog = drawerRef.current
    if (!dialog) return
    if (drawerOpen && !dialog.open) dialog.showModal()
    if (!drawerOpen && dialog.open) dialog.close()
  }, [drawerOpen])

  useEffect(() => setDrawerOpen(false), [pathname])

  return (
    <div className="min-h-dvh lg:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-white lg:block">
        <SidebarContent />
      </aside>

      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2.5">
          <LogoMark className="size-7" />
          <span className="font-display text-lg font-bold">JobPortal</span>
        </div>
        <button type="button" onClick={() => setDrawerOpen(true)} className="grid size-10 place-items-center rounded-lg hover:bg-ink/5" aria-label="Open menu">
          <Menu className="size-5" />
        </button>
      </header>

      <dialog
        ref={drawerRef}
        onClose={() => setDrawerOpen(false)}
        onClick={(e) => e.target === drawerRef.current && setDrawerOpen(false)}
        className="drawer m-0 h-dvh max-h-none w-72 max-w-[85vw] bg-white p-0 text-ink shadow-2xl"
      >
        <div className="relative h-full">
          <button type="button" onClick={() => setDrawerOpen(false)} className="absolute top-4 right-3 z-10 grid size-9 place-items-center rounded-lg text-muted hover:bg-ink/5" aria-label="Close menu">
            <X className="size-5" />
          </button>
          {drawerOpen && <SidebarContent onNavigate={() => setDrawerOpen(false)} />}
        </div>
      </dialog>

      <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
        <Outlet />
      </main>
    </div>
  )
}
