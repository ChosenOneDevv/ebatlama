import { useState } from 'react'
import { Plus } from 'lucide-react'

const defaultCut = {
  length: '',
  quantity: 1,
  startAngle: 90,
  startPlane: 'V',
  endAngle: 90,
  endPlane: 'V',
  notes: ''
}

export default function CutForm({ onAdd }) {
  const [cut, setCut] = useState(defaultCut)

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!cut.length || Number(cut.length) <= 0) {
      return
    }
    
    onAdd({
      ...cut,
      length: Number(cut.length),
      quantity: Number(cut.quantity) || 1,
      startAngle: Number(cut.startAngle),
      endAngle: Number(cut.endAngle)
    })
    
    setCut(defaultCut)
  }

  const handleChange = (field, value) => {
    setCut(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
              min="0"
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
              min="0"
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
