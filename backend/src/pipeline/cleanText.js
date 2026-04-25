export function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\[[0-9]+\]/g, '')
    .replace(/\(\w+ et al\., \d{4}\)/g, '')
    .replace(/References[\s\S]*/i, '')
    .trim();
}
