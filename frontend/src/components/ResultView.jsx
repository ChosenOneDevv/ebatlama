/**
 * Açı metnini formatlar
 */
function formatAngleText(angle) {
  if (angle === 90 || angle === -90) return 'Düz'
  return `${angle}°`
}

/**
 * SVG ile açılı kesim çizgisi çizer - PDF'teki gibi
 */
function AngleLine({ angle, plane, isStart, width, height }) {
  if (angle === 90 || angle === -90) return null
  
  const absAngle = Math.abs(angle)
  const isNegative = angle < 0
  const angleRad = (absAngle * Math.PI) / 180
  const maxOffset = width * 0.3
  const offset = Math.min(height / Math.tan(angleRad), maxOffset)
  
  let x1, y1, x2, y2
  
  if (isStart) {
    if (isNegative) {
      x1 = 0; y1 = height
      x2 = offset; y2 = 0
    } else {
      x1 = 0; y1 = 0
      x2 = offset; y2 = height
    }
  } else {
    if (isNegative) {
      x1 = width; y1 = height
      x2 = width - offset; y2 = 0
    } else {
      x1 = width; y1 = 0
      x2 = width - offset; y2 = height
    }
  }
  
  const color = plane === 'V' ? '#c0392b' : '#2980b9'
  const dashArray = plane === 'V' ? '4,2' : 'none'
  
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth="2"
      strokeDasharray={dashArray}
    />
  )
}

/**
 * Tek bir kesim parçası - SVG tabanlı
 */
function CutPiece({ cut, x, width, height, color, index }) {
  const startAngle = Number(cut.startAngle) || 90
  const endAngle = Number(cut.endAngle) || 90
  
  return (
    <g transform={`translate(${x}, 0)`}>
      {/* Ana dikdörtgen */}
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill={color}
        stroke="#333"
        strokeWidth="1"
      />
      
      {/* Başlangıç açı çizgisi */}
      <AngleLine 
        angle={startAngle} 
        plane={cut.startPlane} 
        isStart={true} 
        width={width} 
        height={height} 
      />
      
      {/* Bitiş açı çizgisi */}
      <AngleLine 
        angle={endAngle} 
        plane={cut.endPlane} 
        isStart={false} 
        width={width} 
        height={height} 
      />
      
      {/* Uzunluk etiketi */}
      {width > 35 && (
        <text
          x={width / 2}
          y={height / 2 + 4}
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fill="#333"
        >
          {cut.length}
        </text>
      )}
      
      {/* Parça numarası */}
      <text
        x={width / 2}
        y={-4}
        textAnchor="middle"
        fontSize="9"
        fill="#666"
      >
        #{index + 1}
      </text>
      
      {/* Açı etiketleri - sadece 90° değilse */}
      {startAngle !== 90 && startAngle !== -90 && (
        <text
          x="3"
          y={height + 12}
          fontSize="8"
          fill={cut.startPlane === 'V' ? '#c0392b' : '#2980b9'}
          fontWeight="bold"
        >
          {formatAngleText(startAngle)}
        </text>
      )}
      
      {endAngle !== 90 && endAngle !== -90 && (
        <text
          x={width - 3}
          y={height + 12}
          textAnchor="end"
          fontSize="8"
          fill={cut.endPlane === 'V' ? '#c0392b' : '#2980b9'}
          fontWeight="bold"
        >
          {formatAngleText(endAngle)}
        </text>
      )}
    </g>
  )
}

/**
 * Stok görselleştirmesi - SVG tabanlı, PDF'e benzer
 */
function StockVisual({ stock, stockLength, startOffset = 0, endOffset = 0 }) {
  const svgWidth = 700
  const svgHeight = 80
  const barHeight = 40
  const barY = 20
  const scale = svgWidth / stockLength
  
  const colors = [
    '#3b82f6', '#22c55e', '#ef4444', 
    '#eab308', '#a855f7', '#14b8a6',
    '#f97316', '#ec4899', '#6366f1'
  ]
  
  let currentX = 0
  
  // Baştan pay genişliği
  const startOffsetWidth = startOffset * scale
  // Sondan pay genişliği  
  const endOffsetWidth = endOffset * scale

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="bg-gray-800 text-white text-sm font-bold px-3 py-1 rounded">
            Stok #{stock.stockIndex}
          </span>
          <span className="text-sm text-gray-600">
            {stockLength} mm
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600">
            Kullanılan: <strong className="text-gray-800">{stock.usedLength} mm</strong>
          </span>
          <span className="text-gray-600">
            Fire: <strong className="text-orange-600">{stock.wasteLength} mm</strong>
          </span>
          <span className={`font-bold ${stock.efficiency >= 80 ? 'text-green-600' : 'text-orange-600'}`}>
            %{stock.efficiency}
          </span>
        </div>
      </div>
      
      {/* SVG Görsel */}
      <svg 
        width="100%" 
        height={svgHeight + 20} 
        viewBox={`0 0 ${svgWidth} ${svgHeight + 20}`}
        className="overflow-visible"
      >
        {/* Arka plan çubuğu */}
        <rect
          x="0"
          y={barY}
          width={svgWidth}
          height={barHeight}
          fill="#e5e7eb"
          stroke="#9ca3af"
          strokeWidth="1"
          rx="2"
        />
        
        {/* Baştan pay alanı */}
        {startOffset > 0 && (
          <g>
            <rect
              x="0"
              y={barY}
              width={startOffsetWidth}
              height={barHeight}
              fill="#ffe0b2"
              stroke="#ff9800"
              strokeWidth="1"
            />
          </g>
        )}
        
        {/* Kesim parçaları */}
        <g transform={`translate(0, ${barY})`}>
          {stock.cuts.map((cut, index) => {
            const cutWidth = cut.effectiveLength * scale
            const cutX = startOffsetWidth + (cut.startPosition * scale)
            const color = colors[cut.originalIndex % colors.length]
            
            return (
              <CutPiece
                key={index}
                cut={cut}
                x={cutX}
                width={cutWidth}
                height={barHeight}
                color={color}
                index={index}
              />
            )
          })}
        </g>
        
        {/* Fire alanı */}
        {stock.wasteLength > 0 && (
          <g>
            <rect
              x={svgWidth - endOffsetWidth - (stock.wasteLength * scale)}
              y={barY}
              width={stock.wasteLength * scale}
              height={barHeight}
              fill="#d1d5db"
              stroke="#9ca3af"
              strokeWidth="1"
            />
            {stock.wasteLength * scale > 30 && (
              <text
                x={svgWidth - endOffsetWidth - (stock.wasteLength * scale / 2)}
                y={barY + barHeight / 2 + 4}
                textAnchor="middle"
                fontSize="10"
                fill="#6b7280"
              >
                Fire
              </text>
            )}
          </g>
        )}
        
        {/* Sondan pay alanı */}
        {endOffset > 0 && (
          <g>
            <rect
              x={svgWidth - endOffsetWidth}
              y={barY}
              width={endOffsetWidth}
              height={barHeight}
              fill="#ffe0b2"
              stroke="#ff9800"
              strokeWidth="1"
            />
          </g>
        )}
        
        {/* Ölçek çizgisi */}
        <line x1="0" y1={barY + barHeight + 15} x2={svgWidth} y2={barY + barHeight + 15} stroke="#ccc" strokeWidth="1" />
        <text x="0" y={barY + barHeight + 28} fontSize="9" fill="#999">0</text>
        <text x={svgWidth} y={barY + barHeight + 28} textAnchor="end" fontSize="9" fill="#999">{stockLength}mm</text>
      </svg>
      
      {/* Kesim detayları tablosu */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-1 px-2 text-gray-500 font-medium">#</th>
              <th className="text-left py-1 px-2 text-gray-500 font-medium">Parça</th>
              <th className="text-right py-1 px-2 text-gray-500 font-medium">Uzunluk</th>
              <th className="text-center py-1 px-2 text-gray-500 font-medium">Baş Açı</th>
              <th className="text-center py-1 px-2 text-gray-500 font-medium">Son Açı</th>
              {stock.cuts.some(c => c.notes) && (
                <th className="text-left py-1 px-2 text-gray-500 font-medium">Not</th>
              )}
            </tr>
          </thead>
          <tbody>
            {stock.cuts.map((cut, index) => {
              const color = colors[cut.originalIndex % colors.length]
              const startAngle = cut.startAngle || 90
              const endAngle = cut.endAngle || 90
              
              return (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-1.5 px-2">
                    <span 
                      className="inline-block w-4 h-4 rounded text-white text-center text-[10px] leading-4 font-bold"
                      style={{ backgroundColor: color }}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-1.5 px-2 font-medium text-gray-700">
                    {cut.name || `Parça ${cut.originalIndex + 1}`}
                    {cut.code && <span className="text-gray-400 ml-1">({cut.code})</span>}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono">{cut.length} mm</td>
                  <td className="py-1.5 px-2 text-center">
                    <span className={startAngle !== 90 && startAngle !== -90 ? 'font-medium' : 'text-gray-400'}>
                      {formatAngleText(startAngle)}
                    </span>
                    {startAngle !== 90 && startAngle !== -90 && (
                      <span className={`ml-1 text-[10px] ${cut.startPlane === 'V' ? 'text-red-500' : 'text-blue-500'}`}>
                        {cut.startPlane === 'V' ? 'D' : 'Y'}
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    <span className={endAngle !== 90 && endAngle !== -90 ? 'font-medium' : 'text-gray-400'}>
                      {formatAngleText(endAngle)}
                    </span>
                    {endAngle !== 90 && endAngle !== -90 && (
                      <span className={`ml-1 text-[10px] ${cut.endPlane === 'V' ? 'text-red-500' : 'text-blue-500'}`}>
                        {cut.endPlane === 'V' ? 'D' : 'Y'}
                      </span>
                    )}
                  </td>
                  {stock.cuts.some(c => c.notes) && (
                    <td className="py-1.5 px-2 text-gray-500 truncate max-w-[150px]">{cut.notes || '-'}</td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
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

      {/* Ayarlar özeti */}
      {(settings.startOffset > 0 || settings.endOffset > 0) && (
        <div className="flex items-center gap-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm">
          <span className="text-orange-700 font-medium">Pay Değerleri:</span>
          {settings.startOffset > 0 && (
            <span className="text-orange-600">Baştan: <strong>{settings.startOffset} mm</strong></span>
          )}
          {settings.endOffset > 0 && (
            <span className="text-orange-600">Sondan: <strong>{settings.endOffset} mm</strong></span>
          )}
        </div>
      )}

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-700">Kesim Planı</h3>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-red-600" style={{ borderStyle: 'dashed', borderWidth: '1px 0 0 0', borderColor: '#c0392b' }}></span>
              Dikey kesim
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-blue-600"></span>
              Yatay kesim
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-orange-200 border border-orange-400 rounded-sm"></span>
              Pay alanı
            </span>
          </div>
        </div>
        
        <div className="space-y-4">
          {stocks.map((stock) => (
            <StockVisual 
              key={stock.stockIndex} 
              stock={stock} 
              stockLength={settings.stockLength}
              startOffset={settings.startOffset || 0}
              endOffset={settings.endOffset || 0}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
