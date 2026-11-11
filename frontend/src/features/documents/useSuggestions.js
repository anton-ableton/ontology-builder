import { useState } from 'react'
import { readPdf } from '../../services/pdf'
import { proposeFacts } from '../../services/cases'
export function useSuggestions(sample, onAccept) {
  const [source, setSource] = useState(sample.source),
    [response, setResponse] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  async function readFile(file) {
    if (!file) return
    setBusy(true)
    setError('')
    setResponse(null)
    try {
      const data = await readPdf(file)
      setSource(data.text)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  async function extract(mode) {
    setBusy(true)
    setError('')
    setResponse(null)
    try {
      const providers = mode === 'compare' ? ['gigachat', 'openrouter'] : [mode]
      const results = await Promise.all(
        providers.map(async (provider) => {
          try {
            return await proposeFacts(
              sample.module,
              source,
              undefined,
              provider
            )
          } catch (e) {
            return { provider, error: e.message }
          }
        })
      )
      setResponse(results)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  function accept(x) {
    onAccept(x.key, x.value, x.quote)
    setResponse(
      response.map((result) =>
        result.error
          ? result
          : {
            ...result,
            items: result.items.filter((item) => item.key !== x.key)
          }
      )
    )
  }
  function edit(text) {
    setSource(text)
    setResponse(null)
    setError('')
  }
  return { source, response, error, busy, readFile, extract, accept, edit }
}
