import { admissibleValue } from './literals.js'
import { readFileSync } from 'node:fs'
export const profile = JSON.parse(
  readFileSync(new URL('./department.json', import.meta.url))
)
export class InputError extends Error {}
export function moduleOf(id) {
  if (!Object.hasOwn(profile.modules, id))
    throw new InputError('Неизвестный процесс')
  return profile.modules[id]
}
export function validDate(s) {
  return (
    /^\d{4}-\d\d-\d\d$/.test(s) &&
    !Number.isNaN(Date.parse(s)) &&
    new Date(s).toISOString().slice(0, 10) === s
  )
}
export function validateFacts(mod, facts) {
  if (!facts || typeof facts !== 'object' || Array.isArray(facts))
    throw new InputError('Ожидается набор фактов')
  for (const [key, value] of Object.entries(facts)) {
    if (
      !Object.hasOwn(mod.fields, key) ||
      typeof value !== 'string' ||
      !value.trim() ||
      value.length > 250
    )
      throw new InputError('Недопустимый факт: ' + key)
    if (!admissibleValue(mod.fields[key], value.trim()))
      throw new InputError(
        'Проверьте значение поля «' +
          mod.fields[key].label +
          '». Неизвестное значение оставьте пустым.'
      )
    if (mod.fields[key].type === 'date' && !validDate(value))
      throw new InputError('Ожидается календарная дата ГГГГ-ММ-ДД')
  }
}
export function graphFor(mod, facts) {
  validateFacts(mod, facts)
  const triples = [['case', 'a', mod.class, 'ref']]
  for (const [key, v] of Object.entries(facts)) {
    const f = mod.fields[key],
      value = v.trim()
    if (value.toLowerCase() === f.negative)
      triples.push(['case', f.negativePredicate, 'true', 'boolean'])
    else if (f.type === 'date')
      triples.push(['case', f.predicate, value, 'date'])
    else
      triples.push(
        ['case', f.predicate, 'value_' + key, 'ref'],
        ['value_' + key, 'a', f.class, 'ref'],
        ['value_' + key, 'label', value, 'label']
      )
  }
  return triples
}
const literal = (v) => JSON.stringify(v)
export function turtle(mod, graph, caseId = mod.class) {
  if (typeof caseId !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(caseId))
    throw new InputError('Недопустимый идентификатор процесса')
  const lines = [
    '@prefix inst: <https://example.org/department/cases/' + caseId + '#> .',
    '@prefix : <https://example.org/department#> .',
    '@prefix owl: <http://www.w3.org/2002/07/owl#> .',
    '@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .',
    '@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .',
    '<https://example.org/department> a owl:Ontology .',
    ''
  ]
  for (const [id, label] of Object.entries(profile.classes))
    lines.push(
      ':' + id + ' a owl:Class ; rdfs:label ' + literal(label) + '@ru .'
    )
  for (const m of Object.values(profile.modules))
    lines.push(':' + m.class + ' rdfs:subClassOf :AcademicProcess .')
  const declarations = new Map()
  for (const m of Object.values(profile.modules))
    for (const f of Object.values(m.fields)) declarations.set(f.predicate, f)
  for (const f of declarations.values()) {
    lines.push(
      ':' +
        f.predicate +
        ' a owl:' +
        (f.type === 'entity'
          ? 'ObjectProperty ; rdfs:range :' + f.class
          : 'DatatypeProperty ; rdfs:range xsd:date') +
        ' .'
    )
    if (f.negativePredicate)
      lines.push(
        ':' +
          f.negativePredicate +
          ' a owl:DatatypeProperty ; rdfs:range xsd:boolean .'
      )
  }
  for (const [s, p, o, t] of graph)
    lines.push(
      'inst:' +
        s +
        ' ' +
        (p === 'a' ? 'a' : p === 'label' ? 'rdfs:label' : ':' + p) +
        ' ' +
        (t === 'ref'
          ? (p === 'a' ? ':' : 'inst:') + o
          : literal(o) + (t === 'label' ? '@ru' : '^^xsd:' + t)) +
        ' .'
    )
  return lines.join('\n') + '\n'
}
export function evaluate(mod, graph) {
  const facts = new Map(
    graph.filter((t) => t[0] === 'case').map(([, p, o]) => [p, o])
  )
  return mod.rules.map((rule) => {
    let status, reason
    if (rule.op === 'assigned' || rule.op === 'present') {
      const f = mod.fields[rule.field],
        ref = facts.get(f.predicate)
      if (ref) {
        status = 'pass'
        reason =
          f.label +
          ': ' +
          graph.find((t) => t[0] === ref && t[1] === 'label')[2]
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
