# 📋 Ürün Gereksinim Belgesi (PRD) - MineCycle AI

## 1. Ürün Özeti
MineCycle AI, e-atıkları kentsel maden olarak konumlandıran, kullanıcıya cihaz bazlı çevresel etki raporu sunan yapay zeka destekli bir web uygulamasıdır.

## 2. Teknik Gereksinimler
- **Frontend:** React veya Next.js (Lovable/Cursor tarafından otomatik yapılandırılacak).
- **AI Entegrasyonu:** Google AI Studio (Gemini 1.5 Flash API).
- **Veri Modeli:** Cihazların mineral içeriklerini ve çevresel maliyetlerini (Su/CO2) içeren bir "Tohum Veri Seti" (JSON formatında).

## 3. Temel Özellikler (MVP)
### 3.1. Akıllı Arama ve Analiz
- Kullanıcı metin girişi ile cihaz arayabilmeli.
- Gemini, girilen cihazın mineral kompozisyonunu bilimsel verilere dayanarak tahmin etmeli.

### 3.2. Etki Hesaplayıcı
- 1 gram Altın geri kazanımı = ~1000 Litre su tasarrufu gibi formüllerle arka planda hesaplama yapmalı.

### 3.3. Görselleştirme
- Maden miktarları grafik veya ikonlarla (Altın külçesi, su damlası vb.) gösterilmeli.

## 4. Başarı Metrikleri
- Kullanıcının analiz sonucunu sonuna kadar okuması.
- "En yakın geri dönüşüm noktasına git" butonuna tıklanma oranı.
