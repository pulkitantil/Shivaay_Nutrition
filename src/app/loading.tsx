'use client';

import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-black relative overflow-hidden">
      {/* Glow decorations */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-brand-orange/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-brand-gold/10 blur-[120px] pointer-events-none" />

      <div className="flex flex-col items-center space-y-6 relative z-10">
        <div className="relative w-20 h-20">
          {/* Inner ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-4 border-t-brand-orange border-r-transparent border-b-transparent border-l-transparent"
          />
          {/* Outer gold ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="absolute -inset-2 rounded-full border-2 border-t-brand-gold border-r-transparent border-b-transparent border-l-transparent opacity-80"
          />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-white font-black text-sm uppercase tracking-widest bg-gradient-to-r from-brand-orange to-brand-gold bg-clip-text text-transparent">
            Shivaay Nutrition
          </h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider animate-pulse">
            Loading Authenticity Stack...
          </p>
        </div>
      </div>
    </div>
  );
}
