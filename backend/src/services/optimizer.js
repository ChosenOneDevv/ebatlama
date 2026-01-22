/**
 * Profil Kesim Optimizasyonu - First Fit Decreasing (FFD) Algoritması
 * Cutting Stock Problem (1D Bin Packing) çözümü
 */

/**
 * Açıların uyumlu olup olmadığını kontrol eder
 * Uyumlu açılar: 45+45=90, 60+30=90, 0+90=90, vb.
 */
function areAnglesCompatible(angle1, angle2) {
  const sum = angle1 + angle2;
  return sum === 90;
}

/**
 * Kesim için gerçek uzunluğu hesaplar
 * Açılar uyumluysa açılı hesaplama, değilse düz kesim
 */
function calculateEffectiveLength(cut, profile) {
  const baseLength = Number(cut.length);
  
  const startAngle = Number(cut.startAngle) || 90;
  const endAngle = Number(cut.endAngle) || 90;
  
  if (startAngle === 90 && endAngle === 90) {
    return baseLength;
  }
  
  let extraLength = 0;
  
  if (startAngle !== 90) {
    const dimension = cut.startPlane === 'V' ? profile.height : profile.width;
    if (startAngle > 0 && startAngle < 90) {
      extraLength += dimension / Math.tan((startAngle * Math.PI) / 180);
    }
  }
  
  if (endAngle !== 90) {
    const dimension = cut.endPlane === 'V' ? profile.height : profile.width;
    if (endAngle > 0 && endAngle < 90) {
      extraLength += dimension / Math.tan((endAngle * Math.PI) / 180);
    }
  }
  
  return baseLength + extraLength;
}

/**
 * Kesim listesini genişletir (quantity'ye göre)
 */
function expandCuts(cuts, profile) {
  const expanded = [];
  
  cuts.forEach((cut, index) => {
    const quantity = Number(cut.quantity) || 1;
    const effectiveLength = calculateEffectiveLength(cut, profile);
    
    for (let i = 0; i < quantity; i++) {
      expanded.push({
        ...cut,
        originalIndex: index,
        instanceIndex: i,
        effectiveLength,
        id: cut.id || `cut-${index}-${i}`
      });
    }
  });
  
  return expanded;
}

/**
 * First Fit Decreasing (FFD) algoritması
 */
function firstFitDecreasing(cuts, stockLength, kerf) {
  const sortedCuts = [...cuts].sort((a, b) => b.effectiveLength - a.effectiveLength);
  
  const stocks = [];
  
  for (const cut of sortedCuts) {
    let placed = false;
    
    for (const stock of stocks) {
      const requiredSpace = cut.effectiveLength + (stock.cuts.length > 0 ? kerf : 0);
      
      if (stock.remainingLength >= requiredSpace) {
        stock.cuts.push(cut);
        stock.usedLength += requiredSpace;
        stock.remainingLength -= requiredSpace;
        placed = true;
        break;
      }
    }
    
    if (!placed) {
      stocks.push({
        stockIndex: stocks.length,
        cuts: [cut],
        usedLength: cut.effectiveLength,
        remainingLength: stockLength - cut.effectiveLength,
        stockLength
      });
    }
  }
  
  return stocks;
}

/**
 * Sonuçları düzenle ve özet oluştur
 */
function formatResults(stocks, stockLength) {
  const formattedStocks = stocks.map((stock, index) => {
    const wasteLength = stock.remainingLength;
    const efficiency = ((stock.usedLength / stockLength) * 100).toFixed(1);
    
    const sortedCuts = [...stock.cuts].sort((a, b) => {
      if (a.originalIndex !== b.originalIndex) {
        return a.originalIndex - b.originalIndex;
      }
      return a.instanceIndex - b.instanceIndex;
    });
    
    let currentPosition = 0;
    const cutsWithPositions = sortedCuts.map((cut, cutIndex) => {
      const startPosition = currentPosition;
      const endPosition = startPosition + cut.effectiveLength;
      currentPosition = endPosition + (cutIndex < sortedCuts.length - 1 ? stocks[0]?.kerf || 3 : 0);
      
      return {
        ...cut,
        startPosition: Math.round(startPosition * 100) / 100,
        endPosition: Math.round(endPosition * 100) / 100
      };
    });
    
    return {
      stockIndex: index + 1,
      cuts: cutsWithPositions,
      usedLength: Math.round(stock.usedLength * 100) / 100,
      wasteLength: Math.round(wasteLength * 100) / 100,
      efficiency: Number(efficiency)
    };
  });
  
  const totalUsed = formattedStocks.reduce((sum, s) => sum + s.usedLength, 0);
  const totalWaste = formattedStocks.reduce((sum, s) => sum + s.wasteLength, 0);
  const totalStockLength = formattedStocks.length * stockLength;
  const overallEfficiency = ((totalUsed / totalStockLength) * 100).toFixed(1);
  
  return {
    stocks: formattedStocks,
    summary: {
      totalStocks: formattedStocks.length,
      totalCuts: formattedStocks.reduce((sum, s) => sum + s.cuts.length, 0),
      totalUsedLength: Math.round(totalUsed * 100) / 100,
      totalWasteLength: Math.round(totalWaste * 100) / 100,
      overallEfficiency: Number(overallEfficiency)
    }
  };
}

/**
 * Ana optimizasyon fonksiyonu
 */
export function optimizeCuts({ stockLength, kerf, profile, cuts }) {
  if (!cuts || cuts.length === 0) {
    return {
      stocks: [],
      summary: {
        totalStocks: 0,
        totalCuts: 0,
        totalUsedLength: 0,
        totalWasteLength: 0,
        overallEfficiency: 0
      }
    };
  }
  
  const expandedCuts = expandCuts(cuts, profile);
  
  for (const cut of expandedCuts) {
    if (cut.effectiveLength > stockLength) {
      throw new Error(
        `Kesim uzunluğu (${cut.effectiveLength}mm) stok uzunluğundan (${stockLength}mm) büyük olamaz`
      );
    }
  }
  
  const stocks = firstFitDecreasing(expandedCuts, stockLength, kerf);
  
  stocks.forEach(stock => {
    stock.kerf = kerf;
  });
  
  return formatResults(stocks, stockLength);
}
