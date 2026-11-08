import express from 'express'
import { fileURLToPath } from 'node:url'
import cases from './routes/case.routes.js'
import upload from './routes/upload.routes.js'
import download from './routes/export.routes.js'
const app = express()
app.use((req, res, next) => {
  // Same-origin UI only; don't let unrelated browser pages trigger paid or local inference.
  const origin = req.get('origin')
  if (origin && new URL(origin).host !== req.get('host'))
    return res.status(403).end()
  next()
})
app.use(express.json({ limit: '2mb' }))
app.use('/api/case', cases)
app.use('/api/upload', upload)
app.use('/api/export', download)
app.use(
  express.static(
    fileURLToPath(new URL('../../frontend/dist/', import.meta.url))
  )
)
app.use((err, req, res, next) =>
  res.status(err.status || 400).json({ error: err.message })
)
const port = Number(process.env.PORT || 8080)
const server = app.listen(port, '127.0.0.1', () =>
  console.log('Кафедра: http://127.0.0.1:' + server.address().port)
)
