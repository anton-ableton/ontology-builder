import { useEffect, useState } from 'react'
import { api, saveBlob } from '../services/api'
import CaseLibrary from './CaseLibrary'
import GraphView from './GraphView'
import Assistant from './Assistant'
import PdfPanel from './PdfPanel'
import './department.css'
const labels = {
  pass: 'Выполнено',
  fail: 'Нарушено',
  unknown: 'Недостаточно данных'
}
function restore(sample) {
  try {
    const data = JSON.parse(
      localStorage.getItem('department-case-v1:' + sample.id)
    )
    if (data?.facts && data?.quotes) return data
  } catch {
    /* Local storage may be unavailable or contain an old record. */
  }
  return { facts: sample.facts, quotes: sample.quotes || {} }
}
function Workspace({ sample, catalog }) {
  const mod = catalog.profile.modules[sample.module],
    [entry, setEntry] = useState(() => restore(sample)),
    [result, setResult] = useState(null),
    [error, setError] = useState('')
  const { facts, quotes } = entry
  useEffect(() => {
    try {
      localStorage.setItem(
        'department-case-v1:' + sample.id,
        JSON.stringify(entry)
      )
    } catch {
      /* private browser mode */
    }
  }, [sample.id, entry])
  useEffect(() => {
    let active = true
    const timer = setTimeout(
      () =>
        api('check', { module: sample.module, facts, caseId: sample.id })
          .then((data) => {
            if (active) {
              setResult(data)
              setError('')
            }
          })
          .catch((e) => {
            if (active) {
              setResult(null)
              setError(e.message)
            }
          }),
      140
    )
    return () => {
      clearTimeout(timer)
      active = false
    }
  }, [sample.id, sample.module, facts])
  function change(key, value, quote) {
    setResult(null)
    setEntry((prev) => {
      const facts = { ...prev.facts },
        quotes = { ...prev.quotes }
      if (value) facts[key] = value
      else delete facts[key]
      if (quote) quotes[key] = quote
      else delete quotes[key]
      return { facts, quotes }
    })
  }
  return (
    <>
      <div className="columns">
        <section className="panel">
          <span className="eyebrow">01 / Факты</span>
          <h2>{sample.title}</h2>
          <p>Пустое поле означает, что сведений нет.</p>
          <div className="fields">
            {Object.entries(mod.fields).map(([k, f]) => (
              <label key={k}>
                {f.label}
                <input
                  type={f.type === 'date' ? 'date' : 'text'}
                  maxLength={250}
                  value={facts[k] || ''}
                  placeholder={
                    f.negative ? 'Значение или «' + f.negative + '»' : 'Нет сведений'
                  }
                  onChange={(e) => change(k, e.target.value)}
                />
              </label>
            ))}
          </div>
          <button
            onClick={() => {
              setEntry({
                facts: { ...sample.facts },
                quotes: sample.quotes || {}
              })
              setResult(null)
            }}
          >
            Вернуть исходные факты
          </button>
          {result && (
            <button
              onClick={() =>
                saveBlob(
                  new Blob(
                    [
                      JSON.stringify(
                        {
                          format: 'department-case/1',
                          module: sample.module,
                          title: sample.title,
                          facts,
                          quotes
                        },
                        null,
                        2
                      )
                    ],
                    { type: 'application/json' }
                  ),
                  'case-' + sample.id + '.json'
                )
              }
            >
              Сохранить карточку JSON
            </button>
          )}
        </section>
        <section className="panel" aria-live="polite">
          <span className="eyebrow">02 / Проверка</span>
          <h2>Требования к процессу</h2>
          <p>Учебные правила демонстрационного регламента.</p>
          {error && <p role="alert">{error}</p>}
          {!result && !error && <p>Проверяем факты…</p>}
          {result?.checks.map((c) => (
            <article className={'check ' + c.status} key={c.id}>
              <small>
                {c.id} · {labels[c.status]}
              </small>
              <h3>{c.title}</h3>
              <p>{c.reason}</p>
            </article>
          ))}
          {result && (
            <button
              onClick={() =>
                saveBlob(
                  new Blob([result.ttl], { type: 'text/turtle' }),
                  'department-' + sample.id + '.ttl'
                )
              }
            >
              Скачать граф RDF/OWL
            </button>
          )}
        </section>
      </div>
      {result && (
        <GraphView
          mod={mod}
          graph={result.graph}
          classes={catalog.profile.classes}
          quotes={quotes}
        />
      )}
      <Assistant
        sample={sample}
        fields={mod.fields}
        provider={catalog.provider}
        model={catalog.model}
        onAccept={change}
      />
      <PdfPanel provider={catalog.provider} />
    </>
  )
}
export default function MainPage() {
  const [catalog, setCatalog] = useState(null),
    [records, setRecords] = useState(() => {
      try {
        return JSON.parse(localStorage.getItem('department-library-v1')) || []
      } catch {
        return []
      }
    }),
    [id, setId] = useState('practice'),
    [error, setError] = useState('')
  useEffect(() => {
    api('catalog')
      .then(setCatalog)
      .catch((e) => setError(e.message))
  }, [])
  function addRecord(record) {
    const next = [...records, record]
    try {
      localStorage.setItem('department-library-v1', JSON.stringify(next))
    } catch {
      setError('Хранилище браузера недоступно. Сохраните карточку в JSON.')
    }
    setRecords(next)
    setId(record.id)
  }
  const sample =
    catalog && [...catalog.cases, ...records].find((c) => c.id === id)
  return (
    <main>
      <header>
        <span className="eyebrow">Онтологическая модель кафедры</span>
        <h1>Учебный процесс кафедры</h1>
        <p>
          Проверьте требования к процессу и проследите, какие факты объясняют
          каждый вывод.
        </p>
      </header>
      {error && <p role="alert">{error}</p>}
      {!catalog && !error && <p>Загрузка модели…</p>}
      {sample && (
        <>
          <nav aria-label="Примеры процессов">
            {catalog.cases.map((c) => (
              <button
                aria-pressed={id === c.id}
                key={c.id}
                onClick={() => setId(c.id)}
              >
                {catalog.profile.modules[c.module].label}
              </button>
            ))}
          </nav>
          <CaseLibrary
            catalog={catalog}
            records={records}
            selected={id}
            onSelect={setId}
            onAdd={addRecord}
          />
          <Workspace key={id} sample={sample} catalog={catalog} />
        </>
      )}
    </main>
  )
}
