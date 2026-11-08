import { usePdfCandidates } from './usePdfCandidates'
export default function PdfPanel({ provider }) {
  const { files, result, busy, info, run, download, select } =
    usePdfCandidates()
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
        onChange={(e) => select([...e.target.files])}
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
