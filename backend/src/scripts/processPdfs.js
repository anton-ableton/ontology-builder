import fs from 'fs';
import path from 'path';
import { extractTextFromPDF } from '../utils/pdfToText.js';

const RAW_DIR = '../data/raw';
const OUT_DIR = '../data/processed';

async function processAll() {
  const files = fs.readdirSync(RAW_DIR);

  for (const file of files) {
    if (!file.endsWith('.pdf')) continue;

    const filePath = path.join(RAW_DIR, file);
    console.log(`Processing ${file}...`);

    const text = await extractTextFromPDF(filePath);

    const cleanText = text
      .replace(/\s+/g, ' ')                     // нормализация пробелов
      .replace(/\[[0-9]+\]/g, '')               // [1], [23]
      .replace(/\(\w+ et al\., \d{4}\)/g, '')   // (Smith et al., 2020)
      .replace(/References[\s\S]*/i, '')        // обрезаем References
      .trim();

    fs.writeFileSync(
      path.join(OUT_DIR, file.replace('.pdf', '.txt')),
      cleanText
    );
  }
}

processAll();
