import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { Agent } from 'undici'

// This CA is used exclusively for the two fixed Sber endpoints.
const dispatcher = new Agent({
  connect: {
    ca: readFileSync(new URL('./russian-trusted-root.pem', import.meta.url))
  }
})
const oauthUrl = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth'
let cached
async function authorize(key, request) {
  const response = await request(oauthUrl, {
    method: 'POST',
    dispatcher,
    redirect: 'error',
    signal: AbortSignal.timeout(20000),
    headers: {
      Authorization: 'Basic ' + key,
      RqUID: randomUUID(),
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'scope=GIGACHAT_API_PERS'
  })
  if (!response.ok) throw Error('Авторизация GigaChat: HTTP ' + response.status)
  const { access_token: token, expires_at: expires } = await response.json()
  if (!token || !Number.isFinite(expires))
    throw Error('GigaChat вернул неполный ответ авторизации.')
  return { token, expires: expires < 1e12 ? expires * 1000 : expires }
}
async function accessToken(key, request) {
  if (cached?.key === key && cached.request === request &&
      (!cached.expires || cached.expires > Date.now() + 60000))
    return (await cached.pending).token
  const entry = { key, request, pending: authorize(key, request) }
  cached = entry
  try {
    const result = await entry.pending
    entry.expires = result.expires
    return result.token
  } catch (e) {
    if (cached === entry) cached = undefined
    throw e
  }
}
export async function gigaCompletion(config, messages, schema, request) {
  const token = await accessToken(config.key, request)
  const response = await request(config.endpoint, {
    method: 'POST',
    dispatcher,
    redirect: 'error',
    signal: AbortSignal.timeout(120000),
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      max_tokens: 1200,
      temperature: 0.01,
      response_format: { type: 'json_schema', schema, strict: true }
    })
  })
  if (response.status === 401 && cached?.key === config.key) cached = undefined
  return response
}
