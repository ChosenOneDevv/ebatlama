import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../../data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const materialsFile = path.join(dataDir, 'materials.json');
const projectsFile = path.join(dataDir, 'projects.json');

// Initialize files if they don't exist
function initFiles() {
  if (!fs.existsSync(materialsFile)) {
    fs.writeFileSync(materialsFile, JSON.stringify({ materials: [] }, null, 2));
  }
  if (!fs.existsSync(projectsFile)) {
    fs.writeFileSync(projectsFile, JSON.stringify({ projects: [] }, null, 2));
  }
}

initFiles();

// ============ MATERIALS ============

export function getMaterials() {
  const data = JSON.parse(fs.readFileSync(materialsFile, 'utf-8'));
  return data.materials;
}

export function addMaterial(material) {
  const data = JSON.parse(fs.readFileSync(materialsFile, 'utf-8'));
  const newMaterial = {
    id: `mat_${Date.now()}`,
    ...material,
    createdAt: new Date().toISOString()
  };
  data.materials.push(newMaterial);
  fs.writeFileSync(materialsFile, JSON.stringify(data, null, 2));
  return newMaterial;
}

export function updateMaterial(id, updates) {
  const data = JSON.parse(fs.readFileSync(materialsFile, 'utf-8'));
  const index = data.materials.findIndex(m => m.id === id);
  if (index === -1) throw new Error('Malzeme bulunamadı');
  
  data.materials[index] = { ...data.materials[index], ...updates, updatedAt: new Date().toISOString() };
  fs.writeFileSync(materialsFile, JSON.stringify(data, null, 2));
  return data.materials[index];
}

export function deleteMaterial(id) {
  const data = JSON.parse(fs.readFileSync(materialsFile, 'utf-8'));
  const index = data.materials.findIndex(m => m.id === id);
  if (index === -1) throw new Error('Malzeme bulunamadı');
  
  data.materials.splice(index, 1);
  fs.writeFileSync(materialsFile, JSON.stringify(data, null, 2));
  return { success: true };
}

// ============ PROJECTS ============

export function getProjects() {
  const data = JSON.parse(fs.readFileSync(projectsFile, 'utf-8'));
  return data.projects.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
}

export function getProject(id) {
  const data = JSON.parse(fs.readFileSync(projectsFile, 'utf-8'));
  return data.projects.find(p => p.id === id);
}

export function saveProject(project) {
  const data = JSON.parse(fs.readFileSync(projectsFile, 'utf-8'));
  
  if (project.id) {
    // Update existing
    const index = data.projects.findIndex(p => p.id === project.id);
    if (index !== -1) {
      data.projects[index] = { ...data.projects[index], ...project, updatedAt: new Date().toISOString() };
      fs.writeFileSync(projectsFile, JSON.stringify(data, null, 2));
      return data.projects[index];
    }
  }
  
  // Create new
  const newProject = {
    id: `proj_${Date.now()}`,
    ...project,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  data.projects.push(newProject);
  fs.writeFileSync(projectsFile, JSON.stringify(data, null, 2));
  return newProject;
}

export function deleteProject(id) {
  const data = JSON.parse(fs.readFileSync(projectsFile, 'utf-8'));
  const index = data.projects.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Proje bulunamadı');
  
  data.projects.splice(index, 1);
  fs.writeFileSync(projectsFile, JSON.stringify(data, null, 2));
  return { success: true };
}
