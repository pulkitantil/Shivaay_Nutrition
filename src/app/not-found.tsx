'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-black px-6 text-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-brand-orange/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-brand-gold/10 blur-[120px] pointer-events-none" />
      
      <div className="space-y-6 max-w-md relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center text-brand-gold text-glow-gold"
        >
          <Compass className="h-24 w-24 animate-[spin_10s_linear_infinite]" />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-2"
        >
          <h1 className="text-8xl font-black text-white bg-gradient-to-r from-brand-orange to-brand-gold bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-xl font-bold uppercase text-white tracking-wider">
            Page Not Found
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
            Oops! The supplement stack or page you are looking for has been moved, removed, or is temporarily out of stock.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="pt-4"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-orange to-brand-gold px-6 py-3 text-xs font-bold text-white shadow-xl shadow-brand-orange/20 hover:scale-105 transition-transform duration-300 led-glow-orange cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Storefront</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
