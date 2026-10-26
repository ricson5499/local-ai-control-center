const express = require('express');
const apiRouter = require('./routes/api');
const cors = require('cors');

const app = express();
const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 8787);

app.disable('x-powered-by');
app.use(cors({origin: 'http://127.0.0.1:4001'}));
app.use(express.json({ limit: '16kb' }));
app.use('/api', apiRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((error, req, res, next) => {
  const status = error.status || 502;
  res.status(status).json({
    error: error.message || 'Request failed'
  });
});

app.listen(PORT, HOST, () => {
  console.log(`Local AI Control Center API listening on http://${HOST}:${PORT}`);
  console.log('This server binds to localhost by default. Do not expose it publicly.');
});
