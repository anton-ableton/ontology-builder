export async function uploadFiles(files, onMessage) {
  const form = new FormData()
  files.forEach((f) => form.append('files', f))
  const res = await fetch('/api/upload', { method: 'POST', body: form })
  if (!res.ok) throw Error((await res.json()).error || 'Ошибка загрузки')
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = '',
    result
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += value
    let end
    while ((end = buffer.indexOf('\n\n')) !== -1) {
      const msg = JSON.parse(buffer.slice(0, end).replace(/^data: /, ''))
      buffer = buffer.slice(end + 2)
      if (msg.stage === 'error') throw Error(msg.message)
      if (msg.stage === 'result') result = msg.ontology
      onMessage(msg)
    }
  }
  if (!result) throw Error('Получен неполный ответ сервера')
  return result
}
export async function api(path, body) {
  const res = await fetch(
    '/api/case/' + path,
    body
      ? {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
      : {}
  )
  const data = await res.json()
  if (!res.ok) throw Error(data.error || 'Ошибка запроса')
  return data
}
export function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob),
    a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
