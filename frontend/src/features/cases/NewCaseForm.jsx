import { useState } from 'react'
export default function NewCaseForm({ modules, onAdd }) {
  const [name, setName] = useState(''),
    [module, setModule] = useState('practice')
  return (
    <form
      className="fields"
      onSubmit={(e) => {
        e.preventDefault()
        if (name.trim()) {
          onAdd({ title: name.trim(), module, source: '', facts: {} })
          setName('')
        }
      }}
    >
      <label>
        Вид процесса
        <select value={module} onChange={(e) => setModule(e.target.value)}>
          {Object.entries(modules).map(([k, m]) => (
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
  )
}
