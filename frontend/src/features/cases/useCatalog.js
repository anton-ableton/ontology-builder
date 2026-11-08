import { useEffect, useState } from 'react'
import { loadCatalog } from '../../services/cases'
export function useCatalog() {
  const [state, setState] = useState({})
  useEffect(() => {
    const controller = new AbortController()
    loadCatalog(controller.signal)
      .then((catalog) => {
        if (!controller.signal.aborted) setState({ catalog })
      })
      .catch((e) => {
        if (!controller.signal.aborted) setState({ error: e.message })
      })
    return () => controller.abort()
  }, [])
  return state
}
