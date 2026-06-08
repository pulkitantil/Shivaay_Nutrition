'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ProteinJar() {
  const groupRef = useRef<THREE.Group>(null);
  const [labelTexture, setLabelTexture] = useState<THREE.CanvasTexture | null>(null);

  // Generate label texture dynamically on mount
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // 1. Label Background (Gold gradient)
      const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
      grad.addColorStop(0, '#B8860B'); // Dark Goldenrod
      grad.addColorStop(0.2, '#F5B041'); // Brand Gold
      grad.addColorStop(0.5, '#FFF8DC'); // Light reflection
      grad.addColorStop(0.8, '#F5B041'); // Brand Gold
      grad.addColorStop(1, '#B8860B'); // Dark Goldenrod
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Borders
      ctx.strokeStyle = '#0A0A0A';
      ctx.lineWidth = 15;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      // Inner borders
      ctx.strokeStyle = '#FF6B00'; // Orange
      ctx.lineWidth = 5;
      ctx.strokeRect(25, 25, canvas.width - 50, canvas.height - 50);

      // 3. Branding Text (SHIVAAY)
      ctx.fillStyle = '#0A0A0A';
      ctx.font = '900 95px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = '10px';
      ctx.fillText('SHIVAAY', canvas.width / 2, canvas.height / 2 - 60);

      // Subtitle (NUTRITION)
      ctx.fillStyle = '#FF6B00';
      ctx.font = '800 45px Outfit, sans-serif';
      ctx.letterSpacing = '18px';
      ctx.fillText('NUTRITION', canvas.width / 2 + 9, canvas.height / 2 + 10);

      // Details
      ctx.fillStyle = '#121212';
      ctx.font = '600 25px Outfit, sans-serif';
      ctx.letterSpacing = '2px';
      ctx.fillText('100% PURE ISOLATE WHEY • AUTHENTIC', canvas.width / 2, canvas.height / 2 + 85);

      ctx.fillStyle = '#0A0A0A';
      ctx.font = '800 30px Outfit, sans-serif';
      ctx.fillText('NET WT. 4.4 LBS (2KG)', canvas.width / 2, canvas.height / 2 + 150);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = 1; // Fit exactly around
    setLabelTexture(texture);

    return () => {
      texture.dispose();
    };
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;

    // Slow floating animation (sine wave)
    const elapsedTime = state.clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(elapsedTime * 1.5) * 0.15;

    // Lerp rotation based on mouse hover
    const targetX = state.pointer.y * 0.3; // tilt up/down
    const targetY = state.pointer.x * 0.5 + elapsedTime * 0.25; // rotate with time + mouse tilt

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.05);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, 0.05);
  });

  return (
    <group ref={groupRef} scale={[1.4, 1.4, 1.4]} position={[0, -0.2, 0]}>
      {/* Jar Body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[1.2, 1.2, 3.2, 32]} />
        <meshStandardMaterial
          color="#121212"
          roughness={0.15}
          metalness={0.85}
        />
      </mesh>

      {/* Glossy Gold Label (wrapped around the body) */}
      {labelTexture && (
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[1.205, 1.205, 2.1, 32, 1, true]} />
          <meshStandardMaterial
            map={labelTexture}
            roughness={0.1}
            metalness={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Jar Shoulder (slanted top) */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <cylinderGeometry args={[0.9, 1.2, 0.2, 32]} />
        <meshStandardMaterial
          color="#121212"
          roughness={0.15}
          metalness={0.85}
        />
      </mesh>

      {/* Jar Neck */}
      <mesh position={[0, 1.85, 0]}>
        <cylinderGeometry args={[0.85, 0.85, 0.1, 32]} />
        <meshStandardMaterial
          color="#0a0a0a"
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>

      {/* Jar Lid (Brand Orange) */}
      <mesh position={[0, 2.0, 0]} castShadow>
        <cylinderGeometry args={[0.92, 0.92, 0.3, 32]} />
        <meshStandardMaterial
          color="#FF6B00"
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
      
      {/* Lid ridges (small decorative detail) */}
      <mesh position={[0, 2.0, 0]}>
        <cylinderGeometry args={[0.93, 0.93, 0.28, 32, 1, true]} />
        <meshStandardMaterial
          color="#e05e00"
          roughness={0.4}
          metalness={0.1}
          wireframe={true}
        />
      </mesh>

      {/* Contact Shadow on bottom floor */}
      <mesh position={[0, -1.8, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4, 4]} />
        <shadowMaterial opacity={0.4} />
      </mesh>
    </group>
  );
}
