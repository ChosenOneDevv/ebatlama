import { Router } from 'express';
import { getProjects, getProject, saveProject, deleteProject } from '../services/dataStore.js';

const router = Router();

// Get all projects
router.get('/', (req, res) => {
  try {
    const projects = getProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Projeler alınamadı', message: error.message });
  }
});

// Get single project
router.get('/:id', (req, res) => {
  try {
    const project = getProject(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Proje bulunamadı' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Proje alınamadı', message: error.message });
  }
});

// Save project (create or update)
router.post('/', (req, res) => {
  try {
    const project = saveProject(req.body);
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Proje kaydedilemedi', message: error.message });
  }
});

// Delete project
router.delete('/:id', (req, res) => {
  try {
    const result = deleteProject(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Proje silinemedi', message: error.message });
  }
});

export default router;
