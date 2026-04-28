export function jsonToOwl(ontology, baseIRI = "http://example.org/sle#") {
  const escape = (str) =>
    (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  let xml = `<?xml version="1.0"?>
<rdf:RDF
  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  xmlns:owl="http://www.w3.org/2002/07/owl#"
  xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema#"
  xmlns:sle="${baseIRI}">

<owl:Ontology rdf:about="${baseIRI}" />
`;

  // CLASSES
  for (const cls of ontology.classes || []) {
    xml += `
  <owl:Class rdf:about="${baseIRI}${escape(cls.name)}">
    <rdfs:label>${escape(cls.name)}</rdfs:label>
    <rdfs:comment>${escape(cls.description)}</rdfs:comment>
`;

    if (cls.parent) {
      xml += `    <rdfs:subClassOf rdf:resource="${baseIRI}${escape(cls.parent)}"/>\n`;
    }

    xml += `  </owl:Class>\n`;
  }

  // OBJECT PROPERTIES
  for (const p of ontology.objectProperties || []) {
    xml += `
  <owl:ObjectProperty rdf:about="${baseIRI}${escape(p.name)}">
    <rdfs:label>${escape(p.name)}</rdfs:label>
    <rdfs:comment>${escape(p.description)}</rdfs:comment>
    <rdfs:domain rdf:resource="${baseIRI}${escape(p.domain)}"/>
    <rdfs:range rdf:resource="${baseIRI}${escape(p.range)}"/>
  </owl:ObjectProperty>
`;
  }

  xml += `</rdf:RDF>`;
  return xml;
}
