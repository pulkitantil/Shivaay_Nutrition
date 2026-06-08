'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Particles({ count = 400 }) {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate random positions and velocities for particles
  const [positions, velocities] = useMemo(() => {
    // Simple seedable pseudo-random generator to satisfy React 19's render purity rules
    let seed = 42;
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    const pos = new Float32Array(count * 3);
    const vels = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Position spread
      pos[i * 3] = (random() - 0.5) * 15; // X
      pos[i * 3 + 1] = (random() - 0.5) * 15; // Y
      pos[i * 3 + 2] = (random() - 0.5) * 15; // Z

      // Speed
      vels[i * 3] = (random() - 0.5) * 0.01; // X vel
      vels[i * 3 + 1] = random() * 0.015 + 0.005; // Y vel (upwards)
      vels[i * 3 + 2] = (random() - 0.5) * 0.01; // Z vel
    }
    return [pos, vels];
  }, [count]);

  const geoRef = useRef<THREE.BufferGeometry>(null);

  useFrame(() => {
    if (!pointsRef.current || !geoRef.current) return;

    const positionsAttr = geoRef.current.attributes.position;
    const array = positionsAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      // Move Y position upwards
      array[i * 3 + 1] += velocities[i * 3 + 1];
      // Add slight drift in X and Z
      array[i * 3] += velocities[i * 3] * Math.sin(Date.now() * 0.001 + i);
      array[i * 3 + 2] += velocities[i * 3 + 2] * Math.cos(Date.now() * 0.001 + i);

      // Reset particles if they float too high
      if (array[i * 3 + 1] > 6) {
        array[i * 3 + 1] = -6;
        array[i * 3] = (Math.random() - 0.5) * 15;
        array[i * 3 + 2] = (Math.random() - 0.5) * 15;
      }
    }

    positionsAttr.needsUpdate = true;
    
    // Rotate particle system slowly
    pointsRef.current.rotation.y += 0.0005;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geoRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={positions.length / 3}
          itemSize={3}
          array={positions}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#F5B041"
        size={0.08}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
