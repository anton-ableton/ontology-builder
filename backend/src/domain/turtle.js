import { profile, InputError } from './profile.js'
const literal = (v) => JSON.stringify(v)
function serializeSchema() {
  const lines = [
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
  return lines.join('\n')
}
// The catalog is immutable for the lifetime of the server.
const schema = serializeSchema()
export function turtle(mod, graph, caseId = mod.class) {
  if (typeof caseId !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(caseId))
    throw new InputError('Недопустимый идентификатор процесса')
  const lines = [
    '@prefix inst: <https://example.org/department/cases/' + caseId + '#> .',
    schema
  ]
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
