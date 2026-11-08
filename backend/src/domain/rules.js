export function evaluate(mod, graph) {
  const facts = new Map(),
    labels = new Map()
  for (const [subject, predicate, value] of graph) {
    if (subject === 'case') facts.set(predicate, value)
    else if (predicate === 'label') labels.set(subject, value)
  }
  return mod.rules.map((rule) => {
    let status, reason
    if (rule.op === 'assigned' || rule.op === 'present') {
      const f = mod.fields[rule.field],
        ref = facts.get(f.predicate)
      if (ref) {
        status = 'pass'
        reason = f.label + ': ' + labels.get(ref)
      } else if (facts.has(f.negativePredicate)) {
        status = 'fail'
        reason = 'Явно указано: «' + f.negative + '».'
      } else {
        status = 'unknown'
        reason = 'Нет сведений: ' + f.label.toLowerCase() + '.'
      }
    } else if (rule.op === 'lte') {
      const [a, b] = [rule.left, rule.right].map((k) => mod.fields[k]),
        x = facts.get(a.predicate),
        y = facts.get(b.predicate)
      if (!x || !y) {
        status = 'unknown'
        reason =
          'Нет данных: ' +
          [!x && a.label, !y && b.label].filter(Boolean).join(', ') +
          '.'
      } else {
        status = x <= y ? 'pass' : 'fail'
        reason =
          a.label + ': ' + x + '; ' + b.label.toLowerCase() + ': ' + y + '.'
      }
    } else throw Error('Неизвестная операция правила')
    return { id: rule.id, title: rule.title, status, reason }
  })
}
