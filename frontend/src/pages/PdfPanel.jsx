import { useState } from 'react'
import { uploadFiles, saveBlob } from '../services/api'
export default function PdfPanel({ provider }) {
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
      const r = await fetch('/api/export/owl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      })
      if (!r.ok) throw Error('Не удалось экспортировать файл')
      saveBlob(await r.blob(), 'candidates.owl')
    } catch (e) {
      setInfo(e.message)
    }
  }
  return (
    <details className="panel">
      <summary>Исследовать понятия из PDF</summary>
      <p>
        Получите черновик классов и отношений из текста. Эти предложения не
        меняют проверенную модель. До 4 файлов, каждый до 8 МБ.
      </p>
      {provider === 'openrouter' && (
        <p>Текст выбранных файлов будет отправлен в OpenRouter.</p>
      )}
      <input
        type="file"
        aria-label="Выбрать PDF"
        accept=".pdf"
        multiple
        disabled={busy}
        onChange={(e) => {
          setFiles([...e.target.files])
          setResult(null)
        }}
      />
      <button
        disabled={busy || !files.length || files.length > 4}
        onClick={run}
      >
        Извлечь понятия
      </button>
      <p role="status">{info}</p>
      {result && <button onClick={download}>Скачать OWL</button>}
    </details>
  )
}
