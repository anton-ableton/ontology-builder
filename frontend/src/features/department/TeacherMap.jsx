const branches = [
  ['course', 'Дисциплины'],
  ['practice', 'Практики'],
  ['thesis', 'Выпускные работы']
]
export default function TeacherMap({
  model,
  teacher,
  selected,
  onTeacher,
  onProcess
}) {
  return (
    <section
      className="panel map-panel"
      aria-label="Карта связей преподавателя"
    >
      <label className="person-node">
        Преподаватель
        <select aria-label="Преподаватель" value={teacher} onChange={(e) => onTeacher(e.target.value)}>
          {Object.entries(model.people).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <div className="map-branches">
        {branches.map(([module, label]) => {
          const related = model.processes.filter(
            (p) =>
              p.module === module &&
              p.links.some((link) => link.person === teacher)
          )
          return (
            <section className="map-branch" key={module}>
              <h3>{label}</h3>
              {related.map((p) => (
                <button
                  className="process-node"
                  key={p.id}
                  aria-pressed={p.id === selected}
                  onClick={() => onProcess(p.id)}
                >
                  <small>{p.period}</small>
                  <strong>{p.title}</strong>
                  <span>
                    {p.links
                      .filter((link) => link.person === teacher)
                      .map((link) => model.roles[link.role])
                      .join(' · ')}
                  </span>
                </button>
              ))}
              {!related.length && (
                <p className="empty-branch">Связей в выборке нет</p>
              )}
            </section>
          )
        })}
      </div>
    </section>
  )
}
