import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OccupationalRiskCard({ kp = 0, protonFlux = 0, flareClass = '-', onActivateShield, isShieldActive }) {
  // Karar Motoru (Decision Engine) Skoru (0-100)
  const kpScore = Math.min((kp / 9) * 40, 40);
  const protonScore = Math.min((protonFlux / 100) * 30, 30);
  const flareScore = flareClass.startsWith('X') ? 30 : flareClass.startsWith('M') ? 15 : 0;
  
  let totalScore = Math.round(kpScore + protonScore + flareScore);
  
  if (isShieldActive) {
    totalScore = Math.max(0, totalScore - 50); // Shield absorbs risk logically
  }

  const riskLevel = totalScore >= 75 ? 'KRİTİK' : totalScore >= 40 ? 'DİKKAT' : 'NOMİNAL';
  const color = totalScore >= 75 ? 'var(--alert-red)' : totalScore >= 40 ? 'var(--orange)' : 'var(--cyan)';

  // Dinamik Eylem Planı (Playbook Rules)
  const getPlaybook = () => {
    if (totalScore >= 75) {
      return [
        { time: 'T-0h', sector: 'ŞEBEKE (TEİAŞ)', action: 'Anadolu & Trakya hatlarında acil "Grid Islanding" (İzolasyon) başlat.', impact: 'Eylemsizlik Etkisi: 450M ₺ Hasar / Blokaj', urgent: true },
        { time: 'T-1h', sector: 'HAVACILIK (DHMİ)', action: 'Kutup (Polar) uçuşları derhal HF radyodan SATCOM\'a geçir.', impact: 'Eylemsizlik Etkisi: Rota Kaybı Riski', urgent: true },
        { time: 'T-6h', sector: 'UZAY (TÜRKSAT)', action: 'Sırt panelleri güneşe ters çevrilmeli, sistem Safe-Mode\'a alınmalı.', impact: 'Eylemsizlik Etkisi: %12 Görev Ömrü Kaybı', urgent: false },
      ];
    } else if (totalScore >= 40) {
      return [
        { time: 'T-6h', sector: 'TARIM (OTONOM)', action: 'İç Anadolu GPS destekli tarım otonomisine ±5m sapma uyarısı gönder.', impact: 'Eylemsizlik Etkisi: Ekim-Biçim Hataları', urgent: false },
        { time: 'T-12h', sector: 'ŞEBEKE (TEİAŞ)', action: 'Planlı 380kV trafo bakımlarını 48 saat ertele.', impact: 'Eylemsizlik Etkisi: 12M ₺ Onarım Riski', urgent: false },
        { time: 'T-24h', sector: 'UZAY (TÜRKSAT)', action: 'Yedek "Ku-Band" transponder iletişimlerini stand-by da tut.', impact: 'Eylemsizlik Etkisi: Müşteri Veri Kaybı', urgent: false },
      ];
    }
    return [
      { time: 'T-72h', sector: 'ULUSAL (TUA)', action: 'Nominal uzay havası koşulları. Rutin operasyonlar devam edebilir.', impact: '-', urgent: false }
    ];
  };

  const playbook = getPlaybook();

  return (
    <div className="glass-card flex flex-col min-h-0" style={{ border: `1px solid ${isShieldActive ? 'var(--green)' : color}40`, overflow: 'hidden' }}>
      
      {/* BAŞLIK VE SKOR */}
      <div className="p-4 flex justify-between items-stretch" style={{ background: isShieldActive ? 'rgba(0, 255, 136, 0.05)' : totalScore > 75 ? 'rgba(255, 34, 34, 0.08)' : 'rgba(0,0,0,0.2)' }}>
        <div className="flex items-center gap-4">
          
          {/* Risk Gösterge Halkası */}
          <div className="relative flex items-center justify-center" style={{ width: 50, height: 50, borderRadius: '50%', border: `3px solid ${color}`, boxShadow: `0 0 15px ${color}40`, background: 'rgba(5, 8, 22, 0.5)' }}>
             <span className="font-data slide-in-up" style={{ fontSize: 20, fontWeight: 800, color: color }}>{totalScore}</span>
             <span style={{ position: 'absolute', bottom: -12, fontSize: 8, background: color, color: '#fff', padding: '1px 4px', borderRadius: 4, fontWeight: 800, letterSpacing: '0.1em' }}>
               {riskLevel}
             </span>
          </div>

          <div>
            <div style={{ fontSize: 13, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 800 }}>
              AI OTONOM KARAR MERKEZİ & PLAYBOOK
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>
              Sensör verisini eyleme çeviren yapay zeka tabanlı Ulusal & Sektörel Karar Destek asistanı.
            </div>
          </div>
        </div>

        {/* OTONOM AKSİYON BUTONU */}
        <div className="flex flex-col justify-center items-end">
          {totalScore >= 40 && !isShieldActive && (
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={onActivateShield}
              className="pulse-border"
              style={{ 
                background: 'rgba(255, 34, 34, 0.15)', border: '1px solid var(--alert-red)', color: 'var(--alert-red)',
                padding: '10px 18px', borderRadius: 4, fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>gpp_bad</span>
              TÜM KORUMA PROTOKOLLERİNİ UYGULA
            </motion.button>
          )}
          {isShieldActive && (
              <span className="slide-in-up uppercase font-data" style={{ padding: '8px 16px', background: 'var(--green)', color: '#000', borderRadius: 4, fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
                 <span className="material-symbols-outlined shrink-0" style={{ fontSize: 16 }}>verified_user</span> 
                 SAHA ÖNLEMLERİ ONAYLANDI
              </span>
          )}
        </div>
      </div>

      {/* OPERATIONAL PLAYBOOK (EYLEM PLANI) */}
      <div className="flex-1 p-0 overflow-hidden bg-space-900 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <table className="w-full text-left" style={{ fontSize: 11, borderCollapse: 'collapse' }}>
          <thead style={{ background: 'rgba(0,0,0,0.4)' }}>
            <tr style={{ color: 'var(--text-dim)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <th className="p-3 font-semibold w-16 text-center">ZAMAN</th>
              <th className="p-3 font-semibold w-40">HEDEF SEKTÖR</th>
              <th className="p-3 font-semibold">ÖNERİLEN AI AKSİYONU (PLAYBOOK)</th>
              <th className="p-3 font-semibold text-right">EYLEMSİZLİK ETKİSİ</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {playbook.map((step, i) => (
                <motion.tr 
                  key={i} 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  style={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.03)', 
                    background: step.urgent && !isShieldActive ? 'rgba(255, 34, 34, 0.05)' : 'transparent' 
                  }}
                >
                  <td className="p-3 text-center">
                    <span style={{ 
                      background: step.urgent && !isShieldActive ? 'var(--alert-red)' : 'rgba(255,255,255,0.1)', 
                      color: step.urgent && !isShieldActive ? '#fff' : 'var(--text-muted)', 
                      padding: '2px 6px', borderRadius: 4, fontWeight: 800, fontSize: 10, fontFamily: "'Space Mono', monospace" 
                    }}>
                      {step.time}
                    </span>
                  </td>
                  <td className="p-3 font-code font-bold tracking-wider" style={{ color: 'var(--cyan)' }}>
                    {step.sector}
                  </td>
                  <td className="p-3 text-white">
                    {step.action}
                  </td>
                  <td className="p-3 text-right font-data" style={{ color: step.urgent && !isShieldActive ? 'var(--alert-red)' : 'var(--orange)' }}>
                    {step.impact}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

    </div>
  );
}
