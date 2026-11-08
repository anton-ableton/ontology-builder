import { useState } from 'react'
import { api } from '../services/api'
export default function Assistant({
  sample,
  fields,
  provider,
  model,
  onAccept
}) {
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
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/case/read-pdf', {
          method: 'POST',
          body: form
        }),
        data = await res.json()
      if (!res.ok) throw Error(data.error)
      setSource(data.text)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  async function extract() {
    setBusy(true)
    setError('')
    setResponse(null)
    try {
      setResponse(await api('propose', { module: sample.module, source }))
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  function accept(x) {
    onAccept(x.key, x.value, x.quote)
    setResponse({ ...response, items: response.items.filter((i) => i !== x) })
  }
  return (
    <details className="panel">
      <summary>Предложить факты из текста</summary>
      <p>
        {provider === 'openrouter'
          ? 'Выбранный текст будет отправлен в OpenRouter.'
          : 'Текст обрабатывается локально в Ollama.'}{' '}
        Модель: <b>{model}</b>. Сверьте каждое предложение с цитатой.
      </p>
      <label>
        Взять текст из PDF (первые четыре страницы)
        <input
          type="file"
          accept=".pdf"
          disabled={busy}
          onChange={(e) => readFile(e.target.files[0])}
        />
      </label>
      {source.length > 4000 && (
        <p>Оставьте фрагмент об одном процессе: до 4000 символов.</p>
      )}
      <label>
        Фрагмент источника
        <textarea
          rows="4"
          value={source}
          maxLength={4000}
          disabled={busy}
          onChange={(e) => {
            setSource(e.target.value)
            setResponse(null)
            setError('')
          }}
        />
      </label>
      <button
        onClick={extract}
        disabled={busy || !source.trim() || source.length > 4000}
      >
        {busy ? 'Извлекаем факты…' : 'Предложить факты'}
      </button>
      {error && <p role="alert">{error}</p>}
      {response && (
        <div aria-live="polite">
          {response.warnings.map((s, i) => (
            <p key={i}>{s}</p>
          ))}
          {!response.items.length && <p>Нет предложений для подтверждения.</p>}
          {response.items.map((x) => (
            <article key={x.key} className="row">
              <div>
                <b>
                  {fields[x.key].label}: {x.value}
                </b>
                <blockquote>{x.quote}</blockquote>
              </div>
              <button onClick={() => accept(x)}>Применить</button>
            </article>
          ))}
        </div>
      )}
    </details>
  )
}
