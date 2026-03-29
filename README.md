# 🛡️ SolarGuard-TR — Güneş Fırtınası Erken Uyarı ve Otonom Karar Destek Sistemi

<div align="center">
  
  **TUA Astro Hackathon 2026 — AstroByte Takımı**
  
  [![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
  [![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
  [![Three.js](https://img.shields.io/badge/Three.js-R3F-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
  [![NASA](https://img.shields.io/badge/NASA-DONKI%20%2B%20SDO-E03C31?style=for-the-badge&logo=nasa&logoColor=white)](https://api.nasa.gov)
  [![NOAA](https://img.shields.io/badge/NOAA-SWPC-005B96?style=for-the-badge)](https://www.swpc.noaa.gov)

</div>

---

## 🌍 Proje Özeti

**SolarGuard-TR**, Türkiye'nin kritik altyapılarını (enerji şebekesi, haberleşme uyduları, havacılık, tarım) uzay hava durumu tehditlerinden korumak için geliştirilmiş **yapay zeka destekli, gerçek zamanlı bir erken uyarı ve otonom karar destek sistemidir.**

Sistem, NASA DONKI, NOAA SWPC ve CelesTrak gibi uluslararası uzay hava durumu veri kaynaklarından anlık veri çekerek:
- **LSTM, XGBoost ve Time-Series** modelleriyle Kp indeksi tahmini yapar
- **3D Orbital Görselleştirme** ile Türk uydularının gerçek zamanlı pozisyonlarını ve risk durumlarını gösterir
- **Otonom Karar Motoru** sayesinde kritik eşik aşıldığında (Kp ≥ 8) insan onayı beklemeden kurumsal acil durum protokollerini otomatik devreye alır
- **CME Transit Simülasyonu** ile Güneş'ten Dünya'ya gelen plazma bulutlarını 3D olarak gerçek zamanlı izler

---

## 🏗️ Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────┐
│                    SolarGuard-TR                         │
├─────────────────────┬───────────────────────────────────┤
│   Frontend (React)  │         Backend (FastAPI)          │
│                     │                                   │
│  ┌───────────────┐  │  ┌─────────────────────────────┐  │
│  │ 3D Orbital    │  │  │ NASA DONKI API              │  │
│  │ (Three.js/R3F)│  │  │ NOAA SWPC (X-Ray, Proton)   │  │
│  │ - Dünya       │  │  │ CelesTrak TLE (Uydu Yörünge)│  │
│  │ - Güneş (CME) │  │  └─────────────────────────────┘  │
│  │ - Uydular     │  │                                   │
│  └───────────────┘  │  ┌─────────────────────────────┐  │
│                     │  │ AI/ML Prediction Engine      │  │
│  ┌───────────────┐  │  │ - LSTM (Kp Forecast)        │  │
│  │ Telemetri     │  │  │ - XGBoost (Classification)  │  │
│  │ Risk Analizi  │  │  │ - Time-Series Baseline      │  │
│  │ Karar Merkezi │  │  └─────────────────────────────┘  │
│  └───────────────┘  │                                   │
├─────────────────────┴───────────────────────────────────┤
│              Otonom Karar Destek Motoru                  │
│   (DEFCON Seviyeleri + Ensemble Consensus Logic)        │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler

| Bileşen | Minimum Versiyon |
|---------|-----------------|
| Node.js | 18+ |
| Python | 3.10+ |
| npm | 9+ |
| pip | 22+ |

### 1. Depoyu Klonlayın

```bash
git clone https://github.com/Beraty14/astrobyte.git
cd astrobyte
```

### 2. Backend Kurulumu (Python / FastAPI)

```bash
cd solarguard-tr
pip install -r requirements.txt
python api/main.py
```

> Backend varsayılan olarak `http://localhost:8000` adresinde çalışır.

### 3. Frontend Kurulumu (React / Vite)

```bash
cd solarguard-dashboard
npm install
npm run dev
```

> Frontend varsayılan olarak `http://localhost:5173` adresinde çalışır.

### 4. 3D Model Dosyaları (Git LFS)

3D uydu modelleri Git LFS ile yönetilmektedir. Klonlama sonrasında:

```bash
git lfs install
git lfs pull
```

---

## 📁 Proje Yapısı

```
astrobyte/
├── solarguard-dashboard/          # Frontend (React + Vite)
│   ├── public/
│   │   ├── models/                # 3D Uydu Modelleri (.glb) — Git LFS
│   │   ├── earth-night.jpg        # Dünya gece tekstürü
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── globe/             # 3D Orbital Bileşenleri
│   │   │   │   ├── Earth.jsx          # Gerçek zamanlı gün/gece shader
│   │   │   │   ├── EarthGlobe.jsx     # Ana 3D sahne
│   │   │   │   ├── CMESolarTransit.jsx # Güneş + CME transit simülasyonu
│   │   │   │   ├── SatelliteOrbits.jsx # TLE tabanlı uydu yörüngeleri
│   │   │   │   ├── Turksat5ASystem.jsx # TÜRKSAT 5A özel sistemi
│   │   │   │   ├── AuroraRings.jsx    # Kutup ışıkları (Kp bağımlı)
│   │   │   │   └── ...
│   │   │   ├── cards/             # UI Kartları
│   │   │   ├── maps/             # Türkiye SVG Haritası
│   │   │   └── sidebar/          # Navigasyon
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx      # Ana gösterge paneli
│   │   │   ├── TelemetryPage.jsx      # X-Ray, Proton, Elektron telemetrisi
│   │   │   ├── RiskAnalysisPage.jsx   # Türkiye altyapı risk haritası + GIC
│   │   │   ├── OperationsCenterPage.jsx # Otonom karar merkezi (DEFCON)
│   │   │   ├── SatelliteRiskPage.jsx  # Uydu bazlı risk analizi
│   │   │   ├── PredictionsPage.jsx    # AI tahmin modülleri
│   │   │   └── ...
│   │   ├── contexts/              # React Context (Ayarlar, Tema)
│   │   ├── hooks/                 # Custom Hooks (useSpaceWeather)
│   │   ├── utils/                 # Yardımcı fonksiyonlar
│   │   └── App.jsx                # Ana uygulama bileşeni
│   ├── package.json
│   └── vite.config.js
│
├── solarguard-tr/                # Backend (Python)
│   ├── api/
│   │   └── main.py               # FastAPI sunucu (tüm endpoint'ler)
│   ├── models/
│   │   ├── lstm_model.py          # LSTM Kp tahmin modeli
│   │   ├── xgb_model.py          # XGBoost sınıflandırma modeli
│   │   ├── baselines.py          # Zaman serisi baseline
│   │   └── turkish_asset_risk.py # Türkiye altyapı risk modeli
│   ├── data/
│   │   ├── donki_fetcher.py      # NASA DONKI veri çekici
│   │   └── preprocessor.py       # Veri ön işleme
│   ├── evaluation/
│   │   └── metrics.py            # Model değerlendirme metrikleri
│   ├── run_pipeline.py           # ML pipeline çalıştırıcı
│   └── requirements.txt          # Python bağımlılıkları
│
├── .gitignore
├── .gitattributes                # Git LFS yapılandırması
└── README.md                     # Bu dosya
```

---

## 🎯 Temel Özellikler

### 🌐 3D Orbital Görselleştirme
- **Gerçek Zamanlı Dünya:** UTC saatine göre doğru gün/gece terminatörü (custom GLSL shader)
- **TLE Tabanlı Uydu Takibi:** SGP4 propagatörü ile GÖKTÜRK-1, GÖKTÜRK-2, TÜRKSAT 5A, TÜRKSAT 5B, BİLSAT-1 uydu yörüngeleri
- **3D Güneş Modeli:** Domain-warped FBM noise shader ile gerçekçi plazma yüzeyi, corona katmanları ve flare arc
- **CME Transit:** Güneş'ten Dünya'ya plazma bulutu seyahati (ETA hesaplı)
- **Serbest Kamera:** Güneş-Dünya koridorunda zoom ve pan

### 🤖 Yapay Zeka Tahmin Motoru
- **LSTM:** 24/48 saat Kp indeksi tahmini
- **XGBoost:** Solar flare sınıflandırma (B, C, M, X)
- **Time-Series Baseline:** İstatistiksel referans model
- **Ensemble Consensus:** 3 model birlikte karar verirse otonom inisiyatif tetiklenir

### 🛡️ Otonom Karar Destek (DEFCON Sistemi)
- **Manuel Mod:** Operatör her raporu onaylar
- **Otonom Override:** Kp ≥ 8 ve tüm modeller hemfikirlse, sistem insan onayı beklemeden acil durum raporunu kurumlara otomatik iletir
- **DEFCON 1 UI:** Kırmızı flaşörler, progress bar ve otonom gönderim animasyonu
- **Kurum Raporları:** Tarım Bakanlığı, DHMİ, TEİAŞ, TÜRKSAT için özelleştirilmiş kriz raporları

### 🗺️ Kritik Altyapı Risk Haritası
- **Yüksek Çözünürlüklü Türkiye SVG Haritası** üzerinde altyapı noktaları
- **GIC Zincirleme Şebeke Çökmesi Simülasyonu:** Kp > 8 durumunda enerji hatları sırayla kırılır (1989 Quebec senaryosu)
- **Dinamik Risk Renklendirme:** Anlık tehdit seviyesine göre marker rengi değişir

### 📡 Gerçek Zamanlı Veri Kaynakları
| Kaynak | Veri | Güncelleme |
|--------|------|-----------|
| NASA DONKI | CME, Flare, GST bildirimleri | Gerçek zamanlı |
| NOAA SWPC | X-Ray akısı, Proton akısı, Kp indeksi | Her 1 dakika |
| CelesTrak | TLE uydu yörünge verileri | Her 12 saat |

### 🎬 Simülasyon Modu (1989 Quebec)
Jüri sunumları için Ayarlar'dan aktif edilebilir. Tüm sistem verileri katastrofik seviyeye yükselir:
- Kp indeksi: 9.0 | Patlama: X5.5 | CME Hızı: 4500 km/s
- Otonom karar motoru devreye girer
- Haritada zincirleme şebeke çökmesi başlar
- 3D'de CME Güneş'ten Dünya'ya seyahat eder

---

## 🔑 API Endpoint'leri

| Endpoint | Açıklama |
|----------|---------|
| `GET /api/kp-forecast` | 48 saatlik Kp indeksi tahmini |
| `GET /api/recent-flares` | Son güneş patlamaları (X-Ray) |
| `GET /api/satellite-risk` | Uydu bazlı risk skorları |
| `GET /api/ground-asset-risk` | Yer altyapısı risk değerleri |
| `GET /api/formatted-notifications` | DONKI bildirimleri (Fallback destekli) |
| `GET /api/telemetry/xray` | Gerçek zamanlı X-Ray akısı |
| `GET /api/telemetry/proton` | Gerçek zamanlı proton akısı |
| `GET /api/prediction-metrics` | Model performans metrikleri |
| `GET /api/historical-scenarios` | Tarihsel karşılaştırma senaryoları |

---

## 🛠️ Kullanılan Teknolojiler

**Frontend:**
- React 18 + Vite
- Three.js / React Three Fiber (3D)
- Framer Motion (Animasyonlar)
- Recharts (Grafikler)

**Backend:**
- FastAPI (Python)
- NumPy, Pandas
- Scikit-learn, XGBoost
- TensorFlow/Keras (LSTM)
- SGP4 (Uydu yörünge hesaplama)

**Veri Kaynakları:**
- NASA DONKI API
- NOAA SWPC JSON Feeds
- CelesTrak TLE Database

---

## 👥 Takım — AstroByte

TUA Astro Hackathon 2026 için geliştirilmiştir.

---

## 📄 Lisans

Bu proje TUA Astro Hackathon 2026 kapsamında geliştirilmiştir. Tüm hakları saklıdır.
