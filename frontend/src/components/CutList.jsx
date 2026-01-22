import { Trash2, Edit2, Check, X } from 'lucide-react'
import { useState } from 'react'

function formatAngle(angle, plane) {
  if (angle === 90) return '90°'
  const planeLabel = plane === 'V' ? 'D' : 'Y'
  return `${planeLabel}-${angle}°`
}

function CutItem({ cut, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState(cut)

  const handleSave = () => {
    onUpdate(cut.id, {
      ...editData,
      length: Number(editData.length),
      quantity: Number(editData.quantity),
      startAngle: Number(editData.startAngle),
      endAngle: Number(editData.endAngle)
    })
    setEditing(false)
  }

  const handleCancel = () => {
    setEditData(cut)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
        <div className="grid grid-cols-4 gap-2">
          <input
            type="number"
            value={editData.length}
            onChange={(e) => setEditData({ ...editData, length: e.target.value })}
            className="px-2 py-1 border rounded text-sm"
            placeholder="Uzunluk"
          />
          <input
            type="number"
            value={editData.quantity}
            onChange={(e) => setEditData({ ...editData, quantity: e.target.value })}
            className="px-2 py-1 border rounded text-sm"
            placeholder="Adet"
          />
          <div className="flex gap-1">
            <input
              type="number"
              value={editData.startAngle}
              onChange={(e) => setEditData({ ...editData, startAngle: e.target.value })}
              className="w-12 px-1 py-1 border rounded text-sm"
            />
            <select
              value={editData.startPlane}
              onChange={(e) => setEditData({ ...editData, startPlane: e.target.value })}
              className="px-1 py-1 border rounded text-sm"
            >
              <option value="V">D</option>
              <option value="H">Y</option>
            </select>
          </div>
          <div className="flex gap-1">
            <input
              type="number"
              value={editData.endAngle}
              onChange={(e) => setEditData({ ...editData, endAngle: e.target.value })}
              className="w-12 px-1 py-1 border rounded text-sm"
            />
            <select
              value={editData.endPlane}
              onChange={(e) => setEditData({ ...editData, endPlane: e.target.value })}
              className="px-1 py-1 border rounded text-sm"
            >
              <option value="V">D</option>
              <option value="H">Y</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={handleCancel}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            className="p-1 text-green-600 hover:text-green-700"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
      <div className="flex items-center gap-4">
        <div className="font-medium text-gray-800">
          {cut.length} mm
        </div>
        <div className="text-sm text-gray-500">
          x{cut.quantity}
        </div>
        <div className="flex gap-2 text-xs">
          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded">
            {formatAngle(cut.startAngle, cut.startPlane)}
          </span>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
            {formatAngle(cut.endAngle, cut.endPlane)}
          </span>
        </div>
        {cut.notes && (
          <div className="text-xs text-gray-400 italic">
            {cut.notes}
          </div>
        )}
      </div>
      
      <div className="flex gap-1">
        <button
          onClick={() => setEditing(true)}
          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
          title="Düzenle"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(cut.id)}
          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
          title="Sil"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function CutList({ cuts, onUpdate, onDelete }) {
  if (cuts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>Henüz kesim eklenmedi</p>
        <p className="text-sm mt-1">Yukarıdaki formu kullanarak kesim ekleyin</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-80 overflow-y-auto">
      {cuts.map((cut) => (
        <CutItem
          key={cut.id}
          cut={cut}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
