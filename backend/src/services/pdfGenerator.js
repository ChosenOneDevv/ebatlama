import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FONT_PATH = path.join(__dirname, '../fonts/Roboto-Regular.ttf');
const FONT_BOLD_PATH = path.join(__dirname, '../fonts/Roboto-Bold.ttf');

/**
 * Aynı kesim düzenine sahip stokları gruplar
 */
function groupIdenticalStocks(stocks) {
  const groups = [];
  
  for (const stock of stocks) {
    const signature = stock.cuts.map(cut => 
      `${cut.length}-${cut.startAngle}-${cut.startPlane}-${cut.endAngle}-${cut.endPlane}`
    ).join('|');
    
    const existingGroup = groups.find(g => g.signature === signature);
    
    if (existingGroup) {
      existingGroup.count++;
    } else {
      groups.push({
        signature,
        stock: { ...stock, stockIndex: groups.length + 1 },
        count: 1
      });
    }
  }
  
  return groups;
}

/**
 * Açı notasyonunu oluşturur
 * Y-45° (Yatay 45°), D-60° (Dikey 60°)
 */
function formatAngle(angle, plane) {
  if (angle === 90) return '';
  const planeLabel = plane === 'V' ? 'D' : 'Y';
  return `${planeLabel}-${angle}°`;
}

/**
 * Profil kesimini çizer (her zaman dikey pozisyonda)
 */
function drawProfile(doc, x, y, width, height, cut, scale) {
  const drawWidth = width * scale;
  const drawHeight = height * scale;
  
  doc.save();
  
  doc.rect(x, y, drawWidth, drawHeight)
     .stroke('#333');
  
  const startAngle = Number(cut.startAngle) || 90;
  const endAngle = Number(cut.endAngle) || 90;
  
  if (startAngle !== 90) {
    doc.save();
    doc.moveTo(x, y);
    
    if (cut.startPlane === 'V') {
      const offset = drawHeight / Math.tan((startAngle * Math.PI) / 180);
      doc.lineTo(x + Math.min(offset, drawWidth), y + drawHeight);
    } else {
      const offset = drawWidth / Math.tan((startAngle * Math.PI) / 180);
      doc.lineTo(x + drawWidth, y + Math.min(offset, drawHeight));
    }
    
    doc.stroke('#e74c3c');
    doc.restore();
    
    const angleText = formatAngle(startAngle, cut.startPlane);
    if (angleText) {
      doc.fontSize(7)
         .fillColor('#e74c3c')
         .text(angleText, x - 5, y - 12, { width: 40, align: 'left' });
    }
  }
  
  if (endAngle !== 90) {
    doc.save();
    doc.moveTo(x + drawWidth, y);
    
    if (cut.endPlane === 'V') {
      const offset = drawHeight / Math.tan((endAngle * Math.PI) / 180);
      doc.lineTo(x + drawWidth - Math.min(offset, drawWidth), y + drawHeight);
    } else {
      const offset = drawWidth / Math.tan((endAngle * Math.PI) / 180);
      doc.lineTo(x, y + Math.min(offset, drawHeight));
    }
    
    doc.stroke('#3498db');
    doc.restore();
    
    const angleText = formatAngle(endAngle, cut.endPlane);
    if (angleText) {
      doc.fontSize(7)
         .fillColor('#3498db')
         .text(angleText, x + drawWidth - 35, y - 12, { width: 40, align: 'right' });
    }
  }
  
  doc.restore();
}

/**
 * Açılı kesim çizgisi çizer
 * Yatay kesim: düz çizgi
 * Dikey kesim: kesikli çizgi
 */
function drawAngleLine(doc, x, y, width, height, angle, plane, isStart) {
  if (angle === 90) return;
  
  doc.save();
  
  const angleRad = (angle * Math.PI) / 180;
  
  if (isStart) {
    doc.moveTo(x, y);
    if (plane === 'V') {
      const offset = height / Math.tan(angleRad);
      doc.lineTo(x + Math.min(offset, width * 0.3), y + height);
    } else {
      const offset = width * 0.15;
      doc.lineTo(x + offset, y + height);
    }
  } else {
    doc.moveTo(x + width, y);
    if (plane === 'V') {
      const offset = height / Math.tan(angleRad);
      doc.lineTo(x + width - Math.min(offset, width * 0.3), y + height);
    } else {
      const offset = width * 0.15;
      doc.lineTo(x + width - offset, y + height);
    }
  }
  
  doc.lineWidth(2);
  
  if (plane === 'V') {
    doc.dash(3, { space: 2 });
    doc.strokeColor('#c0392b');
  } else {
    doc.strokeColor('#2980b9');
  }
  
  doc.stroke();
  doc.undash();
  
  doc.restore();
}

/**
 * Taralı desen çizer (fire için)
 */
function drawHatchPattern(doc, x, y, width, height) {
  doc.save();
  doc.rect(x, y, width, height).clip();
  
  doc.lineWidth(0.5).strokeColor('#999');
  
  const spacing = 4;
  for (let i = -height; i < width + height; i += spacing) {
    doc.moveTo(x + i, y)
       .lineTo(x + i + height, y + height)
       .stroke();
  }
  
  doc.restore();
}

/**
 * Testere yönü ikonu çizer
 * Dikey: ║║ (dikey çizgiler - testereye dik)
 * Yatay: ═ (yatay çizgiler - testereye paralel)
 */
function drawSawIcon(doc, x, y, isVertical) {
  doc.save();
  
  doc.rect(x - 1, y - 1, 12, 12).fill('#fff');
  
  doc.lineWidth(1.5);
  
  if (isVertical) {
    doc.strokeColor('#c0392b');
    doc.moveTo(x + 2, y + 1).lineTo(x + 2, y + 9).stroke();
    doc.moveTo(x + 6, y + 1).lineTo(x + 6, y + 9).stroke();
  } else {
    doc.strokeColor('#2980b9');
    doc.moveTo(x + 1, y + 3).lineTo(x + 9, y + 3).stroke();
    doc.moveTo(x + 1, y + 7).lineTo(x + 9, y + 7).stroke();
  }
  
  doc.restore();
}

/**
 * Açı metnini formatlar - 90° için "Düz" yazar
 */
function formatAngleText(angle) {
  return angle === 90 ? 'Düz' : `${angle}°`;
}

/**
 * Stok profilini ve kesimlerini çizer
 */
function drawStock(doc, stock, startY, pageWidth, profile, stockLength, kerf, stockCount = 1) {
  const margin = 50;
  const availableWidth = pageWidth - (margin * 2);
  const scale = availableWidth / stockLength;
  const profileHeight = 40;
  
  const profileWidth = profile?.width || 60;
  
  doc.fontSize(11)
     .fillColor('#000')
     .text(`Stok #${stock.stockIndex}`, margin, startY);
  
  doc.fontSize(9)
     .fillColor('#2980b9')
     .text(`(${stockCount} adet)`, margin + 60, startY + 1);
  
  doc.fontSize(8)
     .fillColor('#666')
     .text(
       `Kullanılan: ${stock.usedLength}mm | Fire: ${stock.wasteLength}mm | Verim: %${stock.efficiency}`,
       margin + 120, startY + 2
     );
  
  const stockY = startY + 18;
  
  doc.rect(margin, stockY, availableWidth, profileHeight)
     .stroke('#999');
  
  doc.fontSize(7).fillColor('#666');
  doc.text(`${profileWidth}`, margin - 18, stockY + profileHeight / 2 - 4);
  
  let currentX = margin;
  
  stock.cuts.forEach((cut, index) => {
    const cutWidth = cut.effectiveLength * scale;
    
    doc.rect(currentX, stockY, cutWidth, profileHeight)
       .fillAndStroke('#fff', '#333');
    
    const startAngle = Number(cut.startAngle) || 90;
    const endAngle = Number(cut.endAngle) || 90;
    
    drawAngleLine(doc, currentX, stockY, cutWidth, profileHeight, startAngle, cut.startPlane, true);
    drawAngleLine(doc, currentX, stockY, cutWidth, profileHeight, endAngle, cut.endPlane, false);
    
    const lengthLabel = `${cut.length}mm`;
    const padding = 8;
    
    const startAngleText = formatAngleText(startAngle);
    const endAngleText = formatAngleText(endAngle);
    
    if (cutWidth > 90) {
      drawSawIcon(doc, currentX + padding, stockY + padding, cut.startPlane === 'V');
      doc.fillColor('#000').fontSize(7);
      doc.text(startAngleText, currentX + padding + 14, stockY + padding + 1);
      
      drawSawIcon(doc, currentX + cutWidth - padding - 12, stockY + padding, cut.endPlane === 'V');
      doc.text(endAngleText, currentX + cutWidth - padding - 32, stockY + padding + 1, { width: 18, align: 'right' });
      
      doc.fontSize(9).font('Roboto-Bold').fillColor('#000');
      const labelWidth = doc.widthOfString(lengthLabel);
      doc.text(lengthLabel, currentX + (cutWidth - labelWidth) / 2, stockY + profileHeight / 2 - 5);
      doc.font('Roboto');
      
      doc.fontSize(6).fillColor('#555');
      const startNote = cut.startPlane === 'V' ? 'Dikey' : 'Yatay';
      const endNote = cut.endPlane === 'V' ? 'Dikey' : 'Yatay';
      doc.text(startNote, currentX + padding, stockY + profileHeight - 12);
      doc.text(endNote, currentX + cutWidth - padding - 24, stockY + profileHeight - 12);
      
    } else if (cutWidth > 55) {
      drawSawIcon(doc, currentX + 6, stockY + 5, cut.startPlane === 'V');
      doc.fillColor('#000').fontSize(6);
      doc.text(startAngleText, currentX + 18, stockY + 7);
      
      drawSawIcon(doc, currentX + cutWidth - 16, stockY + 5, cut.endPlane === 'V');
      doc.text(endAngleText, currentX + cutWidth - 32, stockY + 7);
      
      doc.fontSize(8).font('Roboto-Bold').fillColor('#000');
      const labelWidth = doc.widthOfString(lengthLabel);
      doc.text(lengthLabel, currentX + (cutWidth - labelWidth) / 2, stockY + profileHeight / 2 - 3);
      doc.font('Roboto');
      
    } else if (cutWidth > 35) {
      doc.fillColor('#000').fontSize(6);
      const startIcon = cut.startPlane === 'V' ? '║' : '═';
      const endIcon = cut.endPlane === 'V' ? '║' : '═';
      doc.text(`${startIcon}${startAngleText}`, currentX + 4, stockY + 6);
      doc.text(`${endIcon}${endAngleText}`, currentX + cutWidth - 26, stockY + 6);
      
      doc.fontSize(7).font('Roboto-Bold');
      const labelWidth = doc.widthOfString(lengthLabel);
      doc.text(lengthLabel, currentX + (cutWidth - labelWidth) / 2, stockY + profileHeight / 2);
      doc.font('Roboto');
      
    } else {
      doc.fontSize(6).fillColor('#000');
      const labelWidth = doc.widthOfString(lengthLabel);
      if (cutWidth > labelWidth + 4) {
        doc.text(lengthLabel, currentX + (cutWidth - labelWidth) / 2, stockY + profileHeight / 2 - 3);
      }
    }
    
    currentX += cutWidth;
    
    if (index < stock.cuts.length - 1) {
      const kerfWidth = kerf * scale;
      doc.rect(currentX, stockY, kerfWidth, profileHeight)
         .fillAndStroke('#ddd', '#999');
      currentX += kerfWidth;
    }
  });
  
  if (stock.wasteLength > 0) {
    const wasteWidth = stock.wasteLength * scale;
    
    doc.rect(currentX, stockY, wasteWidth, profileHeight)
       .stroke('#999');
    
    drawHatchPattern(doc, currentX, stockY, wasteWidth, profileHeight);
    
    doc.rect(currentX, stockY, wasteWidth, profileHeight)
       .stroke('#999');
    
    if (wasteWidth > 25) {
      doc.fillColor('#666')
         .fontSize(7)
         .text('Fire', currentX + wasteWidth / 2 - 10, stockY + profileHeight / 2 - 4);
    }
  }
  
  return stockY + profileHeight + 8;
}

/**
 * Stok için kesim tablosu çizer
 */
function drawStockTable(doc, stock, startY, pageWidth) {
  const margin = 50;
  const colWidths = [30, 70, 60, 60, 80];
  const headers = ['#', 'Uzunluk', 'Baş Kesim', 'Son Kesim', 'Notlar'];
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);
  
  let y = startY;
  
  doc.fontSize(7).fillColor('#333');
  let x = margin;
  
  doc.rect(margin, y, tableWidth, 12).fillAndStroke('#f0f0f0', '#ccc');
  
  headers.forEach((header, i) => {
    doc.fillColor('#333').text(header, x + 2, y + 3, { width: colWidths[i] - 4, align: 'left' });
    x += colWidths[i];
  });
  
  y += 12;
  
  stock.cuts.forEach((cut, index) => {
    x = margin;
    doc.fontSize(7).fillColor('#000');
    
    const rowHeight = 11;
    doc.rect(margin, y, tableWidth, rowHeight).stroke('#ddd');
    
    doc.text(`${index + 1}`, x + 2, y + 2, { width: colWidths[0] - 4 });
    x += colWidths[0];
    
    doc.text(`${cut.length} mm`, x + 2, y + 2, { width: colWidths[1] - 4 });
    x += colWidths[1];
    
    const startAngle = Number(cut.startAngle) || 90;
    const startPlane = cut.startPlane === 'V' ? 'Dikey' : 'Yatay';
    doc.text(`${startPlane} ${startAngle}°`, x + 2, y + 2, { width: colWidths[2] - 4 });
    x += colWidths[2];
    
    const endAngle = Number(cut.endAngle) || 90;
    const endPlane = cut.endPlane === 'V' ? 'Dikey' : 'Yatay';
    doc.text(`${endPlane} ${endAngle}°`, x + 2, y + 2, { width: colWidths[3] - 4 });
    x += colWidths[3];
    
    doc.text(cut.notes || '-', x + 2, y + 2, { width: colWidths[4] - 4 });
    
    y += rowHeight;
  });
  
  return y + 5;
}

/**
 * Kesim listesi tablosu
 */
function drawCutList(doc, cuts, startY, pageWidth) {
  const margin = 50;
  const colWidths = [40, 80, 50, 80, 80, 80];
  const headers = ['#', 'Uzunluk', 'Adet', 'Baş Açı', 'Son Açı', 'Notlar'];
  
  doc.fontSize(11)
     .fillColor('#000')
     .text('Kesim Listesi', margin, startY);
  
  let y = startY + 20;
  
  doc.fontSize(8).fillColor('#333');
  let x = margin;
  headers.forEach((header, i) => {
    doc.text(header, x, y, { width: colWidths[i], align: 'left' });
    x += colWidths[i];
  });
  
  y += 15;
  doc.moveTo(margin, y).lineTo(pageWidth - margin, y).stroke('#ccc');
  y += 5;
  
  cuts.forEach((cut, index) => {
    x = margin;
    doc.fontSize(8).fillColor('#000');
    
    doc.text(`${index + 1}`, x, y, { width: colWidths[0] });
    x += colWidths[0];
    
    doc.text(`${cut.length} mm`, x, y, { width: colWidths[1] });
    x += colWidths[1];
    
    doc.text(`${cut.quantity || 1}`, x, y, { width: colWidths[2] });
    x += colWidths[2];
    
    const startAngle = formatAngle(cut.startAngle || 90, cut.startPlane || 'V');
    doc.text(startAngle || '90°', x, y, { width: colWidths[3] });
    x += colWidths[3];
    
    const endAngle = formatAngle(cut.endAngle || 90, cut.endPlane || 'V');
    doc.text(endAngle || '90°', x, y, { width: colWidths[4] });
    x += colWidths[4];
    
    doc.text(cut.notes || '-', x, y, { width: colWidths[5] });
    
    y += 15;
  });
  
  return y;
}

/**
 * PDF oluşturur
 */
export async function generatePDF({ stockLength, kerf, profile, stocks, summary }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 50,
        bufferPages: true
      });
      
      doc.registerFont('Roboto', FONT_PATH);
      doc.registerFont('Roboto-Bold', FONT_BOLD_PATH);
      doc.font('Roboto');
      
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      const pageWidth = doc.page.width;
      
      doc.font('Roboto-Bold')
         .fontSize(18)
         .fillColor('#2c3e50')
         .text('Profil Kesim Planı', 50, 50);
      
      doc.font('Roboto');
      
      doc.fontSize(10)
         .fillColor('#7f8c8d')
         .text(`Oluşturulma: ${new Date().toLocaleString('tr-TR')}`, 50, 75);
      
      doc.fontSize(10)
         .fillColor('#000')
         .text(`Stok Uzunluğu: ${stockLength}mm`, 50, 100)
         .text(`Testere Payı: ${kerf}mm`, 200, 100)
         .text(`Profil: ${profile.width}x${profile.height}mm`, 350, 100);
      
      doc.moveTo(50, 120).lineTo(pageWidth - 50, 120).stroke('#ccc');
      
      doc.fontSize(12)
         .fillColor('#2c3e50')
         .text('Özet', 50, 135);
      
      doc.fontSize(10)
         .fillColor('#000')
         .text(`Toplam Stok: ${summary.totalStocks} adet`, 50, 155)
         .text(`Toplam Kesim: ${summary.totalCuts} adet`, 200, 155)
         .text(`Genel Verim: %${summary.overallEfficiency}`, 350, 155);
      
      doc.text(`Kullanılan: ${summary.totalUsedLength}mm`, 50, 170)
         .text(`Fire: ${summary.totalWasteLength}mm`, 200, 170);
      
      doc.moveTo(50, 190).lineTo(pageWidth - 50, 190).stroke('#ccc');
      
      let currentY = 210;
      const maxY = doc.page.height - 100;
      
      const groupedStocks = groupIdenticalStocks(stocks);
      
      for (const group of groupedStocks) {
        const stock = group.stock;
        const stockCount = group.count;
        const estimatedHeight = 40 + 8 + 12 + (stock.cuts.length * 11) + 15;
        
        if (currentY + estimatedHeight > maxY) {
          doc.addPage();
          currentY = 50;
        }
        
        currentY = drawStock(doc, stock, currentY, pageWidth, profile, stockLength, kerf, stockCount);
        
        currentY = drawStockTable(doc, stock, currentY, pageWidth);
        
        currentY += 10;
      }
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
