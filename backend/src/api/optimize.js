import { Router } from 'express';
import { optimizeCuts } from '../services/optimizer.js';

const router = Router();

router.post('/', (req, res) => {
  try {
    const { stockLength, kerf, profile, cuts, startOffset, endOffset } = req.body;

    if (!stockLength || !cuts || !Array.isArray(cuts)) {
      return res.status(400).json({ 
        error: 'Geçersiz veri', 
        message: 'stockLength ve cuts dizisi gerekli' 
      });
    }

    const result = optimizeCuts({
      stockLength: Number(stockLength),
      kerf: Number(kerf) || 3,
      profile: profile || { width: 90, height: 50 },
      cuts,
      startOffset: Number(startOffset) || 0,
      endOffset: Number(endOffset) || 0
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Optimizasyon hatası', message: error.message });
  }
});

export default router;
