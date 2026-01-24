import { Trash2, Edit2, Check, X, Copy } from 'lucide-react'
import { useState } from 'react'

function formatAngle(angle, plane) {
  if (angle === 90 || angle === -90) return 'Düz'
  const planeLabel = plane === 'V' ? 'D' : 'Y'
  return `${planeLabel}${angle}°`
}

function EditableCell({ value, onChange, type = 'text', className = '', min, max, step }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-2 py-1.5 border border-blue-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      min={min}
      max={max}
      step={step}
    />
  )
}

function CutRow({ cut, index, onUpdate, onDelete, onDuplicate, isEditing, onStartEdit, onCancelEdit }) {
  const [editData, setEditData] = useState(cut)

  const handleSave = () => {
    onUpdate(cut.id, {
      ...editData,
      length: Number(editData.length),
      quantity: Number(editData.quantity),
      startAngle: Number(editData.startAngle),
      endAngle: Number(editData.endAngle)
    })
    onCancelEdit()
  }

  const handleCancel = () => {
    setEditData(cut)
    onCancelEdit()
  }

  const startEdit = () => {
    setEditData(cut)
    onStartEdit()
  }

  if (isEditing) {
    return (
      <tr className="bg-blue-50">
        <td className="px-3 py-2 text-center text-gray-500 text-sm">{index + 1}</td>
        <td className="px-2 py-2">
          {cut.materialColor ? (
            <span 
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: cut.materialColor }}
            />
          ) : (
            <span className="text-gray-300 text-xs">-</span>
          )}
        </td>
        <td className="px-2 py-2">
          <input
            type="text"
            value={editData.name || ''}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            className="w-full px-2 py-1.5 border border-blue-300 rounded text-sm"
            placeholder="Ad"
          />
        </td>
        <td className="px-2 py-2">
          <input
            type="text"
            value={editData.code || ''}
            onChange={(e) => setEditData({ ...editData, code: e.target.value })}
            className="w-full px-2 py-1.5 border border-blue-300 rounded text-sm"
            placeholder="Kod"
          />
        </td>
        <td className="px-2 py-2">
          <EditableCell
            type="number"
            value={editData.length}
            onChange={(v) => setEditData({ ...editData, length: v })}
            min={1}
          />
        </td>
        <td className="px-2 py-2">
          <EditableCell
            type="number"
            value={editData.quantity}
            onChange={(v) => setEditData({ ...editData, quantity: v })}
            min={1}
          />
        </td>
        <td className="px-2 py-2">
          <div className="flex gap-1">
            <input
              type="number"
              value={editData.startAngle}
              onChange={(e) => setEditData({ ...editData, startAngle: e.target.value })}
              className="w-14 px-1 py-1.5 border border-blue-300 rounded text-sm"
              min={-90}
              max={90}
            />
            <select
              value={editData.startPlane}
              onChange={(e) => setEditData({ ...editData, startPlane: e.target.value })}
              className="px-1 py-1.5 border border-blue-300 rounded text-sm bg-white"
            >
              <option value="V">D</option>
              <option value="H">Y</option>
            </select>
          </div>
        </td>
        <td className="px-2 py-2">
          <div className="flex gap-1">
            <input
              type="number"
              value={editData.endAngle}
              onChange={(e) => setEditData({ ...editData, endAngle: e.target.value })}
              className="w-14 px-1 py-1.5 border border-blue-300 rounded text-sm"
              min={-90}
              max={90}
            />
            <select
              value={editData.endPlane}
              onChange={(e) => setEditData({ ...editData, endPlane: e.target.value })}
              className="px-1 py-1.5 border border-blue-300 rounded text-sm bg-white"
            >
              <option value="V">D</option>
              <option value="H">Y</option>
            </select>
          </div>
        </td>
        <td className="px-2 py-2">
          <div className="flex justify-center gap-1">
            <button
              onClick={handleSave}
              className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
              title="Kaydet"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"
              title="İptal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
      <td className="px-3 py-2.5 text-center text-gray-400 text-sm font-medium">{index + 1}</td>
      <td className="px-3 py-2.5">
        {cut.materialColor ? (
          <span 
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: cut.materialColor }}
            title={cut.materialName || 'Malzeme'}
          />
        ) : (
          <span className="text-gray-300 text-xs">-</span>
        )}
      </td>
      <td className="px-3 py-2.5 text-gray-800 text-sm max-w-[100px] truncate" title={cut.name}>
        {cut.name || '-'}
      </td>
      <td className="px-3 py-2.5 text-gray-600 text-xs font-mono" title={cut.code}>
        {cut.code || '-'}
      </td>
      <td className="px-3 py-2.5 font-semibold text-gray-800">{cut.length} mm</td>
      <td className="px-3 py-2.5 text-center">
        <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
          {cut.quantity}
        </span>
      </td>
      <td className="px-3 py-2.5">
        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
          cut.startPlane === 'V' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {formatAngle(cut.startAngle, cut.startPlane)}
        </span>
      </td>
      <td className="px-3 py-2.5">
        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
          cut.endPlane === 'V' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {formatAngle(cut.endAngle, cut.endPlane)}
        </span>
      </td>
      <td className="px-2 py-2.5">
        <div className="flex justify-center gap-0.5">
          <button
            onClick={startEdit}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Düzenle"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDuplicate(cut)}
            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
            title="Kopyala"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(cut.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function CutList({ cuts, onUpdate, onDelete, onDuplicate }) {
  const [editingId, setEditingId] = useState(null)

  if (cuts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="font-medium">Henüz kesim eklenmedi</p>
        <p className="text-sm mt-1">Yukarıdaki formu kullanarak kesim ekleyin veya Excel dosyası içe aktarın</p>
      </div>
    )
  }

  const totalPieces = cuts.reduce((sum, cut) => sum + (cut.quantity || 1), 0)
  const totalLength = cuts.reduce((sum, cut) => sum + (cut.length * (cut.quantity || 1)), 0)

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-10">#</th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-8" title="Malzeme">M</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ad</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kod</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Uzunluk</th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-14">Adet</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Baş</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Son</th>
              <th className="px-2 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">İşlem</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {cuts.map((cut, index) => (
              <CutRow
                key={cut.id}
                cut={cut}
                index={index}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                isEditing={editingId === cut.id}
                onStartEdit={() => setEditingId(cut.id)}
                onCancelEdit={() => setEditingId(null)}
              />
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-3 flex justify-between items-center text-sm text-gray-500 px-1">
        <span>{cuts.length} farklı kesim</span>
        <span className="font-medium text-gray-700">Toplam: {totalPieces} parça ({(totalLength / 1000).toFixed(2)} m)</span>
      </div>
    </div>
  )
}
