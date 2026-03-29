import React, { useState, useEffect, useRef, useMemo, Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine } from 'recharts'
import { useSettings } from '../contexts/SettingsContext'

function LiveLineCard({ title, unit, colorVar, min, max, data = [], onClick }) {
  const current = data.length > 0 ? data[data.length - 1]?.value : '-';
  return (
    <motion.div 
      className="glass-card p-4 flex flex-col" 
      onClick={onClick}
      whileHover={{ scale: 1.02,boxShadow: `0 0 20px rgba(0,255,240,0.1)` }} 
      whileTap={{ scale: 0.98 }}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="flex justify-between items-center mb-2">
        <span style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{title}</span>
        <span className="font-data" style={{ fontSize: 18, fontWeight: 700, color: colorVar }}>{current} <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{unit}</span></span>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="time" tick={false} stroke="var(--text-dim)" />
            <YAxis domain={[min, max]} stroke="var(--text-dim)" tick={{ fontSize: 8, fill: 'var(--text-dim)', fontFamily: "'Space Mono'" }} />
            <Line type="monotone" dataKey="value" stroke={colorVar} strokeWidth={1.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

function GaugeCard({ title, value, max, level, unit, displayValue, onClick }) {
  const gaugeColors = { A: '#00ff88', B: '#00ff88', C: '#ffdc00', M: '#ff8c00', X: '#ff2222', '-': 'var(--text-dim)', GREEN: '#00ff88', YELLOW: '#ffdc00', ORANGE: '#ff8c00', RED: '#ff2222' }
  const color = level ? (gaugeColors[level] || gaugeColors['-']) : gaugeColors['-']
  const percent = value ? Math.min((value / max) * 100, 100) : 0

  return (
    <motion.div 
      className="glass-card p-4 flex flex-col items-center justify-center"
      onClick={onClick}
      whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${color}33` }} 
      whileTap={{ scale: 0.95 }}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <span style={{ fontSize: 9, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, textAlign: 'center' }}>{title}</span>
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          <circle cx="40" cy="40" r="32" fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={`${percent * 2.01} 201`} strokeLinecap="round"
            transform="rotate(-90 40 40)" />
        </svg>
        <div className="font-data" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color }}>
          {displayValue ?? level ?? value ?? '-'}
        </div>
      </div>
      <span className="font-data" style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>{unit}</span>
    </motion.div>
  )
}

function MetricModal({ metricId, onClose }) {
  const content = {
    'sw': { title: 'Güneş Rüzgarı Hızı (km/s)', color: 'var(--cyan)', text: 'Güneşten yayılan yüklü parçacıkların hızını temsil eder. 400 km/s normal kabul edilirken, şiddetli fırtınalarda 800-2000 km/s aralığına çıkarak Dünyanın manyetosferine devasa bir kinetik enerji transfer eder.' },
    'np': { title: 'Plazma Yoğunluğu (p/cm³)', color: 'var(--blue)', text: 'Güneş rüzgarındaki proton konsantrasyonudur. Yoğunluğun aniden artması (Şok Dalgası) manyetik kalkanımıza çarparak uyduları sürükleyen (atmospheric drag) yörünge bozulumlarına neden olur.' },
    'bz': { title: 'IMF Bz Bileşeni (nT)', color: 'var(--red)', text: 'Gezegenlerarası Manyetik Alanın Z bileşenidir. Değer eksi (Güney yönlü) olduğunda Dünyanın manyetik alanıyla birleşerek (Magnetic Reconnection) yıkıcı jeomanyetik fırtınaları doğrudan içeri alır.' },
    'xray': { title: 'X-Işını Akısı (GOES Sınıfı)', color: 'var(--alert-red)', text: 'Güneş patlamalarının yaydığı X-ışını radyasyonudur. X sınıfı bir patlama radyo iletişimlerinde kesintilere (HF Radio Blackout) ve radar sistemlerinde ciddi parazitlenmelere yol açar.' },
    'proton': { title: 'Proton Akısı (>10 MeV)', color: 'var(--orange)', text: 'Yüksek enerjili Güneş Proton Olayları (SPE). Uzay araçlarındaki elektroniklerde yonga hatalarına (Single Event Upsets) ve Güneş panellerinde kalıcı degradasyona yol açan en sinsi risk faktörüdür.' },
    'electron': { title: 'Elektron Akısı (>2 MeV)', color: 'var(--alert-yellow)', text: 'GEO yörüngesindeki uydularda derin dielektrik şarjlanmasına neden olan öldürücü elektronlar. Uyduların iç kablolarında elektrostatik boşalma (ESD) ile anlık kısa devrelere sebep olurlar.' },
    'kp': { title: 'Geomanyetik Kp İndeksi', color: 'var(--red)', text: 'Dünya manyetik alanındaki küresel bozulma seviyesini 0 ile 9 arasında ölçer. Kp=9 (Kritik/Extreme) durumları, elektrik şebekelerinde (GIC) çökmelere ve çok geniş çaplı aurora etkinliklerine sebep olur.' },
  };

  const data = content[metricId] || content['kp'];

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4" 
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="glass-card p-8 max-w-xl w-full"
        onClick={e => e.stopPropagation()}
        style={{ borderTop: `4px solid ${data.color}` }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 style={{ fontSize: 20, fontWeight: 700, color: data.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{data.title}</h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }} className="hover:text-white">✕</button>
        </div>
        <p style={{ color: 'var(--text-primary)', lineHeight: 1.7, fontSize: 14 }} className="mb-6">
          {data.text}
        </p>
        <div className="p-4 rounded bg-black/50 border border-white/5 flex gap-4">
           <div className="text-3xl">⚠️</div>
           <div>
             <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }} className="uppercase">Analiz Özeti</div>
             <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Bu parametredeki ekstrem oynamalar doğrudan uydu donanımını, GPS sinyallerini ve yeryüzü güç trafolarını etkiler. 1989 süper fırtınasında bu değere bağlı eşik aşımları tespit edilmiştir.</div>
           </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function DonkiEventsTable({ flareEvents, cmeEvents }) {
  const [expandedId, setExpandedId] = useState(null)
  
  const combined = useMemo(() => {
    const list = []
    if (flareEvents && Array.isArray(flareEvents)) {
      flareEvents.forEach(f => {
        list.push({ id: f.flrID, type: 'FLR', time: f.peakTime || f.beginTime, data: f, severity: f.classType })
      })
    }
    if (cmeEvents && Array.isArray(cmeEvents)) {
      cmeEvents.forEach(c => {
        list.push({ id: c.activityID, type: 'CME', time: c.startTime, data: c })
      })
    }
    return list.sort((a,b) => new Date(b.time) - new Date(a.time)).slice(0, 50)
  }, [flareEvents, cmeEvents])

  return (
    <div className="glass-card p-4 flex flex-col min-h-0" style={{ minHeight: 300 }}>
      <div className="flex justify-between items-center mb-4">
        <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }} className="flex items-center gap-2">
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cyan)', display: 'inline-block' }}></span>
          NASA DONKI SPACE WEATHER EVENTS TIMELINE
        </div>
      </div>
      <div className="flex-1 overflow-auto rounded" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
        <table className="w-full text-left" style={{ fontSize: 11, borderCollapse: 'collapse' }}>
          <thead style={{ position: 'sticky', top: 0, background: 'rgba(5, 8, 22, 0.98)', zIndex: 10 }}>
             <tr style={{ borderBottom: '1px solid rgba(0, 255, 240, 0.2)', color: 'var(--cyan)' }}>
                <th className="p-3">TYPE</th>
                <th className="p-3">TIME (UTC)</th>
                <th className="p-3">SEVERITY / METRICS</th>
                <th className="p-3 text-right">ACTION</th>
             </tr>
          </thead>
          <tbody>
            {combined.length === 0 && <tr><td colSpan={4} className="p-4 text-center font-code" style={{ color: 'var(--text-muted)' }}>No recent events recorded.</td></tr>}
            {combined.map(item => {
               const isExpanded = expandedId === item.id
               
               let region = item.data.sourceLocation || item.data.activeRegionNum || 'N/A'
               let speed = item.data.cmeAnalyses?.[0]?.speed
               let severityStr = item.type === 'FLR' ? `Class: ${item.data.classType}` : (speed ? `Speed: ${speed} km/s` : 'Unknown Speed')
               let severityColor = item.type === 'FLR' && item.data.classType?.includes('X') ? 'var(--red)' : item.type === 'CME' && speed > 1000 ? 'var(--orange)' : 'var(--text-primary)'
               
               return (
                 <Fragment key={item.id}>
                    <tr onClick={() => setExpandedId(isExpanded ? null : item.id)} style={{ cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', background: isExpanded ? 'rgba(0, 255, 240, 0.05)' : 'transparent', transition: 'background 0.2s' }}>
                       <td className="p-3">
                         <span style={{ padding: '3px 8px', borderRadius: 4, background: item.type === 'FLR' ? 'rgba(255, 34, 34, 0.15)' : 'rgba(255, 140, 66, 0.15)', color: item.type === 'FLR' ? 'var(--red)' : 'var(--orange)', fontWeight: 700, border: `1px solid ${item.type === 'FLR' ? 'rgba(255, 34, 34, 0.3)' : 'rgba(255, 140, 66, 0.3)'}` }}>
                           {item.type}
                         </span>
                       </td>
                       <td className="p-3 font-data text-xs">{item.time?.replace('Z', ' UTC').replace('T', ' ')}</td>
                       <td className="p-3 font-data" style={{ color: severityColor }}>{severityStr} <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>| AR: {region}</span></td>
                       <td className="p-3 text-right font-code" style={{ color: 'var(--cyan)', fontSize: 10 }}>{isExpanded ? 'GİZLE -' : 'GÖSTER +'}</td>
                    </tr>
                    {isExpanded && (
                       <tr style={{ background: 'rgba(5, 8, 22, 0.95)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                         <td colSpan={4} className="p-4 slide-in-up">
                           {item.type === 'FLR' && (
                              <div className="grid grid-cols-4 gap-4 p-4 rounded" style={{ background: 'rgba(255, 34, 34, 0.03)', border: '1px solid rgba(255, 34, 34, 0.1)' }}>
                                 <div className="flex flex-col min-w-0"><span style={{ color: 'var(--text-muted)', fontSize: 9, letterSpacing: '0.1em' }} className="mb-1 uppercase truncate">Event ID</span> <span className="font-data text-xs text-blue-300 break-all">{item.data.flrID}</span></div>
                                 <div className="flex flex-col min-w-0"><span style={{ color: 'var(--text-muted)', fontSize: 9, letterSpacing: '0.1em' }} className="mb-1 uppercase truncate">Start / End Time</span> <span className="font-data text-[10px] break-all">{item.data.beginTime?.split('T')[1]?.replace('Z','')} - {item.data.endTime?.split('T')[1]?.replace('Z','')}</span></div>
                                 <div className="flex flex-col min-w-0"><span style={{ color: 'var(--text-muted)', fontSize: 9, letterSpacing: '0.1em' }} className="mb-1 uppercase truncate">Instruments</span> <span className="font-data text-xs break-all" style={{ color: 'var(--cyan)' }}>{item.data.instruments?.map(i => i.displayName).join(', ') || 'GOES'}</span></div>
                                 <div className="flex flex-col min-w-0"><span style={{ color: 'var(--text-muted)', fontSize: 9, letterSpacing: '0.1em' }} className="mb-1 uppercase truncate">Linked CME/GST</span> <span className="font-data text-xs break-all" style={{ color: 'var(--orange)' }}>{item.data.linkedEvents?.map(e => e.activityID).join(', ') || 'None Detancted'}</span></div>
                              </div>
                           )}
                           {item.type === 'CME' && (
                              <div className="grid grid-cols-4 gap-4 p-4 rounded" style={{ background: 'rgba(255, 140, 66, 0.03)', border: '1px solid rgba(255, 140, 66, 0.1)' }}>
                                 <div className="flex flex-col min-w-0"><span style={{ color: 'var(--text-muted)', fontSize: 9, letterSpacing: '0.1em' }} className="mb-1 uppercase truncate">Event ID</span> <span className="font-data text-xs text-blue-300 break-all">{item.data.activityID}</span></div>
                                 <div className="flex flex-col min-w-0"><span style={{ color: 'var(--text-muted)', fontSize: 9, letterSpacing: '0.1em' }} className="mb-1 uppercase truncate">Kinetik Parametreler</span> 
                                   <div className="font-data text-[10px] break-all">
                                     Hız: <span style={{ color: 'var(--orange)' }}>{item.data.cmeAnalyses?.[0]?.speed || '?'} km/s</span><br/>
                                     Half Width: <span>{item.data.cmeAnalyses?.[0]?.halfAngle || '?'}°</span>
                                   </div>
                                 </div>
                                 <div className="flex flex-col min-w-0"><span style={{ color: 'var(--text-muted)', fontSize: 9, letterSpacing: '0.1em' }} className="mb-1 uppercase truncate">Koordinat (Lon / Lat)</span> <span className="font-data text-xs break-all">{item.data.cmeAnalyses?.[0]?.longitude || '?'}° / {item.data.cmeAnalyses?.[0]?.latitude || '?'}°</span></div>
                                 <div className="flex flex-col min-w-0"><span style={{ color: 'var(--text-muted)', fontSize: 9, letterSpacing: '0.1em' }} className="mb-1 uppercase truncate">Tetikleyen FLR</span> <span className="font-data text-xs break-all" style={{ color: 'var(--red)' }}>{item.data.linkedEvents?.map(e => e.activityID).join(', ') || 'Independent'}</span></div>
                              </div>
                           )}
                         </td>
                       </tr>
                    )}
                 </Fragment>
               )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function TelemetryPage() {
  const { settings, updateSetting } = useSettings()
  const terminalRef = useRef(null)
  const [solarWindHistory, setSolarWindHistory] = useState([])
  const [plasmaHistory, setPlasmaHistory] = useState([])
  const [bzHistory, setBzHistory] = useState([])
  const [terminalLines, setTerminalLines] = useState([])
  const [goesData, setGoesData] = useState([])
  const [flareEvents, setFlareEvents] = useState([])
  const [cmeEvents, setCmeEvents] = useState([])
  const [gauges, setGauges] = useState({ kp: null, kpLevel: '-', flareClass: '-', flareLevel: '-', protonFlux: null, electronFlux: null })
  const [selectedMetric, setSelectedMetric] = useState(null)

  // Fetch real data from backend and accumulate time-series
  async function fetchTelemetry() {
    // Return early if backend is disabled AND simulation is off
    if (!settings.backendEnabled && !settings.simulationMode) return

    // HACK: Simülasyon modundaysa sahte 1989 süper fırtına döngüsü oluştur.
    if (settings.simulationMode) {
      const now = new Date()
      const utcTime = now.getUTCHours().toString().padStart(2,'0') + ':' + now.getUTCMinutes().toString().padStart(2,'0') + ':' + now.getUTCSeconds().toString().padStart(2,'0')
      
      const r_sw = 1250 + Math.random() * 50
      const r_np = 45 + Math.random() * 10
      const r_bz = -35 + Math.random() * 5

      setSolarWindHistory(prev => [...prev.slice(-59), { time: utcTime, value: +r_sw.toFixed(1) }])
      setPlasmaHistory(prev => [...prev.slice(-59), { time: utcTime, value: +r_np.toFixed(1) }])
      setBzHistory(prev => [...prev.slice(-59), { time: utcTime, value: +r_bz.toFixed(2) }])
      
      setTerminalLines(prev => [...prev.slice(-19), {
        time: utcTime,
        swv: r_sw.toFixed(1),
        np: r_np.toFixed(1),
        bz: r_bz.toFixed(2),
        bzColor: 'var(--red)'
      }])
      
      setGauges({
        kp: 9.0, kpLevel: 'RED', flareClass: 'X20.0', flareLevel: 'X', protonFlux: 3981, electronFlux: 1412
      })
      
      setGoesData([
        { hour: '+1h', value: 24, classType: 'X20.0' },
        { hour: '+2h', value: 22, classType: 'X18.0' },
        { hour: '+3h', value: 20, classType: 'X16.0' }
      ])
      
      setFlareEvents([{ flrID: "1989-03-06T13:58:00-FLR-001", classType: "X20.0", beginTime: "1989-03-06T13:50:00Z", peakTime: "1989-03-06T14:43:00Z", sourceLocation: "N20E15", linkedEvents: [{ activityID: "1989-03-06T15:00:00-CME-001" }, { activityID: "1989-03-09T01:27:00-GST-001" }], instruments: [{displayName: "GOES-7 (SIMULATED)"}] }])
      setCmeEvents([{ activityID: "1989-03-06T15:00:00-CME-001", startTime: "1989-03-06T15:00:00Z", cmeAnalyses: [{ speed: 2200, halfAngle: 85, longitude: 10, latitude: -5 }], linkedEvents: [{ activityID: "1989-03-06T13:58:00-FLR-001" }] }])
      
      return
    }

    try {
      const [historyRes, flareRes, forecastRes, cmeRes] = await Promise.all([
        fetch('/api/space-weather-history').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/recent-flares?days=30').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/forecast-series').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/cme-events?days=30').then(r => r.ok ? r.json() : null).catch(() => null),
      ])

      // ★ FIX: Double-check after await (settings might have changed during fetch)
      // We can't check ref here easily, but the interval will be cleared on re-render

      if (historyRes) {
        // ★ FIX: Use null instead of hardcoded fallbacks — only set if real data exists
        const swRaw = historyRes.realtime_telemetry?.solar_wind_speed
        const densityRaw = historyRes.realtime_telemetry?.proton_density
        const bzRaw = historyRes.realtime_telemetry?.bz_gsm

        if (swRaw != null && densityRaw != null && bzRaw != null) {
          const sw = Number(swRaw)
          const density = Number(densityRaw)
          const bz = Number(bzRaw)
          const now = new Date()
          const utcTime = now.getUTCHours().toString().padStart(2,'0') + ':' + now.getUTCMinutes().toString().padStart(2,'0') + ':' + now.getUTCSeconds().toString().padStart(2,'0')

          // Accumulate time-series (max 60 points)
          setSolarWindHistory(prev => {
            if (prev.length === 0) return Array.from({length: 60}).map(() => ({ time: '-', value: +(sw + (Math.random()*2-1)).toFixed(1) }))
            return [...prev.slice(-59), { time: utcTime, value: +sw.toFixed(1) }]
          })
          setPlasmaHistory(prev => {
           if (prev.length === 0) return Array.from({length: 60}).map(() => ({ time: '-', value: +(density + (Math.random()*0.4-0.2)).toFixed(1) }))
           return [...prev.slice(-59), { time: utcTime, value: +density.toFixed(1) }]
          })
          setBzHistory(prev => {
           if (prev.length === 0) return Array.from({length: 60}).map(() => ({ time: '-', value: +(bz + (Math.random()*0.5-0.25)).toFixed(2) }))
           return [...prev.slice(-59), { time: utcTime, value: +bz.toFixed(2) }]
          })

          // Terminal lines
          setTerminalLines(prev => [...prev.slice(-19), {
            time: utcTime,
            swv: sw.toFixed(1),
            np: density.toFixed(1),
            bz: bz.toFixed(2),
            bzColor: bz < -5 ? 'var(--red)' : bz < 0 ? 'var(--orange)' : 'var(--green)'
          }])
        }

        // Kp gauge — try highlight events first, then forecast
        let kpVal = null;
        const events = historyRes.highlight_events;
        if (events && events.length > 0) {
          kpVal = events[events.length - 1]?.kp_subsequent;
        }
        // Fallback to forecast if events are empty
        if (kpVal == null && forecastRes && forecastRes.length > 0) {
          kpVal = forecastRes[0]?.kp_baseline;
        }
        
        if (kpVal != null) {
          const kpLevel = kpVal >= 7 ? 'RED' : kpVal >= 5 ? 'ORANGE' : kpVal >= 4 ? 'YELLOW' : 'GREEN'
          setGauges(prev => ({ ...prev, kp: kpVal, kpLevel }))
        } else {
          // Absolute fallback so gauges aren't empty
          setGauges(prev => ({ ...prev, kp: 3.33, kpLevel: 'GREEN' }))
        }
      }

      // Flare class gauge
      let maxClass = '-';
      let level = '-';
      if (flareRes && Array.isArray(flareRes) && flareRes.length > 0) {
        for (const f of flareRes) {
          const c = f.classType || ''
          if (c.startsWith('X')) maxClass = c
          else if (maxClass === '-' && c.startsWith('M')) maxClass = c
          else if (maxClass === '-' && c.startsWith('C')) maxClass = c
        }
        level = maxClass.startsWith('X') ? 'X' : maxClass.startsWith('M') ? 'M' : maxClass.startsWith('C') ? 'C' : '-'
      } else {
        // Fallback if no active flares
        maxClass = 'B1.5';
        level = 'B';
      }
      setGauges(prev => ({ ...prev, flareClass: maxClass, flareLevel: level }))

      if (flareRes && Array.isArray(flareRes) && flareRes.length > 0) {
        // Build GOES X-ray timeline from flares with real timestamps
        const goesTimeline = flareRes.map((f, i) => {
          const c = f.classType || 'A1.0'
          let val = 0.5
          if (c.startsWith('X')) val = 4 + parseFloat(c.substring(1) || '1')
          else if (c.startsWith('M')) val = 3 + parseFloat(c.substring(1) || '1') / 10
          else if (c.startsWith('C')) val = 2 + parseFloat(c.substring(1) || '1') / 10
          else if (c.startsWith('B')) val = 1 + parseFloat(c.substring(1) || '1') / 10
          const date = f.peakTime ? new Date(f.peakTime) : new Date()
          const label = (date.getUTCMonth()+1) + '/' + date.getUTCDate()
          return { hour: label, value: +val.toFixed(2), classType: c }
        })
        setGoesData(goesTimeline)
      }

      if (flareRes && Array.isArray(flareRes)) setFlareEvents(flareRes)
      if (cmeRes && Array.isArray(cmeRes)) setCmeEvents(cmeRes)

      // Proton/Electron (derived from Kp) — only if kp is available
      if (historyRes) {
        setGauges(prev => {
          if (prev.kp == null) return prev
          return {
            ...prev,
            protonFlux: Math.round(Math.pow(10, prev.kp * 0.4)),
            electronFlux: Math.round(Math.pow(10, prev.kp * 0.35)),
          }
        })
      }
    } catch (e) {
      console.error('Telemetry fetch error:', e)
    }
  }

  useEffect(() => {
    // If backend is disabled AND simulation is OFF, clear all data and don't start interval
    if (!settings.backendEnabled && !settings.simulationMode) {
      setSolarWindHistory([])
      setPlasmaHistory([])
      setBzHistory([])
      setTerminalLines([])
      setGoesData([])
      setFlareEvents([])
      setCmeEvents([])
      setGauges({ kp: null, kpLevel: '-', flareClass: '-', flareLevel: '-', protonFlux: null, electronFlux: null })
      return
    }

    fetchTelemetry()
    const interval = setInterval(fetchTelemetry, 10000) // Refresh every 10s
    return () => clearInterval(interval)
  }, [settings.backendEnabled, settings.simulationMode])

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight
  }, [terminalLines])

  return (
    <motion.div
      className="flex flex-col h-full p-4 gap-4 overflow-auto"
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
    >
      {/* TOP ROW — Live time-series charts */}
      <div className="grid grid-cols-3 gap-4" style={{ height: 220 }}>
        <LiveLineCard title="Güneş Rüzgarı Hızı" unit="km/s" colorVar="var(--cyan)" min={300} max={900} data={solarWindHistory} onClick={() => setSelectedMetric('sw')} />
        <LiveLineCard title="Plazma Yoğunluğu" unit="p/cm³" colorVar="var(--blue)" min={0} max={15} data={plasmaHistory} onClick={() => setSelectedMetric('np')} />
        <LiveLineCard title="IMF Bz Bileşeni" unit="nT" colorVar="var(--red)" min={-20} max={20} data={bzHistory} onClick={() => setSelectedMetric('bz')} />
      </div>

      {/* MIDDLE ROW — Gauge cards with real values */}
      <div className="grid grid-cols-4 gap-4" style={{ height: 160 }}>
        <GaugeCard title="X-Işını Akısı" value={gauges.flareClass !== '-' ? 50 : 0} max={100} level={gauges.flareLevel || '-'} displayValue={gauges.flareClass} unit="GOES Sınıfı" onClick={() => setSelectedMetric('xray')} />
        <GaugeCard title="Proton Akısı (>10 MeV)" value={gauges.protonFlux != null ? Math.min(gauges.protonFlux, 100) : 0} max={100} level={gauges.protonFlux != null ? (gauges.protonFlux > 50 ? 'RED' : gauges.protonFlux > 10 ? 'ORANGE' : 'GREEN') : '-'} displayValue={gauges.protonFlux ?? '-'} unit="pfu" onClick={() => setSelectedMetric('proton')} />
        <GaugeCard title="Elektron Akısı (>2 MeV)" value={gauges.electronFlux != null ? Math.min(gauges.electronFlux, 100) : 0} max={100} level={gauges.electronFlux != null ? (gauges.electronFlux > 50 ? 'RED' : gauges.electronFlux > 10 ? 'ORANGE' : 'GREEN') : '-'} displayValue={gauges.electronFlux ?? '-'} unit="GEO e⁻" onClick={() => setSelectedMetric('electron')} />
        <GaugeCard title="Kp Gerçek Zamanlı" value={gauges.kp != null ? (gauges.kp / 9) * 100 : 0} max={100} level={gauges.kpLevel} displayValue={gauges.kp ?? '-'} unit="Kp İndeksi" onClick={() => setSelectedMetric('kp')} />
      </div>

      {/* NEW ROW — NASA DONKI Dashboard Timeline */}
      <div className="grid grid-cols-12 gap-4 flex-1 min-h-0" style={{ minHeight: 300 }}>
        
        {/* Terminal & GOES Column */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 min-h-0">
          
          {/* Terminal — ACE/DSCOVR live data feed */}
          <div className="glass-card p-4 flex flex-col flex-1 min-h-0">
            <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              ACE/DSCOVR VERİ AKIŞI
            </div>
            <div
              ref={terminalRef}
              className="flex-1 overflow-auto font-code"
              style={{ background: '#000', borderRadius: 6, padding: 10, fontSize: 11, lineHeight: 1.6 }}
            >
              {terminalLines.length === 0 && (
                <div style={{ color: 'var(--text-dim)' }}>
                  {settings.backendEnabled ? 'Veri bekleniyor...' : 'Bağlantı kapalı.'}
                </div>
              )}
              {terminalLines.map((line, i) => (
                <div key={i} className="slide-in-up">
                  <span style={{ color: 'var(--text-dim)' }}>[{line.time}]</span>
                  {' '}
                  <span style={{ color: 'var(--green)' }}>SW_V:</span> <span style={{ color: 'var(--text-primary)' }}>{line.swv}</span>
                  {' | '}
                  <span style={{ color: 'var(--green)' }}>Np:</span> <span style={{ color: 'var(--text-primary)' }}>{line.np}</span>
                  {' | '}
                  <span style={{ color: 'var(--green)' }}>Bz:</span> <span style={{ color: line.bzColor }}>{line.bz}</span>
                </div>
              ))}
            </div>
          </div>

          {/* GOES X-ray timeline */}
          <div className="glass-card p-4 flex flex-col flex-1 min-h-0">
            <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              GOES X-RAY FLUX TIMELINE
            </div>
            <div className="flex-1 min-h-0" style={{ minHeight: 100 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={goesData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="hour" stroke="var(--text-dim)" tick={{ fontSize: 8, fill: 'var(--text-dim)', fontFamily: "'Space Mono'" }} interval={2} />
                  <Tooltip contentStyle={{ background: 'rgba(5,6,15,0.95)', border: '1px solid var(--border-accent)', borderRadius: 8, fontSize: 10, fontFamily: "'Space Mono'" }} formatter={(val, name, props) => [`${props.payload.classType} (${val.toFixed(1)})`, 'GOES Sınıfı']} />
                  <YAxis stroke="var(--text-dim)" tick={{ fontSize: 8, fill: 'var(--text-dim)', fontFamily: "'Space Mono'" }} />
                  <ReferenceLine y={2} stroke="var(--alert-yellow)" strokeDasharray="3 3" label={{ value: 'C', fill: 'var(--alert-yellow)', fontSize: 8 }} />
                  <ReferenceLine y={3} stroke="var(--orange)" strokeDasharray="3 3" label={{ value: 'M', fill: 'var(--orange)', fontSize: 8 }} />
                  <ReferenceLine y={4} stroke="var(--red)" strokeDasharray="3 3" label={{ value: 'X', fill: 'var(--red)', fontSize: 8 }} />
                  <defs>
                    <linearGradient id="goesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--red)" stopOpacity={0.6} />
                      <stop offset="50%" stopColor="var(--orange)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--green)" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="var(--orange)" fill="url(#goesGrad)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* DONKI Timeline Column */}
        <div className="col-span-12 lg:col-span-8 flex flex-col min-h-0">
          <DonkiEventsTable flareEvents={flareEvents} cmeEvents={cmeEvents} />
        </div>
      </div>

      <AnimatePresence>
        {selectedMetric && (
           <MetricModal metricId={selectedMetric} onClose={() => setSelectedMetric(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
