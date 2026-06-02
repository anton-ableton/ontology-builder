import fs from 'fs';
import path from 'path';

import { extractTextFromPDF } from '../utils/pdfToText.js';
import { cleanText } from './cleanText.js';
import { chunkText } from './chunkText.js';
import { extractOntology } from './llmExtract.js';
import { mergeOntologies } from '../utils/mergeOntologies.js';
import { jsonToOwl } from '../utils/jsonToOwl.js';
import { emitProgress } from '../utils/emitProgress.js';

const ROOT = path.resolve('./');
const OUT_DIR = path.join(ROOT, 'data/outputs');

export async function run(inputFiles = [], res) {
  const allOntologies = [];

  for (const filePath of inputFiles) {
    const fileName = path.basename(filePath);
    console.log(`Processing file: ${fileName}`);

    emitProgress(res, {
      stage: 'file',
      file: fileName,
      message: 'Processing file'
    });

    const rawText = await extractTextFromPDF(filePath);

    const clean = cleanText(rawText);
    const chunks = chunkText(clean);

    emitProgress(res, {
      stage: 'file',
      file: fileName,
      message: `Chunks: ${chunks.length}`
    });

    const fileOntologies = [];

    for (let i = 0; i < chunks.length; i++) {
      const currentChunk = i + 1;
      const totalChunks = chunks.length;

      console.log(`${fileName} — chunk ${currentChunk}/${totalChunks}`);
      emitProgress(res, {
        stage: 'chunk',
        file: fileName,
        current: i + 1,
        total: chunks.length
      });

      try {
        const ontology = await extractOntology(chunks[i]);

        if (ontology) {
          fileOntologies.push(ontology);
        }
      } catch (e) {
        emitProgress(res, {
          stage: 'error',
          file: fileName,
          message: e.message
        });
      }
    }

    const mergedFile = mergeOntologies(fileOntologies);
    allOntologies.push(mergedFile);
  }

  const finalOntology = mergeOntologies(allOntologies);

  const classSet = new Set(finalOntology.classes.map(c => c.name));

  finalOntology.objectProperties = finalOntology.objectProperties.filter(p => {
    if (!classSet.has(p.domain) || !classSet.has(p.range)) {
      return false;
    }
    return true;
  });

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const jsonPath = path.join(OUT_DIR, 'final_ontology.json');
  fs.writeFileSync(
    jsonPath,
    JSON.stringify(finalOntology, null, 2)
  );

  emitProgress(res, {
    stage: 'file',
    message: `Saved JSON`
  });

  const owl = jsonToOwl(finalOntology);

  const owlPath = path.join(OUT_DIR, 'final_ontology.owl');
  fs.writeFileSync(owlPath, owl);

  emitProgress(res, {
    stage: 'done',
    message: 'Pipeline finished'
  });

  return finalOntology;
}
