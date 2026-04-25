import fs from 'fs';

const text = fs.readFileSync('../data/processed/A Short Review for Ontology Learning Stride to Large Language Models Trend.txt', 'utf-8');

function split(text, size = 1500, overlap = 200) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size - overlap) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

const chunks = split(text);

console.log('Chunks:', chunks.length);
console.log(chunks[0]);