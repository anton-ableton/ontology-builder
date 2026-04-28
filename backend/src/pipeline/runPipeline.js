import fs from 'fs';
import path from 'path';

import { extractTextFromPDF } from '../utils/pdfToText.js';
import { cleanText } from './cleanText.js';
import { chunkText } from './chunkText.js';
import { extractOntology } from './llmExtract.js';
import { mergeOntologies } from '../utils/mergeOntologies.js';
import { jsonToOwl } from '../utils/jsonToOwl.js';
import { pipelineEvents } from './progress.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '../../');

const RAW_DIR = path.join(ROOT, 'data/raw');
const OUT_DIR = path.join(ROOT, 'data/outputs');

export async function run(inputFiles = []) {
  const files = inputFiles.length
    ? inputFiles
    : fs.readdirSync(RAW_DIR)
        .filter(f => f.endsWith('.pdf'))
        .map(f => path.join(RAW_DIR, f));

  const allOntologies = [];

  for (const filePath of files) {
    const fileName = path.basename(filePath);

    console.log(`\n📄 Processing: ${fileName}`);
    pipelineEvents.emit('status', `Processing file: ${fileName}`);

    const rawText = await extractTextFromPDF(filePath);

    // 2. clean
    const clean = cleanText(rawText);

    // 3. chunk
    const chunks = chunkText(clean);

    console.log(`Chunks: ${chunks.length}`);
    pipelineEvents.emit('status', `Chunks created: ${chunks.length}`);

    const fileOntologies = [];

    // 4. LLM extraction per chunk
    for (let i = 0; i < chunks.length; i++) {
      console.log(`  → chunk ${i + 1}/${chunks.length}`);
      pipelineEvents.emit('status', `Processing chunk ${i + 1}/${chunks.length}`);

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
    pipelineEvents.emit('status', `File ontology merged: ${fileName}`);

    allOntologies.push(mergedFileOntology);
  }

  // 6. merge all PDFs
  const finalOntology = mergeOntologies(allOntologies);

  // ensure output dir exists
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // 1. SAVE JSON
  const jsonPath = path.join(OUT_DIR, 'final_ontology.json');

  fs.writeFileSync(
    jsonPath,
    JSON.stringify(finalOntology, null, 2)
  );

  pipelineEvents.emit('status', `Saved JSON: ${jsonPath}`);

  // 2. CONVERT TO OWL
  const owl = jsonToOwl(finalOntology);

  // 3. SAVE OWL
  const owlPath = path.join(OUT_DIR, 'final_ontology.owl');

  fs.writeFileSync(owlPath, owl);

  pipelineEvents.emit('status', `Saved OWL: ${owlPath}`);

  console.log('\n✅ DONE: ontology generated');
  console.log('Saved to: data/final_ontology.json');
}
