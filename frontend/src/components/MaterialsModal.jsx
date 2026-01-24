import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Edit2, Check, Package } from 'lucide-react'

export default function MaterialsModal({ isOpen, onClose, materials, onSave }) {
  const [localMaterials, setLocalMaterials] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    code: '',
    width: 60,
    height: 30,
    stockLength: 6000,
    color: '#3b82f6'
  })
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setLocalMaterials([...materials])
    }
  }, [isOpen, materials])

  if (!isOpen) return null

  const handleAdd = () => {
    if (!newMaterial.name.trim()) return
    
    const material = {
      ...newMaterial,
      id: `mat_${Date.now()}`,
      width: Number(newMaterial.width),
      height: Number(newMaterial.height),
      stockLength: Number(newMaterial.stockLength)
    }
    setLocalMaterials([...localMaterials, material])
    setNewMaterial({
      name: '',
      code: '',
      width: 60,
      height: 30,
      stockLength: 6000,
      color: '#3b82f6'
    })
    setShowAddForm(false)
  }

  const handleDelete = (id) => {
    setLocalMaterials(localMaterials.filter(m => m.id !== id))
  }

  const handleUpdate = (id, field, value) => {
    setLocalMaterials(localMaterials.map(m => 
      m.id === id ? { ...m, [field]: field === 'name' || field === 'code' || field === 'color' ? value : Number(value) } : m
    ))
  }

  const handleSave = () => {
    onSave(localMaterials)
    onClose()
  }

  const colors = [
    '#3b82f6', '#22c55e', '#ef4444', '#eab308', '#a855f7',
    '#14b8a6', '#f97316', '#ec4899', '#6366f1', '#84cc16'
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Malzeme Yönetimi</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Materials List */}
          <div className="space-y-2">
            {localMaterials.map((material) => (
              <div 
                key={material.id} 
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border hover:border-blue-300 transition-colors"
              >
                {/* Color indicator */}
                <div 
                  className="w-4 h-10 rounded"
                  style={{ backgroundColor: material.color }}
                />
                
                {editingId === material.id ? (
                  <>
                    <input
                      type="text"
                      value={material.name}
                      onChange={(e) => handleUpdate(material.id, 'name', e.target.value)}
                      className="flex-1 px-2 py-1 border rounded text-sm"
                      placeholder="Malzeme Adı"
                    />
                    <input
                      type="text"
                      value={material.code}
                      onChange={(e) => handleUpdate(material.id, 'code', e.target.value)}
                      className="w-24 px-2 py-1 border rounded text-sm"
                      placeholder="Kod"
                    />
                    <input
                      type="number"
                      value={material.width}
                      onChange={(e) => handleUpdate(material.id, 'width', e.target.value)}
                      className="w-16 px-2 py-1 border rounded text-sm"
                      placeholder="En"
                    />
                    <span className="text-gray-400">x</span>
                    <input
                      type="number"
                      value={material.height}
                      onChange={(e) => handleUpdate(material.id, 'height', e.target.value)}
                      className="w-16 px-2 py-1 border rounded text-sm"
                      placeholder="Boy"
                    />
                    <input
                      type="number"
                      value={material.stockLength}
                      onChange={(e) => handleUpdate(material.id, 'stockLength', e.target.value)}
                      className="w-20 px-2 py-1 border rounded text-sm"
                      placeholder="Stok"
                    />
                    <select
                      value={material.color}
                      onChange={(e) => handleUpdate(material.id, 'color', e.target.value)}
                      className="px-2 py-1 border rounded text-sm"
                    >
                      {colors.map(c => (
                        <option key={c} value={c} style={{ backgroundColor: c }}>{c}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{material.name}</div>
                      <div className="text-xs text-gray-500">{material.code}</div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-mono">{material.width}x{material.height}</span> mm
                    </div>
                    <div className="text-sm text-gray-600">
                      Stok: <span className="font-mono">{material.stockLength}</span> mm
                    </div>
                    <button
                      onClick={() => setEditingId(material.id)}
                      className="p-1.5 text-gray-500 hover:bg-gray-200 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(material.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            ))}

            {localMaterials.length === 0 && !showAddForm && (
              <div className="text-center py-8 text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Henüz malzeme eklenmemiş</p>
              </div>
            )}
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-3">Yeni Malzeme Ekle</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Malzeme Adı *</label>
                  <input
                    type="text"
                    value={newMaterial.name}
                    onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="60x30 Kutu Profil"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Kod</label>
                  <input
                    type="text"
                    value={newMaterial.code}
                    onChange={(e) => setNewMaterial({ ...newMaterial, code: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="KP-6030"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Renk</label>
                  <div className="flex gap-1 flex-wrap">
                    {colors.map(c => (
                      <button
                        key={c}
                        onClick={() => setNewMaterial({ ...newMaterial, color: c })}
                        className={`w-6 h-6 rounded ${newMaterial.color === c ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Genişlik (mm)</label>
                  <input
                    type="number"
                    value={newMaterial.width}
                    onChange={(e) => setNewMaterial({ ...newMaterial, width: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Yükseklik (mm)</label>
                  <input
                    type="number"
                    value={newMaterial.height}
                    onChange={(e) => setNewMaterial({ ...newMaterial, height: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Stok Uzunluğu (mm)</label>
                  <input
                    type="number"
                    value={newMaterial.stockLength}
                    onChange={(e) => setNewMaterial({ ...newMaterial, stockLength: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                >
                  İptal
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!newMaterial.name.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  Ekle
                </button>
              </div>
            </div>
          )}

          {/* Add Button */}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Yeni Malzeme Ekle
            </button>
          )}
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
  )
}
