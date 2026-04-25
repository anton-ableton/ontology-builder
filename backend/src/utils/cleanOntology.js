const ALLOWED = new Set([
  'interactsWith',
  'participatesIn',
  'usesResource',
  'supports',
  'monitors',
  'adaptsTo'
]);

const isValidRelation = (p) =>
  p &&
  typeof p.name === 'string' &&
  typeof p.domain === 'string' &&
  typeof p.range === 'string';

function normalizeProperty(prop) {
  const normalize = (x) =>
    typeof x === 'string'
      ? x.replace(/\s*x\s*/g, '')
          .replace(/\s*-\s*/g, '')
          .replace(/\s+/g, '')
      : x;

  return {
    ...prop,
    domain: normalize(prop.domain),
    range: normalize(prop.range)
  };
}

export function cleanOntology(ontology) {
  if (!ontology) return null;

  // 1. чистим classes
  ontology.classes = (ontology.classes || [])
    .filter(c =>
      c &&
      typeof c.name === 'string' &&
      c.name.trim().length > 1
    )
    .map(c => ({
      ...c,
      name: c.name.trim()
    }));

  // 2. чистим + нормализуем objectProperties
  ontology.objectProperties = (ontology.objectProperties || [])
    .map(normalizeProperty)
    .filter(p => ALLOWED.has(p.name))
    .filter(isValidRelation);

  return ontology;
}
