import { requestJson } from './http'
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

export function readPdf(file, signal) {
  const form = new FormData()
  form.append('file', file)
  return requestJson('/api/case/read-pdf', {
    method: 'POST',
    body: form,
    signal
  })
}
export async function exportOwl(result) {
  const res = await fetch('/api/export/owl', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result)
  })
  if (!res.ok) throw Error('Не удалось экспортировать файл')
  return res.blob()
}
