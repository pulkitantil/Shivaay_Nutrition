'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { 
  ShieldCheck, 
  Sparkles, 
  MessageSquare, 
  ArrowRight, 
  Trophy, 
  Search, 
  FilterX, 
  MessageCircle,
  Truck,
  Award,
  HeartHandshake,
  MapPin,
  Clock,
  Building,
  Navigation,
  Phone,
  Send,
  ShieldQuestion,
  ChevronDown,
  ChevronUp,
  User,
  LogOut,
  ShoppingBag,
  Printer
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import BrandsMarquee from '@/components/BrandsMarquee';
import { OWNER_PHONE, OWNER_WHATSAPP, STORE_ADDRESS, MAPS_URL } from '@/config';
import { api, Order } from '@/services/api';



// Counter component for stats
function Counter({ value, suffix = '', duration = 1.5 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const isInView = useInView(elementRef, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    if (value <= 0) {
      setCount(0);
      return;
    }
    let start = 0;
    const end = value;
    const stepTime = Math.max(Math.floor((duration * 1000) / end), 12);
    
    const timer = setInterval(() => {
      start += Math.ceil(end / 50);
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return (
    <span ref={elementRef} className="font-black text-4xl md:text-5xl text-brand-gold text-glow-gold tracking-tight">
      {count}{suffix}
    </span>
  );
}

export default function Home() {
  const router = useRouter();
  const {
    user,
    token,
    login,
    register,
    logout,
    products,
    fetchProducts,
    categories,
    createOrder,
    authLoading,
  } = useStore();

  useEffect(() => {
    if (token && user?.role === 'admin') {
      router.push('/admin');
    }
  }, [token, user, router]);

  const [myOrders, setMyOrders] = useState<Order[]>([]);

  const formatDate = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  useEffect(() => {
    if (token && user?.role === 'customer') {
      api.orders.getMyOrders().then(setMyOrders).catch(console.error);
    }
  }, [token, user]);

  const [mounted, setMounted] = useState(false);

  // Home Page Filter & Search States
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Real database stats
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalProducts: 0,
    totalBrands: 0,
    totalOrders: 0
  });

  // Auth Card state
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');



  // Ordering Form State
  const [orderName, setOrderName] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderProductId, setOrderProductId] = useState('');
  const [orderQty, setOrderQty] = useState('1');
  const [orderFlavor, setOrderFlavor] = useState('Double Rich Chocolate');
  const [orderNotes, setOrderNotes] = useState('');

  // FAQs Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Initial Fetches
  useEffect(() => {
    setMounted(true);
    fetchProducts();
    
    const loadStats = async () => {
      try {
        const data = await api.stats.getPublic();
        setStats(data);
      } catch (err) {
        console.warn('Failed to load stats:', err);
      }
    };
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch orders when user logins
  useEffect(() => {
    if (token && user) {
      setOrderName(user.name);
      setOrderPhone(user.phone);
    }
  }, [token, user]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-black">
        <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-brand-orange animate-spin" />
      </div>
    );
  }

  // Filter products list
  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Calculate pricing format
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Build WhatsApp payload link
  const getWhatsAppLink = (product: any, qty = 1, flavor = 'Double Rich Chocolate', orderId?: string) => {
    const text = encodeURIComponent(
      `Hello Shivaay Nutrition! I want to order the supplement:\n\n` +
      (orderId ? `*ORDER ID:* ${orderId}\n` : '') +
      `*Product:* ${product.name}\n` +
      `*Brand:* ${product.brand}\n` +
      `*Flavour:* ${flavor}\n` +
      `*Quantity:* ${qty} Tub(s)\n` +
      `*Price Total:* ${formatPrice(product.price * qty)}\n\n` +
      `Is this in stock and ready for delivery?`
    );
    return `https://wa.me/${OWNER_WHATSAPP}?text=${text}`;
  };

  // Handle Instant Order from Product Card
  const handleInstantOrder = async (product: any) => {
    if (!token || !user) {
      alert('Please login to place an order');
      document.getElementById('orders')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const amount = product.price;
    const orderPayload = {
      userId: user.id || null,
      customerDetails: { name: user.name, phone: user.phone },
      products: [
        {
          productId: product.id || product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
          flavor: 'Double Rich Chocolate'
        }
      ],
      amount,
      deliveryAddress: 'Showroom Pickup',
      paymentMethod: 'Card / UPI'
    };

    let result = null;
    try {
      result = await createOrder(orderPayload);
      if (token && user?.role === 'customer') {
        api.orders.getMyOrders().then(setMyOrders).catch(console.error);
      }
    } catch (err) {
      console.error('Failed to save order to DB:', err);
    }

    const orderId = result?.id || result?._id || 'Pending';
    window.open(getWhatsAppLink(product, 1, 'Double Rich Chocolate', orderId), '_blank');
  };

  // Handle Auth Card submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let loggedInUser = null;
      if (authTab === 'login') {
        loggedInUser = await login({ email: authEmail, password: authPassword });
        if (loggedInUser?.role === 'admin') {
          router.push('/admin');
          return;
        }
      } else {
        loggedInUser = await register({ name: authName, email: authEmail, phone: authPhone, password: authPassword });
      }
      // Clear forms
      setAuthPassword('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      alert(message);
    }
  };

  // Checkout ordering form submit
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user) {
      alert('Please login to place an order');
      document.getElementById('orders')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (!orderName || !orderPhone || !orderProductId) {
      alert('Please fill out Name, Phone, and choose a Supplement.');
      return;
    }

    const selectedProduct = products.find(p => p.id === orderProductId || p._id === orderProductId);
    if (!selectedProduct) return;

    const qty = parseInt(orderQty);
    const amount = selectedProduct.price * qty;

    const orderPayload = {
      userId: user?.id || null,
      customerDetails: { name: orderName, phone: orderPhone },
      products: [
        {
          productId: selectedProduct.id || selectedProduct._id,
          name: selectedProduct.name,
          price: selectedProduct.price,
          quantity: qty,
          flavor: orderFlavor
        }
      ],
      amount,
      deliveryAddress: orderNotes || 'Showroom Pickup',
      paymentMethod: 'Card / UPI'
    };

    let result = null;
    try {
      // 1. Save order to backend
      result = await createOrder(orderPayload);
      if (token && user?.role === 'customer') {
        api.orders.getMyOrders().then(setMyOrders).catch(console.error);
      }
    } catch (err) {
      console.error('Failed to save order to DB:', err);
    }

    // 2. Build WhatsApp redirect link
    const orderId = result?.id || result?._id || 'Pending';
    const text = encodeURIComponent(
      `Hello Shivaay Nutrition! I'd like to place this order:\n\n` +
      `*ORDER ID:* ${orderId}\n` +
      `*CUSTOMER:* ${orderName} (${orderPhone})\n\n` +
      `*ITEMS:* ${selectedProduct.name} (${orderFlavor}) x ${qty}\n` +
      `*AMOUNT:* ${formatPrice(amount)}\n\n` +
      `*DELIVERY NOTES:* ${orderNotes || 'Showroom Pickup'}\n\n` +
      `Please confirm delivery dispatch.`
    );
    
    // Open WhatsApp
    window.open(`https://wa.me/${OWNER_WHATSAPP}?text=${text}`, '_blank');
    
    // Reset order fields
    setOrderProductId('');
    setOrderNotes('');
  };

  // Print Invoice Popup Window
  const handlePrintInvoice = (order: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const productRows = order.products.map((p: any) => `
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 10px 0;">${p.name}<br/><span style="font-size: 10px; color: #666;">Flavour: ${p.flavor}</span></td>
        <td style="padding: 10px 0; text-align: center;">₹${p.price.toLocaleString()}</td>
        <td style="padding: 10px 0; text-align: center;">${p.quantity}</td>
        <td style="padding: 10px 0; text-align: right;">₹${(p.price * p.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.id || order._id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #222; margin: 40px; line-height: 1.6; }
            .invoice-box { max-width: 800px; margin: auto; }
            .header { border-bottom: 3px solid #FF6B00; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 24px; font-weight: bold; color: #000; }
            .logo span { color: #F5B041; }
            .details-table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            .details-table th { background: #f9f9f9; padding: 10px; font-size: 12px; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #ddd; }
            .total-row td { font-size: 16px; font-weight: bold; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div class="logo">SHIVAAY <span>NUTRITION</span></div>
              <div style="text-align: right;">
                <h3>TAX INVOICE</h3>
                <p style="font-size: 12px; color: #666;">Invoice ID: ${order.id || order._id}</p>
                <p style="font-size: 12px; color: #666;">Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
              <div>
                <strong>Billed To:</strong><br/>
                ${order.customerDetails.name}<br/>
                Phone: ${order.customerDetails.phone}<br/>
                Address: ${order.deliveryAddress || 'Showroom Pickup'}
              </div>
              <div style="text-align: right;">
                <strong>Showroom Address:</strong><br/>
                Shivaay Nutrition Store<br/>
                1st floor, Omaxe plaza, Omaxe City<br/>
                Sonipat, HR - 131027
              </div>
            </div>

            <table class="details-table">
              <thead>
                <tr>
                  <th style="text-align: left;">Product</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th style="text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${productRows}
                <tr class="total-row">
                  <td colspan="2"></td>
                  <td style="text-align: center; border-top: 2px solid #000;">Total:</td>
                  <td style="text-align: right; border-top: 2px solid #000; color: #FF6B00;">₹${order.amount.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <div style="margin-top: 60px; border-top: 1px dashed #ddd; padding-top: 20px; text-align: center; font-size: 11px; color: #888;">
              Thank you for fueling with Shivaay Nutrition! This is a computer-generated tax invoice. For query, call +91 99999 88888.
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="w-full relative">
      {/* SECTION 1 — CINEMATIC HERO */}
      <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-brand-black">
        {/* Real Showroom Backdrop Image with blur filter */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 select-none pointer-events-none filter blur-[2px]"
          style={{ backgroundImage: `url('/showroom_background.png')` }}
        />
        
        {/* Radial ambient light gradients */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-brand-orange/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-brand-gold/10 blur-[130px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-brand-black/90 pointer-events-none" />

        {/* Subtle LED top lights */}
        <div className="absolute top-0 left-0 right-0 led-strip-orange opacity-40" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 w-full relative z-20">
          <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto py-12 space-y-8">
            {/* Premium Store Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-charcoal/90 border border-brand-gold/20 text-xs font-bold text-brand-gold tracking-wide"
            >
              <span className="h-2 w-2 rounded-full bg-brand-gold animate-pulse" />
              <span>Premium Supplement Store</span>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.1] uppercase">
                Fuel Your <br />
                <span className="bg-gradient-to-r from-brand-orange via-brand-gold to-brand-orange bg-[length:200%_auto] text-transparent bg-clip-text text-glow-gold animate-[pulse_3s_infinite]">
                  Transformation
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-gray-400 font-semibold tracking-wide">
                100% Authentic Supplements • Expert Guidance • Best Prices
              </p>
            </motion.div>

            {/* CTA Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 pt-2 justify-center w-full sm:w-auto"
            >
              <a
                href="#products"
                className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-orange to-brand-gold px-8 py-4 text-sm font-bold text-white shadow-xl shadow-brand-orange/20 hover:scale-105 transition-transform duration-300 led-glow-orange cursor-pointer"
              >
                <span>View Products</span>
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={`https://wa.me/${OWNER_WHATSAPP}?text=Hello%20Shivaay%20Nutrition!%20I'm%20looking%20for%20authentic%20supplement%20guidance.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-brand-charcoal border border-brand-gold/30 hover:border-brand-gold px-8 py-4 text-sm font-bold text-brand-gold hover:scale-105 transition-all duration-300"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Order on WhatsApp</span>
              </a>
            </motion.div>

            {/* Micro Ratings */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="flex items-center justify-center gap-6 pt-6 border-t border-brand-charcoal/50 w-full max-w-md"
            >
              <div>
                <p className="text-lg font-extrabold text-white">4.1/5 ★</p>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Google Store Rating</p>
              </div>
              <div className="h-8 w-[1px] bg-brand-charcoal/60" />
              <div>
                <p className="text-lg font-extrabold text-white">{stats.totalCustomers || 0}</p>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Customers Served</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none opacity-40 animate-bounce">
          <span className="text-[9px] tracking-widest text-gray-500 font-bold uppercase">Scroll to shop</span>
          <div className="w-4 h-7 rounded-full border border-gray-600 flex justify-center p-0.5">
            <div className="w-1 h-1.5 bg-brand-gold rounded-full" />
          </div>
        </div>
      </section>


      {/* SECTION 2 — PRODUCTS SHOWCASE */}
      <section id="products" className="py-24 bg-brand-black relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-charcoal border border-brand-gold/15 text-xs text-brand-gold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>100% Importer Scratch Stickered</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black uppercase text-white">
              Showroom <span className="text-brand-gold text-glow-gold">Catalogue</span>
            </h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              Select supplements from our verified stock catalog below. Order directly on WhatsApp or buy through our instant checkouts.
            </p>
          </div>

          {/* Filtering Controller */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-12 p-6 glass-panel rounded-2xl">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search supplements or brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-brand-black border border-brand-gold/10 hover:border-brand-gold/25 focus:border-brand-gold rounded-full py-2.5 pl-11 pr-4 text-xs text-white focus:outline-none transition-colors"
              />
            </div>

            {/* Categories Scrollable Tabs */}
            <div className="w-full md:w-auto overflow-x-auto flex items-center gap-2 pb-2 md:pb-0 scrollbar-none">
              {['All', ...categories].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-brand-orange to-brand-gold text-white shadow led-glow-orange'
                      : 'bg-brand-black text-gray-400 border border-brand-gold/10 hover:border-brand-gold/25'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Grid */}
          <AnimatePresence mode="popLayout">
            {filteredProducts.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              >
                {filteredProducts.map((product) => (
                  <motion.div
                    layout
                    key={product.id || product._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-2xl glass-panel glass-panel-hover flex flex-col h-full overflow-hidden group border border-brand-gold/15"
                  >
                    {/* Img Box */}
                    <div className="relative aspect-square w-full bg-brand-black overflow-hidden border-b border-brand-gold/10">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=600';
                        }}
                      />
                      <div className="absolute top-3 right-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase ${
                          product.status === 'In Stock' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                          product.status === 'Limited Stock' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}>
                          {product.status}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md rounded px-2.5 py-0.5 border border-brand-gold/10">
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
                              onClick={() => {
                                setOrderProductId(product.id || product._id);
                                window.location.hash = 'contact';
                              }}
                              className="rounded-full bg-brand-charcoal hover:bg-brand-charcoal/80 border border-brand-gold/20 text-brand-gold px-3.5 py-2 text-[10px] font-bold transition-all duration-300"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => handleInstantOrder(product)}
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
                ))}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 glass-panel rounded-2xl max-w-sm mx-auto text-center space-y-4">
                <FilterX className="h-10 w-10 text-brand-gold" />
                <h3 className="text-white font-bold">No Supplements Found</h3>
                <p className="text-gray-400 text-xs">Try adjusting your filters or search terms.</p>
                <button onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }} className="rounded-full bg-brand-charcoal border border-brand-gold/25 px-4 py-2 text-xs font-bold text-brand-gold">
                  Reset Filters
                </button>
              </div>
            )}
          </AnimatePresence>

        </div>
      </section>





      {/* SECTION 4 — WHY CHOOSE SHIVAAY */}
      <section className="py-24 bg-brand-black border-t border-brand-charcoal/40 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Copy */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-charcoal border border-brand-gold/15 text-xs text-brand-gold uppercase font-bold tracking-wider">
                <Sparkles className="h-4 w-4" />
                <span>The Showroom Advantage</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold uppercase text-white leading-snug">
                Why Choose <br />
                <span className="text-brand-gold text-glow-gold">Shivaay Nutrition?</span>
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                We bridge the gap between online marketplaces and standard local retail. When you visit Shivaay, you walk into a premium fitness lounge designed to make supplement buying secure, transparent, and personalized.
              </p>
              <div className="border-l-4 border-brand-gold pl-4 italic text-gray-500 text-xs leading-relaxed">
                "Our mission is simple: 100% original formulas. Every container is verified on official importer codes. If it's not original, we stand by a 200% checkout cash refund."
              </div>
            </div>

            {/* Checklist */}
            <div className="lg:col-span-7 space-y-4">
              {[
                { icon: <ShieldCheck />, title: '100% Genuine Products', desc: 'Direct sourcing from official authorized importers (Bright, Glanbia, MuscleHouse). Hologram stickered.' },
                { icon: <Award />, title: 'Top Global Brands', desc: 'Official retail partners with Optimum Nutrition, MuscleTech, Avvatar, Labrada, GNC.' },
                { icon: <HeartHandshake />, title: 'Certified Fitness Instructors', desc: 'Consult directly with professional trainers at our showroom to match stacks to weight goals.' },
                { icon: <Truck />, title: 'NCR Dispatch in Hours', desc: 'Same-day home delivery inside Sonipat. Fast 1-2 day shipping across Delhi/NCR.' }
              ].map((f, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl bg-brand-charcoal/30 border border-brand-gold/5 hover:border-brand-gold/15 duration-300 group">
                  <div className="w-10 h-10 rounded-lg bg-brand-charcoal border border-brand-gold/10 flex items-center justify-center shrink-0 text-brand-gold group-hover:bg-brand-gold group-hover:text-brand-black transition-colors duration-300">
                    {f.icon}
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-white font-extrabold text-xs sm:text-sm uppercase tracking-wide group-hover:text-brand-gold duration-300">{f.title}</h3>
                    <p className="text-gray-400 text-[11px] leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 p-8 glass-panel rounded-3xl text-center relative overflow-hidden wood-texture mt-16 border border-brand-gold/15">
            <div className="space-y-1 py-3">
              <Counter value={stats.totalCustomers} />
              <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">Happy Customers</p>
              <p className="text-[9px] text-gray-500">Verified Delhi NCR Buyers</p>
            </div>
            <div className="space-y-1 py-3 border-t sm:border-t-0 sm:border-x border-brand-gold/10">
              <Counter value={stats.totalProducts} />
              <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">Products In Stock</p>
              <p className="text-[9px] text-gray-500">Whey, Creatine, Stacks</p>
            </div>
            <div className="space-y-1 py-3 border-t sm:border-t-0 sm:border-r border-brand-gold/10">
              <Counter value={stats.totalBrands} />
              <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">Premium Brands</p>
              <p className="text-[9px] text-gray-500">Authorized Dealerships</p>
            </div>
            <div className="space-y-1 py-3 border-t sm:border-t-0">
              <Counter value={stats.totalOrders} />
              <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">Orders Daily</p>
              <p className="text-[9px] text-gray-500">Sonipat Rapid Dispatch</p>
            </div>
          </div>

        </div>
      </section>


      {/* SECTION 5 — BRANDS WE SELL */}
      <section className="bg-brand-black">
        <BrandsMarquee />
      </section>


      {/* SECTION 6 — AI FITNESS ASSISTANT PROMO */}
      <section className="py-24 bg-brand-black relative">
        <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-brand-orange/5 blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="p-8 md:p-12 rounded-3xl glass-panel relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 border border-brand-gold/20">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-orange to-brand-gold" />
            
            <div className="space-y-5 text-left max-w-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-black border border-brand-gold/15 text-xs text-brand-gold font-bold">
                <Sparkles className="h-3.5 w-3.5 text-brand-gold animate-spin" />
                <span>MEET YOUR SHIVAAY COACH</span>
              </div>
              <h2 className="text-3xl font-black uppercase text-white leading-tight">
                AI-Powered <br />
                <span className="text-brand-gold text-glow-gold">Fitness Guidance</span>
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Stuck choosing between Whey Protein and Mass Gainers? Need pricing details or want to know if creatine is available? Ask our voice-enabled AI assistant in English, Hindi, or Hinglish!
              </p>
              <div className="grid grid-cols-2 gap-3 text-[11px] text-gray-400">
                <div className="flex items-center gap-2 bg-brand-black/40 p-2.5 rounded-lg border border-brand-gold/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                  <span>"Creatine available hai?"</span>
                </div>
                <div className="flex items-center gap-2 bg-brand-black/40 p-2.5 rounded-lg border border-brand-gold/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                  <span>"Best whey under 2500"</span>
                </div>
                <div className="flex items-center gap-2 bg-brand-black/40 p-2.5 rounded-lg border border-brand-gold/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                  <span>"Weight gain ke liye stack?"</span>
                </div>
                <div className="flex items-center gap-2 bg-brand-black/40 p-2.5 rounded-lg border border-brand-gold/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                  <span>"My order status?"</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 text-center shrink-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-orange to-brand-gold flex items-center justify-center shadow-lg shadow-brand-orange/25 led-glow-orange mx-auto animate-pulse">
                <MessageSquare className="h-10 w-10 text-brand-black" />
              </div>
              <p className="text-xs text-white font-bold">Speech Active Widget</p>
              <p className="text-[10px] text-gray-500 max-w-[150px] mx-auto">Click the floating bot icon on bottom right to chat!</p>
            </div>
          </div>
        </div>
      </section>


      {/* SECTION 7 — ORDER HISTORY & AUTH */}
      <section id="orders" className="py-24 bg-brand-black relative">
        <div className="absolute top-0 left-0 right-0 led-strip-gold opacity-35" />
        
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-white">
              Order <span className="text-brand-gold text-glow-gold">Tracking</span>
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto">
              Log in to review your purchase histories, track shipping dispatch states, or print official invoice receipts.
            </p>
          </div>

          {!token ? (
            /* Tabbed Login/Register glassmorphic card */
            <div className="glass-panel rounded-2xl overflow-hidden p-8 max-w-md mx-auto border border-brand-gold/15">
              <div className="flex border-b border-brand-gold/10 mb-6">
                <button
                  onClick={() => setAuthTab('login')}
                  className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                    authTab === 'login' ? 'text-brand-gold border-b-2 border-brand-gold' : 'text-gray-500'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthTab('register')}
                  className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                    authTab === 'register' ? 'text-brand-gold border-b-2 border-brand-gold' : 'text-gray-500'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
                {authTab === 'register' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter your name"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full bg-brand-black border border-brand-gold/10 focus:border-brand-orange rounded-lg p-2.5 text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400">Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="WhatsApp contact"
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        className="w-full bg-brand-black border border-brand-gold/10 focus:border-brand-orange rounded-lg p-2.5 text-white focus:outline-none"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@email.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-brand-black border border-brand-gold/10 focus:border-brand-orange rounded-lg p-2.5 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-brand-black border border-brand-gold/10 focus:border-brand-orange rounded-lg p-2.5 text-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full rounded-lg bg-gradient-to-r from-brand-orange to-brand-gold py-3 text-xs font-bold text-white shadow hover:scale-[1.01] duration-300 mt-6"
                >
                  {authLoading ? 'Loading...' : authTab === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              </form>


            </div>
          ) : (
            /* Logged in User Profile & Order tracking */
            <div className="space-y-6">
              <div className="p-6 glass-panel rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-brand-gold/15">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-gold/10 border border-brand-gold/25 flex items-center justify-center text-brand-gold shrink-0">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-extrabold text-sm">{user?.name}</h3>
                    <p className="text-[10px] text-gray-400 font-medium">{user?.email} • {user?.phone}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 rounded-lg bg-brand-charcoal hover:bg-rose-500/10 border border-brand-gold/20 hover:border-rose-500/25 px-4 py-2 text-[10px] font-bold text-gray-400 hover:text-rose-400 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </div>

              {/* My Orders Section */}
              {user?.role === 'customer' && (
                <div className="space-y-4">
                  <h3 className="text-white font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-brand-gold" />
                    <span>My Orders</span>
                  </h3>

                  {myOrders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {myOrders.map((order) => {
                        const shortId = (order.id || order._id || '').slice(-6);
                        const status = order.status || 'Pending';
                        let statusColorClass = 'text-brand-orange border-brand-orange/20 bg-brand-orange/5';
                        if (status === 'Confirmed') {
                          statusColorClass = 'text-blue-400 border-blue-500/20 bg-blue-500/5';
                        } else if (status === 'Processing') {
                          statusColorClass = 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5';
                        } else if (status === 'Shipped') {
                          statusColorClass = 'text-purple-400 border-purple-500/20 bg-purple-500/5';
                        } else if (status === 'Delivered') {
                          statusColorClass = 'text-green-400 border-green-500/20 bg-green-500/5';
                        }

                        return (
                          <div
                            key={order.id || order._id}
                            className="glass-panel rounded-2xl p-4 border border-brand-gold/15 flex flex-col justify-between gap-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-gray-400">
                                Order ID: <span className="text-white font-bold">#{shortId}</span>
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${statusColorClass}`}>
                                {status}
                              </span>
                            </div>

                            <div className="space-y-1.5">
                              {order.products.map((p: any, idx: number) => (
                                <div key={idx} className="text-xs text-gray-300">
                                  <span className="text-white font-semibold">{p.name}</span>
                                  {p.flavor && <span className="text-gray-400 text-[10px]"> ({p.flavor})</span>}
                                  <span className="text-brand-gold font-bold"> x{p.quantity}</span>
                                </div>
                              ))}
                            </div>

                            <div className="border-t border-brand-gold/10 pt-2 flex items-center justify-between text-[11px]">
                              <span className="text-gray-500 font-medium">
                                {order.createdAt ? formatDate(order.createdAt) : ''}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handlePrintInvoice(order)}
                                  className="p-1 bg-brand-charcoal text-brand-gold border border-brand-gold/15 hover:border-brand-gold rounded-lg duration-300"
                                  title="Print Invoice"
                                >
                                  <Printer className="h-3.5 w-3.5" />
                                </button>
                                <span className="text-white font-extrabold">
                                  Total: <span className="text-brand-orange">₹{order.amount.toLocaleString('en-IN')}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="glass-panel rounded-2xl p-6 border border-brand-gold/15 text-center text-gray-400 text-xs py-8">
                      No orders yet. Start shopping! 💪
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </section>


      {/* SECTION 8 — STORE LOCATION */}
      <section id="location" className="py-24 bg-brand-black relative">
        <div className="absolute top-0 left-0 right-0 led-strip-orange opacity-40" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-charcoal border border-brand-gold/15 text-xs text-brand-gold uppercase tracking-wider font-bold">
              <MapPin className="h-4 w-4" />
              <span>Sonipat Showroom</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black uppercase text-white">
              Showroom <span className="text-brand-gold text-glow-gold">Location</span>
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto">
              Visit our luxury supplement salon in Sonipat to check scratch codes, consult physical stock, and taste protein blends.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Info panel */}
            <div className="lg:col-span-5 flex flex-col justify-between p-8 rounded-2xl glass-panel relative overflow-hidden border border-brand-gold/15">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-orange to-brand-gold" />
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-extrabold text-xl uppercase tracking-wider">Shivaay Nutrition Store</h3>
                  <p className="text-[10px] text-brand-orange font-bold uppercase mt-1">Official Importer Dealer</p>
                </div>

                <div className="space-y-4 text-xs text-gray-300">
                  <div className="flex gap-3">
                    <MapPin className="h-5 w-5 text-brand-gold shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase">Address</span>
                      <p className="text-white mt-0.5">{STORE_ADDRESS}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Clock className="h-5 w-5 text-brand-gold shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase">Showroom Hours</span>
                      <p className="text-white mt-0.5">Mon - Sat: 10:00 AM - 9:00 PM | Sun: Closed</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-brand-gold/10 pt-6">
                  <h4 className="text-white font-bold text-xs uppercase mb-3 flex items-center gap-1.5">
                    <Building className="h-4 w-4 text-brand-gold" />
                    <span>Nearby Landmarks</span>
                  </h4>
                  <ul className="space-y-2 text-[11px] text-gray-400">
                    <li className="flex justify-between p-2.5 bg-brand-black/35 rounded border border-brand-gold/5">
                      <span className="font-bold text-white">The Fusion Gym</span>
                      <span>Located inside the gym premises</span>
                    </li>
                    <li className="flex justify-between p-2.5 bg-brand-black/35 rounded border border-brand-gold/5">
                      <span className="font-bold text-white">Omaxe Plaza</span>
                      <span>1st Floor, Omaxe City</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-brand-gold/10">
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-gold text-white font-bold py-3 text-xs shadow hover:scale-102 duration-300"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Navigate</span>
                </a>
                <a
                  href={`tel:${OWNER_PHONE}`}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-brand-charcoal border border-brand-gold/20 text-brand-gold font-bold py-3 text-xs hover:border-brand-gold duration-300"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call Store</span>
                </a>
              </div>
            </div>

            {/* Map iframe */}
            <div className="lg:col-span-7 h-[400px] lg:h-auto rounded-2xl overflow-hidden glass-panel p-2 border border-brand-gold/15">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3489.547397798284!2d77.0795684!3d29.000780000000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390db1ac9ff47777%3A0x87f6a5f518beca01!2sThe%20Fusion%20Gym!5e0!3m2!1sen!2sin!4v1780849964612!5m2!1sen!2sin"
                className="w-full h-full rounded-xl border border-brand-gold/10 bg-brand-charcoal"
                allowFullScreen
                loading="lazy"
                title="Shivaay Nutrition Store Map"
              />
            </div>
          </div>

        </div>
      </section>


      {/* SECTION 9 — CONTACT & ORDER FORM */}
      <section id="contact" className="py-24 bg-brand-black relative">
        <div className="absolute top-0 left-0 right-0 led-strip-gold opacity-35" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-charcoal border border-brand-gold/15 text-xs text-brand-gold uppercase tracking-wider font-bold">
              <Sparkles className="h-4 w-4" />
              <span>Instant Dispatch Queue</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black uppercase text-white">
              Contact & <span className="text-brand-orange text-glow-orange">Order Now</span>
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto">
              Draft your order list using our billing card below. It triggers WhatsApp with structured invoice fields for rapid delivery checkouts.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Direct Lines */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-6">
              <div className="p-8 rounded-2xl glass-panel relative overflow-hidden flex-grow flex flex-col justify-between border border-brand-gold/15">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-orange to-brand-gold" />
                
                <div className="space-y-6">
                  <div>
                    <span className="text-[9px] text-brand-gold font-bold uppercase tracking-wider">SHOWROOM DIRECT</span>
                    <h3 className="text-white font-extrabold text-xl uppercase mt-1">Direct Lines</h3>
                  </div>

                  <p className="text-gray-400 text-xs leading-relaxed">
                    Need instant custom pricing or want to check local retail batch codes? Speak directly to our showroom.
                  </p>

                  <div className="grid grid-cols-1 gap-3 text-xs">
                    <a href={`tel:${OWNER_PHONE}`} className="flex items-center gap-3 p-3 bg-brand-black/40 border border-brand-gold/5 rounded-xl hover:border-brand-gold/25 hover:text-brand-gold duration-300">
                      <div className="w-10 h-10 rounded-lg bg-brand-charcoal flex items-center justify-center text-brand-gold shrink-0">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-500 font-bold uppercase">Call Support</span>
                        <p className="text-white font-bold">{OWNER_PHONE}</p>
                      </div>
                    </a>
                    <a href={`https://wa.me/${OWNER_WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-brand-black/40 border border-brand-gold/5 rounded-xl hover:border-brand-orange/25 hover:text-brand-orange duration-300">
                      <div className="w-10 h-10 rounded-lg bg-brand-charcoal flex items-center justify-center text-brand-orange shrink-0">
                        <MessageCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-500 font-bold uppercase">WhatsApp Desk</span>
                        <p className="text-white font-bold">{OWNER_PHONE}</p>
                      </div>
                    </a>
                    <a href="https://instagram.com/shivaay_nutrition" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-brand-black/40 border border-brand-gold/5 rounded-xl hover:border-pink-500/20 hover:text-pink-400 duration-300">
                      <div className="w-10 h-10 rounded-lg bg-brand-charcoal flex items-center justify-center text-pink-500 shrink-0">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-500 font-bold uppercase">Instagram</span>
                        <p className="text-white font-bold">@shivaay_nutrition</p>
                      </div>
                    </a>
                  </div>
                </div>

                <div className="mt-8 border-t border-brand-gold/10 pt-4 flex items-center gap-3 text-[10px] text-emerald-400 bg-emerald-500/5 p-3.5 rounded-xl border border-emerald-500/10">
                  <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span>Showroom pickup available inside Sonipat. Select "Pickup" in address notes.</span>
                </div>
              </div>
            </div>

            {/* Ordering Form */}
            <div className="lg:col-span-7">
              <div className="p-8 rounded-2xl glass-panel-orange relative overflow-hidden border border-brand-orange/20">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-[9px] text-brand-orange font-bold uppercase tracking-wider">WhatsApp Checkout</span>
                    <h3 className="text-white font-extrabold text-xl uppercase mt-1">Place Your Order</h3>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-orange animate-ping" />
                </div>

                <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter your name"
                        value={orderName}
                        onChange={(e) => setOrderName(e.target.value)}
                        className="w-full bg-brand-black border border-brand-gold/10 focus:border-brand-orange rounded-xl px-3 py-2.5 text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400">WhatsApp Phone *</label>
                      <input
                        type="tel"
                        required
                        placeholder="Enter phone number"
                        value={orderPhone}
                        onChange={(e) => setOrderPhone(e.target.value)}
                        className="w-full bg-brand-black border border-brand-gold/10 focus:border-brand-orange rounded-xl px-3 py-2.5 text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Select Supplement *</label>
                    <select
                      required
                      value={orderProductId}
                      onChange={(e) => setOrderProductId(e.target.value)}
                      className="w-full bg-brand-black border border-brand-gold/10 focus:border-brand-orange rounded-xl px-3 py-2.5 text-white focus:outline-none cursor-pointer"
                    >
                      <option value="">-- Choose Catalog Supplement --</option>
                      {products.filter(p => p.status !== 'Out of Stock').map((p) => (
                        <option key={p.id || p._id} value={p.id || p._id}>
                          {p.name} ({p.brand}) - ₹{p.price}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400">Select Flavor</label>
                      <select
                        value={orderFlavor}
                        onChange={(e) => setOrderFlavor(e.target.value)}
                        className="w-full bg-brand-black border border-brand-gold/10 focus:border-brand-orange rounded-xl px-3 py-2.5 text-white focus:outline-none cursor-pointer"
                      >
                        <option value="Double Rich Chocolate">Double Rich Chocolate</option>
                        <option value="Vanilla Ice Cream">Vanilla Ice Cream</option>
                        <option value="Mango Blast">Mango Blast</option>
                        <option value="Cookies & Cream">Cookies & Cream</option>
                        <option value="Unflavoured / Neutral">Unflavoured / Neutral</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400">Quantity</label>
                      <select
                        value={orderQty}
                        onChange={(e) => setOrderQty(e.target.value)}
                        className="w-full bg-brand-black border border-brand-gold/10 focus:border-brand-orange rounded-xl px-3 py-2.5 text-white focus:outline-none cursor-pointer"
                      >
                        <option value="1">1 Tub</option>
                        <option value="2">2 Tubs</option>
                        <option value="3">3 Tubs</option>
                        <option value="4">4 Tubs</option>
                        <option value="5">5+ Tubs</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Delivery Address / Notes</label>
                    <textarea
                      rows={3}
                      placeholder="Enter full home address or showroom pickup instructions..."
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      className="w-full bg-brand-black border border-brand-gold/10 focus:border-brand-orange rounded-xl px-3 py-2.5 text-white focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-orange to-brand-gold py-4 text-xs font-bold text-white shadow-xl shadow-brand-orange/20 hover:scale-[1.01] duration-300 led-glow-orange mt-6"
                  >
                    <Send className="h-4 w-4" />
                    <span>Submit Order to WhatsApp</span>
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* FAQs Acc Drawer */}
          <div className="max-w-3xl mx-auto mt-20 border-t border-brand-charcoal/50 pt-16">
            <div className="text-center space-y-3 mb-10">
              <h3 className="text-xl font-black uppercase text-white flex items-center justify-center gap-2">
                <ShieldQuestion className="h-5 w-5 text-brand-gold" />
                <span>Frequently Asked Questions</span>
              </h3>
              <p className="text-[10px] text-gray-500">Authenticity verification and delivery guidelines</p>
            </div>

            <div className="space-y-4">
              {[
                { q: 'How do I check my supplement authenticity code?', a: 'All proteins shipped by Shivaay contain official authorized importer labels (such as Bright Performance, Glanbia, or MuscleHouse). Scratch the sticker card to get your unique code, then text or submit it to the importer portal.' },
                { q: 'What are delivery shipping speeds?', a: 'Timings depend on destination: we offer same-day dispatch inside Sonipat for orders placed before 5 PM (free shipping above ₹4,000). Delhi/NCR deliveries take 1-2 days, while shipping across India takes 3-5 business days.' },
                { q: 'Do you match prices with online portals?', a: 'Yes, we price-match with physical authorized showroom retailers. However, since large online marketplaces harbor unverified third-party sellers, we do not price match with them to prevent selling counterfeit formulas.' },
                { q: 'What payment methods do you support?', a: 'Only online payments are accepted via card and UPI (Google Pay, PhonePe, Paytm, etc.). For in-hand/cash payments, you can visit our Sonipat showroom.' }
              ].map((faq, idx) => {
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

        </div>
      </section>

    </div>
  );
}
