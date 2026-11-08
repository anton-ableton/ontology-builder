import { PDFParse } from 'pdf-parse'
import multer from 'multer'
export const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 4 }
})
export async function readPDF(buffer, options = {}) {
  if (!buffer?.subarray(0, 1024).includes('%PDF-'))
    throw Error('Файл не является PDF.')
  const parser = new PDFParse({ data: new Uint8Array(buffer) })
  try {
    const result = await parser.getText({ ...options, pageJoiner: '' })
    const text = result.pages
      .map((p) => p.text)
      .join('\n')
      .trim()
    if (!text)
      throw Error('В PDF нет текстового слоя. Нужен распознанный текст.')
    return text
  } finally {
    await parser.destroy()
  }
}
