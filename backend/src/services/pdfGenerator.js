import PDFDocument from 'pdfkit';

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
 * Stok profilini ve kesimlerini çizer
 */
function drawStock(doc, stock, startY, pageWidth, profile, stockLength, kerf) {
  const margin = 50;
  const availableWidth = pageWidth - (margin * 2);
  const scale = availableWidth / stockLength;
  const profileHeight = 40;
  
  doc.fontSize(11)
     .fillColor('#000')
     .text(`Stok #${stock.stockIndex}`, margin, startY);
  
  doc.fontSize(8)
     .fillColor('#666')
     .text(
       `Kullanılan: ${stock.usedLength}mm | Fire: ${stock.wasteLength}mm | Verim: %${stock.efficiency}`,
       margin + 80, startY + 2
     );
  
  const stockY = startY + 20;
  
  doc.rect(margin, stockY, availableWidth, profileHeight)
     .fillAndStroke('#f5f5f5', '#ccc');
  
  let currentX = margin;
  
  stock.cuts.forEach((cut, index) => {
    const cutWidth = cut.effectiveLength * scale;
    
    const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c'];
    const color = colors[cut.originalIndex % colors.length];
    
    doc.rect(currentX, stockY, cutWidth, profileHeight)
       .fillAndStroke(color, '#333');
    
    doc.fillColor('#fff')
       .fontSize(8);
    
    const label = `${cut.length}mm`;
    const labelWidth = doc.widthOfString(label);
    
    if (cutWidth > labelWidth + 4) {
      doc.text(label, currentX + (cutWidth - labelWidth) / 2, stockY + profileHeight / 2 - 4);
    }
    
    const startAngleText = formatAngle(cut.startAngle, cut.startPlane);
    const endAngleText = formatAngle(cut.endAngle, cut.endPlane);
    
    doc.fontSize(6).fillColor('#333');
    
    if (startAngleText) {
      doc.text(startAngleText, currentX + 2, stockY + profileHeight + 3);
    }
    
    if (endAngleText) {
      doc.text(endAngleText, currentX + cutWidth - 20, stockY + profileHeight + 3);
    }
    
    currentX += cutWidth;
    
    if (index < stock.cuts.length - 1) {
      doc.rect(currentX, stockY, kerf * scale, profileHeight)
         .fillAndStroke('#ff6b6b', '#c0392b');
      currentX += kerf * scale;
    }
  });
  
  if (stock.wasteLength > 0) {
    const wasteWidth = stock.wasteLength * scale;
    doc.rect(currentX, stockY, wasteWidth, profileHeight)
       .fillAndStroke('#ecf0f1', '#bdc3c7');
    
    doc.fillColor('#7f8c8d')
       .fontSize(7)
       .text('Fire', currentX + wasteWidth / 2 - 10, stockY + profileHeight / 2 - 4);
  }
  
  return stockY + profileHeight + 25;
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
      
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      const pageWidth = doc.page.width;
      
      doc.fontSize(18)
         .fillColor('#2c3e50')
         .text('Profil Kesim Planı', 50, 50);
      
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
      
      for (const stock of stocks) {
        if (currentY > maxY) {
          doc.addPage();
          currentY = 50;
        }
        
        currentY = drawStock(doc, stock, currentY, pageWidth, profile, stockLength, kerf);
      }
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
