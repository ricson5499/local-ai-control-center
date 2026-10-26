const express = require('express');
const apiRouter = require('./routes/api');
const cors = require('cors');

const app = express();
const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 8787);
const FRONTEND_PORT = process.env.FRONTEND_PORT || 4001;

app.disable('x-powered-by');
app.use(cors({origin: `http://127.0.0.1:${FRONTEND_PORT}`}));
app.use(express.json({ limit: '16kb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

app.use('/api', apiRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((error, req, res, next) => {
  const status = error.status || 502;
  const isDev = process.env.NODE_ENV === 'development';
  const message = isDev ? (error.message || 'Request failed') : 'Request failed';
  
  console.error(`[${new Date().toISOString()}] Error:`, error);
  res.status(status).json({ error: message });
});

app.listen(PORT, HOST, () => {
  console.log(`Local AI Control Center API listening on http://${HOST}:${PORT}`);
  console.log('This server binds to localhost by default. Do not expose it publicly.');
});
