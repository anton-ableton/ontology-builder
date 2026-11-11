import { useState } from 'react'
import { useSuggestions } from './useSuggestions'
export default function Assistant({
  sample,
  fields,
  provider,
  model,
  onAccept
}) {
  const [mode, setMode] = useState(provider)
  const names = {
    gigachat: 'GigaChat',
    openrouter: 'OpenRouter',
    ollama: 'Ollama'
  }
  const { source, response, error, busy, readFile, extract, accept, edit } =
    useSuggestions(sample, onAccept)
  return (
    <details className="panel">
      <summary>Предложить факты из текста</summary>
      <label>
        Модель для извлечения
        <select
          aria-label="Модель для извлечения"
          value={mode}
          disabled={busy}
          onChange={(e) => {
            setMode(e.target.value)
            edit(source)
          }}
        >
          {Object.entries(names).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
              {id === provider ? ' · ' + model : ''}
            </option>
          ))}
          <option value="compare">Сравнить GigaChat и OpenRouter</option>
        </select>
      </label>
      <p>
        {mode === 'ollama'
          ? 'Текст обрабатывается на этом компьютере.'
          : 'Выбранный фрагмент будет отправлен в ' +
            (mode === 'compare' ? 'GigaChat и OpenRouter' : names[mode]) +
            '.'}
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
          onChange={(e) => edit(e.target.value)}
        />
      </label>
      <button
        onClick={() => extract(mode)}
        disabled={busy || !source.trim() || source.length > 4000}
      >
        {busy
          ? 'Извлекаем факты…'
          : mode === 'compare'
            ? 'Сравнить ответы'
            : 'Предложить факты'}
      </button>
      {error && <p role="alert">{error}</p>}
      {response && (
        <div aria-live="polite">
          {response.map((result) => (
            <section key={result.provider}>
              <h3>
                {names[result.provider]}
                {result.model && ' · ' + result.model}
              </h3>
              {result.error ? (
                <p role="alert">{result.error}</p>
              ) : (
                <>
                  {result.warnings.map((warning, i) => (
                    <p key={i}>{warning}</p>
                  ))}
                  {!result.items.length && (
                    <p>Нет предложений для подтверждения.</p>
                  )}
                  {result.items.map((x) => (
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
                </>
              )}
            </section>
          ))}
        </div>
      )}
    </details>
  )
}
