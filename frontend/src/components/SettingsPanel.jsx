import { X } from 'lucide-react'

export default function SettingsPanel({ settings, onChange, onClose }) {
  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      onChange({
        ...settings,
        [parent]: {
          ...settings[parent],
          [child]: Number(value)
        }
      })
    } else {
      onChange({
        ...settings,
        [field]: Number(value)
      })
    }
  }

  return (
    <div className="mb-6 bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Ayarlar</h2>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stok Uzunluğu (mm)
          </label>
          <input
            type="number"
            value={settings.stockLength}
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
            value={settings.kerf}
            onChange={(e) => handleChange('kerf', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            step="0.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Profil Genişliği (mm)
          </label>
          <input
            type="number"
            value={settings.profile.width}
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
            value={settings.profile.height}
            onChange={(e) => handleChange('profile.height', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1"
          />
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Profil Boyutu:</strong> {settings.profile.width}x{settings.profile.height} mm
          <br />
          <span className="text-xs text-blue-500">
            Dikey kesim: {settings.profile.height}mm kısımdan | 
            Yatay kesim: {settings.profile.width}mm kısımdan
          </span>
        </p>
      </div>
    </div>
  )
}
