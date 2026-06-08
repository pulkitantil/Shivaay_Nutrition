'use client';

import { motion } from 'framer-motion';

const BRANDS = [
  { name: 'MuscleBlaze', country: 'India', info: 'Leading Indian fitness brand' },
  { name: 'Optimum Nutrition', country: 'USA', info: 'World\'s #1 whey provider' },
  { name: 'GNC', country: 'USA', info: 'General Nutrition Center' },
  { name: 'Avvatar', country: 'India', info: '100% fresh grass-to-dairy whey' },
  { name: 'BSN', country: 'USA', info: 'Syntha-6 legendary taste' },
  { name: 'Kevin Levrone', country: 'USA', info: 'Signature Series elite fuel' },
  { name: 'BigMuscles', country: 'India', info: 'Premium authentic supplements' },
  { name: 'Labrada', country: 'USA', info: 'Muscle Mass Gainers standard' },
];

export default function BrandsMarquee() {
  // Double the list to create a seamless infinite loop
  const brandsLoop = [...BRANDS, ...BRANDS, ...BRANDS];

  return (
    <div className="relative w-full overflow-hidden bg-brand-charcoal/40 py-10 border-y border-brand-gold/10">
      {/* Side Vignette Fades */}
      <div className="absolute left-0 top-0 bottom-0 w-20 md:w-48 bg-gradient-to-r from-brand-black to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 md:w-48 bg-gradient-to-l from-brand-black to-transparent z-10 pointer-events-none" />

      {/* Infinite scrolling track */}
      <div className="flex w-max">
        <motion.div
          animate={{ x: [0, -1400] }}
          transition={{
            ease: 'linear',
            duration: 25,
            repeat: Infinity,
          }}
          className="flex gap-6 md:gap-8 px-4"
        >
          {brandsLoop.map((brand, idx) => (
            <div
              key={idx}
              className="w-48 md:w-56 shrink-0 p-5 rounded-xl glass-panel relative overflow-hidden flex flex-col justify-between group hover:border-brand-orange/40 transition-all duration-300 select-none cursor-pointer"
            >
              {/* LED glow detail inside on hover */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-orange to-brand-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div>
                <span className="text-[10px] text-brand-gold font-bold tracking-widest uppercase">
                  {brand.country}
                </span>
                <h3 className="text-white text-base md:text-lg font-black tracking-wide uppercase mt-1 leading-snug group-hover:text-brand-orange transition-colors">
                  {brand.name}
                </h3>
              </div>

              <p className="text-[10px] text-gray-500 mt-4 leading-relaxed group-hover:text-gray-400 transition-colors">
                {brand.info}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
