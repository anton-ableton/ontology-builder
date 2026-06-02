import express from 'express';
import cors from 'cors';
import uploadRoutes from './routes/upload.routes.js';
import exportRoutes from './routes/export.routes.js';
import { pipelineEvents } from './pipeline/progress.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/upload', uploadRoutes);
app.use('/api/export', exportRoutes);

// 🔴 SSE clients
const clients = new Set();

app.get('/api/progress', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  res.flushHeaders();

  clients.add(res);

  req.on('close', () => {
    clients.delete(res);
  });
});

// broadcast helper
function broadcast(data) {
  for (const client of clients) {
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  }
}

// connect pipeline → frontend
pipelineEvents.on('status', (msg) => {
  console.log(msg);

  broadcast({
    type: 'status',
    message: msg,
    time: Date.now()
  });
});

const PORT = 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
