# Ebatlama - Profil Kesim Optimizasyonu

Alüminyum ve çelik profil ustalarının kesim işlemlerini optimize eden web uygulaması.

## Özellikler

- **Kesim Optimizasyonu:** First Fit Decreasing (FFD) algoritması ile minimum fire
- **Açılı Kesimler:** Yatay/Dikey düzlem ve 0-90° açı desteği
- **PDF Çıktısı:** Görsel kesim planı ve detaylı rapor
- **Excel Desteği:** Verileri içe/dışa aktarma
- **Testere Payı:** Kerf hesaplaması dahil

## Kurulum

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend http://localhost:3001 adresinde çalışır.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend http://localhost:5173 adresinde çalışır.

## Kullanım

1. **Ayarlar:** Stok uzunluğu, testere payı ve profil boyutlarını girin
2. **Kesim Ekle:** Uzunluk, adet, açılar ve düzlemleri belirtin
3. **Optimize Et:** Sistem en verimli kesim planını hesaplar
4. **PDF İndir:** Atölyede kullanmak için kesim planını indirin

## API Endpoints

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/health` | GET | Sağlık kontrolü |
| `/api/optimize` | POST | Kesim optimizasyonu |
| `/api/pdf` | POST | PDF oluşturma |
| `/api/excel/export` | POST | Excel dışa aktarma |
| `/api/excel/import` | POST | Excel içe aktarma |

## Teknolojiler

- **Backend:** Node.js, Express.js, PDFKit, XLSX
- **Frontend:** React 19, Vite, TailwindCSS, Lucide Icons

## Açı Notasyonu

- **Y-45°:** Yatay düzlemde 45° açı (profil genişliğinden)
- **D-60°:** Dikey düzlemde 60° açı (profil yüksekliğinden)

## Lisans

MIT
