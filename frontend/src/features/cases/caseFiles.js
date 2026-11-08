import { checkFacts } from '../../services/cases'
import { saveBlob } from '../../services/download'
const format = 'department-case/1'
export function saveCard(sample, { facts, quotes }) {
  const data = {
    format,
    module: sample.module,
    title: sample.title,
    facts,
    quotes
  }
  saveBlob(
    new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
    'case-' + sample.id + '.json'
  )
}
export async function importCard(file, modules) {
  if (file.size > 64000) throw Error('Слишком большой файл карточки')
  const data = JSON.parse(await file.text())
  if (
    data?.format !== format ||
    typeof data.title !== 'string' ||
    !data.title.trim() ||
    data.title.length > 120 ||
    !Object.hasOwn(modules, data.module)
  )
    throw Error('Неизвестный формат карточки')
  await checkFacts(data.module, data.facts)
  const quotes = Object.fromEntries(
    Object.entries(data.quotes || {}).filter(
      ([key, v]) =>
        Object.hasOwn(data.facts, key) &&
        typeof v === 'string' &&
        v.length <= 4000
    )
  )
  return {
    module: data.module,
    title: data.title,
    facts: data.facts,
    quotes,
    source: ''
  }
}
