'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dumbbell, Menu, X, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OWNER_PHONE } from '@/config';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Products', href: '/#products' },
    { name: 'Location', href: '/#location' },
    { name: 'Contact', href: '/#contact' },
    { name: 'Orders', href: '/#orders' },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-x-0 border-t-0 border-b border-brand-gold/15 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/#top" className="flex items-center gap-2 group">
              <div className="rounded-lg bg-gradient-to-br from-brand-orange to-brand-gold p-2 text-brand-black transition-transform group-hover:rotate-12 duration-300">
                <Dumbbell className="h-6 w-6" />
              </div>
              <span className="text-xl font-extrabold tracking-wider text-white">
                SHIVAAY <span className="text-brand-gold text-glow-gold">NUTRITION</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === '/' && typeof window !== 'undefined' && window.location.hash === link.href.split('#')[1];
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm font-semibold tracking-wide transition-colors duration-300 hover:text-brand-gold py-2 ${
                    isActive ? 'text-brand-gold' : 'text-gray-300'
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
          </div>

          {/* Right side controls */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/admin"
              className="text-gray-400 hover:text-brand-gold transition-colors p-2"
              title="Admin Portal"
            >
              <Settings className="h-5 w-5" />
            </Link>
            <a
              href={`tel:${OWNER_PHONE}`}
              className="rounded-full bg-gradient-to-r from-brand-orange to-brand-gold px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-orange/20 hover:shadow-brand-orange/40 hover:scale-105 transition-all duration-300 led-glow-orange"
            >
              Call Now
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <Link
              href="/admin"
              className="text-gray-400 hover:text-brand-gold transition-colors p-2"
              title="Admin Portal"
            >
              <Settings className="h-5 w-5" />
            </Link>
            <button
              onClick={toggleMenu}
              className="rounded-lg p-2 text-gray-400 hover:text-brand-gold hover:bg-brand-charcoal/50 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden border-t border-brand-gold/10 bg-brand-black/95 backdrop-blur-lg overflow-hidden"
          >
            <div className="space-y-2 px-4 py-6">
              {navLinks.map((link) => {
                return (
                  <a
                    key={link.href}
                    onClick={() => setIsOpen(false)}
                    href={link.href}
                    className="block rounded-lg px-4 py-3 text-base font-semibold text-gray-300 hover:bg-brand-charcoal/50 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                );
              })}
              <div className="pt-4 border-t border-brand-charcoal mt-4">
                <a
                  onClick={() => setIsOpen(false)}
                  href={`tel:${OWNER_PHONE}`}
                  className="block w-full text-center rounded-full bg-gradient-to-r from-brand-orange to-brand-gold px-6 py-3 text-base font-bold text-white shadow-lg led-glow-orange"
                >
                  Call Now
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
