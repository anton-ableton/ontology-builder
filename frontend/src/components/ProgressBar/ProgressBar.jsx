export default function ProgressBar({ progress }) {
  if (!progress) return null;

  let text = '';

  switch (progress.stage) {
    case 'file':
      text = `📄 ${progress.file} — ${progress.message}`;
      break;

    case 'chunk':
      text = `📦 ${progress.file} — chunk ${progress.current}/${progress.total}`;
      break;

    case 'done':
      text = '✅ Conversion finished';
      break;

    case 'error':
      text = `❌ ${progress.file || ''} — ${progress.message}`;
      break;

    default:
      text = '';
  }

  return (
    <div>
      <div>{text}</div>
    </div>
  );
}
