'use client'

import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial, Float, Sparkles, OrbitControls, Text } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

function InvoiceArtifact({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null)
  const chipRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.25
    groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.7) * 0.12
    if (chipRef.current) {
      chipRef.current.rotation.z = state.clock.elapsedTime * 0.5
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Glass slab main body */}
      <mesh>
        <boxGeometry args={[1.1, 1.55, 0.12]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.3}
          roughness={0.04}
          transmission={0.96}
          ior={1.5}
          chromaticAberration={0.07}
          color="#818cf8"
          attenuationColor="#6366f1"
          attenuationDistance={0.5}
        />
      </mesh>
      {/* Metallic frame edges */}
      <mesh>
        <boxGeometry args={[1.16, 1.61, 0.08]} />
        <meshStandardMaterial
          color="#a5b4fc"
          metalness={0.95}
          roughness={0.05}
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>
      {/* Document lines */}
      {[0.45, 0.22, -0.02, -0.26, -0.46].map((y, i) => (
        <mesh key={i} position={[i === 0 ? -0.1 : 0, y, 0.08]}>
          <boxGeometry args={[i === 0 ? 0.5 : 0.72, 0.035, 0.008]} />
          <meshStandardMaterial
            color="#c7d2fe"
            emissive="#6366f1"
            emissiveIntensity={0.8}
            metalness={0.3}
          />
        </mesh>
      ))}
      {/* Stamp / seal circle */}
      <mesh position={[0.28, -0.45, 0.09]}>
        <torusGeometry args={[0.14, 0.025, 8, 32]} />
        <meshStandardMaterial color="#818cf8" emissive="#4f46e5" emissiveIntensity={1.5} />
      </mesh>
      {/* Floating chip */}
      <group ref={chipRef} position={[0.75, 0.6, 0.25]}>
        <mesh>
          <boxGeometry args={[0.28, 0.18, 0.06]} />
          <meshStandardMaterial color="#4f46e5" metalness={0.8} roughness={0.15} emissive="#3730a3" emissiveIntensity={0.5} />
        </mesh>
      </group>
      {/* Label */}
      <Text
        position={[0, -1.15, 0]}
        fontSize={0.2}
        color="#a5b4fc"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        Invoice Artifact
      </Text>
    </group>
  )
}

function VerificationEngine({ position }: { position: [number, number, number] }) {
  const outerRingRef = useRef<THREE.Mesh>(null)
  const innerRingRef = useRef<THREE.Mesh>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const scanPlaneRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (outerRingRef.current) {
      outerRingRef.current.rotation.x = t * 0.7
      outerRingRef.current.rotation.z = t * 0.3
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.y = t * 1.1
      innerRingRef.current.rotation.x = -t * 0.4
    }
    if (coreRef.current) {
      const s = 1 + Math.sin(t * 2.5) * 0.12
      coreRef.current.scale.setScalar(s)
    }
    if (scanPlaneRef.current) {
      scanPlaneRef.current.rotation.y = t * 0.6
      ;(scanPlaneRef.current.material as THREE.MeshStandardMaterial).opacity =
        0.15 + Math.abs(Math.sin(t * 1.5)) * 0.25
    }
  })

  return (
    <group position={position}>
      {/* Outer scanning ring */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[1.35, 0.045, 16, 120]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#7c3aed" emissiveIntensity={2} metalness={0.9} roughness={0.05} />
      </mesh>
      {/* Inner ring */}
      <mesh ref={innerRingRef}>
        <torusGeometry args={[0.95, 0.06, 16, 100]} />
        <meshStandardMaterial color="#a78bfa" emissive="#8b5cf6" emissiveIntensity={2.5} metalness={0.95} roughness={0.02} />
      </mesh>
      {/* Scan plane */}
      <mesh ref={scanPlaneRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0, 1.3, 64]} />
        <meshStandardMaterial color="#7c3aed" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      {/* Glass shell */}
      <mesh>
        <sphereGeometry args={[0.72, 32, 32]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.25}
          roughness={0.0}
          transmission={0.92}
          ior={1.9}
          chromaticAberration={0.05}
          color="#c4b5fd"
          attenuationColor="#8b5cf6"
          attenuationDistance={0.8}
        />
      </mesh>
      {/* Core */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.4, 2]} />
        <meshStandardMaterial color="#7c3aed" emissive="#6d28d9" emissiveIntensity={3} metalness={0.2} roughness={0.05} />
      </mesh>
      <Sparkles count={40} scale={3.2} size={1.8} speed={0.5} color="#a78bfa" />
      {/* Label */}
      <Text
        position={[0, -1.7, 0]}
        fontSize={0.2}
        color="#a78bfa"
        anchorX="center"
        anchorY="middle"
      >
        Verification Engine
      </Text>
    </group>
  )
}

function FundingNode({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null)
  const gemRef = useRef<THREE.Mesh>(null)
  const ringsRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.25
    }
    if (gemRef.current) {
      gemRef.current.position.y = 1.05 + Math.sin(t * 1.8) * 0.12
      gemRef.current.rotation.y = t * 1.2
    }
    if (ringsRef.current) {
      ringsRef.current.children.forEach((child, i) => {
        child.rotation.y = t * (0.4 + i * 0.2)
      })
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Vault body — hexagonal cylinder */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.72, 0.82, 1.4, 6, 1]} />
        <meshStandardMaterial color="#059669" emissive="#047857" emissiveIntensity={0.7} metalness={0.95} roughness={0.08} />
      </mesh>
      {/* Glass outer shell */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.78, 0.88, 1.5, 6, 1]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.2}
          roughness={0.0}
          transmission={0.88}
          ior={1.65}
          chromaticAberration={0.04}
          color="#6ee7b7"
          attenuationColor="#10b981"
          attenuationDistance={1}
        />
      </mesh>
      {/* Energy rings */}
      <group ref={ringsRef}>
        {[0.4, 0, -0.4].map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <torusGeometry args={[0.95 + i * 0.08, 0.025, 8, 64]} />
            <meshStandardMaterial color="#34d399" emissive="#10b981" emissiveIntensity={2} />
          </mesh>
        ))}
      </group>
      {/* Floating gem */}
      <mesh ref={gemRef} position={[0, 1.05, 0]}>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial color="#6ee7b7" emissive="#10b981" emissiveIntensity={4} metalness={0.4} roughness={0.0} />
      </mesh>
      <Sparkles count={25} scale={2.8} size={2.5} speed={0.35} color="#34d399" />
      {/* Label */}
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.2}
        color="#6ee7b7"
        anchorX="center"
        anchorY="middle"
      >
        Funding Node
      </Text>
    </group>
  )
}

function PipelineRails() {
  const particleRef = useRef<THREE.Mesh>(null)
  const progressRef = useRef(0)

  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-4.5, 0, 0),
        new THREE.Vector3(-2.8, 0.35, 0.2),
        new THREE.Vector3(0, 0.1, 0),
        new THREE.Vector3(2.8, 0.35, 0.2),
        new THREE.Vector3(4.5, 0, 0),
      ]),
    []
  )

  const tubeGeo = useMemo(
    () => new THREE.TubeGeometry(curve, 120, 0.028, 8, false),
    [curve]
  )

  const points = useMemo(() => curve.getPoints(120), [curve])

  useFrame((_, delta) => {
    progressRef.current = (progressRef.current + delta * 0.18) % 1
    if (particleRef.current) {
      const idx = Math.floor(progressRef.current * (points.length - 1))
      const p = points[idx]
      particleRef.current.position.set(p.x, p.y, p.z)
    }
  })

  return (
    <group>
      <mesh geometry={tubeGeo}>
        <meshStandardMaterial
          color="#6366f1"
          emissive="#4338ca"
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.55}
        />
      </mesh>
      {/* Traveling light bead */}
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#a5b4fc"
          emissiveIntensity={8}
        />
      </mesh>
    </group>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[-5, 3, 3]} intensity={1.2} color="#6366f1" />
      <pointLight position={[0, 2, 2]} intensity={1.8} color="#8b5cf6" />
      <pointLight position={[5, 3, 3]} intensity={1.5} color="#10b981" />
      <hemisphereLight groundColor="#000000" color="#1e1b4b" intensity={0.4} />

      <InvoiceArtifact position={[-4.5, 0, 0]} />
      <VerificationEngine position={[0, 0, 0]} />
      <FundingNode position={[4.5, 0, 0]} />
      <PipelineRails />

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.4}
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2 + 0.4}
        minPolarAngle={Math.PI / 2 - 0.4}
        dampingFactor={0.05}
        enableDamping
      />

      <EffectComposer>
        <Bloom luminanceThreshold={0.2} intensity={1.4} mipmapBlur radius={0.6} />
        <ChromaticAberration offset={[0.0008, 0.0008]} />
        <Vignette offset={0.3} darkness={0.7} />
      </EffectComposer>
    </>
  )
}

export default function Pipeline3D() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 1.5, 9], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
