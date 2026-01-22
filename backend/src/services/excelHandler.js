import * as XLSX from 'xlsx';

/**
 * Kesim verilerini Excel'e aktarır
 */
export function exportToExcel({ stockLength, kerf, profile, cuts, startOffset = 0, endOffset = 0 }) {
  const workbook = XLSX.utils.book_new();
  
  const settingsData = [
    ['Ayarlar', ''],
    ['Stok Uzunluğu (mm)', stockLength],
    ['Testere Payı (mm)', kerf],
    ['Baştan Pay (mm)', startOffset],
    ['Sondan Pay (mm)', endOffset],
    ['Profil Genişliği (mm)', profile?.width || 90],
    ['Profil Yüksekliği (mm)', profile?.height || 50]
  ];
  
  const settingsSheet = XLSX.utils.aoa_to_sheet(settingsData);
  XLSX.utils.book_append_sheet(workbook, settingsSheet, 'Ayarlar');
  
  const cutsHeader = [
    'Sıra',
    'Parça Adı',
    'Parça Kodu',
    'Uzunluk (mm)',
    'Adet',
    'Baş Açı (°)',
    'Baş Düzlem (Y/D)',
    'Son Açı (°)',
    'Son Düzlem (Y/D)',
    'Notlar'
  ];
  
  const cutsData = [cutsHeader];
  
  cuts.forEach((cut, index) => {
    cutsData.push([
      index + 1,
      cut.name || '',
      cut.code || '',
      cut.length,
      cut.quantity || 1,
      cut.startAngle || 90,
      cut.startPlane === 'V' ? 'D' : 'Y',
      cut.endAngle || 90,
      cut.endPlane === 'V' ? 'D' : 'Y',
      cut.notes || ''
    ]);
  });
  
  const cutsSheet = XLSX.utils.aoa_to_sheet(cutsData);
  
  cutsSheet['!cols'] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 12 },
    { wch: 15 },
    { wch: 8 },
    { wch: 12 },
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
    { wch: 25 }
  ];
  
  XLSX.utils.book_append_sheet(workbook, cutsSheet, 'Kesim Listesi');
  
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
}

/**
 * Excel'den kesim verilerini içe aktarır
 */
export function importFromExcel(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  
  let stockLength = 6000;
  let kerf = 3;
  let startOffset = 0;
  let endOffset = 0;
  let profile = { width: 90, height: 50 };
  
  if (workbook.SheetNames.includes('Ayarlar')) {
    const settingsSheet = workbook.Sheets['Ayarlar'];
    const settingsData = XLSX.utils.sheet_to_json(settingsSheet, { header: 1 });
    
    settingsData.forEach(row => {
      if (row[0] === 'Stok Uzunluğu (mm)') stockLength = Number(row[1]) || 6000;
      if (row[0] === 'Testere Payı (mm)') kerf = Number(row[1]) || 3;
      if (row[0] === 'Baştan Pay (mm)') startOffset = Number(row[1]) || 0;
      if (row[0] === 'Sondan Pay (mm)') endOffset = Number(row[1]) || 0;
      if (row[0] === 'Profil Genişliği (mm)') profile.width = Number(row[1]) || 90;
      if (row[0] === 'Profil Yüksekliği (mm)') profile.height = Number(row[1]) || 50;
    });
  }
  
  const cuts = [];
  
  const cutsSheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('kesim') || name.toLowerCase().includes('cut')
  ) || workbook.SheetNames[workbook.SheetNames.length - 1];
  
  if (cutsSheetName) {
    const cutsSheet = workbook.Sheets[cutsSheetName];
    const cutsData = XLSX.utils.sheet_to_json(cutsSheet, { header: 1 });
    
    for (let i = 1; i < cutsData.length; i++) {
      const row = cutsData[i];
      if (!row || !row[3]) continue;
      
      cuts.push({
        name: row[1] || '',
        code: row[2] || '',
        length: Number(row[3]) || 0,
        quantity: Number(row[4]) || 1,
        startAngle: Number(row[5]) || 90,
        startPlane: row[6] === 'D' ? 'V' : 'H',
        endAngle: Number(row[7]) || 90,
        endPlane: row[8] === 'D' ? 'V' : 'H',
        notes: row[9] || ''
      });
    }
  }
  
  return {
    stockLength,
    kerf,
    startOffset,
    endOffset,
    profile,
    cuts
  };
}
