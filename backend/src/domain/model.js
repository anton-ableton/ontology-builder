import { admissibleValue } from './literals.js'
import { InputError } from './profile.js'
export { profile, moduleOf, InputError } from './profile.js'
export { evaluate } from './rules.js'
export { turtle } from './turtle.js'
export function validDate(s) {
  return (
    /^\d{4}-\d\d-\d\d$/.test(s) &&
    !Number.isNaN(Date.parse(s)) &&
    new Date(s).toISOString().slice(0, 10) === s
  )
}
export function validateFacts(mod, facts) {
  if (!facts || typeof facts !== 'object' || Array.isArray(facts))
    throw new InputError('Ожидается набор фактов')
  for (const [key, value] of Object.entries(facts)) {
    if (
      !Object.hasOwn(mod.fields, key) ||
      typeof value !== 'string' ||
      !value.trim() ||
      value.length > 250
    )
      throw new InputError('Недопустимый факт: ' + key)
    if (!admissibleValue(mod.fields[key], value.trim()))
      throw new InputError(
        'Проверьте значение поля «' +
          mod.fields[key].label +
          '». Неизвестное значение оставьте пустым.'
      )
    if (mod.fields[key].type === 'date' && !validDate(value))
      throw new InputError('Ожидается календарная дата ГГГГ-ММ-ДД')
  }
}
export function graphFor(mod, facts) {
  validateFacts(mod, facts)
  const triples = [['case', 'a', mod.class, 'ref']]
  for (const [key, v] of Object.entries(facts)) {
    const f = mod.fields[key],
      value = v.trim()
    if (value.toLowerCase() === f.negative)
      triples.push(['case', f.negativePredicate, 'true', 'boolean'])
    else if (f.type === 'date')
      triples.push(['case', f.predicate, value, 'date'])
    else
      triples.push(
        ['case', f.predicate, 'value_' + key, 'ref'],
        ['value_' + key, 'a', f.class, 'ref'],
        ['value_' + key, 'label', value, 'label']
      )
  }
  return triples
}
