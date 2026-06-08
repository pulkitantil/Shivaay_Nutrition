import Link from 'next/link';
import { Dumbbell, Instagram, Mail, Phone, MapPin, Youtube, MessageCircle } from 'lucide-react';
import { OWNER_PHONE, OWNER_WHATSAPP, OWNER_EMAIL, STORE_ADDRESS } from '@/config';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const storeContact = {
    phone: OWNER_PHONE,
    whatsapp: OWNER_WHATSAPP,
    address: STORE_ADDRESS,
    email: OWNER_EMAIL,
    instagram: 'https://instagram.com/shivaay_nutrition'
  };

  return (
    <footer className="bg-brand-black border-t border-brand-charcoal pt-16 pb-8 relative overflow-hidden">
      {/* Decorative LED line at the top */}
      <div className="absolute top-0 left-0 right-0 led-strip-gold opacity-50" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-br from-brand-orange to-brand-gold p-2 text-brand-black">
                <Dumbbell className="h-6 w-6" />
              </div>
              <span className="text-lg font-extrabold tracking-wider text-white">
                SHIVAAY <span className="text-brand-gold text-glow-gold">NUTRITION</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Sonipat's premium luxury fitness showroom. We supply 100% authentic supplements, provide expert guidance, and guarantee the best market prices.
            </p>
            {/* Socials */}
            <div className="flex items-center gap-4 pt-2">
              <a
                href={storeContact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-brand-charcoal flex items-center justify-center text-gray-300 hover:text-brand-gold hover:scale-110 transition-all border border-brand-gold/10"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={`https://wa.me/${storeContact.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-brand-charcoal flex items-center justify-center text-gray-300 hover:text-brand-orange hover:scale-110 transition-all border border-brand-gold/10"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-brand-charcoal flex items-center justify-center text-gray-300 hover:text-brand-gold hover:scale-110 transition-all border border-brand-gold/10"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-base tracking-wider uppercase mb-6 border-b border-brand-gold/10 pb-2 inline-block">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-brand-gold transition-colors">Home Page</Link>
              </li>
              <li>
                <Link href="/#products" className="hover:text-brand-gold transition-colors">Supplement Catalog</Link>
              </li>
              <li>
                <Link href="/#location" className="hover:text-brand-gold transition-colors">Store Location</Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-brand-gold transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Store Timings */}
          <div>
            <h3 className="text-white font-bold text-base tracking-wider uppercase mb-6 border-b border-brand-gold/10 pb-2 inline-block">
              Showroom Hours
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex justify-between">
                <span>Mon - Sat:</span>
                <span className="text-brand-gold">10:00 AM - 09:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday:</span>
                <span className="text-brand-orange">Closed (Rest Day)</span>
              </li>
              <li className="pt-2 text-xs text-gray-500 italic">
                *Order online 24/7 on WhatsApp! Delivery dispatched next business day.
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-bold text-base tracking-wider uppercase mb-6 border-b border-brand-gold/10 pb-2 inline-block">
              Get In Touch
            </h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex gap-3">
                <MapPin className="h-5 w-5 text-brand-gold shrink-0 mt-0.5" />
                <span className="leading-relaxed">{storeContact.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-brand-gold shrink-0" />
                <span>{storeContact.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-brand-gold shrink-0" />
                <a href={`mailto:${storeContact.email}`} className="hover:text-brand-gold transition-colors break-all">
                  {storeContact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright and disclaimer */}
        <div className="border-t border-brand-charcoal/60 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© {currentYear} Shivaay Nutrition. All Rights Reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-gray-400 cursor-pointer">100% Authentic Guarantee</span>
            <span className="hover:text-gray-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-400 cursor-pointer">Terms & Conditions</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
