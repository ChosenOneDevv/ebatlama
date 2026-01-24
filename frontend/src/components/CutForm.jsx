import { useState } from 'react'
import { Plus, Package } from 'lucide-react'

const defaultCut = {
  name: '',
  code: '',
  length: '',
  quantity: 1,
  startAngle: 90,
  startPlane: 'V',
  endAngle: 90,
  endPlane: 'V',
  notes: '',
  materialId: ''
}

export default function CutForm({ onAdd, materials = [] }) {
  const [cut, setCut] = useState(defaultCut)

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!cut.length || Number(cut.length) <= 0) {
      return
    }
    
    const material = materials.find(m => m.id === cut.materialId)
    
    onAdd({
      ...cut,
      length: Number(cut.length),
      quantity: Number(cut.quantity) || 1,
      startAngle: Number(cut.startAngle),
      endAngle: Number(cut.endAngle),
      materialId: cut.materialId || null,
      materialName: material?.name || null,
      materialColor: material?.color || null
    })
    
    setCut(defaultCut)
  }

  const handleChange = (field, value) => {
    setCut(prev => ({ ...prev, [field]: value }))
  }

  const selectedMaterial = materials.find(m => m.id === cut.materialId)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Malzeme Seçimi */}
      {materials.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Package className="w-4 h-4 inline mr-1" />
            Malzeme Seçimi
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleChange('materialId', '')}
              className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                !cut.materialId
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              Genel
            </button>
            {materials.map((material) => (
              <button
                key={material.id}
                type="button"
                onClick={() => handleChange('materialId', material.id)}
                className={`px-3 py-1.5 rounded-lg border text-sm transition-colors flex items-center gap-1.5 ${
                  cut.materialId === material.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <span 
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: material.color }}
                />
                {material.name}
                <span className="text-gray-400 text-xs">({material.width}x{material.height})</span>
              </button>
            ))}
          </div>
          {selectedMaterial && (
            <p className="mt-1 text-xs text-gray-500">
              Seçili: {selectedMaterial.name} - Stok: {selectedMaterial.stockLength}mm
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parça Adı
          </label>
          <input
            type="text"
            value={cut.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Örn: Kasa Profili"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parça Kodu
          </label>
          <input
            type="text"
            value={cut.code}
            onChange={(e) => handleChange('code', e.target.value)}
            placeholder="Örn: KP-001"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Uzunluk (mm) *
          </label>
          <input
            type="number"
            value={cut.length}
            onChange={(e) => handleChange('length', e.target.value)}
            placeholder="Örn: 1500"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adet
          </label>
          <input
            type="number"
            value={cut.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Baş Açı
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={cut.startAngle}
              onChange={(e) => handleChange('startAngle', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="-90"
              max="90"
            />
            <select
              value={cut.startPlane}
              onChange={(e) => handleChange('startPlane', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="V">Dikey</option>
              <option value="H">Yatay</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Son Açı
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={cut.endAngle}
              onChange={(e) => handleChange('endAngle', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="-90"
              max="90"
            />
            <select
              value={cut.endPlane}
              onChange={(e) => handleChange('endPlane', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="V">Dikey</option>
              <option value="H">Yatay</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notlar
        </label>
        <input
          type="text"
          value={cut.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="İsteğe bağlı not..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors"
      >
        <Plus className="w-5 h-5" />
        Kesim Ekle
      </button>
    </form>
  )
}
