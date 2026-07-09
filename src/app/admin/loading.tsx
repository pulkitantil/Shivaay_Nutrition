'use client';

import { motion } from 'framer-motion';

export default function AdminLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center relative overflow-hidden">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-12 h-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-t-brand-gold border-r-transparent border-b-transparent border-l-transparent"
          />
        </div>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest animate-pulse">
          Loading Admin Panel...
        </p>
      </div>
    </div>
  );
}
