import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { run } from '../pipeline/runPipeline.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage()
});

const ROOT = path.resolve('./');
const RAW_DIR = path.join(ROOT, 'data/raw');

router.post('/', upload.array('files'), async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // создаём папку если нет
    fs.mkdirSync(RAW_DIR, { recursive: true });

    console.log(`Saving ${files.length} file(s)...`);

    const savedPaths = [];

    for (const file of files) {
        const filePath = path.join(RAW_DIR, file.originalname);

        fs.writeFileSync(filePath, file.buffer);

        savedPaths.push(filePath);
        }

    // 🔥 ЗАПУСК PIPELINE
    console.log('Starting pipeline...');
    await run(savedPaths);

    res.json({
      ok: true,
      message: 'Files uploaded and pipeline executed'
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
