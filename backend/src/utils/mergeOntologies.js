// One accumulator per upload. Keep only distinct entities while reading chunks.
function classId(value) {
  if (typeof value !== 'string') return null
  const id = value
    .trim()
    .split(/\s+/u)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
  return /^[A-Z][A-Za-z0-9]{1,79}$/u.test(id) ? id : null
}
const description = (v) => (typeof v === 'string' ? v : '')
export class Candidates {
  classes = new Map()
  properties = new Map()
  add(ontology) {
    for (const c of ontology.classes) {
      const name = classId(c?.name)
      if (name && !this.classes.has(name))
        this.classes.set(name, {
          name,
          description: description(c.description),
          parent: classId(c.parent)
        })
    }
    for (const p of ontology.objectProperties) {
      const name = p?.name,
        domain = classId(p?.domain),
        range = classId(p?.range)
      if (
        typeof name !== 'string' ||
        !/^[a-z][A-Za-z0-9]{1,79}$/u.test(name) ||
        !domain ||
        !range
      )
        continue
      const key = [name, domain, range].join('|')
      if (!this.properties.has(key))
        this.properties.set(key, {
          name,
          domain,
          range,
          description: description(p.description)
        })
    }
  }
  result() {
    const known = (id) => this.classes.has(id)
    const classes = [...this.classes.values()].map((c) => ({
      ...c,
      parent: c.parent !== c.name && known(c.parent) ? c.parent : null
    }))
    return {
      classes,
      objectProperties: [...this.properties.values()].filter(
        (p) => known(p.domain) && known(p.range)
      )
    }
  }
}
