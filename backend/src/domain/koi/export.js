import { schema } from '../turtle.js'
import { moduleOf } from '../profile.js'

const quote = JSON.stringify
const label = (text) => 'rdfs:label ' + quote(text) + '@ru'
const statement = (subject, ...properties) =>
  subject + ' ' + properties.join(' ; ') + ' .'

function processStatements(process) {
  const subject = 'k:' + process.id
  const source = subject + '_source'
  const rows = [
    statement(
      subject,
      'a :' + process.type,
      label(process.title),
      ':inDepartment k:koi',
      'dct:source ' + source
    ),
    statement(
      source,
      'a :Document',
      label(process.source.label),
      'dct:date ' + quote(process.period) + '^^xsd:gYear',
      'dct:identifier <' + process.source.url + '>',
      'dct:description ' + quote(process.source.location) + '@ru'
    )
  ]
  for (const link of process.links) {
    if (!link.person) continue
    const assignee =
      link.person === 'absent'
        ? ':explicitlyUnassigned true'
        : ':participant k:' + link.person
    rows.push(
      statement(
        subject + '_' + link.role,
        'a :Participation',
        ':inProcess ' + subject,
        ':inRole k:' + link.role,
        ':onBehalfOf k:' + link.organization,
        assignee,
        'dct:source ' + (link.edited ? 'k:scenario' : source)
      )
    )
  }
  const fields = moduleOf(process.module).fields
  for (const [key, value] of Object.entries(process.facts)) {
    if (key === 'discipline' && process.type === 'Discipline') continue
    const field = fields[key]
    const negative = field.negative && value.toLowerCase() === field.negative
    const predicate =
      ':' + (negative ? field.negativePredicate : field.predicate)
    let object = 'true'
    if (!negative) {
      if (field.type === 'date') object = quote(value) + '^^xsd:date'
      else {
        object = subject + '_' + key
        rows.push(statement(object, 'a :' + field.class, label(value)))
      }
    }
    rows.push(statement(subject, predicate + ' ' + object))
    rows.push(
      statement(
        '[]',
        'a rdf:Statement',
        'rdf:subject ' + subject,
        'rdf:predicate ' + predicate,
        'rdf:object ' + object,
        'dct:source ' +
          (process.editedFields.includes(key) ? 'k:scenario' : source)
      )
    )
  }
  return rows
}
export function departmentTurtle(view) {
  const rows = [
    schema,
    '@prefix k: <https://example.org/department/koi#> .',
    '@prefix dct: <http://purl.org/dc/terms/> .',
    '@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .',
    ':Participation a owl:Class .',
    ':Role a owl:Class .',
    ':Organization a owl:Class .',
    ':Department a owl:Class ; rdfs:subClassOf :Organization .',
    ':explicitlyUnassigned a owl:DatatypeProperty ; rdfs:range xsd:boolean .'
  ]
  const ranges = {
    participant: 'Teacher',
    inProcess: null,
    inRole: 'Role',
    onBehalfOf: 'Organization',
    inDepartment: 'Department'
  }
  for (const [key, range] of Object.entries(ranges)) {
    const properties = ['a owl:ObjectProperty']
    if (range) properties.push('rdfs:range :' + range)
    rows.push(statement(':' + key, ...properties))
  }
  for (const [id, name] of Object.entries(view.people))
    rows.push(statement('k:' + id, 'a :Teacher', label(name)))
  for (const [id, name] of Object.entries(view.organizations))
    rows.push(
      statement(
        'k:' + id,
        id === 'koi' ? 'a :Department' : 'a :Organization',
        label(name)
      )
    )
  for (const [id, name] of Object.entries(view.roles))
    rows.push(statement('k:' + id, 'a :Role', label(name)))
  if (
    view.processes.some(
      (p) => p.editedFields.length || p.links.some((l) => l.edited)
    )
  )
    rows.push(
      statement(
        'k:scenario',
        'a :Document',
        label('Изменения в учебном сценарии')
      )
    )
  for (const process of view.processes) rows.push(...processStatements(process))
  return rows.join('\n') + '\n'
}
