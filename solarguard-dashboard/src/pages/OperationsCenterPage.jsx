import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';

const DEPARTMENTS = [
  { id: 'tarim', name: 'T.C. Tarım ve Orman Bakanlığı', icon: 'agriculture', color: 'var(--green)' },
  { id: 'dhmi', name: 'Devlet Hava Meydanları İşletmesi (DHMİ)', icon: 'flight_takeoff', color: 'var(--blue)' },
  { id: 'teias', name: 'TEİAŞ (Türkiye Elektrik İletim A.Ş.)', icon: 'electric_bolt', color: 'var(--orange)' },
  { id: 'turksat', name: 'TÜRKSAT Uydu Haberleşme', icon: 'satellite_alt', color: 'var(--cyan)' },
];

const AI_REPORTS = {
  tarim: `İLGİLİ BİRİM: T.C. Tarım ve Orman Bakanlığı, Otonom Tarım Sistemleri Daire Başkanlığı & Afet Yönetim Merkezi 
RAPOR KODU: TUA-AI-AGR-993-X
TEHLİKE SEVİYESİ: DERECE 4 (KRİTİK ONAY BEKLİYOR)

KONU: Yüksek Jeomanyetik Fırtına (G3/G4 Seviye) Beklentisi Önlem ve Kriz Bildirimi

TUA SolarGuard-TR Sentetik Açıklıklı Sensör Ağı ve NOAA Uzay Havası modellerinden elde edilen çapraz doğrulanmış telemetri verilerine göre; önümüzdeki 6-12 saatlik pencerede Dünya'nın manyetosfer kalkanında Kp:9 seviyesinde ekstrem bir delinme ve plazma enjeksiyonu beklenmektedir.

[TEKNİK ETKİ VE SİNTİLASYON ANALİZİ]
Küresel Konumlandırma Sistemleri (GNSS) L1 (1575.42 MHz) ve L2 (1227.60 MHz) bantlarında iyonosferik Toplam Elektron İçeriği (TEC) dalgalanmaları nedeniyle şiddetli faz ve genlik sintilasyonları yaşanacaktır.
- Hassas Tarım RTK-GPS Sistemlerindeki Tahmini Sinyal Kayması: ±14.8 Metre (Maksimum toleransın %400 üzerinde).
- Eylemsizlik Durumunda Beklenen Hasar: Otonom (otopliot) traktörlerin ve akıllı hasat makinelerinin şerit kontrolünü kaybederek ekinleri ezmesi, kimyasal ilaçlama dronlarının (UAV) hedef şaşarak zehirli pestisitleri su kaynaklarına veya yanlış parsellere boşaltması. Tahmini ekonomik ekolojik zarar: Milyonlarca dolar.

[ZORUNLU PROTOKOLLER VE OTOMATİK EYLEM PLANLARI]
Derhal yürürlüğe sokulması gereken otonom protokoller:
1. SİSTEM DÜŞÜRME: Türkiye genelindeki tüm IoT tarım modüllerinin Otonom Sürüş modlarının zorunlu "VFR/Manuel" veya "Wait-in-Place" seviyesine indirilmesi.
2. DRONE YASAK BÖLGESİ (NFZ): Tarımsal insansız hava araçlarının uçuşlarının T+72 saat boyunca donanımsal olarak kilitlenmesi.
3. ÇİFTÇİ ACİL BİLDİRİM AĞI: ÇKS (Çiftçi Kayıt Sistemi) üzerinden GPS bağımlı konumlandırma kullanan tüm üyelere otomatik SMS ve siren uyarılarının basılması.

Lütfen bu raporu askeri güvenlik standartlarına (MIL-STD) uygun olarak kurum içi kanallara derhal iletiniz.
TUA Otonom Karar Destek AI (T-12h Acil Taktik Planı)`,
  dhmi: `İLGİLİ BİRİM: Ulaştırma ve Altyapı Bakanlığı, DHMİ Hava Trafik Kontrol Merkezi (ACC)
RAPOR KODU: TUA-AI-PLR-214-G
TEHLİKE SEVİYESİ: DERECE 5 (HAYATİ RİSK)

KONU: Küresel Telsiz Blokajı (R3-R4), Radyasyon Emilim Eşiklerinin Aşılması ve Polar Rota İptalleri

TUA SolarGuard-TR Yapay Zeka Komuta Merkezi, Güneş diski Aktif Bölge AR3664 üzerinde eşzamanlı X-sınıfı (X9.0) şiddetli bir Flare (Güneş Patlaması) ve 4500 km/s hızında şok dalgasına sahip asimetrik bir Koronal Kütle Atımı (CME) tespit etmiştir.

[TELSİZ KESİNTİSİ VE RADYASYON PROFİLİ]
- HF Telsiz Dağılım Kaybı: F katmanı D-layer absorbsiyonu nedeniyle 3 ila 30 MHz bandında (HF iletişimi) tamamen kararma (Blackout) hesaplanmıştır. 
- Yüksek irtifa radyasyon dozimetreleri: Sivil havacılık uçaklarının seyir irtifasında (35.000+ ft), yolcu ve mürettebatın maruz kalacağı Solar Enerjetik Parçacık (SEP) kaynaklı nötron radyasyonu yıllık güvenli dozu 4 saatte aşacaktır.

[ZORUNLU OTONOM KONTROL TALİMATLARI]
Uluslararası Sivil Havacılık Örgütü (ICAO) Uzay Havası Regülasyonu 8.4.1. bendi gereğince:
1. ROTA DÜŞÜMÜ (REROUTE): Türkiye hava sahasından kalkan ve 40° Kuzey (Polar Region) civarını veya daha üstünü kullanan Kanada / ABD kargo ve yolcu transit rotalarının derhal iptal edilerek Ekvatoral veya Orta Enlem koridorlarına saptırılması.
2. TELSİZ YEDEKLEMESİ: Tüm AOC ve ATC birimlerinin Yüksek Frekans (HF) kullanımını bırakıp, Inmarsat/Iridium SATCOM (CPDLC) veri yollarına zorunlu aktarımı.
3. İRTİFA SINIRLANDIRMASI: Atmosferik kalkanın radyasyon korumasından faydalanmak için Türkiye FIR hattındaki tüm ticari uçuşların maksimum tavan irtifasının FL290 (29.000 feet) olarak sabitlenmesi emredilmektedir. 

Rapor ACC sistemlerine entegre edilmek üzere API üzerinden push edilmiştir.
TUA Otonom Komuta Motoru (T-1h Acil Eylem Yönergesi)`,
  teias: `İLGİLİ BİRİM: TEİAŞ Ulusal Yük Tevzi Merkezi & Acil Durum Koordinasyon Planlaması
RAPOR KODU: TUA-AI-GRID-770-P
TEHLİKE SEVİYESİ: DERECE 4 (ŞEBEKE İZOLASYON PROTOKOLÜ)

KONU: Jeomanyetik İndüklenen Akım (GIC) Tehdidi ve Şebeke Cascade (Zincirleme) Çöküş Analizi

Türkiye Coğrafi Alanı üzerindeki Faraday rotasyon ve manyetometre verileri incelendiğinde; Kp:9 seviyesindeki makro manyetik fırtınanın yerkabuğunda oluşturacağı Jeomanyetik İndüklenen Akımların (GIC), Extra High Voltage (EHV-380kV) iletim hatlarında eşi benzeri görülmemiş bir yük oluşturacağı Neural Network analizimizle %98 doğrulukla tahmin edilmiştir.

[KASKAD ÇÖKÜŞ SİMÜLASYONU]
- Trafo Çekirdek Doyması (Half-Cycle Saturation): GIC'nin doğru akım karakteristiği göstermesi, AC transformatörlerin çekirdeklerini asimetrik olarak doyuma ulaştıracak, aşırı ısınma ve reaktif güç (MVAR) tüketimini devasa boyuta taşıyacaktır.
- Termal Analiz: Özellikle zemin iletkenliğinin düşük olduğu Doğu Karadeniz (Keban-Erciyes hattı) ve yüksek kapasiteli Marmara ring hatlarında trafo sargı sıcaklıkları 95°C'yi aşarak erime (meltdown) veya yangın fazına geçecektir. 1989 Quebec elektrik kesintisinin (%100 black-out) bir benzerinin İstanbul megakent şebekesinde yaşanma riski %74'tür. Eylemsizlik zararı tahmini: 450-800 Milyon TL ve 48 Saat karanlık.

[ACİL YÜK TEVZİ PROTOKOLLERİ]
1. ERTELEME: Planlı olan ve sistemi hassaslaştıracak tüm bakım-onarım ve hat kapatma çalışmalarının 72 saat süreyle rafa kaldırılması.
2. REAKTİF GÜÇ YEDEĞİ: Şebekeye derhal senkron kondansatörler ve reaktörler üzerinden maksimum reaktif güç desteğinin sağlanması.
3. BÖLGESEL İZOLASYON (GRID ISLANDING): Hasarın ulusal kaskad bir çöküşe dönüşmemesi için, riskli EHV hatlarındaki seri kapasitörlerin acilen bypass edilmesi ve gerekli görülürse bölgeler arası enterkonnekte bağların kopartılarak izole adacık şebekelere geçilmesi.

Müdahale onaylandığı an sistem TEİAŞ SCADA ağına otomatik GIC kapama sinyallerini gönderecektir.
TUA Otonom Karar Destek AI (T-0h Şebeke Savunma Yönergesi)`,
  turksat: `İLGİLİ BİRİM: TÜRKSAT Uydu Operasyon ve Yörünge Kontrol Merkezi
RAPOR KODU: TUA-AI-SAT-001-K
TEHLİKE SEVİYESİ: DERECE 5 (DİREKT DONANIM HASARI)

KONU: Dielektrik Deşarj (ESD) Tehdidi ve TÜRKSAT Filo Safe-Mode Otonomisi

TUA SolarGuard Yörünge Analiz Modülü, 10 MeV ve üstü enerji seviyelerindeki proton akısının eşik değerlerin katbekat üzerine çıkarak 4200 pfu bandına oturduğunu raporlamaktadır. Jeosenkron (GEO) yörüngede görev yapan haberleşme uyduları için kritik radyasyon fırtınası başlamıştır.

[TERMAL VE ELEKTRONİK HASAR PROFİLİ]
1. Tekil Olay Etkileri (Single Event Upsets - SEU): Aşırı yüklü proton ve ağır iyonlar, uydu işlemcilerinin bellek durumlarını tersine çevirecek (Bit-flip). Bu durum Telemetri/Telekomut (TT&C) bilgisayarlarında mantıksal hatalara (Phantom Commands) yol açabilir.
2. Derin Dielektrik Şarjlanma (Deep Dielectric Charging): Yüksek enerjili elektronlar uydu zırhını geçerek kablolarda birikecek ve kilovoltlarca potansiyel fark yatarak mikro-arklara (kısa devre) sebebiyet verecektir.
3. Atmosferik Sürüklenme (Drag): Alçak yörüngedeki TUA mikrouyduları için atmosfer genleşmesi kaynaklı yörünge irtifa kayıtları beklenmektedir.

[OTONOM FİLO SAVUNMA DİREKTİFİ]
TÜRKSAT 5A ve 5B dahil tüm birincil uydular için otonom donanım komutları hazırlanmıştır:
- PANELLER KORUMAYA: Güneş panellerinin yüksek partikül fırtınasından delinmemesi / voltaj dalgalanması yaşamaması için "Edge-to-Sun" (güneşe profilden bakma) pozisyonuna derhal döndürülmesi.
- SAFE-MODE (GÜVENLİ MOD): Telekomünikasyon yüklerinin (Payload) yedek Traveling Wave Tube Amplifiers (TWTAs) üzerinden asgari seviyeye indirilmesi, hayati olmayan tüm transponderlerin sıcak yedek (warm-standby) duruma çekilmesi.
- İTİCİ BLOKAJI: SEU (bit-flip) ihtimaline karşı manevra iticilerinin donanımsal ateşleme kilitlerinin takılması.

Lütfen otonom "Uplink" komutlarına onay veriniz.
TUA Otonom Karar Destek AI (T-6h Uydu Hayatta Kalma Protokolü)`
};

function useTypewriter(text, startDelay = 0, speed = 10) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = React.useRef(null);

  useEffect(() => {
    setDisplayedText('');
    if (!text) return;
    
    setIsTyping(true);
    let i = 0;
    
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i += 6; // Yüksek daktilo hızı (multi-char chunking)
        setDisplayedText(text.slice(0, i));
        
        // Auto scroll to bottom
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }

        if (i >= text.length) {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);

    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);

  return { displayedText, isTyping, containerRef };
}

function useAutonomousDefense(isSimulation, reportState, setReportState) {
  const [overrideActive, setOverrideActive] = useState(false);
  const [dispatchProgress, setDispatchProgress] = useState(0);

  // Simulated AI Ensemble Consensus
  const predictions = useMemo(() => ({
    lstm: isSimulation ? 8.8 : 3.2,
    xgboost: isSimulation ? 9.1 : 3.5,
    baseline: isSimulation ? 8.5 : 3.0,
    flareClass: isSimulation ? 'X5.5' : 'B1.2'
  }), [isSimulation]);

  useEffect(() => {
    // Logic: If ensemble consensus is complete catastrophe
    const isCatastrophe = 
      predictions.lstm >= 8 && 
      predictions.xgboost >= 8 && 
      predictions.baseline >= 8;
    
    // Auto-override happens when report finishes generating
    if (isCatastrophe && reportState === 'complete') {
      setOverrideActive(true);
      
      // Simulate fast auto-dispatch progress
      let p = 0;
      const interval = setInterval(() => {
        p += 20;
        setDispatchProgress(p);
        if (p >= 100) {
          clearInterval(interval);
          setReportState('sent');
        }
      }, 300);
      
      return () => clearInterval(interval);
    } else {
      setOverrideActive(false);
      setDispatchProgress(0);
    }
  }, [predictions, reportState, setReportState]);

  return { overrideActive, dispatchProgress, predictions };
}

export default function OperationsCenterPage() {
  const { settings } = useSettings();
  const [selectedDept, setSelectedDept] = useState(null);
  const [reportState, setReportState] = useState('idle'); // idle -> generating -> complete -> sent
  
  const isSimulation = settings.simulationMode;

  const { overrideActive, dispatchProgress, predictions } = useAutonomousDefense(isSimulation, reportState, setReportState);

  const { displayedText, isTyping, containerRef } = useTypewriter(
    reportState === 'generating' || reportState === 'complete' || reportState === 'sent' ? AI_REPORTS[selectedDept] : '', 
    300, 
    5
  );

  useEffect(() => {
    if (reportState === 'generating' && !isTyping && displayedText.length > 10) {
      setReportState('complete');
    }
  }, [displayedText, isTyping, reportState]);

  const handleDeptSelect = (deptId) => {
    setSelectedDept(deptId);
    setReportState('generating');
  };

  const handleApprove = () => {
    setReportState('sent');
  };

  return (
    <div className={`flex flex-col h-full p-6 text-white overflow-hidden relative transition-colors duration-1000 ${overrideActive ? 'border-4 border-red-600 shadow-[inset_0_0_100px_rgba(255,0,0,0.3)] bg-red-950/20' : ''}`}>
      {/* DEFCON 1 VIGNETTE */}
      {overrideActive && (
        <div className="absolute inset-0 pointer-events-none z-0 animate-pulse bg-red-500/5 mix-blend-overlay"></div>
      )}
      
      <div className="relative z-10 flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
         <div>
             <h1 className="text-2xl font-black tracking-widest text-cyan-400 uppercase">Müdahale Karargahı (Operations Center)</h1>
             <p className="text-xs text-gray-500 font-mono mt-1">
                 Bürokrasi ve Operasyon Otomasyonu: Resmi Kriz Raporları LLM tabanlı Otonom Araçlarca üretilir ve ilgili mercilere iletilir.
             </p>
         </div>
         <div className="flex gap-4">
             {isSimulation ? (
               <div className="px-4 py-1.5 bg-red-900/30 border border-red-500/50 rounded flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                 <span className="text-[10px] font-bold tracking-widest text-red-400">KRİZ SENARYOSU (Kp: 9.0)</span>
               </div>
             ) : (
               <div className="px-4 py-1.5 bg-green-900/30 border border-green-500/50 rounded flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-green-500"></span>
                 <span className="text-[10px] font-bold tracking-widest text-green-400">NOMİNAL DURUM</span>
               </div>
             )}
         </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        
        {/* SOL: Kurum Seçimi */}
        <div className="w-1/3 flex flex-col gap-3 overflow-y-auto pr-2">
           <div className="text-xs tracking-widest text-gray-400 mb-2 font-bold uppercase">Hedef Operasyon Kurumları</div>
           
           {!isSimulation && (
             <div className="glass-card p-6 border-green-500/30 text-center">
                 <span className="material-symbols-outlined text-green-400 text-3xl mb-2">check_circle</span>
                 <p className="text-sm text-gray-300">Uzay havası nominal seviyede. Tehdit algılanmadı.</p>
                 <p className="text-xs text-gray-500 mt-2">Demosu görmek için Ayarlardan Simülasyonu açın.</p>
             </div>
           )}

           {isSimulation && DEPARTMENTS.map(dept => (
             <motion.div 
                key={dept.id}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDeptSelect(dept.id)}
                className={`glass-card p-4 cursor-pointer border-l-4 transition-all ${selectedDept === dept.id ? 'bg-space-800 border-cyan-500 shadow-[0_0_15px_rgba(0,255,240,0.1)]' : 'border-gray-700 hover:border-gray-500'}`}
             >
                <div className="flex items-center gap-3">
                   <div style={{ color: dept.color, background: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 8 }}>
                     <span className="material-symbols-outlined">{dept.icon}</span>
                   </div>
                   <div>
                      <div className="font-bold text-sm">{dept.name}</div>
                      <div className="text-[10px] text-gray-500 tracking-wide mt-1">Resmi Bildirim / T-Zero İrtibat</div>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>

        {/* SAĞ: Otonom Rapor Üretimi */}
        <div className="w-2/3 flex flex-col glass-card border border-gray-800 rounded-xl overflow-hidden relative">
           
           {/* Rapor Header */}
           <div className="bg-space-900 border-b border-gray-800 p-4 flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400">terminal</span>
                  <div className="text-sm font-code text-gray-300">TUA-REPORT-GENERATOR-v2.1</div>
               </div>
               
               {reportState === 'generating' && (
                 <div className="flex items-center gap-2 text-orange-400 text-xs font-code animate-pulse">
                    <span className="material-symbols-outlined text-sm">memory</span>
                    LLM Rapor Üretiyor...
                 </div>
               )}
           </div>

           {/* Rapor Body (Kağıt Görünümü) */}
           <div ref={containerRef} className="flex-1 p-8 overflow-y-auto overflow-x-hidden relative bg-[#0a0c10]" style={{ scrollBehavior: 'smooth' }}>
              {!selectedDept ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600">
                   <span className="material-symbols-outlined text-5xl mb-4 opacity-20">domain_verification</span>
                   <p className="font-code text-sm">Rapor üretimi için sol menüden kurum seçiniz.</p>
                </div>
              ) : (
                <div className="font-code text-cyan-50 text-[13px] leading-relaxed whitespace-pre-wrap max-w-3xl block w-full transform-gpu" style={{ minHeight: '101%' }}>
                   {displayedText}
                   {isTyping && <span className="inline-block w-2 h-4 ml-1 bg-cyan-500 animate-pulse"></span>}
                </div>
              )}

              {/* Damga / Mühür (Gönderildiğinde çıkar) */}
              <AnimatePresence>
                {reportState === 'sent' && (
                  <motion.div 
                     initial={{ scale: 3, opacity: 0, rotate: -30 }}
                     animate={{ scale: 1, opacity: 1, rotate: -15 }}
                     transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                     className="absolute top-20 right-20 border-4 border-red-500 text-red-500 p-6 rounded-lg pointer-events-none"
                     style={{ WebkitMaskImage: 'url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/8399/grunge.png)', WebkitMaskSize: 'cover' }}
                  >
                     <div className="text-4xl font-black tracking-tighter uppercase border-b-4 border-red-500 pb-1 mb-1 text-center">OTONOM</div>
                     <div className="text-2xl font-black tracking-widest uppercase text-center">İLETİLDİ</div>
                     <div className="text-[10px] text-center mt-2 font-mono">{new Date().toISOString()}</div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>

           {/* Footer: Aksiyon Butonları */}
           <div className="bg-space-900 border-t border-gray-800 p-4 flex justify-end gap-4 h-24 items-center relative z-10 transition-colors duration-500 rounded-b-xl">
               {reportState === 'complete' && !overrideActive && (
                  <motion.div 
                     initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                     className="flex gap-4 w-full justify-between items-center"
                  >
                     <div className="text-xs text-orange-400 font-mono tracking-widest px-4">
                        ONAY BEKLENİYOR...
                     </div>
                     <button 
                        onClick={handleApprove}
                        className="btn-primary hover:bg-red-500 border border-red-500 bg-red-500/20 text-red-100 flex items-center gap-2"
                     >
                        <span className="material-symbols-outlined text-sm">send</span>
                        ONAYLA VE KURUMLARA İLET
                     </button>
                  </motion.div>
               )}

               {overrideActive && reportState === 'complete' && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                   className="w-full flex flex-col gap-2"
                 >
                   <div className="flex justify-between items-center text-red-500 font-bold tracking-widest text-sm">
                     <span className="flex items-center gap-2 animate-pulse">
                        <span className="material-symbols-outlined">warning</span>
                        AUTONOMOUS OVERRIDE INITIATED - MULTI-MODEL CONSENSUS (Kp: {predictions.lstm.toFixed(1)})
                     </span>
                     <span className="font-mono text-xs text-red-400">DEFCON 1</span>
                   </div>
                   <div className="w-full h-3 bg-red-950 rounded-full overflow-hidden border border-red-900 relative">
                     <motion.div 
                       className="h-full bg-red-500" 
                       initial={{ width: 0 }}
                       animate={{ width: `${dispatchProgress}%` }}
                     />
                   </div>
                   <div className="text-[9px] text-red-400 font-mono tracking-widest flex justify-between">
                     <span>Bypassing manual approval...</span>
                     <span>Sending automated API requests to TEİAŞ, TUA, DHMİ...</span>
                   </div>
                 </motion.div>
               )}

               {reportState === 'sent' && (
                 <div className={`font-bold text-sm tracking-widest flex w-full justify-between items-center gap-2 slide-in-up ${overrideActive ? 'text-red-500' : 'text-green-400'}`}>
                   <div className="flex items-center gap-2">
                     <span className="material-symbols-outlined">done_all</span>
                     {overrideActive ? 'OTONOM İNSİYATİF İLE RESMİ İLETİŞİM ZORUNLU SAĞLANDI.' : 'RESMİ İLETİŞİM SAĞLANDI. KURUMSAL PLAYBOOK UYGULANIYOR.'}
                   </div>
                   {overrideActive && (
                     <div className="text-xs font-mono opacity-60">
                       [LSTM: {predictions.lstm} | XGBoost: {predictions.xgboost}]
                     </div>
                   )}
                 </div>
               )}
           </div>

        </div>
      </div>
    </div>
  );
}
