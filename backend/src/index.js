import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import optimizeRoutes from './api/optimize.js';
import pdfRoutes from './api/pdf.js';
import excelRoutes from './api/excel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/optimize', optimizeRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/excel', excelRoutes);

if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, '../public');
  app.use(express.static(staticPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Bir hata oluştu', message: err.message });
});

app.listen(PORT, () => {
  console.log(`TurNest API çalışıyor: http://localhost:${PORT}`);
});
