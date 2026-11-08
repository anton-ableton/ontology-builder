import express from 'express'
import multer from 'multer'
import { run } from '../pipeline/runPipeline.js'
const router = express.Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 4, fileSize: 8 * 1024 * 1024 }
})
router.post('/', upload.array('files', 4), async (req, res) => {
  if (
    !req.files?.length ||
    req.files.some((f) => !f.buffer.subarray(0, 1024).includes('%PDF-'))
  )
    return res
      .status(400)
      .json({ error: 'Выберите до четырёх PDF, не более 8 МБ каждый.' })
  res
    .set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' })
    .flushHeaders()
  const emit = (msg) => {
    if (res.destroyed) throw Error('Соединение закрыто')
    res.write('data: ' + JSON.stringify(msg) + '\n\n')
  }
  try {
    const ontology = await run(req.files, emit)
    emit({ stage: 'result', ontology })
  } catch (e) {
    if (!res.destroyed) emit({ stage: 'error', message: e.message })
  }
  res.end()
})
export default router
