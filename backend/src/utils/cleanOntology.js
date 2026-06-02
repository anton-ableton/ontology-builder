import { normalizeName } from "./normalizeName.js";

function isValidClass(name) {
  if (!name) return false;

  if (name.length < 3) return false;
  if (name.length > 40) return false;

  // отсекаем мусор типа ABCDEFGHIJKL
  if (/^[A-Z]{10,}$/.test(name)) return false;

  return true;
}

export function cleanOntology(ontology) {
  if (!ontology) return null;

  const classMap = new Map();
  const propertyMap = new Map();

  // ===== CLASSES =====
  for (const cls of ontology.classes || []) {
    const name = normalizeName(cls.name);
    if (!isValidClass(name)) continue;

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
    if (!prop?.name) continue;

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

  return {
    classes: Array.from(classMap.values()),
    objectProperties: Array.from(propertyMap.values())
  };
}
