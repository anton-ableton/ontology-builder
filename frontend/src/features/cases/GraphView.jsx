export default function GraphView({ mod, graph, classes, quotes }) {
  const names = Object.fromEntries(
    graph.filter(([, p]) => p === 'label').map(([id, , name]) => [id, name])
  )
  const fields = new Map()
  for (const [key, field] of Object.entries(mod.fields)) {
    fields.set(field.predicate, { key, field })
    if (field.negativePredicate)
      fields.set(field.negativePredicate, { key, field })
  }
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
            const { key, field } = fields.get(p)
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
