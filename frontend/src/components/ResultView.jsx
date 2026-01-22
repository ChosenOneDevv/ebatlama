function formatAngle(angle, plane) {
  if (angle === 90) return ''
  const planeLabel = plane === 'V' ? 'D' : 'Y'
  return `${planeLabel}-${angle}°`
}

function StockVisual({ stock, stockLength }) {
  const scale = 100 / stockLength
  
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-red-500', 
    'bg-yellow-500', 'bg-purple-500', 'bg-teal-500'
  ]

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-gray-700">Stok #{stock.stockIndex}</span>
        <span className="text-sm text-gray-500">
          Kullanılan: {stock.usedLength}mm | Fire: {stock.wasteLength}mm | 
          <span className={stock.efficiency >= 80 ? 'text-green-600' : 'text-orange-600'}>
            {' '}%{stock.efficiency}
          </span>
        </span>
      </div>
      
      <div className="relative h-10 bg-gray-200 rounded-lg overflow-hidden">
        {stock.cuts.map((cut, index) => {
          const width = (cut.effectiveLength / stockLength) * 100
          const left = (cut.startPosition / stockLength) * 100
          const colorClass = colors[cut.originalIndex % colors.length]
          
          return (
            <div
              key={index}
              className={`absolute top-0 h-full ${colorClass} flex items-center justify-center text-white text-xs font-medium border-r border-white/30`}
              style={{ left: `${left}%`, width: `${width}%` }}
              title={`${cut.length}mm - ${formatAngle(cut.startAngle, cut.startPlane) || '90°'} / ${formatAngle(cut.endAngle, cut.endPlane) || '90°'}`}
            >
              {width > 8 && <span>{cut.length}</span>}
            </div>
          )
        })}
        
        {stock.wasteLength > 0 && (
          <div
            className="absolute top-0 h-full bg-gray-300 flex items-center justify-center text-gray-500 text-xs"
            style={{ 
              right: 0, 
              width: `${(stock.wasteLength / stockLength) * 100}%` 
            }}
          >
            {(stock.wasteLength / stockLength) * 100 > 5 && 'Fire'}
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-1 mt-2">
        {stock.cuts.map((cut, index) => {
          const colorClass = colors[cut.originalIndex % colors.length].replace('bg-', 'text-')
          const startAngle = formatAngle(cut.startAngle, cut.startPlane)
          const endAngle = formatAngle(cut.endAngle, cut.endPlane)
          
          return (
            <span 
              key={index} 
              className={`text-xs ${colorClass} bg-gray-100 px-1.5 py-0.5 rounded`}
            >
              {cut.length}mm
              {(startAngle || endAngle) && (
                <span className="text-gray-400 ml-1">
                  ({startAngle || '90°'}/{endAngle || '90°'})
                </span>
              )}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export default function ResultView({ result, settings }) {
  if (!result) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="text-4xl mb-3">📊</div>
        <p>Kesim listesini girdikten sonra</p>
        <p className="text-sm mt-1">"Optimize Et" butonuna tıklayın</p>
      </div>
    )
  }

  const { stocks, summary } = result

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{summary.totalStocks}</div>
          <div className="text-xs text-blue-500">Stok Adedi</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{summary.totalCuts}</div>
          <div className="text-xs text-green-500">Kesim Adedi</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">%{summary.overallEfficiency}</div>
          <div className="text-xs text-purple-500">Verimlilik</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-orange-600">{summary.totalWasteLength}</div>
          <div className="text-xs text-orange-500">Toplam Fire (mm)</div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium text-gray-700 mb-4">Kesim Planı</h3>
        
        <div className="space-y-4">
          {stocks.map((stock) => (
            <StockVisual 
              key={stock.stockIndex} 
              stock={stock} 
              stockLength={settings.stockLength}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
