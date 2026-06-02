import { normalizeName } from "./normalizeName.js";

export function mergeOntologies(ontologies) {
  const classMap = new Map();
  const propertyMap = new Map();

  for (const ontology of ontologies) {
    if (!ontology) continue;

    // ===== CLASSES =====
    for (const cls of ontology.classes || []) {
      const name = normalizeName(cls.name);
      if (!name) continue;

      if (!classMap.has(name)) {
        classMap.set(name, {
          name,
          description: cls.description || '',
          parent: normalizeName(cls.parent)
        });
      }
    }

    // ===== PROPERTIES =====
    for (const prop of ontology.objectProperties || []) {
      const domain = normalizeName(prop.domain);
      const range = normalizeName(prop.range);

      if (!domain || !range) continue;

      const key = `${prop.name}|${domain}|${range}`;

      if (!propertyMap.has(key)) {
        propertyMap.set(key, {
          name: prop.name,
          domain,
          range,
          description: prop.description || ''
        });
      }
    }
  }

  return {
    classes: Array.from(classMap.values()),
    objectProperties: Array.from(propertyMap.values())
  };
}
