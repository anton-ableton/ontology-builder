import { mkdirSync, writeFileSync } from 'node:fs'
import { turtle, moduleOf } from '../src/domain/model.js'
const dir = new URL('../../model/', import.meta.url)
mkdirSync(dir, { recursive: true })
writeFileSync(new URL('department.ttl', dir), turtle(moduleOf('practice'), []))
