import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

const ROOT = path.resolve('./');
const OUT_DIR = path.join(ROOT, 'data/outputs');

router.post('/owl', (req, res) => {
  try {
    const filePath = path.join(OUT_DIR, 'final_ontology.owl');

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'OWL file not found' });
    }

    res.download(filePath, 'ontology.owl');
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
