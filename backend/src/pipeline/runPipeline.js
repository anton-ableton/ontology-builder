import fs from 'fs';
import path from 'path';

import { extractTextFromPDF } from '../utils/pdfToText.js';
import { cleanText } from './cleanText.js';
import { chunkText } from './chunkText.js';
import { extractOntology } from './llmExtract.js';
import { mergeOntologies } from '../utils/mergeOntologies.js';

const RAW_DIR = '../data/raw';
const OUT_DIR = '../data/processed';

async function run() {
  const files = fs.readdirSync(RAW_DIR);

  const allOntologies = [];

  for (const file of files) {
    if (!file.endsWith('.pdf')) continue;

    console.log(`\n📄 Processing: ${file}`);

    // 1. PDF → text
    const rawText = await extractTextFromPDF(path.join(RAW_DIR, file));

    // 2. clean
    const clean = cleanText(rawText);

    // 3. chunk
    const chunks = chunkText(clean);

    console.log(`Chunks: ${chunks.length}`);

    const fileOntologies = [];

    // 4. LLM extraction per chunk
    for (let i = 0; i < chunks.length; i++) {
      console.log(`  → chunk ${i + 1}/${chunks.length}`);

      try {
        const ontology = await extractOntology(chunks[i]);
        if (ontology) {
          fileOntologies.push(ontology);
        }
      } catch (e) {
        console.log('LLM error:', e.message);
      }
    }

    // 5. merge chunks of one file
    const mergedFileOntology = mergeOntologies(fileOntologies);

    allOntologies.push(mergedFileOntology);
  }

  // 6. merge all PDFs
  const finalOntology = mergeOntologies(allOntologies);

  // 7. save result
  fs.writeFileSync(
    '../data/final_ontology.json',
    JSON.stringify(finalOntology, null, 2)
  );

  console.log('\n✅ DONE: ontology generated');
  console.log('Saved to: data/final_ontology.json');
}

run();
