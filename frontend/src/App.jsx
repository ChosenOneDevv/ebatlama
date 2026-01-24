import { useState, useEffect } from 'react'
import { Settings, Play, FileDown, FileUp, FileText, Save, FolderOpen, Edit2, X } from 'lucide-react'
import CutForm from './components/CutForm'
import CutList from './components/CutList'
import ResultView from './components/ResultView'
import SettingsPanel from './components/SettingsPanel'
import { 
  optimizeCuts, generatePDF, exportExcel, importExcel,
  getMaterials, saveProject, getProjects, deleteProject,
  addMaterial as apiAddMaterial, updateMaterial as apiUpdateMaterial, deleteMaterial as apiDeleteMaterial
} from './api'

function App() {
  const [settings, setSettings] = useState({
    stockLength: 6000,
    kerf: 3,
    startOffset: 0,
    endOffset: 0,
    profile: { width: 60, height: 30 }
  })
  
  const [cuts, setCuts] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  
  // Project management
  const [projectName, setProjectName] = useState('Yeni Proje')
  const [projectId, setProjectId] = useState(null)
  const [editingProjectName, setEditingProjectName] = useState(false)
  const [showProjectsModal, setShowProjectsModal] = useState(false)
  const [projects, setProjects] = useState([])
  
  // Materials
  const [materials, setMaterials] = useState([])

  // Load materials on mount
  useEffect(() => {
    loadMaterials()
  }, [])

  const loadMaterials = async () => {
    try {
      const data = await getMaterials()
      setMaterials(data)
    } catch (err) {
      console.error('Malzemeler yüklenemedi:', err)
    }
  }

  const loadProjects = async () => {
    try {
      const data = await getProjects()
      setProjects(data)
    } catch (err) {
      console.error('Projeler yüklenemedi:', err)
    }
  }

  const handleSaveProject = async () => {
    setLoading(true)
    try {
      const project = await saveProject({
        id: projectId,
        name: projectName,
        settings,
        cuts,
        result
      })
      setProjectId(project.id)
      setError(null)
      alert('Proje kaydedildi!')
    } catch (err) {
      setError('Proje kaydedilemedi: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadProject = (project) => {
    setProjectId(project.id)
    setProjectName(project.name)
    setSettings(project.settings)
    setCuts(project.cuts.map((cut, i) => ({ ...cut, id: cut.id || Date.now() + i })))
    setResult(project.result || null)
    setShowProjectsModal(false)
  }

  const handleDeleteProject = async (id) => {
    if (!confirm('Bu projeyi silmek istediğinizden emin misiniz?')) return
    try {
      await deleteProject(id)
      loadProjects()
    } catch (err) {
      setError('Proje silinemedi: ' + err.message)
    }
  }

  const handleNewProject = () => {
    setProjectId(null)
    setProjectName('Yeni Proje')
    setCuts([])
    setResult(null)
    setSettings({
      stockLength: 6000,
      kerf: 3,
      startOffset: 0,
      endOffset: 0,
      profile: { width: 60, height: 30 }
    })
  }

  const handleMaterialsChange = async (newMaterials) => {
    // Sync with backend
    try {
      // Get current materials from backend
      const currentMaterials = await getMaterials()
      const currentIds = currentMaterials.map(m => m.id)
      const newIds = newMaterials.map(m => m.id)
      
      // Delete removed materials
      for (const mat of currentMaterials) {
        if (!newIds.includes(mat.id)) {
          await apiDeleteMaterial(mat.id)
        }
      }
      
      // Add or update materials
      for (const mat of newMaterials) {
        if (currentIds.includes(mat.id)) {
          await apiUpdateMaterial(mat.id, mat)
        } else {
          await apiAddMaterial(mat)
        }
      }
      
      // Reload materials
      await loadMaterials()
    } catch (err) {
      console.error('Malzemeler kaydedilemedi:', err)
      setError('Malzemeler kaydedilemedi')
    }
  }

  const addCut = (cut) => {
    setCuts([...cuts, { ...cut, id: Date.now() }])
    setResult(null)
  }

  const updateCut = (id, updatedCut) => {
    setCuts(cuts.map(c => c.id === id ? { ...updatedCut, id } : c))
    setResult(null)
  }

  const deleteCut = (id) => {
    setCuts(cuts.filter(c => c.id !== id))
    setResult(null)
  }

  const duplicateCut = (cut) => {
    const newCut = { ...cut, id: Date.now() }
    setCuts([...cuts, newCut])
    setResult(null)
  }

  const handleOptimize = async () => {
    if (cuts.length === 0) {
      setError('Lütfen en az bir kesim ekleyin')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const data = await optimizeCuts({
        stockLength: settings.stockLength,
        kerf: settings.kerf,
        startOffset: settings.startOffset || 0,
        endOffset: settings.endOffset || 0,
        profile: settings.profile,
        cuts,
        materials
      })
      setResult(data)
    } catch (err) {
      setError(err.message || 'Optimizasyon hatası')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!result) return
    
    setLoading(true)
    try {
      await generatePDF({
        stockLength: settings.stockLength,
        kerf: settings.kerf,
        startOffset: settings.startOffset || 0,
        endOffset: settings.endOffset || 0,
        profile: settings.profile,
        optimizationResult: result,
        projectName: projectName
      })
    } catch (err) {
      setError(err.message || 'PDF oluşturma hatası')
    } finally {
      setLoading(false)
    }
  }

  const handleExportExcel = async () => {
    setLoading(true)
    try {
      await exportExcel({
        stockLength: settings.stockLength,
        kerf: settings.kerf,
        startOffset: settings.startOffset || 0,
        endOffset: settings.endOffset || 0,
        profile: settings.profile,
        cuts
      })
    } catch (err) {
      setError(err.message || 'Excel dışa aktarma hatası')
    } finally {
      setLoading(false)
    }
  }

  const handleImportExcel = async (file) => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await importExcel(file)
      setSettings({
        stockLength: data.stockLength,
        kerf: data.kerf,
        startOffset: data.startOffset || 0,
        endOffset: data.endOffset || 0,
        profile: data.profile
      })
      setCuts(data.cuts.map((cut, index) => ({ ...cut, id: Date.now() + index })))
      setResult(null)
    } catch (err) {
      setError(err.message || 'Excel içe aktarma hatası')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/TurNestLogoNoBackground.svg" 
                alt="TurNest Logo" 
                className="w-14 h-14"
              />
              <div>
                <h1 className="text-xl font-bold">TurNest</h1>
                {/* Project Name */}
                <div className="flex items-center gap-2">
                  {editingProjectName ? (
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      onBlur={() => setEditingProjectName(false)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingProjectName(false)}
                      className="bg-white/20 text-white text-sm px-2 py-0.5 rounded border-none outline-none"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="text-blue-100 text-sm cursor-pointer hover:text-white flex items-center gap-1"
                      onClick={() => setEditingProjectName(true)}
                    >
                      {projectName}
                      <Edit2 className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Project Actions */}
              <button
                onClick={handleNewProject}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-sm"
                title="Yeni Proje"
              >
                Yeni
              </button>
              <button
                onClick={() => { loadProjects(); setShowProjectsModal(true) }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Projeleri Aç"
              >
                <FolderOpen className="w-5 h-5" />
              </button>
              <button
                onClick={handleSaveProject}
                disabled={loading}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Projeyi Kaydet"
              >
                <Save className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-white/20 mx-1" />
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Ayarlar"
              >
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Projects Modal */}
      {showProjectsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[70vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">Kayıtlı Projeler</h2>
              <button onClick={() => setShowProjectsModal(false)} className="p-2 hover:bg-gray-200 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              {projects.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Henüz kayıtlı proje yok</p>
              ) : (
                <div className="space-y-2">
                  {projects.map((project) => (
                    <div 
                      key={project.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleLoadProject(project)}
                    >
                      <div>
                        <div className="font-medium text-gray-800">{project.name}</div>
                        <div className="text-xs text-gray-500">
                          {project.cuts?.length || 0} kesim • {new Date(project.updatedAt || project.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id) }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Settings Modal */}
        <SettingsPanel 
          isOpen={showSettings}
          settings={settings} 
          materials={materials}
          onChange={setSettings}
          onClose={() => setShowSettings(false)}
          onMaterialsChange={handleMaterialsChange}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Kesim Ekle</h2>
                <div className="flex gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                      onChange={(e) => e.target.files[0] && handleImportExcel(e.target.files[0])}
                    />
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors">
                      <FileUp className="w-4 h-4" />
                      İçe Aktar
                    </span>
                  </label>
                  <button
                    onClick={handleExportExcel}
                    disabled={cuts.length === 0}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    <FileDown className="w-4 h-4" />
                    Dışa Aktar
                  </button>
                </div>
              </div>
              
              <CutForm onAdd={addCut} materials={materials} />
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Kesim Listesi 
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({cuts.length} adet)
                  </span>
                </h2>
              </div>
              
              <CutList 
                cuts={cuts} 
                onUpdate={updateCut} 
                onDelete={deleteCut}
                onDuplicate={duplicateCut}
              />

              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={handleOptimize}
                  disabled={loading || cuts.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                  Optimize Et
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Sonuç</h2>
                {result && (
                  <button
                    onClick={handleDownloadPDF}
                    disabled={loading}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    <FileText className="w-4 h-4" />
                    PDF İndir
                  </button>
                )}
              </div>
              
              <ResultView 
                result={result} 
                settings={settings}
              />
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <h3 className="font-medium text-blue-800 mb-2">Ayarlar</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">Stok Uzunluğu:</span>
                  <span className="ml-2 font-medium">{settings.stockLength} mm</span>
                </div>
                <div>
                  <span className="text-blue-600">Testere Payı:</span>
                  <span className="ml-2 font-medium">{settings.kerf} mm</span>
                </div>
                <div>
                  <span className="text-blue-600">Profil:</span>
                  <span className="ml-2 font-medium">
                    {settings.profile.width}x{settings.profile.height} mm
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-12 py-6 border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          TurNest - Profil Kesim Optimizasyonu © 2026
        </div>
      </footer>
    </div>
  )
}

export default App
