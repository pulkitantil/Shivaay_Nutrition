'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

interface Product {
  id?: string;
  _id?: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  status: 'In Stock' | 'Limited Stock' | 'Out of Stock';
  image: string;
  description: string;
}

interface ProductCardProps {
  product: Product;
  formatPrice: (price: number) => string;
  onInstantOrder: (product: Product) => void;
  onDetailsClick: (productId: string) => void;
}

export default function ProductCard({
  product,
  formatPrice,
  onInstantOrder,
  onDetailsClick
}: ProductCardProps) {
  const [imgSrc, setImgSrc] = useState(product.image);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl glass-panel glass-panel-hover flex flex-col h-full overflow-hidden group border border-brand-gold/15"
    >
      {/* Img Box */}
      <div className="relative aspect-square w-full bg-brand-black overflow-hidden border-b border-brand-gold/10">
        <Image
          src={imgSrc}
          alt={product.name}
          width={400}
          height={400}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          onError={() => {
            setImgSrc('https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=600');
          }}
        />
        <div className="absolute top-3 right-3 z-10">
          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase ${
            product.status === 'In Stock' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
            product.status === 'Limited Stock' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
            'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}>
            {product.status}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md rounded px-2.5 py-0.5 border border-brand-gold/10 z-10">
          <span className="text-[9px] font-extrabold tracking-wider text-brand-gold uppercase">{product.brand}</span>
        </div>
      </div>

      {/* Details Box */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex-grow space-y-2">
          <h3 className="text-white font-extrabold text-sm leading-snug group-hover:text-brand-gold transition-colors duration-300">
            {product.name}
          </h3>
          <p className="text-gray-400 text-[11px] line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="h-[1px] bg-brand-gold/10 w-full my-4" />

        <div className="flex items-center justify-between mt-auto gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] text-gray-500 font-bold uppercase">Price</span>
            <span className="text-white font-extrabold text-base">{formatPrice(product.price)}</span>
          </div>

          {product.status === 'Out of Stock' ? (
            <button disabled className="rounded-full bg-brand-charcoal text-gray-500 border border-brand-charcoal px-3 py-2 text-[10px] font-bold cursor-not-allowed">
              Sold Out
            </button>
          ) : (
            <div className="flex gap-1.5">
              <button
                onClick={() => onDetailsClick(product.id || product._id || '')}
                className="rounded-full bg-brand-charcoal hover:bg-brand-charcoal/80 border border-brand-gold/20 text-brand-gold px-3.5 py-2 text-[10px] font-bold transition-all duration-300"
              >
                Details
              </button>
              <button
                onClick={() => onInstantOrder(product)}
                className="flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-orange to-brand-gold text-white px-3.5 py-2 text-[10px] font-bold hover:scale-105 duration-300 shadow led-glow-orange cursor-pointer"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>Order</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
