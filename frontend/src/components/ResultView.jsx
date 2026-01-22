function formatAngle(angle, plane) {
  if (angle === 90) return ''
  const planeLabel = plane === 'V' ? 'D' : 'Y'
  return `${planeLabel}-${angle}°`
}

function getPlaneLabel(plane) {
  return plane === 'V' ? 'Dikey' : 'Yatay'
}

function AngleIndicator({ angle, plane, position }) {
  if (angle === 90) return null
  
  const isLeft = position === 'left'
  const skewAngle = isLeft ? (90 - angle) : -(90 - angle)
  
  return (
    <div 
      className={`absolute top-0 h-full w-3 ${isLeft ? 'left-0' : 'right-0'}`}
      style={{
        background: `linear-gradient(${isLeft ? '' : '-'}${90 - angle}deg, transparent 50%, rgba(0,0,0,0.3) 50%)`,
      }}
    >
      <div 
        className={`absolute ${isLeft ? '-left-1' : '-right-1'} -top-4 text-[9px] font-bold whitespace-nowrap`}
        style={{ color: plane === 'V' ? '#dc2626' : '#2563eb' }}
      >
        {formatAngle(angle, plane)}
      </div>
    </div>
  )
}

function CutBar({ cut, width, left, colorClass, stockLength }) {
  const startAngle = Number(cut.startAngle) || 90
  const endAngle = Number(cut.endAngle) || 90
  const hasStartAngle = startAngle !== 90
  const hasEndAngle = endAngle !== 90

  const clipPath = (() => {
    if (!hasStartAngle && !hasEndAngle) return 'none'
    
    const startOffset = hasStartAngle ? 15 : 0
    const endOffset = hasEndAngle ? 15 : 0
    
    if (hasStartAngle && hasEndAngle) {
      return `polygon(${startOffset}% 0%, 100% 0%, ${100 - endOffset}% 100%, 0% 100%)`
    } else if (hasStartAngle) {
      return `polygon(${startOffset}% 0%, 100% 0%, 100% 100%, 0% 100%)`
    } else if (hasEndAngle) {
      return `polygon(0% 0%, 100% 0%, ${100 - endOffset}% 100%, 0% 100%)`
    }
    return 'none'
  })()

  const startPlaneLabel = cut.startPlane === 'V' ? 'Dikey' : 'Yatay'
  const endPlaneLabel = cut.endPlane === 'V' ? 'Dikey' : 'Yatay'

  return (
    <div
      className={`absolute top-0 h-full ${colorClass} flex items-center justify-center text-white text-xs font-medium overflow-visible`}
      style={{ 
        left: `${left}%`, 
        width: `${width}%`,
        clipPath: clipPath
      }}
      title={`${cut.length}mm - Baş: ${startPlaneLabel} ${startAngle}° / Son: ${endPlaneLabel} ${endAngle}°${cut.flipped ? ' (Ters)' : ''}`}
    >
      <div className="flex flex-col items-center leading-tight">
        {width > 8 && <span className="font-bold">{cut.length}</span>}
      </div>
      
      <div 
        className="absolute left-1 -top-5 text-[8px] font-bold flex flex-col items-start"
        style={{ color: cut.startPlane === 'V' ? '#fca5a5' : '#93c5fd' }}
      >
        <span>{startPlaneLabel}</span>
        <span>{startAngle}°</span>
      </div>
      
      <div 
        className="absolute right-1 -top-5 text-[8px] font-bold flex flex-col items-end"
        style={{ color: cut.endPlane === 'V' ? '#fca5a5' : '#93c5fd' }}
      >
        <span>{endPlaneLabel}</span>
        <span>{endAngle}°</span>
      </div>
      
      {cut.flipped && (
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-orange-400 font-medium">
          ↔ Ters
        </div>
      )}
      
      {cut.matchedWithPrevious && (
        <div className="absolute -bottom-4 left-0 text-[8px] text-green-400 font-medium">
          ✓
        </div>
      )}
    </div>
  )
}

function StockVisual({ stock, stockLength }) {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-red-500', 
    'bg-yellow-500', 'bg-purple-500', 'bg-teal-500'
  ]

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-gray-700">Stok #{stock.stockIndex}</span>
        <span className="text-sm text-gray-500">
          Kullanılan: {stock.usedLength}mm | Fire: {stock.wasteLength}mm | 
          <span className={stock.efficiency >= 80 ? 'text-green-600' : 'text-orange-600'}>
            {' '}%{stock.efficiency}
          </span>
        </span>
      </div>
      
      <div className="relative h-12 bg-gray-200 rounded-lg overflow-visible mt-6 mb-6">
        {stock.cuts.map((cut, index) => {
          const width = (cut.effectiveLength / stockLength) * 100
          const left = (cut.startPosition / stockLength) * 100
          const colorClass = colors[cut.originalIndex % colors.length]
          
          return (
            <CutBar
              key={index}
              cut={cut}
              width={width}
              left={left}
              colorClass={colorClass}
              stockLength={stockLength}
            />
          )
        })}
        
        {stock.wasteLength > 0 && (
          <div
            className="absolute top-0 h-full bg-gray-300 flex items-center justify-center text-gray-500 text-xs rounded-r-lg"
            style={{ 
              right: 0, 
              width: `${(stock.wasteLength / stockLength) * 100}%` 
            }}
          >
            {(stock.wasteLength / stockLength) * 100 > 5 && 'Fire'}
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-1 mt-4">
        {stock.cuts.map((cut, index) => {
          const colorClass = colors[cut.originalIndex % colors.length].replace('bg-', 'text-')
          const startPlane = cut.startPlane === 'V' ? 'D' : 'Y'
          const endPlane = cut.endPlane === 'V' ? 'D' : 'Y'
          const startAngle = cut.startAngle || 90
          const endAngle = cut.endAngle || 90
          
          return (
            <span 
              key={index} 
              className={`text-xs ${colorClass} bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1`}
            >
              <span className="font-medium">{cut.length}mm</span>
              <span className="text-gray-400">
                [{startPlane}{startAngle}° → {endPlane}{endAngle}°]
              </span>
              {cut.flipped && <span className="text-orange-500">↔</span>}
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
