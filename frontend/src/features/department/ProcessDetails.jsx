import { useState } from 'react'
import ScenarioForm from './ScenarioForm'
const labels = {
  pass: 'Выполнено',
  fail: 'Нарушено',
  unknown: 'Недостаточно данных'
}

export default function ProcessDetails({
  process,
  original,
  model,
  fields,
  busy,
  onApply,
  onTeacher
}) {
  const [editing, setEditing] = useState(false)
  return (
    <article className="panel process-detail" aria-label="Сведения о процессе">
      <small>
        {process.period} · {process.source.label}
      </small>
      <h2>{process.title}</h2>
      <a href={process.source.url} target="_blank" rel="noreferrer">
        Открыть документ · {process.source.location} ↗
      </a>
      <h3>Участники и роли</h3>
      <dl className="role-list">
        {process.links.map((l) => (
          <div key={l.role}>
            <dt>
              {model.roles[l.role]}
              <small>{model.organizations[l.organization]}</small>
            </dt>
            <dd>
              {model.people[l.person] ? (
                <button
                  className="person-link"
                  onClick={() => onTeacher(l.person)}
                >
                  {model.people[l.person]}
                </button>
              ) : l.person === 'absent' ? (
                'Явно указано отсутствие'
              ) : (
                'Нет сведений'
              )}
              {l.edited && <small>Учебный сценарий</small>}
            </dd>
          </div>
        ))}
      </dl>
      <dl className="process-facts">
        {Object.entries(process.facts)
          .filter(([k]) => k !== 'discipline')
          .map(([key, value]) => (
            <div key={key}>
              <dt>{fields[key].label}</dt>
              <dd>
                {value}
                {process.editedFields.includes(key) && ' · сценарий'}
              </dd>
            </div>
          ))}
      </dl>
      <h3>Проверка требований</h3>
      <div aria-live="polite">
        {process.checks.map((c) => (
          <div key={c.id} className={'check ' + c.status}>
            <small>
              {c.id} · {labels[c.status]}
            </small>
            <strong>{c.title}</strong>
            <p>{c.reason}</p>
          </div>
        ))}
      </div>
      {editing ? (
        <ScenarioForm
          process={process}
          original={original}
          model={model}
          fields={fields}
          busy={busy}
          onApply={onApply}
          onClose={() => setEditing(false)}
        />
      ) : (
        <button onClick={() => setEditing(true)}>
          Изменить условия проверки
        </button>
      )}
    </article>
  )
}
