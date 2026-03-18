import { useRef, useMemo, type FC } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'
import type { RoomKey } from '@/types'
import { ROOMS } from '@/store/roomStore'

// Circular sprite texture — fixes square particles
function useCircleTexture() {
  return useMemo(() => {
    const size = 64
    const canvas = document.createElement('canvas')
    canvas.width = size; canvas.height = size
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2)
    gradient.addColorStop(0,   'rgba(255,255,255,1)')
    gradient.addColorStop(0.4, 'rgba(255,255,255,0.8)')
    gradient.addColorStop(1,   'rgba(255,255,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
    const tex = new THREE.CanvasTexture(canvas)
    return tex
  }, [])
}

// ── Library — warm dust motes ────────────────────────────────────────────────
function LibraryScene() {
  const dustRef = useRef<THREE.Points>(null)
  const tex = useCircleTexture()
  const count = 200

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 14
      pos[i*3+1] = (Math.random() - 0.5) * 9
      pos[i*3+2] = (Math.random() - 0.5) * 6
    }
    return pos
  }, [])

  useFrame((_, delta) => {
    if (!dustRef.current) return
    const pos = dustRef.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      pos[i*3+1] += delta * (0.04 + (i % 5) * 0.01)
      if (pos[i*3+1] > 4.5) pos[i*3+1] = -4.5
      pos[i*3]   += Math.sin(Date.now()*0.001 + i) * delta * 0.02
    }
    dustRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <>
      <ambientLight intensity={0.3} color="#ff9955" />
      <pointLight position={[3, 4, 2]} intensity={2} color="#ffcc77" distance={12} />
      <pointLight position={[-4, -2, 3]} intensity={0.5} color="#cc7733" distance={8} />
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial map={tex} color="#ffddaa" size={0.08} sizeAttenuation transparent alphaTest={0.01} depthWrite={false} />
      </points>
    </>
  )
}

// ── Spaceship — star field ───────────────────────────────────────────────────
function SpaceshipScene() {
  return (
    <>
      <ambientLight intensity={0.05} />
      <pointLight position={[0, 0, 5]} intensity={0.5} color="#4466ff" />
      <Stars radius={80} depth={50} count={5000} factor={4} saturation={0.5} fade speed={0.4} />
    </>
  )
}

// ── Café — warm steam particles ──────────────────────────────────────────────
function CafeScene() {
  const steamRef = useRef<THREE.Points>(null)
  const tex = useCircleTexture()
  const count = 60

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 6
      pos[i*3+1] = (Math.random() - 0.5) * 8
      pos[i*3+2] = (Math.random() - 0.5) * 4
    }
    return pos
  }, [])

  useFrame((_, delta) => {
    if (!steamRef.current) return
    const pos = steamRef.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      pos[i*3+1] += delta * (0.2 + (i % 4) * 0.05)
      pos[i*3]   += Math.sin(Date.now()*0.001 + i * 0.5) * delta * 0.04
      if (pos[i*3+1] > 4.5) {
        pos[i*3+1] = -4.5
        pos[i*3]   = (Math.random() - 0.5) * 6
      }
    }
    steamRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <>
      <ambientLight intensity={0.4} color="#ff9944" />
      <pointLight position={[0, 3, 1]} intensity={1.5} color="#ffbb55" distance={10} />
      <points ref={steamRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial map={tex} color="#ffddbb" size={0.18} sizeAttenuation transparent alphaTest={0.01} depthWrite={false} opacity={0.35} />
      </points>
    </>
  )
}

// ── Rain — streaking droplets ─────────────────────────────────────────────────
function RainScene() {
  const rainRef = useRef<THREE.Points>(null)
  const tex = useCircleTexture()
  const count = 500

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 22
      pos[i*3+1] = (Math.random() - 0.5) * 16
      pos[i*3+2] = (Math.random() - 0.5) * 8
    }
    return pos
  }, [])

  useFrame((_, delta) => {
    if (!rainRef.current) return
    const pos = rainRef.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      pos[i*3+1] -= delta * (5 + (i % 6))
      pos[i*3]   += delta * 0.4
      if (pos[i*3+1] < -8) {
        pos[i*3+1] = 8
        pos[i*3]   = (Math.random() - 0.5) * 22
      }
    }
    rainRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <>
      <ambientLight intensity={0.15} color="#4488bb" />
      <pointLight position={[-3, 3, 2]} intensity={0.6} color="#6699cc" distance={10} />
      <points ref={rainRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial map={tex} color="#aaccff" size={0.05} sizeAttenuation transparent alphaTest={0.01} depthWrite={false} opacity={0.6} />
      </points>
    </>
  )
}

// ── Forest — glowing fireflies ────────────────────────────────────────────────
function ForestScene() {
  const ffRef = useRef<THREE.Points>(null)
  const tex = useCircleTexture()
  const count = 80
  const phases = useMemo(() => new Float32Array(count).map(() => Math.random() * Math.PI * 2), [])

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 14
      pos[i*3+1] = (Math.random() - 0.5) * 8
      pos[i*3+2] = (Math.random() - 0.5) * 6
    }
    return pos
  }, [])

  useFrame((state, delta) => {
    if (!ffRef.current) return
    const t = state.clock.elapsedTime
    const pos = ffRef.current.geometry.attributes.position.array as Float32Array
    const mat = ffRef.current.material as THREE.PointsMaterial
    for (let i = 0; i < count; i++) {
      pos[i*3]   += Math.sin(t * 0.5 + phases[i]) * delta * 0.3
      pos[i*3+1] += Math.cos(t * 0.3 + phases[i] * 1.3) * delta * 0.2
      if (pos[i*3+1] > 4.5) pos[i*3+1] = -4.5
      if (pos[i*3] >  7)    pos[i*3]   = -7
      if (pos[i*3] < -7)    pos[i*3]   =  7
    }
    ffRef.current.geometry.attributes.position.needsUpdate = true
    mat.opacity = 0.4 + Math.sin(t * 1.2) * 0.35
  })

  return (
    <>
      <ambientLight intensity={0.08} color="#224422" />
      <pointLight position={[0, 2, 2]} intensity={0.4} color="#66ff88" distance={8} />
      <points ref={ffRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial map={tex} color="#99ff66" size={0.22} sizeAttenuation transparent alphaTest={0.01} depthWrite={false} opacity={0.7} />
      </points>
    </>
  )
}

// ── Void — slow drifting orbs ────────────────────────────────────────────────
function VoidScene() {
  const ref = useRef<THREE.Points>(null)
  const tex = useCircleTexture()
  const count = 50

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 16
      pos[i*3+1] = (Math.random() - 0.5) * 10
      pos[i*3+2] = (Math.random() - 0.5) * 5
    }
    return pos
  }, [])

  useFrame((state, delta) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    const pos = ref.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      pos[i*3]   += Math.sin(t * 0.1 + i * 0.7) * delta * 0.06
      pos[i*3+1] += Math.cos(t * 0.08 + i * 1.3) * delta * 0.05
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <>
      <ambientLight intensity={0.02} />
      <pointLight position={[0, 0, 3]} intensity={0.4} color="#9955ff" distance={8} />
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial map={tex} color="#bb88ff" size={0.15} sizeAttenuation transparent alphaTest={0.01} depthWrite={false} opacity={0.6} />
      </points>
    </>
  )
}

const SCENE_MAP: Record<RoomKey, FC> = {
  library:   LibraryScene,
  spaceship: SpaceshipScene,
  cafe:      CafeScene,
  rain:      RainScene,
  forest:    ForestScene,
  void:      VoidScene,
}

interface RoomSceneProps { roomKey: RoomKey }

export function RoomScene({ roomKey }: RoomSceneProps) {
  const room = ROOMS[roomKey]
  const [br, bg, bb] = room.bg

  const SceneComponent = SCENE_MAP[roomKey]

  return (
    <Canvas
      style={{ position: 'fixed', inset: 0, zIndex: 0 }}
      camera={{ position: [0, 0, 5], fov: 75 }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color(`rgb(${br},${bg},${bb})`))
      }}
    >
      <SceneComponent />
    </Canvas>
  )
}