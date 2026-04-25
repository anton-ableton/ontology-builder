export function mergeOntologies(ontologies) {
  const classMap = new Map();
  const propertyMap = new Map();

  for (const ontology of ontologies) {
    if (!ontology || typeof ontology !== 'object') continue;
    if (!Array.isArray(ontology.classes)) continue;
    if (!Array.isArray(ontology.objectProperties)) continue;

    // CLASSES
    for (const cls of ontology.classes) {
      if (!cls?.name) continue;

      const key = cls.name;

      if (!classMap.has(key)) {
        classMap.set(key, {
          name: cls.name,
          description: cls.description || '',
          parent: cls.parent || null
        });
      } else {
        const existing = classMap.get(key);

        if (!existing.description && cls.description) {
          existing.description = cls.description;
        }

        if (!existing.parent && cls.parent) {
          existing.parent = cls.parent;
        }
      }
    }

    // OBJECT PROPERTIES
    for (const prop of ontology.objectProperties) {
      if (!prop?.name) continue;

      const key = `${prop.name}|${prop.domain}|${prop.range}`;

      if (!propertyMap.has(key)) {
        propertyMap.set(key, {
          name: prop.name,
          domain: prop.domain,
          range: prop.range,
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