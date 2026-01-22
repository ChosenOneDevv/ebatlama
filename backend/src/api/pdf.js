import { Router } from 'express';
import { generatePDF } from '../services/pdfGenerator.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { stockLength, kerf, profile, optimizationResult } = req.body;

    if (!optimizationResult || !optimizationResult.stocks) {
      return res.status(400).json({ 
        error: 'Geçersiz veri', 
        message: 'optimizationResult gerekli' 
      });
    }

    const pdfBuffer = await generatePDF({
      stockLength: Number(stockLength),
      kerf: Number(kerf) || 3,
      profile: profile || { width: 90, height: 50 },
      stocks: optimizationResult.stocks,
      summary: optimizationResult.summary
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=kesim-plani.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: 'PDF oluşturma hatası', message: error.message });
  }
});

export default router;
