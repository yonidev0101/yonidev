"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/* -------------------------------------------------------------------------- */
/*  Sample non-transparent pixels from the logo PNG into 3D positions.        */
/* -------------------------------------------------------------------------- */

interface ParticleData {
  positions: Float32Array;
  colors: Float32Array;
}

async function sampleImage(url: string, sampleStep = 2, alphaThreshold = 80): Promise<ParticleData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const W = 200;
      const H = Math.round((img.height / img.width) * W);

      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0, W, H);
      const { data } = ctx.getImageData(0, 0, W, H);

      const positions: number[] = [];
      const colors: number[] = [];
      const scale = 1 / 38;

      for (let y = 0; y < H; y += sampleStep) {
        for (let x = 0; x < W; x += sampleStep) {
          const i = (y * W + x) * 4;
          const a = data[i + 3];
          if (a < alphaThreshold) continue;

          // Centered, flipped Y, slight Z noise
          const wx = (x - W / 2) * scale;
          const wy = -(y - H / 2) * scale;
          const wz = (Math.random() - 0.5) * 0.15;

          positions.push(wx, wy, wz);

          // Mix sampled color with brand blue for cohesion
          const r = data[i]     / 255;
          const g = data[i + 1] / 255;
          const b = data[i + 2] / 255;
          // Slight bias toward brand blue (#2B7FFF = 0.168, 0.498, 1.0)
          colors.push(r * 0.5 + 0.168 * 0.5, g * 0.5 + 0.498 * 0.5, b * 0.5 + 1 * 0.5);
        }
      }

      resolve({
        positions: new Float32Array(positions),
        colors:    new Float32Array(colors),
      });
    };
    img.onerror = reject;
    img.src = url;
  });
}

/* -------------------------------------------------------------------------- */
/*  Particle field component                                                   */
/* -------------------------------------------------------------------------- */

function ParticleField({ data }: { data: ParticleData }) {
  const pointsRef = useRef<THREE.Points>(null);
  const positionsRef = useRef<Float32Array>(data.positions.slice());
  const velocitiesRef = useRef<Float32Array>(new Float32Array(data.positions.length));

  // Mouse tracking in world space
  const mouse = useRef(new THREE.Vector3(999, 999, 0));
  const mouseActive = useRef(false);
  const { viewport, pointer } = useThree();

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;

    const arr = positionsRef.current;
    const vel = velocitiesRef.current;
    const target = data.positions;
    const t = clock.getElapsedTime();

    // Convert pointer (-1 → 1) to world space
    mouse.current.x = (pointer.x * viewport.width)  / 2;
    mouse.current.y = (pointer.y * viewport.height) / 2;

    const repulseRadius = 1.0;
    const repulseStrength = 0.04;
    const springStrength = 0.04;
    const damping = 0.88;

    for (let i = 0; i < arr.length; i += 3) {
      const tx = target[i];
      const ty = target[i + 1];
      const tz = target[i + 2];

      // Idle breathing — subtle organic motion
      const idleX = Math.sin(t * 0.6 + tx * 1.5) * 0.015;
      const idleY = Math.cos(t * 0.5 + ty * 1.5) * 0.015;

      const targetX = tx + idleX;
      const targetY = ty + idleY;
      const targetZ = tz;

      // Mouse repulsion
      let fx = 0, fy = 0;
      if (mouseActive.current) {
        const dx = arr[i]     - mouse.current.x;
        const dy = arr[i + 1] - mouse.current.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);
        if (dist < repulseRadius && dist > 0.0001) {
          const force = (1 - dist / repulseRadius) * repulseStrength;
          fx = (dx / dist) * force;
          fy = (dy / dist) * force;
        }
      }

      // Spring force toward target
      vel[i]     = (vel[i]     + (targetX - arr[i]    ) * springStrength + fx) * damping;
      vel[i + 1] = (vel[i + 1] + (targetY - arr[i + 1]) * springStrength + fy) * damping;
      vel[i + 2] = (vel[i + 2] + (targetZ - arr[i + 2]) * springStrength       ) * damping;

      arr[i]     += vel[i];
      arr[i + 1] += vel[i + 1];
      arr[i + 2] += vel[i + 2];
    }

    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    posAttr.array = arr;
    posAttr.needsUpdate = true;

    // Subtle group rotation following mouse for parallax
    pointsRef.current.rotation.y = pointer.x * 0.15;
    pointsRef.current.rotation.x = -pointer.y * 0.1;
  });

  return (
    <points
      ref={pointsRef}
      onPointerOver={() => (mouseActive.current = true)}
      onPointerOut={() => (mouseActive.current = false)}
    >
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[data.positions.slice(), 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[data.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        vertexColors
        transparent
        opacity={0.95}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* -------------------------------------------------------------------------- */
/*  Outer wrapper — handles image sampling                                     */
/* -------------------------------------------------------------------------- */

export default function ParticleLogo() {
  const [data, setData] = useState<ParticleData | null>(null);

  useEffect(() => {
    let cancelled = false;
    sampleImage("/logo/y-logo.png").then((d) => {
      if (!cancelled) setData(d);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        {data && <ParticleField data={data} />}
      </Canvas>
    </div>
  );
}
