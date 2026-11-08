import { useState } from 'react'
import { exportGraph } from '../../services/cases'
import { saveBlob } from '../../services/download'
const labels = {
  pass: 'Выполнено',
  fail: 'Нарушено',
  unknown: 'Недостаточно данных'
}

export default function CheckResults({ result, error, sample, facts }) {
  const [exportError, setExportError] = useState('')
  async function download() {
    try {
      setExportError('')
      const { ttl } = await exportGraph(sample.module, facts, sample.id)
      saveBlob(
        new Blob([ttl], { type: 'text/turtle' }),
        'department-' + sample.id + '.ttl'
      )
    } catch (e) {
      setExportError(e.message)
    }
  }
  return (
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
      {result && <button onClick={download}>Скачать граф RDF/OWL</button>}
      {exportError && <p role="alert">{exportError}</p>}
    </section>
  )
}
