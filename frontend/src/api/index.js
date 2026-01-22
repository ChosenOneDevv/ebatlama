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
