export function safeParseOntology(text) {
  if (!text) return null;

  try {
    // 1. пробуем как есть
    return JSON.parse(text);
  } catch {}

  try {
    // 2. ищем JSON блок
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');

    if (start === -1 || end === -1) return null;

    const jsonStr = text.slice(start, end + 1);

    return JSON.parse(jsonStr);
  } catch {}

  console.log('❌ FAILED TO PARSE:', text);
  return null;
}
