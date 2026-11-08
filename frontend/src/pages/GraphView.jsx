export default function GraphView({ mod, graph, classes, quotes }) {
  const names = Object.fromEntries(
    graph.filter(([, p]) => p === 'label').map(([id, , name]) => [id, name])
  )
  const fields = Object.values(mod.fields)
  return (
    <details className="panel">
      <summary>Как записан этот процесс в модели</summary>
      <p>
        Класс: <b>{classes[mod.class]}</b>. Ниже факты одного экземпляра
        процесса.
      </p>
      <dl>
        {graph
          .filter(([s, p]) => s === 'case' && p !== 'a')
          .map(([, p, v]) => {
            const field = fields.find(
              (f) => f.predicate === p || f.negativePredicate === p
            )
            const key = Object.keys(mod.fields).find(
              (k) => mod.fields[k] === field
            )
            return (
              <div key={p} className="triple">
                <dt>
                  {field.label} <code>{p}</code>
                </dt>
                <dd>
                  {p === field.negativePredicate
                    ? field.negative
                    : names[v] || v}
                  {quotes[key] && (
                    <blockquote>Источник: «{quotes[key]}»</blockquote>
                  )}
                </dd>
              </div>
            )
          })}
      </dl>
    </details>
  )
}
