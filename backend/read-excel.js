import xlsx from 'xlsx';
import { optimizeCuts } from './src/services/optimizer.js';

const wb = xlsx.readFile('c:/Users/clarence/Documents/Projects/ebatlama/test-files/kesim-listesi.xlsx');

const settingsSheet = wb.Sheets['Ayarlar'];
const cutsSheet = wb.Sheets['Kesim Listesi'];

const settingsData = xlsx.utils.sheet_to_json(settingsSheet, { header: 1 });
const cutsData = xlsx.utils.sheet_to_json(cutsSheet, { header: 1 });

const settings = {
  stockLength: settingsData[1][1],
  kerf: settingsData[2][1],
  profile: {
    width: settingsData[3][1],
    height: settingsData[4][1]
  }
};

const cuts = cutsData.slice(1).map(row => ({
  length: row[1],
  quantity: row[2],
  startAngle: row[3],
  startPlane: row[4] === 'D' ? 'V' : 'H',
  endAngle: row[5],
  endPlane: row[6] === 'D' ? 'V' : 'H',
  notes: row[7] || ''
}));

console.log('Ayarlar:', settings);
console.log('\nKesimler:');
cuts.forEach((cut, i) => {
  console.log(`${i+1}. ${cut.length}mm x${cut.quantity} - Baş: ${cut.startPlane}${cut.startAngle}° Son: ${cut.endPlane}${cut.endAngle}°`);
});

console.log('\n=== AÇILI KESİMLER ANALİZİ ===');
cuts.forEach((cut, i) => {
  const startAngle = cut.startAngle;
  const endAngle = cut.endAngle;
  if (startAngle !== 90 || endAngle !== 90) {
    console.log(`${i+1}. ${cut.length}mm x${cut.quantity} - ${cut.startPlane}${startAngle}° -> ${cut.endPlane}${endAngle}°`);
    if (startAngle === endAngle && cut.startPlane === cut.endPlane) {
      console.log(`   ^ SİMETRİK: Son(${endAngle}°) + Baş(${startAngle}°) = ${endAngle + startAngle}° (90 olmalı)`);
    }
  }
});

const result = optimizeCuts({
  ...settings,
  cuts
});

console.log('\n=== OPTİMİZASYON SONUCU ===');
console.log(`Toplam Stok: ${result.summary.totalStocks}`);
console.log(`Toplam Kesim: ${result.summary.totalCuts}`);
console.log(`Verimlilik: %${result.summary.overallEfficiency}`);

result.stocks.forEach(stock => {
  console.log(`\n--- Stok #${stock.stockIndex} (Verim: %${stock.efficiency}) ---`);
  stock.cuts.forEach((cut, i) => {
    const prev = i > 0 ? stock.cuts[i-1] : null;
    let matchStatus = '';
    if (prev) {
      const sum = Number(prev.endAngle) + Number(cut.startAngle);
      const samePlane = prev.endPlane === cut.startPlane;
      matchStatus = `[${prev.endAngle}°+${cut.startAngle}°=${sum} ${samePlane ? 'AYNI DÜZLEM' : 'FARKLI DÜZLEM'}]`;
      if (sum === 90 && samePlane) matchStatus += ' ✓ EŞLEŞMELİ';
    }
    const matched = cut.matchedWithPrevious ? '✓MATCHED' : '';
    console.log(`  ${cut.length}mm - Baş: ${cut.startPlane}${cut.startAngle}° Son: ${cut.endPlane}${cut.endAngle}° ${cut.flipped ? '(TERS)' : ''} ${matched} ${matchStatus}`);
  });
});
