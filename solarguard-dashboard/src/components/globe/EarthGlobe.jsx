import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, AdaptiveDpr } from '@react-three/drei'
import Earth from './Earth'
import Atmosphere from './Atmosphere'
import SatelliteOrbits from './SatelliteOrbits'
import GroundMarkers from './GroundMarkers'
import AuroraRings from './AuroraRings'
import GeomagneticHeatmap from './GeomagneticHeatmap'
import CMEImpactGlow from './CMEImpactGlow'


export default function EarthGlobe({ satellites = [], groundAssets = [], kpIndex = 6, toggles = {}, swarmFilter = 'ALL', timeMultiplier = 1, backendEnabled = true }) {
  return (
    <div
      role="img"
      aria-label="3D Dünya küre görselleştirmesi — Türk uyduları ve yer istasyonları"
      style={{ width: '100%', height: '100%' }}
    >
      <Canvas
        camera={{ position: [0, 0.5, 2.8], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Otomatik DPR ayarı — düşük GPU'larda kaliteyi düşürür */}
        <AdaptiveDpr pixelated />

        {/* === LIGHTING — Minimal, shader handles day/night === */}
        <ambientLight intensity={0.08} color="#111133" />
        {/* No directional or point lights — the custom shader in Earth.jsx
            uses its own sunDirection uniform for proper day/night terminator */}

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          autoRotate={true}
          autoRotateSpeed={0.15}
          minDistance={1.5}
          maxDistance={5}
          zoomSpeed={0.5}
          dampingFactor={0.08}
          enableDamping={true}
        />

        <Suspense fallback={null}>
          <Earth />
        </Suspense>
        <Atmosphere />
        <SatelliteOrbits visible={toggles.orbits !== false} filter={swarmFilter} timeMultiplier={timeMultiplier} backendEnabled={backendEnabled} />
        <GroundMarkers assets={groundAssets} />
        <AuroraRings kpIndex={toggles.aurora ? Math.max(kpIndex || 0, 7) : 0} visible={toggles.aurora !== false} />
        <GeomagneticHeatmap active={toggles.heatmap === true} kpIndex={toggles.heatmap ? Math.max(kpIndex || 0, 7) : 0} />
        <CMEImpactGlow active={toggles.cme === true} intensity={toggles.cme ? Math.max(kpIndex || 0, 7) : 0} />
      </Canvas>
    </div>
  )
}
