import { useCatalog } from '../features/cases/useCatalog'
import { useCaseLibrary } from '../features/cases/useCaseLibrary'
import CaseLibrary from '../features/cases/CaseLibrary'
import Workspace from '../features/cases/Workspace'
import './department.css'
export default function MainPage() {
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
        <span className="eyebrow">Онтологическая модель кафедры</span>
        <h1>Учебный процесс кафедры</h1>
        <p>
          Проверьте требования к процессу и проследите, какие факты объясняют
          каждый вывод.
        </p>
      </header>
      {(error || storageError) && <p role="alert">{error || storageError}</p>}
      {!catalog && !error && <p>Загрузка модели…</p>}
      {sample && (
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
