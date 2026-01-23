import { useState } from 'react'
import { Settings, Plus, Trash2, Play, FileDown, FileUp, FileText } from 'lucide-react'
import CutForm from './components/CutForm'
import CutList from './components/CutList'
import ResultView from './components/ResultView'
import SettingsPanel from './components/SettingsPanel'
import { optimizeCuts, generatePDF, exportExcel, importExcel } from './api'

function App() {
  const [settings, setSettings] = useState({
    stockLength: 6000,
    kerf: 3,
    startOffset: 0,
    endOffset: 0,
    profile: { width: 90, height: 50 }
  })
  
  const [cuts, setCuts] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showSettings, setShowSettings] = useState(false)

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
        cuts
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
        optimizationResult: result
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
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                  <rect x="2" y="6" width="20" height="12" rx="1" opacity="0.3"/>
                  <line x1="8" y1="6" x2="8" y2="18" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2"/>
                  <line x1="14" y1="6" x2="14" y2="18" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold">TurNest</h1>
                <p className="text-blue-100 text-sm">Profil Kesim Optimizasyonu</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Ayarlar"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

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

        {showSettings && (
          <SettingsPanel 
            settings={settings} 
            onChange={setSettings}
            onClose={() => setShowSettings(false)}
          />
        )}

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
              
              <CutForm onAdd={addCut} />
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
          Ebatlama - Profil Kesim Optimizasyonu © 2026
        </div>
      </footer>
    </div>
  )
}

export default App
