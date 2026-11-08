import { useEffect, useState } from 'react'
import { checkFacts } from '../../services/cases'
// Match each response to the exact input snapshot. Old verdicts must never appear under newly edited facts.
export function useFactCheck(sample, facts) {
  const [response, setResponse] = useState(null)
  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const result = await checkFacts(
          sample.module,
          facts,
          sample.id,
          controller.signal
        )
        if (!controller.signal.aborted) setResponse({ facts, result })
      } catch (e) {
        if (!controller.signal.aborted) setResponse({ facts, error: e.message })
      }
    }, 140)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [sample.module, sample.id, facts])
  return response?.facts === facts ? response : {}
}
