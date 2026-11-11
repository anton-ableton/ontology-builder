import { useEffect, useState } from 'react'
import { postJson, requestJson } from '../../services/http'
import { saveBlob } from '../../services/download'

export function useDepartment() {
  const [original, setOriginal] = useState(null)
  const [view, setView] = useState(null)
  const [edits, setEdits] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    requestJson('/api/department', { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return
        setOriginal(data)
        setView(data)
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message)
      })
    return () => controller.abort()
  }, [])
  async function apply(id, update) {
    const next = { ...edits }
    if (
      Object.keys(update.positions).length ||
      Object.keys(update.values).length
    )
      next[id] = update
    else delete next[id]
    setBusy(true)
    setError('')
    try {
      setView(await postJson('/api/department/scenario', { edits: next }))
      setEdits(next)
      return true
    } catch (e) {
      setError(e.message)
      return false
    } finally {
      setBusy(false)
    }
  }
  function reset() {
    setView(original)
    setEdits({})
    setError('')
  }
  async function download() {
    try {
      const { ttl } = await postJson('/api/department/scenario', {
        edits,
        export: true
      })
      saveBlob(
        new Blob([ttl], { type: 'text/turtle' }),
        Object.keys(edits).length ? 'koi-scenario.ttl' : 'koi.ttl'
      )
    } catch (e) {
      setError(e.message)
    }
  }
  return {
    view,
    original,
    edited: Boolean(Object.keys(edits).length),
    error,
    busy,
    apply,
    reset,
    download
  }
}
