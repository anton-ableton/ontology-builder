import { useRef, useState } from 'react'
import { useDepartment } from './useDepartment'
import TeacherMap from './TeacherMap'
import ProcessDetails from './ProcessDetails'
import './department-map.css'

export default function DepartmentExplorer({ modules }) {
  const { view, original, edited, error, busy, apply, reset, download } =
    useDepartment()
  const details = useRef(null)
  const [teacher, setTeacher] = useState('palchunov')
  const [selected, setSelected] = useState('practice2018')
  if (!view)
    return (
      <p role={error ? 'alert' : 'status'}>
        {error || 'Загрузка связей кафедры…'}
      </p>
    )
  const process = view.processes.find((p) => p.id === selected)
  function chooseTeacher(id) {
    setTeacher(id)
    const related = view.processes.filter((p) =>
      p.links.some((l) => l.person === id)
    )
    if (!related.some((p) => p.id === selected))
      setSelected(related[0]?.id || '')
  }
  function chooseProcess(id) {
    const next = view.processes.find((p) => p.id === id)
    if (!next.links.some((l) => l.person === teacher)) {
      const first = next.links.find((l) => Object.hasOwn(view.people, l.person))
      if (first) setTeacher(first.person)
    }
    setSelected(id)
  }
  return (
    <>
      <div className="map-toolbar">
        <div>
          <h2>Связи преподавателей</h2>
          <p>
            Открытые документы КОИ и ФИТ за 2012–2025 годы. Выберите
            преподавателя и проследите его роль до источника.
          </p>
        </div>
        <button onClick={download}>Скачать общий граф</button>
      </div>
      {edited && (
        <aside className="scenario-note">
          Показан учебный сценарий.{' '}
          <button disabled={busy} onClick={reset}>
            Вернуть документальные данные
          </button>
        </aside>
      )}
      {error && <p role="alert">{error}</p>}
      <div className="map-layout">
        <TeacherMap
          model={view}
          teacher={teacher}
          selected={selected}
          onTeacher={chooseTeacher}
          onProcess={(id) => {
            setSelected(id)
            if (window.matchMedia('(max-width: 760px)').matches)
              details.current?.scrollIntoView({ block: 'start' })
          }}
        />
        <div ref={details}>
          <label className="process-picker">
            Все объекты модели
            <select
              aria-label="Все объекты модели"
              value={selected}
              onChange={(e) => chooseProcess(e.target.value)}
            >
              {!selected && <option value="">Выберите объект</option>}
              {view.processes.map((p) => (
                <option value={p.id} key={p.id}>
                  {p.period} · {p.title}
                </option>
              ))}
            </select>
          </label>
          {process && (
            <ProcessDetails
              key={selected + '-' + edited}
              process={process}
              original={original.processes.find((p) => p.id === selected)}
              model={view}
              fields={modules[process.module].fields}
              busy={busy}
              onApply={apply}
              onTeacher={chooseTeacher}
            />
          )}
        </div>
      </div>
    </>
  )
}
