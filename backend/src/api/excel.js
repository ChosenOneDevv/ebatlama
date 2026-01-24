import { Router } from 'express';
import multer from 'multer';
import { exportToExcel, importFromExcel } from '../services/excelHandler.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/export', (req, res) => {
  try {
    const { stockLength, kerf, profile, cuts, startOffset, endOffset } = req.body;

    const excelBuffer = exportToExcel({
      stockLength,
      kerf,
      profile,
      cuts,
      startOffset: Number(startOffset) || 0,
      endOffset: Number(endOffset) || 0
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=kesim-listesi.xlsx');
    res.send(excelBuffer);
  } catch (error) {
    res.status(500).json({ error: 'Excel dışa aktarma hatası', message: error.message });
  }
});

router.post('/import', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Dosya gerekli' });
    }

    console.log('Excel import - file received:', req.file.originalname, req.file.size, 'bytes');
    const data = importFromExcel(req.file.buffer);
    console.log('Excel import - success:', data.cuts.length, 'cuts imported');
    res.json(data);
  } catch (error) {
    console.error('Excel import error:', error);
    res.status(500).json({ error: 'Excel içe aktarma hatası', message: error.message });
  }
});

export default router;
