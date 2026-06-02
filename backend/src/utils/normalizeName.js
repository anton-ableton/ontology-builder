export function normalizeName(name) {
  if (!name || typeof name !== 'string') return null;

  return name
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase()) // только первая буква слова
    .replace(/\s/g, ''); // убираем пробелы
}
