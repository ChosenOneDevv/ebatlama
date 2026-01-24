import { Router } from 'express';
import { getMaterials, addMaterial, updateMaterial, deleteMaterial } from '../services/dataStore.js';

const router = Router();

// Get all materials
router.get('/', (req, res) => {
  try {
    const materials = getMaterials();
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: 'Malzemeler alınamadı', message: error.message });
  }
});

// Add new material
router.post('/', (req, res) => {
  try {
    const material = addMaterial(req.body);
    res.json(material);
  } catch (error) {
    res.status(500).json({ error: 'Malzeme eklenemedi', message: error.message });
  }
});

// Update material
router.put('/:id', (req, res) => {
  try {
    const material = updateMaterial(req.params.id, req.body);
    res.json(material);
  } catch (error) {
    res.status(500).json({ error: 'Malzeme güncellenemedi', message: error.message });
  }
});

// Delete material
router.delete('/:id', (req, res) => {
  try {
    const result = deleteMaterial(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Malzeme silinemedi', message: error.message });
  }
});

export default router;
