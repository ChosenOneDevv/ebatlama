import { useState, useEffect } from 'react'
import { X, Settings, Package } from 'lucide-react'
import MaterialsModal from './MaterialsModal'

export default function SettingsPanel({ isOpen, settings, materials, onChange, onClose, onMaterialsChange }) {
  const [showMaterialsModal, setShowMaterialsModal] = useState(false)
  const [localSettings, setLocalSettings] = useState(settings)

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings)
    }
  }, [isOpen, settings])

  if (!isOpen) return null

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setLocalSettings({
        ...localSettings,
        [parent]: {
          ...localSettings[parent],
          [child]: Number(value)
        }
      })
    } else {
      setLocalSettings({
        ...localSettings,
        [field]: Number(value)
      })
    }
  }

  const handleSave = () => {
    onChange(localSettings)
    onClose()
  }

  const handleMaterialSelect = (material) => {
    setLocalSettings({
      ...localSettings,
      stockLength: material.stockLength,
      profile: {
        width: material.width,
        height: material.height
      }
    })
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">Ayarlar</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Material Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Hızlı Malzeme Seçimi
                </label>
                <button
                  onClick={() => setShowMaterialsModal(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Package className="w-4 h-4" />
                  Malzemeleri Yönet
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {materials.map((material) => (
                  <button
                    key={material.id}
                    onClick={() => handleMaterialSelect(material)}
                    className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                      localSettings.profile.width === material.width && 
                      localSettings.profile.height === material.height
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div 
                      className="w-3 h-3 rounded-full inline-block mr-2"
                      style={{ backgroundColor: material.color }}
                    />
                    {material.name}
                    <span className="text-gray-400 ml-1">({material.width}x{material.height})</span>
                  </button>
                ))}
                {materials.length === 0 && (
                  <p className="text-gray-400 text-sm">Henüz malzeme eklenmemiş</p>
                )}
              </div>
            </div>

            <hr className="my-4" />

            {/* Manual Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stok Uzunluğu (mm)
                </label>
                <input
                  type="number"
                  value={localSettings.stockLength}
                  onChange={(e) => handleChange('stockLength', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Testere Payı (mm)
                </label>
                <input
                  type="number"
                  value={localSettings.kerf}
                  onChange={(e) => handleChange('kerf', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Baştan Pay (mm)
                </label>
                <input
                  type="number"
                  value={localSettings.startOffset || 0}
                  onChange={(e) => handleChange('startOffset', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sondan Pay (mm)
                </label>
                <input
                  type="number"
                  value={localSettings.endOffset || 0}
                  onChange={(e) => handleChange('endOffset', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profil Genişliği (mm)
                </label>
                <input
                  type="number"
                  value={localSettings.profile.width}
                  onChange={(e) => handleChange('profile.width', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profil Yüksekliği (mm)
                </label>
                <input
                  type="number"
                  value={localSettings.profile.height}
                  onChange={(e) => handleChange('profile.height', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Profil Boyutu:</strong> {localSettings.profile.width}x{localSettings.profile.height} mm
                <br />
                <span className="text-xs text-blue-500">
                  Dikey kesim: {localSettings.profile.height}mm kısımdan | 
                  Yatay kesim: {localSettings.profile.width}mm kısımdan
                </span>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>

      {/* Materials Modal */}
      <MaterialsModal
        isOpen={showMaterialsModal}
        onClose={() => setShowMaterialsModal(false)}
        materials={materials}
        onSave={onMaterialsChange}
      />
    </>
  )
}
