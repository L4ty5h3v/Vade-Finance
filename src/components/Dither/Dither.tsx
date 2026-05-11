"use client";

import "./Dither.css";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Noise, Pixelation } from "@react-three/postprocessing";
import { memo, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type Vec3 = [number, number, number];

type DitherProps = {
  waveColor?: Vec3;
  waveSpeed?: number;
  waveFrequency?: number;
  waveAmplitude?: number;
  colorNum?: number;
  pixelSize?: number;
  enableMouseInteraction?: boolean;
  mouseRadius?: number;
  reducedMotion?: boolean;
};

type ShaderPlaneProps = Required<Omit<DitherProps, "reducedMotion">> & {
  reducedMotion: boolean;
  pointer: { current: THREE.Vector2 };
};

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  varying vec2 vUv;

  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uTime;
  uniform vec3 uWaveColor;
  uniform float uWaveSpeed;
  uniform float uWaveFrequency;
  uniform float uWaveAmplitude;
  uniform float uColorNum;
  uniform float uPixelSize;
  uniform float uMouseRadius;
  uniform float uEnableMouse;

  vec3 posterize(vec3 color, float steps) {
    return floor(color * steps) / max(steps - 1.0, 1.0);
  }

  void main() {
    vec2 uv = vUv;

    float px = max(1.0, uPixelSize);
    vec2 scaled = floor((uv * uResolution) / px) * px / uResolution;

    float t = uTime * uWaveSpeed;
    float waveA = sin((scaled.x * uWaveFrequency + t) * 6.2831853);
    float waveB = cos((scaled.y * uWaveFrequency - t * 0.8) * 6.2831853);
    float wave = (waveA + waveB) * 0.5;

    float distToMouse = distance(scaled, uMouse);
    float mouseGlow = smoothstep(uMouseRadius, 0.0, distToMouse) * uEnableMouse;
    float waveShape = wave * uWaveAmplitude + mouseGlow * 0.5;

    vec3 base = vec3(0.03, 0.10, 0.22);
    vec3 crest = clamp(uWaveColor + vec3(0.075 * mouseGlow), 0.0, 1.0);
    vec3 color = mix(base, crest, 0.4 + waveShape * 0.5);

    float shimmer = sin((scaled.x + scaled.y + t * 0.2) * 48.0) * 0.015;
    color += shimmer;

    float vignette = smoothstep(1.2, 0.3, distance(uv, vec2(0.5)));
    color *= mix(0.9, 1.12, vignette);

    color = posterize(color, max(2.0, uColorNum));
    gl_FragColor = vec4(color, 1.0);
  }
`;

const ShaderPlane = memo(function ShaderPlane({
  waveColor,
  waveSpeed,
  waveFrequency,
  waveAmplitude,
  colorNum,
  pixelSize,
  enableMouseInteraction,
  mouseRadius,
  reducedMotion,
  pointer,
}: ShaderPlaneProps) {
  const { size } = useThree();
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  const uniforms = useMemo(
    () => ({
      uResolution: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uTime: { value: 0 },
      uWaveColor: { value: new THREE.Color(0.12, 0.35, 0.95) },
      uWaveSpeed: { value: 0.04 },
      uWaveFrequency: { value: 3 },
      uWaveAmplitude: { value: 0.28 },
      uColorNum: { value: 5 },
      uPixelSize: { value: 2 },
      uMouseRadius: { value: 0.35 },
      uEnableMouse: { value: 1 },
    }),
    [],
  );

  useEffect(() => {
    const material = materialRef.current;
    if (!material) {
      return;
    }
    const updatedUniforms = material.uniforms;
    (updatedUniforms.uWaveColor.value as THREE.Color).setRGB(waveColor[0], waveColor[1], waveColor[2]);
    updatedUniforms.uWaveSpeed.value = waveSpeed;
    updatedUniforms.uWaveFrequency.value = waveFrequency;
    updatedUniforms.uWaveAmplitude.value = waveAmplitude;
    updatedUniforms.uColorNum.value = colorNum;
    updatedUniforms.uPixelSize.value = pixelSize;
    updatedUniforms.uMouseRadius.value = mouseRadius;
    updatedUniforms.uEnableMouse.value = enableMouseInteraction && !reducedMotion ? 1 : 0;
  }, [
    colorNum,
    enableMouseInteraction,
    mouseRadius,
    pixelSize,
    reducedMotion,
    waveAmplitude,
    waveColor,
    waveFrequency,
    waveSpeed,
  ]);

  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material) {
      return;
    }
    const frameUniforms = material.uniforms;
    frameUniforms.uTime.value += reducedMotion ? delta * 0.2 : delta;
    (frameUniforms.uResolution.value as THREE.Vector2).set(size.width, size.height);
    (frameUniforms.uMouse.value as THREE.Vector2).lerp(pointer.current, reducedMotion ? 0.05 : 0.12);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
      />
    </mesh>
  );
});

export default function Dither({
  waveColor = [0.12, 0.35, 0.95],
  waveSpeed = 0.04,
  waveFrequency = 3,
  waveAmplitude = 0.28,
  colorNum = 5,
  pixelSize = 2,
  enableMouseInteraction = true,
  mouseRadius = 0.35,
  reducedMotion = false,
}: DitherProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const pointerRef = useRef(new THREE.Vector2(0.5, 0.5));

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const wrap = wrapRef.current;
      if (!wrap) {
        return;
      }
      const rect = wrap.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        return;
      }

      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      pointerRef.current.set(Math.min(1, Math.max(0, x)), 1 - Math.min(1, Math.max(0, y)));
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <div ref={wrapRef} className="dither-wrap">
      <Canvas
        dpr={reducedMotion ? 1 : [1, 1.4]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        orthographic
        camera={{ zoom: 1, position: [0, 0, 1] }}
      >
        <ShaderPlane
          waveColor={waveColor}
          waveSpeed={waveSpeed}
          waveFrequency={waveFrequency}
          waveAmplitude={waveAmplitude}
          colorNum={colorNum}
          pixelSize={pixelSize}
          enableMouseInteraction={enableMouseInteraction}
          mouseRadius={mouseRadius}
          reducedMotion={reducedMotion}
          pointer={pointerRef}
        />
        <EffectComposer multisampling={0}>
          <Pixelation granularity={reducedMotion ? 3 : pixelSize} />
          <Noise opacity={reducedMotion ? 0.02 : 0.035} premultiply />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
