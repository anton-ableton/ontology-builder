export async function uploadFiles(files, onMessage) {
  const form = new FormData();

  files.forEach(f => form.append('files', f));

  const res = await fetch('http://localhost:8080/api/upload', {
    method: 'POST',
    body: form
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n\n').filter(Boolean);

    for (const line of lines) {
      const jsonStr = line.replace('data: ', '');
      const data = JSON.parse(jsonStr);

      onMessage(data);
    }
  }
}
