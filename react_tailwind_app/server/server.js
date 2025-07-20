import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

// SSE endpoint
app.get('/process-file/status', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    res.write(`data: ${JSON.stringify({ progress })}\n\n`);
    if (progress >= 100) {
      clearInterval(interval);
      res.end();
    }
  }, 500);

  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`SSE server running on http://localhost:${PORT}`);
});