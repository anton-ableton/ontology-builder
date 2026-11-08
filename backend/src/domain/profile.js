import { readFileSync } from 'node:fs'
export const profile = JSON.parse(
  readFileSync(new URL('./department.json', import.meta.url))
)
export class InputError extends Error {}
export function moduleOf(id) {
  if (!Object.hasOwn(profile.modules, id))
    throw new InputError('Неизвестный процесс')
  return profile.modules[id]
}
