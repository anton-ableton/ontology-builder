import { gigaCompletion } from './gigachat.js'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const envPath = fileURLToPath(new URL('../../../.env', import.meta.url))
if (existsSync(envPath)) process.loadEnvFile(envPath)
export function settings(
  env = process.env,
  provider = env.LLM_PROVIDER || 'ollama'
) {
  if (provider === 'ollama')
    return {
      provider,
      model: env.OLLAMA_MODEL || 'llama3.2:3b',
      endpoint:
        (env.OLLAMA_URL || 'http://127.0.0.1:11434').replace(/\/$/, '') +
        '/api/chat'
    }
  if (provider === 'gigachat')
    return {
      provider,
      model: 'GigaChat-3-Ultra',
      endpoint: 'https://api.giga.chat/v1/chat/completions',
      key: env.GIGACHAT_CREDENTIALS
    }
  if (provider !== 'openrouter')
    throw Error('LLM_PROVIDER: допустимы ollama, gigachat и openrouter')
  const model = env.OPENROUTER_MODEL || 'openrouter/free'
  if (model !== 'openrouter/free' && !model.endsWith(':free'))
    throw Error('Разрешены только бесплатные модели OpenRouter')
  return {
    provider,
    model,
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    key: env.OPENROUTER_API_KEY
  }
}
export async function generateJSON(
  messages,
  schema,
  { config = settings(), request = fetch, onModel } = {}
) {
  const local = config.provider === 'ollama'
  if (!local && !config.key)
    throw Error(
      'Укажите ' +
        (config.provider === 'gigachat'
          ? 'GIGACHAT_CREDENTIALS'
          : 'OPENROUTER_API_KEY') +
        ' в файле .env и перезапустите сервер.'
    )
  const headers = { 'Content-Type': 'application/json' }
  if (!local) headers.Authorization = 'Bearer ' + config.key
  const opts = local
    ? {
        stream: false,
        format: schema,
        options: { temperature: 0, seed: 7, num_ctx: 4096, num_predict: 1200 }
      }
    : {
        temperature: 0,
        max_tokens: 1200,
        response_format: { type: 'json_object' }
      }
  let r
  try {
    r =
      config.provider === 'gigachat'
        ? await gigaCompletion(config, messages, schema, request)
        : await request(config.endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({ model: config.model, messages, ...opts }),
            signal: AbortSignal.timeout(120000)
          })
  } catch (e) {
    if (
      e.message.startsWith('Авторизация GigaChat') ||
      e.message.startsWith('GigaChat вернул')
    )
      throw e
    throw Error(
      e.name === 'TimeoutError'
        ? 'Модель не ответила за 120 секунд.'
        : 'Не удалось подключиться к ' +
            config.provider +
            '. Проверьте адрес и доступность сервера.'
    )
  }
  if (!r.ok)
    throw Error(
      config.provider +
        ' HTTP ' +
        r.status +
        (r.status === 429
          ? ' — исчерпан лимит, попробуйте позже.'
          : r.status === 404 && local
            ? ' — загрузите модель: ollama pull ' + config.model
            : '')
    )
  const data = await r.json()
  if (typeof data.model === 'string') onModel?.(data.model)
  const content = local
    ? data.message?.content
    : data.choices?.[0]?.message?.content
  try {
    return JSON.parse(content)
  } catch {
    throw Error('Модель вернула некорректный JSON. Факты не изменены.')
  }
}
