'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Next.js Page Error Bound:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-black px-6 text-center relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none" />
      
      <div className="space-y-6 max-w-md relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center text-rose-500"
        >
          <AlertCircle className="h-20 w-20 animate-pulse" />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-2"
        >
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">
            Something Went Wrong
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
            There was an error loading this section of the showroom. Please try resetting the viewport or check your connection.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="pt-4"
        >
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-orange to-brand-gold px-6 py-3 text-xs font-bold text-white shadow-xl shadow-brand-orange/20 hover:scale-105 transition-transform duration-300 led-glow-orange cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
