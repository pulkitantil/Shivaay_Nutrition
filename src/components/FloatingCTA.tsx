'use client';

import { Phone, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { OWNER_PHONE, OWNER_WHATSAPP } from '@/config';

export default function FloatingCTA() {
  const storeContact = {
    phone: OWNER_PHONE,
    whatsapp: OWNER_WHATSAPP,
  };

  const containerVariants = {
    initial: { opacity: 0, y: 50 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 260,
        damping: 20,
        delay: 1,
      },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.1 },
    tap: { scale: 0.9 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="fixed bottom-6 right-6 z-40 flex flex-col gap-4"
    >
      {/* Call Button */}
      <motion.a
        href={`tel:${storeContact.phone}`}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-charcoal text-brand-gold border border-brand-gold/30 shadow-lg shadow-black/50 hover:shadow-brand-gold/20 transition-all duration-300 relative group"
        aria-label="Call Store"
      >
        <Phone className="h-6 w-6" />
        <span className="absolute right-16 top-1/2 -translate-y-1/2 rounded bg-brand-charcoal border border-brand-gold/20 px-3 py-1 text-xs font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          Call Showroom
        </span>
      </motion.a>

      {/* WhatsApp Button */}
      <motion.a
        href={`https://wa.me/${storeContact.whatsapp}?text=Hello%20Shivaay%20Nutrition!%20I'm%20interested%20in%20ordering%20supplements.`}
        target="_blank"
        rel="noopener noreferrer"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange to-brand-gold text-white shadow-lg shadow-brand-orange/30 hover:shadow-brand-orange/50 transition-all duration-300 relative group led-glow-orange"
        aria-label="Order on WhatsApp"
      >
        {/* Pulsing Outer Ring */}
        <span className="absolute -inset-1 rounded-full bg-brand-orange/30 animate-ping opacity-75" />
        
        <MessageCircle className="h-6 w-6 relative z-10" />
        <span className="absolute right-16 top-1/2 -translate-y-1/2 rounded bg-brand-charcoal border border-brand-orange/20 px-3 py-1 text-xs font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          WhatsApp Order
        </span>
      </motion.a>
    </motion.div>
  );
}
