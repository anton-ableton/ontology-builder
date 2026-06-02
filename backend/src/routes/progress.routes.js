import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // чтобы соединение не закрывалось
  res.flushHeaders();

  req.on('close', () => {
    res.end();
  });
});

export default router;
