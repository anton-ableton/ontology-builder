import { useRef, useState } from 'react'
import { loadRecords, saveRecords } from './storage'
export function useCaseLibrary() {
  const [records, setRecords] = useState(loadRecords)
  const [selected, select] = useState('practice')
  const [storageError, setError] = useState('')
  // File imports may finish in a different order from the user's selections.
  const latest = useRef(records)
  function add(record) {
    const item = { ...record, id: crypto.randomUUID() }
    const next = [...latest.current, item]
    latest.current = next
    setRecords(next)
    setError(
      saveRecords(next)
        ? ''
        : 'Хранилище браузера недоступно. Сохраните карточку в JSON.'
    )
    select(item.id)
  }
  return { records, selected, select, add, storageError }
}
