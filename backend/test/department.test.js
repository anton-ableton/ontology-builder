import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { departmentView } from '../src/domain/koi/model.js'
import { departmentTurtle } from '../src/domain/koi/export.js'
import { InputError } from '../src/domain/profile.js'

const processOf = (view, id) => view.processes.find((p) => p.id === id)
const verdict = (p, id) => p.checks.find((c) => c.id === id).status

test('The same person has two independent practice appointments and three kinds of object', () => {
  const view = departmentView()
  const linked = view.processes.filter((p) =>
    p.links.some((l) => l.person === 'palchunov')
  )
  assert.deepEqual(
    new Set(linked.map((p) => p.module)),
    new Set(['course', 'practice', 'thesis'])
  )
  const practice = processOf(view, 'practice2018')
  assert.deepEqual(
    practice.links.map((l) => [l.person, l.organization]),
    [
      ['palchunov', 'nsu'],
      ['palchunov', 'sobolev']
    ]
  )
  for (const [person, expected] of [
    [null, 'unknown'],
    ['absent', 'fail'],
    ['rylov', 'pass']
  ]) {
    const changed = processOf(
      departmentView({
        practice2018: { positions: { hostSupervisor: person } }
      }),
      'practice2018'
    )
    assert.equal(verdict(changed, 'П1.1'), 'pass')
    assert.equal(verdict(changed, 'П1.2'), expected)
  }
})

test('Evidence of authorship or lecturing does not identify the teacher of a specific group', () => {
  const view = departmentView()
  assert.equal(verdict(processOf(view, 'logic'), 'Д1'), 'unknown')
  const course = processOf(view, 'programmingLogic')
  assert.equal(
    course.links.find((l) => l.role === 'lecturer').person,
    'yakhyaeva'
  )
  assert.equal(verdict(course, 'Д1'), 'unknown')
  assert.equal(
    verdict(
      processOf(
        departmentView({ logic: { positions: { teacher: 'rylov' } } }),
        'logic'
      ),
      'Д1'
    ),
    'unknown'
  )
  assert.equal(
    verdict(
      processOf(
        departmentView({
          logic: {
            positions: { teacher: 'rylov' },
            values: { group: 'Учебная группа' }
          }
        }),
        'logic'
      ),
      'Д1'
    ),
    'pass'
  )
})

test('Deadlines and existence of documents give independent conclusions and preserve provenance', () => {
  const base = departmentView()
  const original = processOf(base, 'thesis2022')
  assert.equal(verdict(original, 'В2'), 'unknown')
  assert.equal(verdict(original, 'В3'), 'pass')
  for (const [submitted, expected] of [
    ['2022-05-20', 'pass'],
    ['2022-05-21', 'fail']
  ]) {
    const view = departmentView({
      thesis2022: { values: { submitted, document: 'не приложен' } }
    })
    const p = processOf(view, 'thesis2022')
    assert.equal(verdict(p, 'В2'), expected)
    assert.equal(verdict(p, 'В3'), 'fail')
    const ttl = departmentTurtle(view)
    assert.match(
      ttl,
      /rdf:predicate :thesisSubmittedOn[^\n]+dct:source k:scenario/
    )
    assert.match(
      ttl,
      /rdf:predicate :thesisDueOn[^\n]+dct:source k:thesis2022_source/
    )
    assert.match(ttl, /k:thesis2022 :thesisTextExplicitlyMissing true/)
  }
  assert.equal(
    departmentTurtle(base),
    readFileSync(new URL('../../model/koi.ttl', import.meta.url), 'utf8')
  )
  assert.deepEqual(departmentView(), base)
})

test('Reject unknown actors, roles, objects and invalid dates', () => {
  for (const bad of [
    { java: { positions: { teacher: 'unknown-id' } } },
    { java: { positions: { hostSupervisor: 'palchunov' } } },
    { ghost: {} },
    { thesis2022: { values: { due: '2022-02-30' } } }
  ])
    assert.throws(() => departmentView(bad), InputError)
})
