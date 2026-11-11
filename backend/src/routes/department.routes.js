import express from 'express'
import { departmentView } from '../domain/koi/model.js'
import { departmentTurtle } from '../domain/koi/export.js'
import { InputError } from '../domain/profile.js'

const router = express.Router()
const original = departmentView()
router.get('/', (_, res) => res.json(original))
router.post('/scenario', (req, res) => {
  const view = departmentView(req.body?.edits)
  if (req.body?.export === true)
    return res.json({ ttl: departmentTurtle(view) })
  res.json(view)
})
router.use((error, req, res, next) => {
  if (!(error instanceof InputError)) return next(error)
  res.status(400).json({ error: error.message })
})
export default router
