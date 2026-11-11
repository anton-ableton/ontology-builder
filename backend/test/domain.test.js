import test from 'node:test'
import assert from 'node:assert/strict'
import { moduleOf, graphFor, evaluate, turtle } from '../src/domain/model.js'
import { cases } from '../src/domain/cases.js'
import { propose } from '../src/llm/extract.js'
import { generateJSON, settings } from '../src/llm/client.js'
const mod = moduleOf('practice'),
  statuses = (f) => evaluate(mod, graphFor(mod, f)).map((r) => r.status)
test('Explicit negative, late report, no defence date are distinct', () =>
  assert.deepEqual(statuses(cases[0].facts), ['fail', 'fail', 'unknown']))
test('Removing the negative assertion makes the assignment unknown', () =>
  assert.equal(statuses({})[0], 'unknown'))
test('Boundary dates are inclusive; edits propagate across rules', () =>
  assert.deepEqual(
    statuses({
      supervisor: 'А. Лесова',
      due: '2026-10-15',
      submitted: '2026-10-15',
      review: '2026-10-15'
    }),
    ['pass', 'pass', 'pass']
  ))
test('Invalid dates and out-of-module fields rejected', () => {
  for (const f of [{ due: '2026-02-29' }, { model: 'invented' }])
    assert.throws(() => graphFor(mod, f))
})
test('Export preserves explicit negative as data; unknown has no invented date', () => {
  const ttl = turtle(mod, graphFor(mod, cases[0].facts))
  assert.match(ttl, /:case :supervisorExplicitlyAbsent "true"/)
  assert.doesNotMatch(ttl, /:case :defendedOn/)
})
test('No automatic merge of conflicting, fabricated or out-of-profile candidates', async () => {
  const source = 'Руководитель: Анна. Руководитель: Борис.'
  const raw = [
    ['supervisor', 'Анна', 'Руководитель: Анна.'],
    ['supervisor', 'Борис', 'Руководитель: Борис.'],
    ['due', '2026-10-10', 'invented'],
    ['extra', 'Анна', 'Анна']
  ]
  const r = await propose(mod, source, async () => ({
    items: raw.map(([key, value], i) => ({ key, value, sentence: i + 1 }))
  }))
  assert.equal(r.items.length, 0)
  assert.ok(r.warnings.length)
})
test('Every module validates its own example', () => {
  const expected = {
    practice: ['fail', 'fail', 'unknown'],
    course: ['pass'],
    thesis: ['pass', 'pass', 'unknown'],
    assignment: ['pass', 'fail']
  }
  for (const c of cases)
    assert.deepEqual(
      evaluate(moduleOf(c.module), graphFor(moduleOf(c.module), c.facts)).map(
        (x) => x.status
      ),
      expected[c.id]
    )
})
test('Cloud adapter sends only free model requests; credentials stay server side', async () => {
  assert.throws(() =>
    settings({ LLM_PROVIDER: 'openrouter', OPENROUTER_MODEL: 'paid/model' })
  )
  const config = settings({
    LLM_PROVIDER: 'openrouter',
    OPENROUTER_API_KEY: 'test'
  })
  await assert.rejects(
    generateJSON([], {}, { config: { ...config, key: '' } }),
    /OPENROUTER_API_KEY/
  )
  const out = await generateJSON(
    [],
    {},
    {
      config,
      request: async (url, opts) => {
        assert.equal(url, 'https://openrouter.ai/api/v1/chat/completions')
        assert.equal(opts.headers.Authorization, 'Bearer test')
        assert.equal(JSON.parse(opts.body).model, 'openrouter/free')
        return Response.json({
          choices: [{ message: { content: '{"items":[]}' } }]
        })
      }
    }
  )
  assert.deepEqual(out, { items: [] })
})

test('Russian dates and spaced initials keep verbatim evidence', async () => {
  const source = 'Руководитель: И. К. Соколова. Отчёт сдан 17.10.2026.'
  const r = await propose(mod, source, async () => ({
    items: [
      { key: 'supervisor', sentence: 1, value: 'И. К. Соколова' },
      { key: 'submitted', sentence: 2, value: '17.10.2026' }
    ]
  }))
  assert.deepEqual(
    r.items.map((x) => x.value),
    ['И. К. Соколова', '2026-10-17']
  )
  assert.equal(r.items[0].quote, 'Руководитель: И. К. Соколова.')
})
test('Uncertain assignment strings must not pass as names', () => {
  assert.throws(() => graphFor(mod, { supervisor: 'нет данных' }))
  assert.equal(statuses({ supervisor: 'Не назначен' })[0], 'fail')
})

test('Missing document differs from an explicitly missing attachment', () => {
  const m = moduleOf('thesis'),
    check = (f) => evaluate(m, graphFor(m, f)).find((r) => r.id === 'В3').status
  assert.equal(check({}), 'unknown')
  assert.equal(check({ document: 'не приложен' }), 'fail')
  assert.equal(check({ document: 'ВКР-17.pdf' }), 'pass')
})

test('PDF class candidates use profile terms, not substrings; repeated property types are alternatives', async () => {
  const { mentionedClasses } = await import('../src/domain/vocabulary.js')
  const { jsonToOwl } = await import('../src/utils/jsonToOwl.js')
  const vocab = { classes: { Teacher: 'Преподаватель', Student: 'Студент' } }
  assert.deepEqual(
    mentionedClasses(vocab, 'Teacher, студентка').map((c) => c.name),
    ['Teacher']
  )
  const property = (domain) => ({ name: 'hasTask', domain, range: 'Task' })
  const xml = jsonToOwl({
    classes: [],
    objectProperties: [property('Practice'), property('Thesis')]
  })
  assert.equal(xml.match(/<owl:ObjectProperty /g).length, 1)
  assert.match(xml, /owl:unionOf rdf:parseType="Collection"/)
})

test('GigaChat exchanges the personal credentials, reuses the token and requests a structured answer', async () => {
  const config = settings({ GIGACHAT_CREDENTIALS: 'test-key' }, 'gigachat')
  const schema = { type: 'object' }
  let auth = 0
  const request = async (url, options) => {
    if (url.endsWith('/oauth')) {
      auth++
      assert.equal(options.headers.Authorization, 'Basic test-key')
      assert.equal(options.body, 'scope=GIGACHAT_API_PERS')
      assert.match(options.headers.RqUID, /^[\da-f-]{36}$/)
      return Response.json({
        access_token: 'test-token',
        expires_at: Date.now() + 1800000
      })
    }
    assert.equal(url, 'https://api.giga.chat/v1/chat/completions')
    assert.equal(options.headers.Authorization, 'Bearer test-token')
    const body = JSON.parse(options.body)
    assert.equal(body.model, 'GigaChat-3-Ultra')
    assert.deepEqual(body.response_format, {
      type: 'json_schema',
      schema,
      strict: true
    })
    return Response.json({
      model: 'GigaChat-3-Ultra:test',
      choices: [{ message: { content: '{"items":[]}' } }]
    })
  }
  for (const result of await Promise.all(
    [1, 2].map(() => generateJSON([], schema, { config, request }))
  ))
    assert.deepEqual(result, { items: [] })
  assert.equal(auth, 1)
  await assert.rejects(
    generateJSON([], schema, { config: settings({}, 'gigachat'), request }),
    /GIGACHAT_CREDENTIALS/
  )
})
test('Quoted day in a Russian deadline retains its original citation', async () => {
  const quote = 'Срок сдачи студентом готовой работы «20» мая 2022 г.'
  const result = await propose(moduleOf('thesis'), quote, async () => ({
    items: [{ sentence: 1, key: 'due', value: '«20» мая 2022 г.' }]
  }))
  assert.deepEqual(result.items, [{ key: 'due', value: '2022-05-20', quote }])
})
