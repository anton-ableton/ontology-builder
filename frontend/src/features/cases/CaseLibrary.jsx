import { useState } from 'react'
import { importCard } from './caseFiles'
import NewCaseForm from './NewCaseForm'
export default function CaseLibrary({
  catalog,
  records,
  selected,
  onSelect,
  onAdd
}) {
  const [error, setError] = useState('')
  async function restore(file) {
    if (!file) return
    try {
      onAdd(await importCard(file, catalog.profile.modules))
      setError('')
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
      <NewCaseForm
        modules={catalog.profile.modules}
        onAdd={(record) => {
          setError('')
          onAdd(record)
        }}
      />
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
