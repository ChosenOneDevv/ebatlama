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
 * İki kesimin açılarının uyumlu olup olmadığını kontrol eder
 * Uyumlu açılar yan yana geldiğinde yapışık görünür (kerf hariç)
 * Koşul: Aynı düzlem + açıların toplamı 90° olmalı
 */
function canMatchAngles(cut1End, cut2Start) {
  const angle1 = Number(cut1End.endAngle) || 90;
  const angle2 = Number(cut2Start.startAngle) || 90;
  const plane1 = cut1End.endPlane;
  const plane2 = cut2Start.startPlane;
  
  // İki açı da 90° ise zaten düz kesim, özel eşleşme yok
  if (angle1 === 90 && angle2 === 90) return false;
  
  // Düzlemler aynı olmalı
  if (plane1 !== plane2) return false;
  
  // Açıların toplamı 90° olmalı (örn: 45+45, 30+60, 20+70)
  return (angle1 + angle2) === 90;
}

/**
 * Kesimi ters çevirir (baş ve son açıları değiştirir)
 */
function flipCut(cut) {
  return {
    ...cut,
    startAngle: cut.endAngle,
    endAngle: cut.startAngle,
    startPlane: cut.endPlane,
    endPlane: cut.startPlane,
    flipped: !cut.flipped
  };
}

/**
 * Kesimin simetrik olup olmadığını kontrol eder
 * Simetrik: Baş ve son açılar/yönler aynı ise
 */
function isSymmetricCut(cut) {
  const startAngle = Number(cut.startAngle) || 90;
  const endAngle = Number(cut.endAngle) || 90;
  return startAngle === endAngle && cut.startPlane === cut.endPlane;
}

/**
 * Simetrik kesim için en uygun yönü belirler
 * Önceki kesimin son açısına göre döndürülüp döndürülmeyeceğine karar verir
 */
function orientSymmetricCut(cut, previousCut) {
  if (!isSymmetricCut(cut)) return cut;
  if (!previousCut) return cut;
  
  const prevEndAngle = Number(previousCut.endAngle) || 90;
  const prevEndPlane = previousCut.endPlane;
  const cutAngle = Number(cut.startAngle) || 90;
  const cutPlane = cut.startPlane;
  
  if (prevEndPlane === cutPlane && (prevEndAngle + cutAngle) === 90) {
    return { ...cut, matchedWithPrevious: true };
  }
  
  return cut;
}

/**
 * First Fit Decreasing (FFD) algoritması - Açı eşleşmesi öncelikli
 */
function firstFitDecreasing(cuts, stockLength, kerf) {
  const sortedCuts = [...cuts].sort((a, b) => b.effectiveLength - a.effectiveLength);
  
  const stocks = [];
  const remainingCuts = [...sortedCuts];
  
  while (remainingCuts.length > 0) {
    const cut = remainingCuts.shift();
    
    let placed = false;
    let bestStock = null;
    let bestCut = cut;
    let bestRequiredSpace = Infinity;
    let bestIsMatched = false;
    
    // Mevcut stoklarda uygun yer ara
    for (const stock of stocks) {
      if (stock.cuts.length === 0) continue;
      
      const lastCut = stock.cuts[stock.cuts.length - 1];
      const flippedCut = flipCut(cut);
      
      // Öncelik 1: Açı eşleşmesi (kerf tasarrufu)
      if (canMatchAngles(lastCut, cut)) {
        const matchedRequired = cut.effectiveLength;
        if (stock.remainingLength >= matchedRequired) {
          if (!bestIsMatched || matchedRequired < bestRequiredSpace) {
            bestStock = stock;
            bestCut = { ...cut, matchedWithPrevious: true };
            bestRequiredSpace = matchedRequired;
            bestIsMatched = true;
            placed = true;
          }
        }
      }
      
      if (canMatchAngles(lastCut, flippedCut)) {
        const matchedRequired = flippedCut.effectiveLength;
        if (stock.remainingLength >= matchedRequired) {
          if (!bestIsMatched || matchedRequired < bestRequiredSpace) {
            bestStock = stock;
            bestCut = { ...flippedCut, matchedWithPrevious: true };
            bestRequiredSpace = matchedRequired;
            bestIsMatched = true;
            placed = true;
          }
        }
      }
      
      // Öncelik 2: Normal yerleştirme (eşleşme yoksa)
      if (!bestIsMatched) {
        const normalRequired = cut.effectiveLength + kerf;
        if (stock.remainingLength >= normalRequired && normalRequired < bestRequiredSpace) {
          bestStock = stock;
          bestCut = cut;
          bestRequiredSpace = normalRequired;
          placed = true;
        }
        
        const flippedRequired = flippedCut.effectiveLength + kerf;
        if (stock.remainingLength >= flippedRequired && flippedRequired < bestRequiredSpace) {
          bestStock = stock;
          bestCut = flippedCut;
          bestRequiredSpace = flippedRequired;
          placed = true;
        }
      }
    }
    
    if (placed && bestStock) {
      bestStock.cuts.push(bestCut);
      bestStock.usedLength += bestRequiredSpace;
      bestStock.remainingLength -= bestRequiredSpace;
      
      // Her zaman eşleşen kesim ara (zincirleme eşleşme için)
      tryAddMatchingCuts(remainingCuts, bestStock, kerf);
    } else {
      // Yeni stok aç
      const requiredSpace = cut.effectiveLength;
      if (stockLength >= requiredSpace) {
        const newStock = {
          stockIndex: stocks.length,
          cuts: [cut],
          usedLength: requiredSpace,
          remainingLength: stockLength - requiredSpace,
          stockLength
        };
        stocks.push(newStock);
        
        // Yeni stokta eşleşen kesim var mı kontrol et (ilk kesimden sonra da)
        tryAddMatchingCuts(remainingCuts, newStock, kerf);
      }
    }
  }
  
  return stocks;
}

/**
 * Stoka eşleşen kesimleri eklemeye çalışır
 */
function tryAddMatchingCuts(remainingCuts, stock, kerf) {
  let addedAny = true;
  
  while (addedAny && remainingCuts.length > 0) {
    addedAny = false;
    const lastCut = stock.cuts[stock.cuts.length - 1];
    
    for (let i = 0; i < remainingCuts.length; i++) {
      const candidate = remainingCuts[i];
      const flippedCandidate = flipCut(candidate);
      
      // Normal yönde eşleşme
      if (canMatchAngles(lastCut, candidate)) {
        const required = candidate.effectiveLength;
        if (stock.remainingLength >= required) {
          stock.cuts.push({ ...candidate, matchedWithPrevious: true });
          stock.usedLength += required;
          stock.remainingLength -= required;
          remainingCuts.splice(i, 1);
          addedAny = true;
          break;
        }
      }
      
      // Ters yönde eşleşme
      if (canMatchAngles(lastCut, flippedCandidate)) {
        const required = flippedCandidate.effectiveLength;
        if (stock.remainingLength >= required) {
          stock.cuts.push({ ...flippedCandidate, matchedWithPrevious: true });
          stock.usedLength += required;
          stock.remainingLength -= required;
          remainingCuts.splice(i, 1);
          addedAny = true;
          break;
        }
      }
    }
  }
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
 * Kesimleri malzeme/profil boyutuna göre gruplar
 * Her grup ayrı stoktan kesilir
 */
function groupCutsByMaterial(cuts, defaultProfile, defaultStockLength) {
  const groups = new Map();
  
  cuts.forEach(cut => {
    // Malzeme bilgisi varsa onu kullan, yoksa genel ayarları kullan
    const materialKey = cut.materialId || 'default';
    
    if (!groups.has(materialKey)) {
      groups.set(materialKey, {
        materialId: cut.materialId || null,
        materialName: cut.materialName || 'Genel',
        materialColor: cut.materialColor || null,
        profile: cut.materialId ? {
          width: cut.materialWidth || defaultProfile.width,
          height: cut.materialHeight || defaultProfile.height
        } : defaultProfile,
        stockLength: cut.materialStockLength || defaultStockLength,
        cuts: []
      });
    }
    
    groups.get(materialKey).cuts.push(cut);
  });
  
  return groups;
}

/**
 * Ana optimizasyon fonksiyonu
 * Farklı malzeme/profil boyutları ayrı stoklarda optimize edilir
 */
export function optimizeCuts({ stockLength, kerf, profile, cuts, startOffset = 0, endOffset = 0, materials = [] }) {
  if (!cuts || cuts.length === 0) {
    return {
      stocks: [],
      summary: {
        totalStocks: 0,
        totalCuts: 0,
        totalUsedLength: 0,
        totalWasteLength: 0,
        overallEfficiency: 0
      },
      materialGroups: []
    };
  }
  
  // Kesimlere malzeme bilgilerini ekle
  const cutsWithMaterialInfo = cuts.map(cut => {
    if (cut.materialId && materials.length > 0) {
      const material = materials.find(m => m.id === cut.materialId);
      if (material) {
        return {
          ...cut,
          materialWidth: material.width,
          materialHeight: material.height,
          materialStockLength: material.stockLength,
          materialName: material.name,
          materialColor: material.color
        };
      }
    }
    return cut;
  });
  
  // Kesimleri malzeme/profil boyutuna göre grupla
  const materialGroups = groupCutsByMaterial(cutsWithMaterialInfo, profile, stockLength);
  
  let allStocks = [];
  let stockIndexOffset = 0;
  const groupResults = [];
  
  // Her grup için ayrı optimizasyon yap
  for (const [materialKey, group] of materialGroups) {
    const groupProfile = group.profile;
    const groupStockLength = group.stockLength;
    const effectiveStockLength = groupStockLength - startOffset - endOffset;
    
    const expandedCuts = expandCuts(group.cuts, groupProfile);
    
    // Kesim uzunluğu kontrolü
    for (const cut of expandedCuts) {
      if (cut.effectiveLength > effectiveStockLength) {
        throw new Error(
          `Kesim uzunluğu (${cut.effectiveLength}mm) kullanılabilir stok uzunluğundan (${effectiveStockLength}mm) büyük olamaz (${group.materialName})`
        );
      }
    }
    
    const stocks = firstFitDecreasing(expandedCuts, effectiveStockLength, kerf);
    
    // Stok bilgilerine malzeme ve profil bilgilerini ekle
    stocks.forEach(stock => {
      stock.kerf = kerf;
      stock.startOffset = startOffset;
      stock.endOffset = endOffset;
      stock.materialId = group.materialId;
      stock.materialName = group.materialName;
      stock.materialColor = group.materialColor;
      stock.profile = groupProfile;
      stock.stockLength = groupStockLength;
    });
    
    // Grup sonuçlarını formatla
    const groupResult = formatResults(stocks, groupStockLength);
    
    // Stok indekslerini güncelle (global sıralama için)
    groupResult.stocks.forEach(stock => {
      stock.stockIndex = stockIndexOffset + stock.stockIndex;
      stock.materialId = group.materialId;
      stock.materialName = group.materialName;
      stock.materialColor = group.materialColor;
      stock.profile = groupProfile;
      stock.groupStockLength = groupStockLength;
    });
    
    stockIndexOffset += groupResult.stocks.length;
    allStocks = allStocks.concat(groupResult.stocks);
    
    groupResults.push({
      materialId: group.materialId,
      materialName: group.materialName,
      materialColor: group.materialColor,
      profile: groupProfile,
      stockLength: groupStockLength,
      summary: groupResult.summary
    });
  }
  
  // Genel özet hesapla
  const totalUsed = allStocks.reduce((sum, s) => sum + s.usedLength, 0);
  const totalWaste = allStocks.reduce((sum, s) => sum + s.wasteLength, 0);
  const totalStockLength = allStocks.reduce((sum, s) => sum + (s.groupStockLength || stockLength), 0);
  const overallEfficiency = totalStockLength > 0 ? ((totalUsed / totalStockLength) * 100).toFixed(1) : 0;
  
  return {
    stocks: allStocks,
    summary: {
      totalStocks: allStocks.length,
      totalCuts: allStocks.reduce((sum, s) => sum + s.cuts.length, 0),
      totalUsedLength: Math.round(totalUsed * 100) / 100,
      totalWasteLength: Math.round(totalWaste * 100) / 100,
      overallEfficiency: Number(overallEfficiency)
    },
    materialGroups: groupResults
  };
}
