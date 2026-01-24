import axios from 'axios'

const API_BASE = '/api'

export async function optimizeCuts(data) {
  const response = await axios.post(`${API_BASE}/optimize`, data)
  return response.data
}

export async function generatePDF(data) {
  const response = await axios.post(`${API_BASE}/pdf`, data, {
    responseType: 'blob'
  })
  
  const blob = new Blob([response.data], { type: 'application/pdf' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'kesim-plani.pdf'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export async function exportExcel(data) {
  const response = await axios.post(`${API_BASE}/excel/export`, data, {
    responseType: 'blob'
  })
  
  const blob = new Blob([response.data], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'kesim-listesi.xlsx'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export async function importExcel(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await axios.post(`${API_BASE}/excel/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  
  return response.data
}

// ============ MATERIALS ============

export async function getMaterials() {
  const response = await axios.get(`${API_BASE}/materials`)
  return response.data
}

export async function addMaterial(material) {
  const response = await axios.post(`${API_BASE}/materials`, material)
  return response.data
}

export async function updateMaterial(id, material) {
  const response = await axios.put(`${API_BASE}/materials/${id}`, material)
  return response.data
}

export async function deleteMaterial(id) {
  const response = await axios.delete(`${API_BASE}/materials/${id}`)
  return response.data
}

// ============ PROJECTS ============

export async function getProjects() {
  const response = await axios.get(`${API_BASE}/projects`)
  return response.data
}

export async function getProject(id) {
  const response = await axios.get(`${API_BASE}/projects/${id}`)
  return response.data
}

export async function saveProject(project) {
  const response = await axios.post(`${API_BASE}/projects`, project)
  return response.data
}

export async function deleteProject(id) {
  const response = await axios.delete(`${API_BASE}/projects/${id}`)
  return response.data
}
