import { useState } from 'react'
import { uploadFiles, exportOwl } from '../../services/pdf'
import { saveBlob } from '../../services/download'
export function usePdfCandidates() {
  const [files, setFiles] = useState([]),
    [busy, setBusy] = useState(false),
    [result, setResult] = useState(null),
    [info, setInfo] = useState('')
  async function run() {
    setBusy(true)
    setResult(null)
    setInfo('Читаем документы…')
    try {
      const data = await uploadFiles(files, (m) => {
        if (m.stage === 'chunk')
          setInfo(m.file + ' · фрагмент ' + m.current + ' из ' + m.total)
      })
      setResult(data)
      setInfo(
        'Классов: ' +
          data.classes.length +
          ' · отношений: ' +
          data.objectProperties.length
      )
    } catch (e) {
      setInfo(e.message)
    } finally {
      setBusy(false)
    }
  }
  async function download() {
    try {
      saveBlob(await exportOwl(result), 'candidates.owl')
    } catch (e) {
      setInfo(e.message)
    }
  }
  function select(files) {
    setFiles(files)
    setResult(null)
    setInfo('')
  }
  return { files, result, busy, info, run, download, select }
}
