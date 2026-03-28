import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GroundAssetCard from '../components/cards/GroundAssetCard'
import { getRiskColor } from '../utils/formatters'
import { useSettings } from '../contexts/SettingsContext'
import { createTranslator } from '../utils/translations'
import TurkeyMap from '../components/maps/TurkeyMap'

export default function RiskAnalysisPage({ groundAssets = [] }) {
  const { settings } = useSettings()
  const t = createTranslator(settings.language)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [historicalScenarios, setHistoricalScenarios] = useState([])

  useEffect(() => {
    if (!settings.backendEnabled) {
      setHistoricalScenarios([])
      return
    }
    fetch('/api/historical-scenarios')
      .then(res => res.json())
      .then(data => setHistoricalScenarios(data))
      .catch(err => console.error(err))
  }, [settings.backendEnabled])

  return (
    <motion.div
      className="flex h-full p-4 gap-4 overflow-auto"
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: settings.animations ? 0.3 : 0 }}
    >
      <div className="flex-1 flex flex-col gap-4">
        {/* Turkey Map */}
        <div className="glass-card p-5 relative" style={{ minHeight: 400 }}>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12, fontWeight: 700 }}>
            {t('TÜRKİYE KRİTİK ALTYAPI RİSK HARİTASI', 'TURKEY CRITICAL INFRASTRUCTURE RISK MAP')}
          </div>
          <div style={{ position: 'relative', height: 320, border: '1px solid var(--border-subtle)', borderRadius: 8, overflow: 'hidden', background: 'rgba(5,10,20,0.4)' }}>
            
            {/* Detailed Turkey Map Background */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
              <TurkeyMap color="var(--cyan)" opacity={0.3} />
            </div>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,255,240,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,240,0.03) 1px, transparent 1px)', backgroundSize: '50px 50px', zIndex: 0 }} />

            {/* Asset markers */}
            {groundAssets.map(asset => {
              const color = getRiskColor(asset.level)
              
              // Jitter to prevent overlapping entities
              let jitterX = 0; let jitterY = 0;
              if (asset.id === "tubitak-ank") { jitterX = 2; jitterY = 3.5; }
              if (asset.id === "tedas-ank") { jitterX = -1.5; jitterY = -2; }
              if (asset.id === "turksat-gc") { jitterX = -4.5; jitterY = 3.5; }

              // Accurate coordinate mapping for 1000x422 SVG
              // Lon range ~26-45 -> X range ~80-930
              // Lat range ~36-42 -> Y range ~340-50
              const x = ((88 + (asset.lon - 26.5) * 46.8) / 1000) * 100 + jitterX
              const y = ((81 + (41.6 - asset.lat) * 52.9) / 422) * 100 + jitterY
              const dotSize = 8 + (asset.criticality || 0.5) * 8
              const isSelected = selectedAsset?.id === asset.id

              let iconStr = "satellite_alt";
              if (asset.type === "power_grid") iconStr = "factory";
              if (asset.type === "satellite_control") iconStr = "settings_input_antenna";
              if (asset.type === "research_station") iconStr = "radar";

              return (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  style={{
                    position: 'absolute',
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: isSelected ? 10 : 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  title={asset.name}
                >
                  <div style={{
                    position: 'absolute',
                    width: isSelected ? dotSize + 24 : dotSize + 16,
                    height: isSelected ? dotSize + 24 : dotSize + 16,
                    borderRadius: '50%',
                    border: `1px solid ${color}`,
                    opacity: isSelected ? 0.8 : 0.4,
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    animation: isSelected ? 'none' : 'pulse-cyan 2s ease-in-out infinite',
                    background: isSelected ? `${color}33` : 'transparent'
                  }} />
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: isSelected ? dotSize + 8 : dotSize + 4,
                    height: isSelected ? dotSize + 8 : dotSize + 4,
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.8)',
                    border: `2px solid ${color}`,
                    boxShadow: isSelected ? `0 0 15px ${color}` : `0 0 8px ${color}`,
                    color: color,
                    transition: 'all 0.2s'
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: isSelected ? dotSize + 2 : dotSize - 2 }}>{iconStr}</span>
                  </div>
                  <div className="font-data" style={{
                    position: 'absolute',
                    bottom: -20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 9,
                    fontWeight: isSelected ? 800 : 700,
                    color: isSelected ? '#fff' : color,
                    background: 'rgba(0,0,0,0.6)',
                    padding: '2px 4px',
                    borderRadius: 4,
                    whiteSpace: 'nowrap',
                    border: isSelected ? `1px solid ${color}` : 'none'
                  }}>
                    {asset.name.split(' ').slice(-2).join(' ')} ({(asset.risk * 100).toFixed(0)}%)
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Historical Scenarios compared to current */}
        <div className="glass-card p-4">
          <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12, fontWeight: 700 }}>
            {t('Karşılaştırma Senaryoları', 'Comparison Scenarios')}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {historicalScenarios.map(sc => (
              <div key={sc.id} className="p-3" style={{ border: `1px solid ${sc.color}44`, borderRadius: 8, background: 'rgba(0,0,0,0.3)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-data" style={{ fontSize: 14, color: sc.color, fontWeight: 800 }}>{sc.year}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{sc.name}</span>
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {sc.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel: Asset Details OR General Info */}
      <div className="flex flex-col gap-4" style={{ width: 300 }}>
        <AnimatePresence mode="wait">
          {selectedAsset ? (
            <motion.div
              key="asset-details"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="glass-strong p-5" style={{ borderTop: `3px solid ${getRiskColor(selectedAsset.level)}` }}
            >
              <div className="flex justify-between items-start mb-4">
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{t('Kritik Altyapı Detayları', 'Critical Infrastructure Details')}</div>
                <button onClick={() => setSelectedAsset(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                </button>
              </div>
              
              <div className="font-data mb-1" style={{ fontSize: 14, color: 'var(--cyan)' }}>{selectedAsset.name}</div>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined" style={{ fontSize: 12, color: 'var(--text-dim)' }}>location_on</span>
                <span className="font-data" style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{selectedAsset.lat.toFixed(4)}°N, {selectedAsset.lon.toFixed(4)}°E</span>
              </div>

              <div className="p-3 mb-4" style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 9, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 4 }}>RİSK SEVİYESİ</div>
                <div className="font-data" style={{ fontSize: 24, fontWeight: 700, color: getRiskColor(selectedAsset.level) }}>
                  {(selectedAsset.risk * 100).toFixed(1)}%
                </div>
              </div>

              <div style={{ fontSize: 9, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.1em' }}>{t('Etkilenecek Sistemler', 'Affected Systems')}</div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selectedAsset.type === 'power_grid' && (
                  <>
                    <li className="flex items-center gap-2" style={{ fontSize: 10, color: 'var(--text-secondary)' }}><span className="material-symbols-outlined" style={{ fontSize: 12, color: 'var(--red)' }}>bolt</span> Yüksek Gerilim Trafoları</li>
                    <li className="flex items-center gap-2" style={{ fontSize: 10, color: 'var(--text-secondary)' }}><span className="material-symbols-outlined" style={{ fontSize: 12, color: 'var(--amber)' }}>power_off</span> GIC Doygunluğu Riski</li>
                  </>
                )}
                {selectedAsset.type === 'satellite_control' && (
                  <>
                    <li className="flex items-center gap-2" style={{ fontSize: 10, color: 'var(--text-secondary)' }}><span className="material-symbols-outlined" style={{ fontSize: 12, color: 'var(--cyan)' }}>router</span> Telemetri Bağlantısı (S-Band)</li>
                    <li className="flex items-center gap-2" style={{ fontSize: 10, color: 'var(--text-secondary)' }}><span className="material-symbols-outlined" style={{ fontSize: 12, color: 'var(--red)' }}>warning</span> RF Sinyal Zayıflaması</li>
                  </>
                )}
                {selectedAsset.type === 'research_station' && (
                  <>
                    <li className="flex items-center gap-2" style={{ fontSize: 10, color: 'var(--text-secondary)' }}><span className="material-symbols-outlined" style={{ fontSize: 12, color: 'var(--cyan)' }}>sensors</span> Gözlem Sensörleri</li>
                    <li className="flex items-center gap-2" style={{ fontSize: 10, color: 'var(--text-secondary)' }}><span className="material-symbols-outlined" style={{ fontSize: 12, color: 'var(--amber)' }}>memory</span> Veri İşleme Kesintisi</li>
                  </>
                )}
              </ul>
            </motion.div>
          ) : (
            <motion.div key="general-info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="glass-card p-5 mb-4">
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--cyan)', marginBottom: 12 }}>GIC NEDİR?</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  Şiddetli jeomanyetik fırtınalar sırasında, uzun iletim hatlarında endüklenen DC akımları trafo çekirdeklerini doyuma uğratabilir.
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: 12 }}>
                  Türkiye (37-42°N) orta enlem bölgesindedir. Kp≥6 durumunda risk artar.
                </div>
              </div>

              <div className="glass-card p-4">
                <div style={{ fontSize: 9, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.1em' }}>ETKİ ZİNCİRİ</div>
                {[
                  { icon: 'wb_sunny', label: 'Güneş Patlaması', color: 'var(--amber)' },
                  { icon: 'arrow_downward', label: '', color: 'var(--text-dim)' },
                  { icon: 'cloud', label: 'CME Yayılımı', color: 'var(--orange)' },
                  { icon: 'arrow_downward', label: '', color: 'var(--text-dim)' },
                  { icon: 'public', label: 'Manyetik Alan Bozulması', color: 'var(--blue)' },
                  { icon: 'arrow_downward', label: '', color: 'var(--text-dim)' },
                  { icon: 'bolt', label: 'GIC → Trafo Hasarı', color: 'var(--red)' },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined" style={{ fontSize: step.label ? 16 : 12, color: step.color }}>{step.icon}</span>
                    {step.label && <span style={{ fontSize: 10, color: step.color }}>{step.label}</span>}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
