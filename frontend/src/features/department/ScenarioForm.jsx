import { useState } from 'react'

export default function ScenarioForm({
  process,
  original,
  fields,
  model,
  busy,
  onApply,
  onClose
}) {
  const [people, setPeople] = useState(() =>
    Object.fromEntries(process.links.map((l) => [l.role, l.person ?? '']))
  )
  const editableFields = Object.entries(fields).filter(
    ([key, field]) =>
      field.type === 'date' || ['document', 'group'].includes(key)
  )
  const [values, setValues] = useState(() =>
    Object.fromEntries(
      editableFields.map(([key]) => [key, process.facts[key] ?? ''])
    )
  )
  async function submit(e) {
    e.preventDefault()
    const update = { positions: {}, values: {} }
    for (const link of original.links) {
      const person = people[link.role] || null
      if (person !== link.person) update.positions[link.role] = person
    }
    for (const [key] of editableFields) {
      const value = values[key].trim() || null
      if (value !== (original.facts[key] ?? null)) update.values[key] = value
    }
    if (await onApply(process.id, update)) onClose()
  }
  return (
    <form onSubmit={submit} className="scenario-form">
      <h3>Проверить сценарий</h3>
      <p>
        Изменения действуют в этой вкладке до перезагрузки. Сравните связи и
        выводы с исходным документом.
      </p>
      <fieldset disabled={busy}>
        {process.links.map((link) => (
          <label key={link.role}>
            {model.roles[link.role]}
            <select
              aria-label={model.roles[link.role]}
              value={people[link.role]}
              onChange={(e) =>
                setPeople({ ...people, [link.role]: e.target.value })
              }
            >
              <option value="">Нет сведений</option>
              <option value="absent">Явно указано отсутствие</option>
              {Object.entries(model.people).map(([id, name]) => (
                <option value={id} key={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        ))}
        {editableFields.map(([key, field]) => (
          <label key={key}>
            {field.label}
            <input
              type={field.type === 'date' ? 'date' : 'text'}
              maxLength={250}
              placeholder={
                field.negative
                  ? 'Название или «' + field.negative + '»'
                  : undefined
              }
              value={values[key]}
              onChange={(e) => setValues({ ...values, [key]: e.target.value })}
            />
          </label>
        ))}
        <button type="submit">Применить сценарий</button>
        <button type="button" onClick={onClose}>
          Отмена
        </button>
      </fieldset>
    </form>
  )
}
