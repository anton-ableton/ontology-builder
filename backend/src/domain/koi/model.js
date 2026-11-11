import { evaluate, graphFor, InputError, moduleOf } from '../model.js'
import { people, organizations, processes, roles } from './catalog.js'

const object = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const invalid = () => {
  throw new InputError('Некорректное изменение модели КОИ')
}

// Each assertion connects a person to a specific process in one role on behalf of one organization.
// null means evidence is missing; "absent" is an explicit negative assertion.
function positionCheck(position, id) {
  const { person, role } = position
  return {
    id,
    title: roles[role] + ' указан в практике',
    status: person === 'absent' ? 'fail' : person ? 'pass' : 'unknown',
    reason:
      person === 'absent'
        ? 'Явно указано отсутствие назначения.'
        : person
          ? people[person] + ' · ' + organizations[position.organization]
          : 'Сведения о назначении отсутствуют.'
  }
}
function buildProcess(process, edits) {
  const mod = moduleOf(process.module)
  const { positions = {}, values = {} } = edits
  if (
    !object(positions) ||
    !object(values) ||
    Object.keys(edits).some((k) => !['positions', 'values'].includes(k))
  )
    invalid()
  for (const [role, person] of Object.entries(positions)) {
    if (
      !Object.hasOwn(process.positions, role) ||
      !(
        person === null ||
        person === 'absent' ||
        (typeof person === 'string' && Object.hasOwn(people, person))
      )
    )
      invalid()
  }
  const facts = { ...process.facts }
  for (const [field, value] of Object.entries(values)) {
    if (
      !Object.hasOwn(mod.fields, field) ||
      (mod.fields[field].type !== 'date' &&
        !['document', 'group'].includes(field))
    )
      invalid()
    if (value === null) delete facts[field]
    else if (typeof value === 'string') facts[field] = value.trim()
    else invalid()
  }
  const links = Object.entries(process.positions).map(
    ([role, organization]) => ({
      role,
      organization,
      person: Object.hasOwn(positions, role)
        ? positions[role]
        : (process.participants[role] ?? null),
      edited: Object.hasOwn(positions, role)
    })
  )
  const factRole = {
    course: 'teacher',
    thesis: 'thesisSupervisor',
    practice: 'universitySupervisor'
  }[process.module]
  const assigned = links.find((link) => link.role === factRole)
  const key = process.module === 'course' ? 'teacher' : 'supervisor'
  if (assigned.person)
    facts[key] =
      assigned.person === 'absent'
        ? mod.fields[key].negative
        : people[assigned.person]
  let checks = evaluate(mod, graphFor(mod, facts))
  if (process.module === 'course') {
    checks = checks.map((check) => {
      if (check.id !== 'Д1') return check
      const title = 'Установлен преподаватель конкретной группы'
      if (check.status === 'pass' && !facts.group)
        return {
          id: check.id,
          title,
          status: 'unknown',
          reason: 'Преподаватель указан. Нет сведений об учебной группе.'
        }
      const reason =
        check.status === 'pass'
          ? check.reason + ' · группа ' + facts.group
          : check.reason
      return { ...check, title, reason }
    })
  }
  if (process.module === 'practice') {
    checks = [
      ...links.map((link, i) => positionCheck(link, 'П1.' + (i + 1))),
      ...checks.filter((c) => c.id !== 'П1')
    ]
  }
  return {
    id: process.id,
    title: process.title,
    type: process.type,
    module: process.module,
    period: process.period,
    source: process.source,
    links,
    checks,
    // People are already represented by qualified links.
    facts: Object.fromEntries(Object.entries(facts).filter(([k]) => k !== key)),
    editedFields: Object.keys(values)
  }
}
export function departmentView(edits = {}) {
  if (!object(edits)) invalid()
  for (const [id, update] of Object.entries(edits))
    if (!processes.some((p) => p.id === id) || !object(update)) invalid()
  return {
    people,
    organizations,
    roles,
    processes: processes.map((p) => buildProcess(p, edits[p.id] ?? {}))
  }
}
