import express from 'express';
import cors from 'cors';
import apiRouter from '../server/routes';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount all API routes on /api
app.use('/api', apiRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    environment: 'vercel_serverless',
    timestamp: new Date().toISOString()
  });
});

export default app;
