import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function NotFound() {
  useDocumentTitle('Page not found')
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="font-display text-6xl font-bold text-brand">404</p>
      <h1 className="mt-4 text-2xl font-bold">This page doesn't exist</h1>
      <p className="mt-2 text-muted">The link may be broken, or the page may have been moved.</p>
      <Button as={Link} to="/" className="mt-6">Back to home</Button>
    </div>
  )
}
