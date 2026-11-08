import express from 'express'
import { jsonToOwl } from '../utils/jsonToOwl.js'
const router = express.Router()
router.post('/owl', (req, res) => {
  if (
    !Array.isArray(req.body?.classes) ||
    !Array.isArray(req.body?.objectProperties)
  )
    return res.status(400).json({ error: 'Нет результата извлечения' })
  res
    .attachment('candidates.owl')
    .type('application/rdf+xml')
    .send(jsonToOwl(req.body))
})
export default router
