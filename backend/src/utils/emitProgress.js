export function emitProgress(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}
