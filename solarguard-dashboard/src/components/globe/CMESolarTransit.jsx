import React, { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { getSunDirection } from './Earth'

// ============================================================================
// SUN SURFACE SHADER — Smooth flowing plasma (NOT grainy)
// Uses domain warping for realistic turbulent flow
// ============================================================================
const sunVertexShader = `
  varying vec2 vUv;
  varying vec3 vPos;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vPos = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const sunFragmentShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vPos;
  varying vec3 vNormal;

  // Smooth value noise (NOT simplex — smoother result)
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f); // Smooth interpolation
    
    return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                   mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                   mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }

  // Domain-warped FBM for flowing plasma effect
  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    vec3 shift = vec3(100.0);
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // Use 3D position on sphere for seamless wrapping
    vec3 p = normalize(vPos) * 2.0;
    
    // Domain warping: distort coordinates with noise for flowing look
    float t = uTime * 0.06;
    vec3 q = vec3(
      fbm(p + vec3(0.0, 0.0, t)),
      fbm(p + vec3(5.2, 1.3, t * 0.7)),
      fbm(p + vec3(1.7, 9.2, t * 0.5))
    );
    
    // Second layer of warping for extra turbulence
    vec3 r = vec3(
      fbm(p + 4.0 * q + vec3(1.7, 9.2, t * 0.15)),
      fbm(p + 4.0 * q + vec3(8.3, 2.8, t * 0.1)),
      0.0
    );
    
    float pattern = fbm(p + 3.5 * r);
    
    // Color ramp: dark red -> orange -> yellow -> white
    vec3 col;
    float v = pattern;
    
    vec3 darkRed   = vec3(0.5, 0.05, 0.0);
    vec3 orange    = vec3(1.0, 0.35, 0.0);
    vec3 yellow    = vec3(1.0, 0.75, 0.1);
    vec3 white     = vec3(1.0, 0.95, 0.8);
    
    col = mix(darkRed, orange, smoothstep(0.0, 0.4, v));
    col = mix(col, yellow, smoothstep(0.4, 0.65, v));
    col = mix(col, white, smoothstep(0.65, 0.9, v));
    
    // Limb darkening (edges darker like a real star)
    float viewDot = abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
    float limb = 0.5 + 0.5 * pow(viewDot, 0.4);
    col *= limb;
    
    // Boost brightness
    col *= 1.4;
    
    gl_FragColor = vec4(col, 1.0);
  }
`

// ============================================================================
// CORONA GLOW SHADER — Soft Fresnel-based atmosphere
// ============================================================================
const coronaVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`

const coronaFragmentShader = `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    float fresnel = 1.0 - dot(vViewDir, vNormal);
    float glow = pow(fresnel, 2.5);
    
    // Pulsating corona
    float pulse = 0.8 + 0.2 * sin(uTime * 0.5);
    
    vec3 innerColor = vec3(1.0, 0.6, 0.1);
    vec3 outerColor = vec3(1.0, 0.2, 0.0);
    vec3 color = mix(innerColor, outerColor, fresnel) * pulse;
    
    gl_FragColor = vec4(color, glow * 0.7);
  }
`

// ============================================================================
// FLARE ARC — A visible eruption arc on the Sun's surface
// ============================================================================
function FlareArc({ sunRadius, time }) {
  const ref = useRef()
  
  const curve = useMemo(() => {
    // Create a torus-like arc erupting from the surface
    const points = []
    for (let i = 0; i <= 40; i++) {
      const t = (i / 40) * Math.PI
      const x = Math.cos(t) * sunRadius * 0.4
      const y = Math.sin(t) * sunRadius * 0.8
      const z = Math.sin(t * 2) * sunRadius * 0.1
      points.push(new THREE.Vector3(x, y + sunRadius * 0.6, z))
    }
    return new THREE.CatmullRomCurve3(points)
  }, [sunRadius])
  
  const tubeGeom = useMemo(() => {
    return new THREE.TubeGeometry(curve, 40, sunRadius * 0.06, 8, false)
  }, [curve, sunRadius])
  
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.z = Math.sin(time * 0.3) * 0.2
      ref.current.rotation.x = Math.cos(time * 0.2) * 0.1
    }
  })
  
  return (
    <mesh ref={ref} geometry={tubeGeom}>
      <meshBasicMaterial
        color="#ff6600"
        transparent
        opacity={0.6 + Math.sin(time * 2) * 0.3}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function CMESolarTransit({ active }) {
  const sunMatRef = useRef()
  const coronaMatRef = useRef()
  const cmeRef = useRef()
  const sunGroupRef = useRef()
  const [eta, setEta] = useState(24)
  const [impacted, setImpacted] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const simStart = useRef(Date.now())
  const { camera } = useThree()
  const prevCamPos = useRef(null)

  const SUN_DISTANCE = 30
  const SUN_RADIUS = 3.5
  const CME_COUNT = 3000

  const sunUniforms = useMemo(() => ({ uTime: { value: 0 } }), [])
  const coronaUniforms = useMemo(() => ({ uTime: { value: 0 } }), [])

  // CME particle data
  const cmeData = useMemo(() => {
    const pos = new Float32Array(CME_COUNT * 3)
    const colors = new Float32Array(CME_COUNT * 3)
    const speeds = new Float32Array(CME_COUNT)
    for (let i = 0; i < CME_COUNT; i++) {
      speeds[i] = 0.5 + Math.random() * 1.0
      // Color gradient: bright orange core, red edges
      const bright = Math.random()
      colors[i * 3] = 1.0
      colors[i * 3 + 1] = 0.2 + bright * 0.5
      colors[i * 3 + 2] = bright * 0.15
    }
    return { pos, colors, speeds }
  }, [])

  // Camera pull-back when CME activates
  useEffect(() => {
    if (active) {
      simStart.current = Date.now()
      setImpacted(false)
      // Save current camera position and pull back to see both Sun and Earth
      prevCamPos.current = camera.position.clone()
      camera.position.set(0, 5, 18)
    } else if (prevCamPos.current) {
      // Restore camera when CME is deactivated
      camera.position.copy(prevCamPos.current)
      prevCamPos.current = null
    }
  }, [active, camera])

  useFrame(() => {
    if (!active) return
    const el = (Date.now() - simStart.current) / 1000
    setElapsed(el)

    // Animate Sun shaders
    if (sunMatRef.current) sunMatRef.current.uniforms.uTime.value = el
    if (coronaMatRef.current) coronaMatRef.current.uniforms.uTime.value = el

    // Slow Sun rotation
    if (sunGroupRef.current) sunGroupRef.current.rotation.y += 0.0008

    // CME Cloud Transit
    if (cmeRef.current) {
      const sunDir = getSunDirection(new Date())
      const sunPos = sunDir.clone().multiplyScalar(SUN_DISTANCE)

      const transitDur = 22
      let frac = Math.min(el / transitDur, 1.0)
      if (frac >= 1.0 && !impacted) setImpacted(true)

      setEta(Math.max(0, (1 - frac) * 24).toFixed(1))

      const center = sunPos.clone().lerp(new THREE.Vector3(0, 0, 0), frac)
      const positions = cmeRef.current.geometry.attributes.position.array

      // CME forms a cone/funnel shape expanding as it travels
      for (let i = 0; i < CME_COUNT; i++) {
        const sp = cmeData.speeds[i]
        const angle1 = (i / CME_COUNT) * Math.PI * 2.0 + el * 0.05 * sp
        const angle2 = Math.sin(i * 7.77) * frac * 1.2 * sp

        // Cone radius expands with distance
        const r = frac * 2.5 * sp

        positions[i * 3] = center.x + Math.cos(angle1) * Math.sin(angle2) * r
        positions[i * 3 + 1] = center.y + Math.sin(angle1) * Math.sin(angle2) * r
        positions[i * 3 + 2] = center.z + Math.cos(angle2) * r * 0.4
      }
      cmeRef.current.geometry.attributes.position.needsUpdate = true
      cmeRef.current.material.opacity = impacted ? Math.max(0, 0.5 - (el - transitDur) * 0.25) : 0.5
    }
  })

  if (!active) return null

  const sunDir = getSunDirection(new Date())
  const sunPos = sunDir.clone().multiplyScalar(SUN_DISTANCE)

  return (
    <group>
      {/* ===== 3D SUN ===== */}
      <group ref={sunGroupRef} position={[sunPos.x, sunPos.y, sunPos.z]}>
        {/* Main Sun — domain-warped smooth plasma */}
        <mesh>
          <sphereGeometry args={[SUN_RADIUS, 96, 96]} />
          <shaderMaterial
            ref={sunMatRef}
            vertexShader={sunVertexShader}
            fragmentShader={sunFragmentShader}
            uniforms={sunUniforms}
          />
        </mesh>

        {/* Corona Layer 1 — Inner Fresnel glow */}
        <mesh>
          <sphereGeometry args={[SUN_RADIUS * 1.2, 48, 48]} />
          <shaderMaterial
            ref={coronaMatRef}
            vertexShader={coronaVertexShader}
            fragmentShader={coronaFragmentShader}
            uniforms={coronaUniforms}
            transparent
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Corona Layer 2 — Mid glow */}
        <mesh>
          <sphereGeometry args={[SUN_RADIUS * 1.6, 32, 32]} />
          <meshBasicMaterial color="#ff5500" transparent opacity={0.06}
            side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false}
          />
        </mesh>

        {/* Corona Layer 3 — Outer aura */}
        <mesh>
          <sphereGeometry args={[SUN_RADIUS * 2.5, 24, 24]} />
          <meshBasicMaterial color="#ff8833" transparent opacity={0.025}
            side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false}
          />
        </mesh>

        {/* Flare Arc erupting from surface */}
        <FlareArc sunRadius={SUN_RADIUS} time={elapsed} />

        {/* Point light from Sun */}
        <pointLight color="#ffcc77" intensity={60} distance={80} decay={2} />
      </group>

      {/* ===== CME PLASMA CLOUD ===== */}
      <points ref={cmeRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={CME_COUNT} array={cmeData.pos} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={CME_COUNT} array={cmeData.colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          vertexColors
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* ===== TELEMETRY HUD ===== */}
      <Html position={[0, -1.5, 0]} center style={{ pointerEvents: 'none', zIndex: 999 }}>
        <div style={{
          background: 'rgba(10,0,0,0.93)', border: '1px solid rgba(255,80,0,0.5)',
          padding: '10px 16px', borderRadius: 10, display: 'flex', flexDirection: 'column',
          alignItems: 'center', minWidth: 320, boxShadow: '0 0 25px rgba(255,40,0,0.4)',
          backdropFilter: 'blur(8px)', whiteSpace: 'nowrap', fontFamily: "'Space Mono', monospace"
        }}>
          <div style={{ color: '#ff4444', fontWeight: 900, letterSpacing: '0.1em', display: 'flex',
            alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, animation: 'spin 2s linear infinite' }}>cyclone</span>
            CME TRANSIT — X5.5 CLASS
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 11, background: 'rgba(0,0,0,0.5)',
            padding: '4px 10px', borderRadius: 5, borderLeft: '3px solid #ff4400',
            width: '100%', justifyContent: 'space-between' }}>
            <div style={{ color: '#777' }}>SPEED<br/><span style={{ color: '#ff8800', fontWeight: 700 }}>1,850 km/s</span></div>
            <div style={{ color: '#777' }}>DENSITY<br/><span style={{ color: '#ff8800', fontWeight: 700 }}>45 p/cm³</span></div>
            <div style={{ color: '#777' }}>Bz<br/><span style={{ color: '#ff4444', fontWeight: 700 }}>-35.8 nT</span></div>
          </div>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,68,0,0.3)',
            paddingBottom: 3, marginTop: 8, fontSize: 11 }}>
            <span style={{ color: '#666' }}>ETA:</span>
            <span style={{ color: '#ff2222', fontWeight: 900, fontSize: 15 }}>{eta} H</span>
          </div>
          {impacted && (
            <div style={{ color: '#fff', background: '#cc0000', fontWeight: 900, fontSize: 11,
              width: '100%', textAlign: 'center', padding: '3px 0', marginTop: 6, borderRadius: 4,
              letterSpacing: '0.08em', animation: 'pulse 0.5s ease-in-out infinite alternate',
              boxShadow: '0 0 15px #ff0000' }}>
              ⚠ MAGNETOSPHERE COMPRESSION
            </div>
          )}
        </div>
      </Html>
    </group>
  )
}
