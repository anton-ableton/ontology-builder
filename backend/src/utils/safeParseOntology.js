export function safeParseOntology(text) {
  try {
    if (!text || typeof text !== 'string') return null;

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    const obj = JSON.parse(match[0]);

    if (!obj || !Array.isArray(obj.classes) || !Array.isArray(obj.objectProperties)) {
      return null;
    }

    return obj;
  } catch (e) {
    return null;
  }
}
