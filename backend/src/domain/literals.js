const months =
  'января февраля марта апреля мая июня июля августа сентября октября ноября декабря'.split(
    ' '
  )
export function isoDate(text) {
  let m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/u.exec(text)
  if (m) return m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0')
  m = /^(\d{1,2})\s+(\p{L}+)\s+(\d{4})(?:\s+(?:г\.?|года))?$/iu.exec(text)
  if (m && months.includes(m[2].toLowerCase()))
    return (
      m[3] +
      '-' +
      String(months.indexOf(m[2].toLowerCase()) + 1).padStart(2, '0') +
      '-' +
      m[1].padStart(2, '0')
    )
  return text
}
export function admissibleValue(field, value) {
  if (field.type === 'date') return true
  if (field.negative && value.toLowerCase() === field.negative) return true
  if (/^\d{4}-\d\d-\d\d$/u.test(isoDate(value))) return false
  if (['Student', 'Teacher'].includes(field.class)) {
    if (!/\p{Ll}/u.test(value)) return false
    if (
      /^(?:нет|неизвестно|не указан[ао]?|нет данных|неизвестен|не назначен[ао]?)$/iu.test(
        value
      )
    )
      return false
    return /^(?:\p{Lu}[\p{Ll}\p{M}'’\-]+|\p{Lu}\.)(?:\s*(?:\p{Lu}[\p{Ll}\p{M}'’\-]+|\p{Lu}\.)){0,4}$/u.test(
      value
    )
  }
  return true
}
