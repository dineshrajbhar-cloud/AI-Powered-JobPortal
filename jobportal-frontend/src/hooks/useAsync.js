import { useCallback, useEffect, useRef, useState } from 'react'
import { isCancelled } from '../lib/api'

/**
 * Runs `fn({ signal })` on mount and whenever `deps` change. Previous data is kept
 * while reloading so lists don't flash empty. Call `reload()` to refetch.
 */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const [nonce, setNonce] = useState(0)
  const fnRef = useRef(fn)
  fnRef.current = fn

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    setState((s) => ({ ...s, loading: true, error: null }))

    fnRef
      .current({ signal: controller.signal })
      .then((data) => active && setState({ data, error: null, loading: false }))
      .catch((error) => {
        if (!active || isCancelled(error)) return
        setState((s) => ({ ...s, error, loading: false }))
      })

    return () => {
      active = false
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])

  const reload = useCallback(() => setNonce((n) => n + 1), [])
  const setData = useCallback(
    (updater) => setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater })),
    [],
  )

  return { ...state, reload, setData }
}
