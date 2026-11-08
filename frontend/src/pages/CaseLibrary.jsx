import { useState } from 'react'
import { api } from '../services/api'
export default function CaseLibrary({
  catalog,
  records,
  selected,
  onSelect,
  onAdd
}) {
  const [name, setName] = useState(''),
    [module, setModule] = useState('practice'),
    [error, setError] = useState('')
  function add(obj) {
    const item = { ...obj, id: crypto.randomUUID() }
    onAdd(item)
    setName('')
    setError('')
  }
  async function restore(file) {
    if (!file) return
    try {
      if (file.size > 64000) throw Error('Слишком большой файл карточки')
      const data = JSON.parse(await file.text())
      if (
        data.format !== 'department-case/1' ||
        typeof data.title !== 'string' ||
        !data.title.trim() ||
        data.title.length > 120 ||
        !Object.hasOwn(catalog.profile.modules, data.module)
      )
        throw Error('Неизвестный формат карточки')
      await api('check', { module: data.module, facts: data.facts })
      const quotes = Object.fromEntries(
        Object.entries(data.quotes || {}).filter(
          ([key, v]) =>
            Object.hasOwn(data.facts, key) &&
            typeof v === 'string' &&
            v.length <= 4000
        )
      )
      add({
        module: data.module,
        title: data.title,
        facts: data.facts,
        quotes,
        source: ''
      })
    } catch (e) {
      setError(e.message)
    }
  }
  return (
    <details className="panel">
      <summary>
        Мои процессы {records.length > 0 ? '(' + records.length + ')' : ''}
      </summary>
      <p>
        Создайте пустую карточку или откройте сохранённую с другого компьютера.
      </p>
      {records.length > 0 && (
        <label>
          Открыть карточку
          <select
            value={records.some((x) => x.id === selected) ? selected : ''}
            onChange={(e) => onSelect(e.target.value)}
          >
            <option disabled value="">
              Выбрать…
            </option>
            {records.map((x) => (
              <option key={x.id} value={x.id}>
                {x.title}
              </option>
            ))}
          </select>
        </label>
      )}
      <form
        className="fields"
        onSubmit={(e) => {
          e.preventDefault()
          if (name.trim())
            add({ title: name.trim(), module, source: '', facts: {} })
        }}
      >
        <label>
          Вид процесса
          <select value={module} onChange={(e) => setModule(e.target.value)}>
            {Object.entries(catalog.profile.modules).map(([k, m]) => (
              <option key={k} value={k}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Название карточки
          <input
            required
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <button>Создать карточку</button>
      </form>
      <label>
        Открыть JSON карточки
        <input
          type="file"
          accept=".json"
          onChange={(e) => {
            restore(e.target.files[0])
            e.target.value = ''
          }}
        />
      </label>
      {error && <p role="alert">{error}</p>}
    </details>
  )
}
