import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ClientShell from '@/components/ClientShell';

export const metadata: Metadata = {
  title: 'Shivaay Nutrition | Premium Authentic Supplements Store Sonipat',
  description:
    'Shivaay Nutrition is Sonipat\'s premium luxury fitness showroom offering 100% authentic Whey Protein, Mass Gainers, Creatine, Pre-workouts, and multivitamins. Visit us for expert guidance & best prices.',
  keywords: [
    'supplement store',
    'whey protein Sonipat',
    'authentic supplements',
    'gym showroom Sonipat',
    'creatine buy online',
    'Shivaay Nutrition',
    'pre-workout store',
  ],
  authors: [{ name: 'Shivaay Nutrition' }],
  openGraph: {
    title: 'Shivaay Nutrition | Premium Supplements & Vitamins Showroom',
    description:
      'Explore our curated inventory of authentic whey protein, gainers, creatine, and pre-workouts. Fast delivery & expert guidance.',
    type: 'website',
    locale: 'en_IN',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-brand-black text-white selection:bg-brand-orange selection:text-white" suppressHydrationWarning>
        {/* Sticky Header Navbar */}
        <Navbar />

        {/* Dynamic page contents */}
        <main className="flex-grow page-transition-container relative z-10">
          {children}
        </main>

        {/* Sticky floating widgets */}
        <ClientShell />

        {/* Universal Footer */}
        <Footer />
      </body>
    </html>
  );
}
