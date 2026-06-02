import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { run } from '../pipeline/runPipeline.js';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

const RAW_DIR = path.resolve('./data/raw');

router.post('/', upload.array('files'), async (req, res) => {
  try {
    const files = req.files;

    if (!files?.length) {
      return res.status(400).json({ error: 'No files' });
    }

    fs.mkdirSync(RAW_DIR, { recursive: true });

    const savedPaths = files.map((file) => {
      const filePath = path.join(RAW_DIR, file.originalname);
      fs.writeFileSync(filePath, file.buffer);
      return filePath;
    });

    // SSE setup
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const result = await run(savedPaths, res);

    // отправляем финальный результат
    res.write(`data: ${JSON.stringify({
      stage: 'result',
      ontology: result
    })}\n\n`);

    res.end();

  } catch (e) {
    console.error(e);
    res.end(`data: ${JSON.stringify({ stage: 'error', message: e.message })}\n\n`);
  }
});

export default router;
