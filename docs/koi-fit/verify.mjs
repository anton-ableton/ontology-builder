// Run with Node 22+ against a running local instance. Optional argument: original public PDF.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
const base = 'http://127.0.0.1:' + (process.env.PORT || '8080') + '/api/case/'
const readCard = async (path) =>
  JSON.parse(await readFile(new URL(path, import.meta.url)))
async function check(id, card, expected) {
  const res = await fetch(base + 'check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ module: card.module, facts: card.facts, caseId: id })
  })
  assert.equal(res.status, 200)
  const { checks } = await res.json(),
    actual = Object.fromEntries(checks.map((r) => [r.id, r.status]))
  assert.deepEqual(actual, expected)
  console.log(id, actual)
}
const thesis = await readCard('./vkr-2022.json'),
  course = await readCard('./course-2016.json')
await check('koi-thesis', thesis, { В1: 'pass', В2: 'unknown', В3: 'pass' })
await check('koi-course', course, { Д1: 'unknown' })
await check('koi-practice', await readCard('./practice-2018.json'), {
  П1: 'pass',
  П2: 'unknown',
  П3: 'unknown'
})
for (const [id, submitted, expect] of [
  ['boundary', '2022-05-20', 'pass'],
  ['late', '2022-05-21', 'fail']
]) {
  await check(
    'synthetic-' + id,
    { ...thesis, facts: { ...thesis.facts, submitted } },
    { В1: 'pass', В2: expect, В3: 'pass' }
  )
}
if (process.argv[2]) {
  const config = await (await fetch(base + 'catalog')).json()
  assert.equal(
    config.provider,
    'ollama',
    'Live extraction in this study uses local Ollama only'
  )
  const form = new FormData()
  form.set(
    'file',
    new Blob([await readFile(process.argv[2])], { type: 'application/pdf' }),
    'public-thesis.pdf'
  )
  const pdf = await fetch(base + 'read-pdf', { method: 'POST', body: form })
  assert.equal(pdf.status, 200)
  const { text } = await pdf.json(),
    a = text.indexOf('УТВЕРЖДАЮ'),
    b = text.indexOf('СОДЕРЖАНИЕ', a)
  assert.ok(
    a >= 0 && b > a && b - a <= 4000,
    'Expected assignment page of the referenced PDF'
  )
  const result = await fetch(base + 'propose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ module: 'thesis', source: text.slice(a, b) })
  })
  assert.equal(result.status, 200)
  const { items, warnings } = await result.json()
  console.log(
    JSON.stringify(
      {
        provider: config.provider,
        model: config.model,
        sourceLength: b - a,
        candidates: items.map(({ key, value }) => ({ key, value })),
        warnings
      },
      null,
      2
    )
  )
}
