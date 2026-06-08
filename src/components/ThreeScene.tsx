'use client';

import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import ProteinJar from './ProteinJar';
import Particles from './Particles';

export default function ThreeScene() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-transparent">
        {/* Loading Spinner/Skeleton */}
        <div className="relative flex items-center justify-center">
          <div className="h-24 w-24 rounded-full border-t-2 border-b-2 border-brand-orange animate-spin" />
          <div className="absolute h-16 w-16 rounded-full border-r-2 border-l-2 border-brand-gold animate-spin reverse-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-transparent" style={{ minHeight: '400px' }}>
      <Canvas shadows gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 5.5]} fov={50} />

        {/* Ambient illumination */}
        <ambientLight intensity={0.4} />

        {/* Key Spotlight (LED Showroom effect) */}
        <spotLight
          position={[5, 8, 5]}
          angle={0.3}
          penumbra={1}
          intensity={2.5}
          castShadow
          shadow-mapSize={1024}
        />

        {/* Warm Gold/Orange LED rim lights */}
        <pointLight position={[-6, 2, -2]} intensity={2.0} color="#FF6B00" />
        <pointLight position={[6, -2, 2]} intensity={1.5} color="#F5B041" />
        
        {/* Soft front fill light */}
        <directionalLight position={[0, 5, 5]} intensity={0.8} />

        {/* 3D Elements */}
        <ProteinJar />
        <Particles count={300} />

        {/* Controls: restrict zooming and panning to maintain scroll layout integrity */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
    </div>
  );
}
