import { Component } from 'react'

export class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="grid min-h-dvh place-items-center bg-canvas p-6 text-center">
        <div className="max-w-md">
          <h1 className="text-2xl font-bold">Something broke on this page</h1>
          <p className="mt-2 text-muted">Reload to try again. If it keeps happening, check the browser console for details.</p>
          <button onClick={() => window.location.reload()} className="mt-5 h-10 rounded-[10px] bg-brand px-4 text-sm font-medium text-white">Reload</button>
        </div>
      </div>
    )
  }
}
