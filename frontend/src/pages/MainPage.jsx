import { useState } from 'react'
import DepartmentExplorer from '../features/department/DepartmentExplorer'
import { useCatalog } from '../features/cases/useCatalog'
import { useCaseLibrary } from '../features/cases/useCaseLibrary'
import CaseLibrary from '../features/cases/CaseLibrary'
import Workspace from '../features/cases/Workspace'
import './department.css'
export default function MainPage() {
  const [section, setSection] = useState('department')
  const { catalog, error } = useCatalog()
  const { records, selected, select, add, storageError } = useCaseLibrary()
  const sample =
    catalog?.cases.find((c) => c.id === selected) ||
    (catalog &&
      records.find(
        (c) =>
          c.id === selected && Object.hasOwn(catalog.profile.modules, c.module)
      ))
  return (
    <main>
      <header>
        <span className="eyebrow">
          ФИТ · Новосибирский государственный университет
        </span>
        <h1>Кафедра общей информатики</h1>
        <p>Онтологическая модель учебного процесса</p>
      </header>
      {(error || storageError) && <p role="alert">{error || storageError}</p>}
      {!catalog && !error && <p>Загрузка модели…</p>}
      {catalog && (
        <>
          <nav aria-label="Разделы приложения">
            <button
              aria-pressed={section === 'department'}
              onClick={() => setSection('department')}
            >
              Модель КОИ
            </button>
            <button
              aria-pressed={section === 'cases'}
              onClick={() => setSection('cases')}
            >
              Карточки процессов
            </button>
          </nav>
          <div hidden={section !== 'department'}>
            <DepartmentExplorer modules={catalog.profile.modules} />
          </div>
        </>
      )}
      {section === 'cases' && sample && (
        <>
          <nav aria-label="Примеры процессов">
            {catalog.cases.map((c) => (
              <button
                aria-pressed={selected === c.id}
                key={c.id}
                onClick={() => select(c.id)}
              >
                {catalog.profile.modules[c.module].label}
              </button>
            ))}
          </nav>
          <CaseLibrary
            catalog={catalog}
            records={records}
            selected={selected}
            onSelect={select}
            onAdd={add}
          />
          <Workspace key={sample.id} sample={sample} catalog={catalog} />
        </>
      )}
    </main>
  )
}
