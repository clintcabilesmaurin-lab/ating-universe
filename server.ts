import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import app from './api/index';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Universe Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.NETLIFY && !process.env.LAMBDA_TASK_ROOT && !process.env.VERCEL) {
  startServer();
}

export { app };
export default app;
