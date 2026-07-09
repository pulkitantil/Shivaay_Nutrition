'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin Panel Error Bound:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center text-center p-6">
      <div className="space-y-4 max-w-sm glass-panel p-8 rounded-2xl border border-rose-500/20">
        <div className="flex justify-center text-rose-500">
          <AlertTriangle className="h-12 w-12 animate-bounce" />
        </div>
        <div className="space-y-1">
          <h2 className="text-white font-black text-sm uppercase tracking-wider">
            Admin Panel Error
          </h2>
          <p className="text-gray-500 text-[10px] sm:text-xs leading-relaxed">
            An error occurred while loading the administrative records dashboard.
          </p>
        </div>
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-orange to-brand-gold px-4 py-2 text-[10px] font-bold text-white shadow hover:scale-105 duration-300 cursor-pointer"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reload View</span>
        </button>
      </div>
    </div>
  );
}
