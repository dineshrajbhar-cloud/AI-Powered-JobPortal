import { Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppShell } from './components/layout/AppShell'
import { AdaptiveLayout } from './components/layout/AdaptiveLayout'
import { PublicLayout } from './components/layout/PublicLayout'
import { ScrollToTop } from './components/ScrollToTop'
import { GuestOnly, RequireAuth } from './routes/guards'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import ResumeMatcher from './pages/ResumeMatcher'
import Jobs from './pages/Jobs'
import JobDetails from './pages/JobDetails'
import NotFound from './pages/NotFound'
import CandidateDashboard from './pages/candidate/CandidateDashboard'
import MyApplications from './pages/candidate/MyApplications'
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard'
import ManageJobs from './pages/recruiter/ManageJobs'
import Applicants from './pages/recruiter/Applicants'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route element={<GuestOnly />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
        </Route>

        {/* Works signed in or out: the matcher endpoint is public */}
        <Route element={<AdaptiveLayout />}>
          <Route path="/matcher" element={<ResumeMatcher />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetails />} />

            <Route element={<RequireAuth roles={['CANDIDATE']} />}>
              <Route path="/candidate" element={<CandidateDashboard />} />
              <Route path="/candidate/applications" element={<MyApplications />} />
            </Route>

            <Route element={<RequireAuth roles={['RECRUITER']} />}>
              <Route path="/recruiter" element={<RecruiterDashboard />} />
              <Route path="/recruiter/jobs" element={<ManageJobs />} />
              <Route path="/recruiter/applications" element={<Applicants />} />
            </Route>
          </Route>
        </Route>
      </Routes>

      <Toaster position="top-right" richColors closeButton toastOptions={{ style: { fontFamily: 'var(--font-sans)' } }} />
    </>
  )
}
