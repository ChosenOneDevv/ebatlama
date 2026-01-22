import express from 'express';
import cors from 'cors';
import optimizeRoutes from './api/optimize.js';
import pdfRoutes from './api/pdf.js';
import excelRoutes from './api/excel.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/optimize', optimizeRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/excel', excelRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Bir hata oluştu', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Ebatlama API çalışıyor: http://localhost:${PORT}`);
});
