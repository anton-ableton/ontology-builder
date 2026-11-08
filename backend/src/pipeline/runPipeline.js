import { readPDF } from '../utils/pdf.js'
import { cleanText } from './cleanText.js'
import { chunkText } from './chunkText.js'
import { extractOntology } from './llmExtract.js'
import { Candidates } from '../utils/mergeOntologies.js'
export async function run(files, emit) {
  const candidates = new Candidates()
  for (const { originalname: file, buffer } of files) {
    const chunks = chunkText(cleanText(await readPDF(buffer)))
    if (!chunks.length)
      throw Error('PDF не содержит доступного текстового слоя.')
    for (const [i, chunk] of chunks.entries()) {
      emit({ stage: 'chunk', file, current: i + 1, total: chunks.length })
      candidates.add(await extractOntology(chunk))
    }
  }
  return candidates.result()
}
