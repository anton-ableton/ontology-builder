export async function requestJson(url, options) {
  const response = await fetch(url, options)
  if (!response.ok) {
    const details = await response.json().catch(() => null)
    throw Error(details?.error || 'Ошибка запроса: HTTP ' + response.status)
  }
  return response.json()
}
export const postJson = (url, body, signal) =>
  requestJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal
  })
