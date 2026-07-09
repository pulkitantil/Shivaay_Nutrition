'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, ShieldQuestion } from 'lucide-react';

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: 'How do I check my supplement authenticity code?', a: 'All proteins shipped by Shivaay contain official authorized importer labels (such as Bright Performance, Glanbia, or MuscleHouse). Scratch the sticker card to get your unique code, then text or submit it to the importer portal.' },
    { q: 'What are delivery shipping speeds?', a: 'Timings depend on destination: we offer same-day dispatch inside Sonipat for orders placed before 5 PM (free shipping above ₹4,000). Delhi/NCR deliveries take 1-2 days, while shipping across India takes 3-5 business days.' },
    { q: 'Do you match prices with online portals?', a: 'Yes, we price-match with physical authorized showroom retailers. However, since large online marketplaces harbor unverified third-party sellers, we do not price match with them to prevent selling counterfeit formulas.' },
    { q: 'What payment methods do you support?', a: 'Only online payments are accepted via card and UPI (Google Pay, PhonePe, Paytm, etc.). For in-hand/cash payments, you can visit our Sonipat showroom.' }
  ];

  return (
    <div className="max-w-3xl mx-auto mt-20 border-t border-brand-charcoal/50 pt-16">
      <div className="text-center space-y-3 mb-10">
        <h3 className="text-xl font-black uppercase text-white flex items-center justify-center gap-2">
          <ShieldQuestion className="h-5 w-5 text-brand-gold" />
          <span>Frequently Asked Questions</span>
        </h3>
        <p className="text-[10px] text-gray-500">Authenticity verification and delivery guidelines</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div key={idx} className="glass-panel rounded-xl overflow-hidden border border-brand-gold/5">
              <button
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                className="w-full flex justify-between items-center p-4 text-left text-xs sm:text-sm font-bold text-white hover:text-brand-gold duration-300"
              >
                <span>{faq.q}</span>
                {isOpen ? <ChevronUp className="h-4 w-4 text-brand-gold" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-brand-charcoal/20 border-t border-brand-gold/5"
                  >
                    <p className="p-4 text-[11px] text-gray-400 leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
