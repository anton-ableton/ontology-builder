import { isoDate, admissibleValue } from '../domain/literals.js'
import { generateJSON } from './client.js'
import { sentences, factPrompt } from './facts.js'
import { validateFacts, InputError } from '../domain/model.js'
export function factSchema(mod, n) {
  return {
    type: 'object',
    required: ['items'],
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            sentence: { type: 'integer', minimum: 1, maximum: n },
            key: { type: 'string', enum: Object.keys(mod.fields) },
            value: { type: 'string' }
          },
          required: ['sentence', 'key', 'value'],
          additionalProperties: false
        }
      }
    },
    additionalProperties: false
  }
}
export async function propose(mod, source, generate = generateJSON) {
  if (typeof source !== 'string' || !source.trim() || source.length > 4000)
    throw new InputError('Введите от 1 до 4000 символов об одном процессе.')
  const lines = sentences(source)
  if (!lines.length) throw new InputError('В источнике нет текста.')
  const raw = await generate(
    factPrompt(mod, lines),
    factSchema(mod, lines.length)
  )
  if (!Array.isArray(raw?.items))
    throw Error('Ответ не соответствует схеме предложений.')
  const items = [],
    warnings = []
  let rejected = 0
  for (const x of raw.items) {
    try {
      if (
        !x ||
        !Number.isInteger(x.sentence) ||
        typeof x.key !== 'string' ||
        typeof x.value !== 'string'
      )
        throw Error()
      const quote = lines[x.sentence - 1],
        rawValue = x.value.trim()
      if (!quote || !quote.includes(rawValue)) throw Error()
      // In labelled records the source explicitly identifies the role; use that
      // label to disambiguate e.g. a supervisor from a student.
      const header = quote.split(/[:—]/u)[0].trim().toLowerCase()
      const explicit = Object.entries(mod.fields).filter(
        ([, field]) =>
          field.label.toLowerCase() === header ||
          (field.negative &&
            quote
              .toLowerCase()
              .startsWith(field.label.toLowerCase() + ' ' + field.negative))
      )
      const key = explicit.length === 1 ? explicit[0][0] : x.key
      const f = mod.fields[key]
      if (!f) throw Error()
      const value =
        f.type === 'date'
          ? isoDate(rawValue)
          : rawValue.toLowerCase() === f.negative
            ? f.negative
            : rawValue
      if (!admissibleValue(f, value)) throw Error()
      validateFacts(mod, { [key]: value })
      if (
        f.type === 'entity' &&
        (value === quote.replace(/[.!?]+$/u, '') ||
          value.toLowerCase().startsWith(f.label.toLowerCase() + ' '))
      )
        throw Error()
      if (value.toLowerCase() === f.label.toLowerCase()) throw Error()
      if (
        f.actualEvent &&
        /запланир|планирует|предстоит|не состоял|не сдан|не представлен|ожидается/iu.test(
          quote
        )
      )
        throw Error()
      if (!items.some((y) => y.key === key && y.value === value))
        items.push({ key, value, quote })
    } catch {
      rejected++
    }
  }
  if (rejected)
    warnings.push(
      'Не прошли проверку источника или типа поля: ' + rejected + '.'
    )
  const unique = items.filter(
    (x) => !items.some((y) => y.key === x.key && y.value !== x.value)
  )
  if (unique.length !== items.length)
    warnings.push(
      'Противоречащие друг другу значения исключены. Сверьте источник.'
    )
  return { items: unique, warnings }
}
