export default function FactEditor({
  title,
  fields,
  facts,
  onChange,
  onReset,
  onSave
}) {
  return (
    <section className="panel">
      <span className="eyebrow">01 / Факты</span>
      <h2>{title}</h2>
      <p>Пустое поле означает, что сведений нет.</p>
      <div className="fields">
        {Object.entries(fields).map(([k, f]) => (
          <label key={k}>
            {f.label}
            <input
              type={f.type === 'date' ? 'date' : 'text'}
              maxLength={250}
              value={facts[k] || ''}
              placeholder={
                f.negative
                  ? 'Значение или «' + f.negative + '»'
                  : 'Нет сведений'
              }
              onChange={(e) => onChange(k, e.target.value)}
            />
          </label>
        ))}
      </div>

      <button onClick={onReset}>Вернуть исходные факты</button>
      {onSave && <button onClick={onSave}>Сохранить карточку JSON</button>}
    </section>
  )
}
