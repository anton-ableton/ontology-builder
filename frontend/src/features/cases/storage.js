const libraryKey = 'department-library-v1'
const entryKey = (id) => 'department-case-v1:' + id
function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key))
  } catch {
    return null
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}
const map = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
export function loadRecords() {
  const records = read(libraryKey)
  return Array.isArray(records)
    ? records.filter(
      (r) =>
        r &&
          typeof r.id === 'string' &&
          typeof r.title === 'string' &&
          typeof r.module === 'string' &&
          map(r.facts)
    )
    : []
}
export const saveRecords = (records) => write(libraryKey, records)
export const initialEntry = (sample) => ({
  facts: sample.facts,
  quotes: sample.quotes || {}
})
export function loadEntry(sample) {
  const entry = read(entryKey(sample.id))
  return map(entry?.facts) && map(entry?.quotes) ? entry : initialEntry(sample)
}
export const saveEntry = (id, entry) => write(entryKey(id), entry)
export function changeFact(entry, key, value, quote) {
  const facts = { ...entry.facts },
    quotes = { ...entry.quotes }
  if (value) facts[key] = value
  else delete facts[key]
  if (quote) quotes[key] = quote
  else delete quotes[key]
  return { facts, quotes }
}
