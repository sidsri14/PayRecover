import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import monitorRoutes from './routes/monitor.routes';
import { errorHandler } from './middleware/error.middleware';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/monitors', monitorRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.send('API Monitoring SaaS Backend is running.');
});

// Serve frontend static files in production
const distPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(distPath));

// Fallback all unknown routes to the React index.html for CSR
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
