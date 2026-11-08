import { useState } from 'react'
import { changeFact, initialEntry, loadEntry, saveEntry } from './storage'
import { saveCard } from './caseFiles'
import { useFactCheck } from './useFactCheck'
import FactEditor from './FactEditor'
import CheckResults from './CheckResults'
import GraphView from './GraphView'
import Assistant from '../documents/Assistant'
import PdfPanel from '../documents/PdfPanel'
export default function Workspace({ sample, catalog }) {
  const mod = catalog.profile.modules[sample.module]
  const [entry, setEntry] = useState(() => loadEntry(sample))
  const [storageOK, setStorageOK] = useState(true)
  function commit(next) {
    setStorageOK(saveEntry(sample.id, next))
    setEntry(next)
  }
  const { result, error } = useFactCheck(sample, entry.facts)
  const change = (key, value, quote) =>
    commit(changeFact(entry, key, value, quote))
  return (
    <>
      {!storageOK && (
        <p role="alert">
          Хранилище браузера недоступно. Сохраните карточку в JSON.
        </p>
      )}
      <div className="columns">
        <FactEditor
          title={sample.title}
          fields={mod.fields}
          facts={entry.facts}
          onChange={change}
          onReset={() => commit(initialEntry(sample))}
          onSave={result ? () => saveCard(sample, entry) : null}
        />
        <CheckResults
          result={result}
          error={error}
          sample={sample}
          facts={entry.facts}
        />
      </div>
      {result && (
        <GraphView
          mod={mod}
          graph={result.graph}
          classes={catalog.profile.classes}
          quotes={entry.quotes}
        />
      )}
      <Assistant
        sample={sample}
        fields={mod.fields}
        provider={catalog.provider}
        model={catalog.model}
        onAccept={change}
      />
      <PdfPanel provider={catalog.provider} />
    </>
  )
}
