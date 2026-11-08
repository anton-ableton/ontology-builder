import { readPDF, pdfUpload } from '../utils/pdf.js'
import express from 'express'
import { cases } from '../domain/cases.js'
import {
  moduleOf,
  graphFor,
  evaluate,
  turtle,
  profile,
  InputError
} from '../domain/model.js'
import { propose } from '../llm/extract.js'
import { settings } from '../llm/client.js'
const router = express.Router()
router.post('/read-pdf', pdfUpload.single('file'), async (req, res) => {
  try {
    const text = await readPDF(req.file?.buffer, { first: 4 })
    res.json({ text: text.slice(0, 24000) })
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})
router.get('/catalog', (_, res) => {
  const { provider, model } = settings()
  res.json({ profile, cases, provider, model })
})
router.post('/check', (req, res) => {
  const mod = moduleOf(req.body?.module),
    graph = graphFor(mod, req.body.facts)
  res.json({
    checks: evaluate(mod, graph),
    graph,
    ...(req.body.includeTurtle === false
      ? {}
      : { ttl: turtle(mod, graph, req.body.caseId) })
  })
})
router.post('/propose', async (req, res) => {
  const mod = moduleOf(req.body?.module)
  try {
    res.json(await propose(mod, req.body.source))
  } catch (e) {
    res.status(e instanceof InputError ? 400 : 502).json({ error: e.message })
  }
})
router.use((err, req, res, next) => {
  res.status(err instanceof InputError ? 400 : 500).json({ error: err.message })
})
export default router
