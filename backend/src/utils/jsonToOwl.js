// Multiple independent rdfs:domain declarations denote intersection. For a
// candidate relation observed with different endpoint types, export their union.
const iri = 'https://example.org/department/candidates#'
const escape = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (ch) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;'
      })[ch]
  )
const ref = (id) => iri + escape(id)
function constraint(tag, values) {
  const ids = [...values]
  if (ids.length === 1)
    return '<rdfs:' + tag + ' rdf:resource="' + ref(ids[0]) + '"/>'
  return (
    '<rdfs:' +
    tag +
    '><owl:Class><owl:unionOf rdf:parseType="Collection">' +
    ids.map((id) => '<owl:Class rdf:about="' + ref(id) + '"/>').join('') +
    '</owl:unionOf></owl:Class></rdfs:' +
    tag +
    '>'
  )
}
export function jsonToOwl(ontology) {
  const out = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:owl="http://www.w3.org/2002/07/owl#" xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">',
    '<owl:Ontology rdf:about="' + iri + '"/>'
  ]
  for (const c of ontology.classes)
    out.push(
      '<owl:Class rdf:about="' +
        ref(c.name) +
        '"><rdfs:label>' +
        escape(c.name) +
        '</rdfs:label><rdfs:comment>' +
        escape(c.description) +
        '</rdfs:comment>' +
        (c.parent
          ? '<rdfs:subClassOf rdf:resource="' + ref(c.parent) + '"/>'
          : '') +
        '</owl:Class>'
    )
  const props = new Map()
  for (const p of ontology.objectProperties) {
    if (!props.has(p.name))
      props.set(p.name, {
        domains: new Set(),
        ranges: new Set(),
        description: p.description
      })
    const item = props.get(p.name)
    item.domains.add(p.domain)
    item.ranges.add(p.range)
  }
  for (const [name, p] of props)
    out.push(
      '<owl:ObjectProperty rdf:about="' +
        ref(name) +
        '"><rdfs:label>' +
        escape(name) +
        '</rdfs:label><rdfs:comment>' +
        escape(p.description) +
        '</rdfs:comment>' +
        constraint('domain', p.domains) +
        constraint('range', p.ranges) +
        '</owl:ObjectProperty>'
    )
  return out.concat('</rdf:RDF>').join('\n')
}
