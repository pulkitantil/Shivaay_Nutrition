'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowLeft, 
  Save, 
  X, 
  Sparkles, 
  Database,
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  LogOut,
  Lock,
  TrendingDown
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/services/api';

type AdminTab = 'dashboard' | 'products' | 'orders';

export default function AdminPage() {
  const {
    user,
    token,
    logout,
    setSession,
    products,
    fetchProducts,
    categories,
    orders,
    fetchOrders,
    updateOrderStatus
  } = useStore();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Login form states
  const [step, setStep] = useState<'email' | 'otp' | 'password' | 'set-password'>('email');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Product CRUD Form States
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodBrand, setProdBrand] = useState('Shivaay Nutrition');
  const [prodCategory, setProdCategory] = useState('Whey Protein');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('10');
  const [prodStatus, setProdStatus] = useState<'In Stock' | 'Limited Stock' | 'Out of Stock'>('In Stock');
  const [prodImage, setProdImage] = useState('');
  const [prodDescription, setProdDescription] = useState('');

  // Offer Form States removed

  // Load Admin Data on mount / login
  useEffect(() => {
    setMounted(true);
    if (token && user?.role === 'admin') {
      fetchProducts();
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail) return;
    setLoginLoading(true);
    try {
      const res = await api.adminAuth.checkEmail(adminEmail);
      if (res.isFirstTime) {
        alert(res.msg || 'First-time setup: OTP sent to your email.');
        setStep('otp');
      } else {
        setStep('password');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Access Denied: Not an authorized admin email address.';
      alert(message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!adminEmail) return;
    setLoginLoading(true);
    try {
      const res = await api.adminAuth.sendOtp(adminEmail);
      alert(res.msg || 'OTP sent successfully! Check your email or backend console.');
      setStep('otp');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP.';
      alert(message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setLoginLoading(true);
    try {
      await api.adminAuth.verifyOtp(adminEmail, otp);
      alert('OTP verified successfully.');
      setStep('set-password');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Incorrect or expired OTP.';
      alert(message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword || !confirmPassword) return;
    if (adminPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    setLoginLoading(true);
    try {
      const res = await api.adminAuth.setPassword({
        email: adminEmail,
        otp,
        password: adminPassword
      });
      setSession(res.token, res.user);
      alert('Administrator password configured successfully! Welcome to the dashboard.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to configure password.';
      alert(message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword) return;
    setLoginLoading(true);
    try {
      const res = await api.adminAuth.login({
        email: adminEmail,
        password: adminPassword
      });
      setSession(res.token, res.user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid administrator password.';
      alert(message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleResetProductForm = () => {
    setProdName('');
    setProdBrand('Shivaay Nutrition');
    setProdCategory(categories[0] || 'Whey Protein');
    setProdPrice('');
    setProdStock('10');
    setProdStatus('In Stock');
    setProdImage('');
    setProdDescription('');
    setEditingProductId(null);
    setIsEditingProduct(false);
  };

  const handleEditProductClick = (product: any) => {
    setEditingProductId(product.id || product._id);
    setProdName(product.name);
    setProdBrand(product.brand);
    setProdCategory(product.category);
    setProdPrice(product.price.toString());
    setProdStock(product.stock.toString());
    setProdStatus(product.status);
    setProdImage(product.image);
    setProdDescription(product.description);
    setIsEditingProduct(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodBrand || !prodPrice || !prodImage || !prodDescription) {
      alert('Please fill out all product details.');
      return;
    }

    const priceNum = parseFloat(prodPrice);
    const stockNum = parseInt(prodStock);
    if (isNaN(priceNum) || priceNum <= 0 || isNaN(stockNum) || stockNum < 0) {
      alert('Please enter a valid price and stock quantity.');
      return;
    }

    const payload = {
      name: prodName,
      brand: prodBrand,
      category: prodCategory,
      price: priceNum,
      stock: stockNum,
      status: prodStatus,
      image: prodImage,
      description: prodDescription
    };

    try {
      if (editingProductId) {
        await api.products.update(editingProductId, payload);
      } else {
        await api.products.create(payload);
      }
      fetchProducts();
      handleResetProductForm();
      alert('Showroom product listing updated successfully!');
    } catch {
      alert('Failed to update product listing.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this supplement from stock?')) {
      try {
        await api.products.delete(id);
        fetchProducts();
        alert('Supplement removed.');
      } catch {
        alert('Failed to delete.');
      }
    }
  };

  // Offer Handlers removed

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      alert(`Order status updated to: ${status}`);
    } catch {
      alert('Failed to update order status.');
    }
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-black">
        <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-brand-orange animate-spin" />
      </div>
    );
  }

  // Auth Guard
  if (!token || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* LED Glow strip */}
        <div className="absolute top-0 left-0 right-0 led-strip-gold opacity-35" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-orange/5 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md p-8 rounded-2xl glass-panel relative overflow-hidden border border-brand-gold/15 text-center">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-orange to-brand-gold" />
          
          <div className="w-14 h-14 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold mx-auto mb-6">
            <Lock className="h-6 w-6" />
          </div>

          <h1 className="text-2xl font-black uppercase text-white tracking-wide">Admin Portal</h1>
          <p className="text-gray-500 text-xs mt-1 mb-6">Restricted Area. Authorized Access Only.</p>

          {step === 'email' && (
            <form onSubmit={handleCheckEmail} className="space-y-4 text-xs text-left animate-fadeIn">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Admin Email</label>
                <input
                  type="email"
                  required
                  placeholder="Enter admin email address"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-brand-black border border-brand-gold/10 focus:border-brand-orange rounded-xl px-4 py-3 text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full rounded-xl bg-gradient-to-r from-brand-orange to-brand-gold py-4 text-xs font-bold text-white shadow-lg shadow-brand-orange/20 hover:scale-[1.01] duration-300 led-glow-orange mt-6"
              >
                {loginLoading ? 'Checking Access...' : 'Continue'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs text-left animate-fadeIn">
              <p className="text-gray-400 text-center mb-2 leading-relaxed">We have sent a 6-digit verification code to your email.</p>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Enter OTP Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-brand-black border border-brand-gold/10 focus:border-brand-orange rounded-xl px-4 py-3 text-white focus:outline-none text-center font-mono text-lg tracking-widest"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full rounded-xl bg-gradient-to-r from-brand-orange to-brand-gold py-4 text-xs font-bold text-white shadow-lg shadow-brand-orange/20 hover:scale-[1.01] duration-300 led-glow-orange mt-4"
              >
                {loginLoading ? 'Verifying OTP...' : 'Verify OTP'}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-[10px] text-gray-500 hover:text-brand-gold font-semibold uppercase tracking-wider transition-colors"
                >
                  Change Email / Go Back
                </button>
              </div>
            </form>
          )}

          {step === 'set-password' && (
            <form onSubmit={handleSetPassword} className="space-y-4 text-xs text-left animate-fadeIn">
              <p className="text-brand-gold text-center mb-2 font-semibold">🔒 First-Time Setup: Create administrator password.</p>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Create secure password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-brand-black border border-brand-gold/10 focus:border-brand-orange rounded-xl px-4 py-3 text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Confirm Password</label>
                <input
                  type="password"
                  required
                  placeholder="Confirm secure password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-brand-black border border-brand-gold/10 focus:border-brand-orange rounded-xl px-4 py-3 text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full rounded-xl bg-gradient-to-r from-brand-orange to-brand-gold py-4 text-xs font-bold text-white shadow-lg shadow-brand-orange/20 hover:scale-[1.01] duration-300 led-glow-orange mt-6"
              >
                {loginLoading ? 'Saving...' : 'Set Password & Login'}
              </button>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4 text-xs text-left animate-fadeIn">
              <p className="text-gray-400 text-center mb-2 leading-relaxed">Please enter your password to sign in.</p>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-brand-black border border-brand-gold/10 focus:border-brand-orange rounded-xl px-4 py-3 text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full rounded-xl bg-gradient-to-r from-brand-orange to-brand-gold py-4 text-xs font-bold text-white shadow-lg shadow-brand-orange/20 hover:scale-[1.01] duration-300 led-glow-orange mt-4"
              >
                {loginLoading ? 'Signing In...' : 'Sign In'}
              </button>

              <div className="flex justify-between items-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setAdminPassword('');
                  }}
                  className="text-[10px] text-gray-500 hover:text-brand-gold font-semibold uppercase tracking-wider transition-colors"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[10px] text-brand-orange hover:text-brand-gold font-semibold uppercase tracking-wider transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          )}

          <Link href="/#top" className="inline-flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-brand-gold uppercase tracking-wider font-semibold mt-6 transition-colors">
            <ArrowLeft className="h-3 w-3" />
            <span>Return to storefront</span>
          </Link>
        </div>
      </div>
    );
  }

  // Dashboard calculations
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const activeOrdersList = orders.filter(o => o.status !== 'Cancelled' && o.status !== 'Delivered');
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.amount, 0);

  // Low Stock Items (quantity <= 3 or marked as Out of Stock)
  const lowStockItems = products.filter(p => p.stock <= 3);
  const lowStockAlertsCount = lowStockItems.length;

  // Helper to compute weekly chart data
  const getWeeklyChartData = () => {
    const chartDays: { dateString: string; label: string; total: number }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    
    // Generate the last 7 days (from 6 days ago up to today)
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      chartDays.push({
        dateString: d.toDateString(),
        label: i === 0 ? `${dayNames[d.getDay()]} (Today)` : dayNames[d.getDay()],
        total: 0
      });
    }

    // Group and sum order amounts
    orders.forEach(order => {
      if (order.status === 'Cancelled') return;
      const orderDate = new Date(order.createdAt).toDateString();
      const dayObj = chartDays.find(cd => cd.dateString === orderDate);
      if (dayObj) {
        dayObj.total += order.amount || 0;
      }
    });

    return chartDays;
  };

  const weeklyData = getWeeklyChartData();
  const maxDailyTotal = Math.max(...weeklyData.map(d => d.total));
  
  const points = weeklyData.map((d, i) => {
    const x = (i / 6) * 500;
    const y = maxDailyTotal > 0 ? 200 - (d.total / maxDailyTotal) * 180 : 200;
    return { x, y, total: d.total };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const fillPath = `${linePath} L 500 200 L 0 200 Z`;
  const weeklyRevenue = weeklyData.reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="min-h-screen bg-brand-black pb-24 relative overflow-hidden">
      {/* Showroom light strips */}
      <div className="absolute top-0 left-0 right-0 led-strip-gold opacity-35" />
      <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full bg-brand-orange/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16">
        
        {/* Header Action Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-brand-gold/10 pb-8">
          <div className="space-y-2">
            <Link
              href="/#top"
              className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-brand-gold duration-300 font-semibold uppercase tracking-wider"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Storefront</span>
            </Link>
            <h1 className="text-3xl font-black uppercase text-white tracking-wider flex items-center gap-2">
              <Database className="h-7 w-7 text-brand-gold" />
              <span>Admin <span className="text-brand-gold text-glow-gold">Dashboard</span></span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-white font-bold">{user?.name}</p>
              <p className="text-[9px] text-brand-gold font-bold uppercase tracking-wider">Showroom manager</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-xl bg-brand-charcoal hover:bg-rose-500/10 border border-brand-gold/20 hover:border-rose-500/25 px-5 py-3 text-xs font-bold text-gray-400 hover:text-rose-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-brand-gold/10 gap-6 mb-8 overflow-x-auto scrollbar-none">
          {[
            { id: 'dashboard', label: 'Analytics' },
            { id: 'products', label: 'Supplement Catalog' },
            { id: 'orders', label: 'Order Processing' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`pb-3 text-xs font-black uppercase tracking-wider transition-all duration-300 relative shrink-0 ${
                activeTab === tab.id ? 'text-brand-gold font-bold' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-orange to-brand-gold rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* ACTIVE TAB CONTENT */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Revenue Card */}
              <div className="p-6 rounded-2xl glass-panel border border-brand-gold/15 relative overflow-hidden flex flex-col justify-between h-36">
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-brand-orange to-brand-gold" />
                <div className="flex justify-between items-start text-gray-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Total Revenue</span>
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                </div>
                <h2 className="text-3xl font-black text-white">₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h2>
                <span className="text-[9px] text-emerald-400 font-bold">Excludes cancelled invoices</span>
              </div>

              {/* Orders Card */}
              <div className="p-6 rounded-2xl glass-panel border border-brand-gold/15 relative overflow-hidden flex flex-col justify-between h-36">
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-brand-orange to-brand-gold" />
                <div className="flex justify-between items-start text-gray-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Total Orders</span>
                  <ShoppingBag className="h-4 w-4 text-brand-gold" />
                </div>
                <h2 className="text-3xl font-black text-white">{totalOrders}</h2>
                <span className="text-[9px] text-brand-gold font-bold">{activeOrdersList.length} active in queue</span>
              </div>

              {/* Products Card */}
              <div className="p-6 rounded-2xl glass-panel border border-brand-gold/15 relative overflow-hidden flex flex-col justify-between h-36">
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-brand-orange to-brand-gold" />
                <div className="flex justify-between items-start text-gray-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Catalog Items</span>
                  <Package className="h-4 w-4 text-brand-orange" />
                </div>
                <h2 className="text-3xl font-black text-white">{totalProducts}</h2>
                <span className="text-[9px] text-gray-500 font-bold">Supplement classifications</span>
              </div>

              {/* Low Stock Alerts Card */}
              <div className="p-6 rounded-2xl glass-panel border border-brand-gold/15 relative overflow-hidden flex flex-col justify-between h-36">
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-brand-orange to-brand-gold" />
                <div className="flex justify-between items-start text-gray-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Low Stock Alerts</span>
                  <AlertTriangle className="h-4 w-4 text-rose-400 animate-pulse" />
                </div>
                <h2 className={`text-3xl font-black ${lowStockAlertsCount > 0 ? 'text-rose-400' : 'text-white'}`}>{lowStockAlertsCount}</h2>
                <span className="text-[9px] text-rose-400 font-bold">Supplements with Qty &le; 3</span>
              </div>
            </div>

            {/* Sales Graph & Low Stock items table */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Sales SVG graph */}
              <div className="lg:col-span-8 p-6 glass-panel rounded-2xl border border-brand-gold/15">
                <h3 className="text-white font-extrabold text-sm uppercase tracking-wider mb-6">Sales Trend Analytics</h3>
                
                {/* SVG Graph wrapper */}
                <div className="w-full h-64 bg-brand-black/40 rounded-xl border border-brand-gold/5 flex items-end p-4 relative">
                  
                  {/* Grid Lines */}
                  <div className="absolute left-0 right-0 top-1/4 h-[1px] bg-brand-gold/5" />
                  <div className="absolute left-0 right-0 top-2/4 h-[1px] bg-brand-gold/5" />
                  <div className="absolute left-0 right-0 top-3/4 h-[1px] bg-brand-gold/5" />

                  {/* SVG Chart */}
                  <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Fill Area */}
                    <path
                      d={fillPath}
                      fill="url(#chartGrad)"
                    />
                    {/* Line */}
                    <path
                      d={linePath}
                      fill="none"
                      stroke="#FF6B00"
                      strokeWidth="3.5"
                    />
                    {/* Dots */}
                    {points.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r="5" fill="#F5B041" />
                    ))}
                  </svg>

                  <div className="absolute left-6 bottom-6 flex gap-1 items-center bg-black/60 border border-brand-orange/20 px-3 py-1 rounded text-[10px] text-brand-orange font-bold uppercase">
                    {weeklyRevenue > 0 ? (
                      <>
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>Weekly Revenue: ₹{weeklyRevenue.toLocaleString('en-IN')}</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-3.5 w-3.5 text-gray-400" />
                        <span>No Sales Recorded This Week</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex justify-between text-[9px] text-gray-500 font-bold uppercase mt-3 px-2">
                  {weeklyData.map((d, idx) => (
                    <span key={idx}>{d.label}</span>
                  ))}
                </div>
              </div>

              {/* Low stock indicators list */}
              <div className="lg:col-span-4 p-6 glass-panel rounded-2xl border border-brand-gold/15">
                <h3 className="text-white font-extrabold text-sm uppercase tracking-wider mb-6 flex items-center gap-1.5">
                  <AlertTriangle className="h-4.5 w-4.5 text-brand-orange shrink-0" />
                  <span>Inventory Alerts</span>
                </h3>

                {lowStockItems.length > 0 ? (
                  <div className="space-y-3">
                    {lowStockItems.map(item => (
                      <div key={item.id || item._id} className="flex justify-between items-center bg-brand-black/30 border border-brand-gold/5 p-3 rounded-xl">
                        <div className="space-y-0.5 max-w-[150px]">
                          <p className="text-white text-xs font-bold truncate">{item.name}</p>
                          <p className="text-gray-500 text-[9px] uppercase font-semibold">{item.brand}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            item.stock === 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {item.stock} LEFT
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 text-xs">
                    All supplement stocks are healthy! No low stock warnings.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
            {/* Left Product Add/Edit Form */}
            <div className="lg:col-span-4">
              {isEditingProduct ? (
                <div className="rounded-2xl glass-panel p-6 border border-brand-gold/15 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-orange to-brand-gold" />
                  
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-white font-black text-sm uppercase tracking-wider">
                      {editingProductId ? 'Edit Product details' : 'Add Supplement'}
                    </h3>
                    <button onClick={handleResetProductForm} className="text-gray-500 hover:text-white p-1 rounded-lg">
                      <X className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="space-y-4 text-[10px] text-left">
                    <div className="space-y-1">
                      <label className="text-gray-400 font-bold uppercase">Supplement Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Shivaay Whey Isolate 2kg"
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        className="w-full bg-brand-black border border-brand-gold/10 focus:border-brand-orange rounded-lg p-2.5 text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-400 font-bold uppercase">Brand</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Shivaay Nutrition"
                        value={prodBrand}
                        onChange={(e) => setProdBrand(e.target.value)}
                        className="w-full bg-brand-black border border-brand-gold/10 focus:border-brand-orange rounded-lg p-2.5 text-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-gray-400 font-bold uppercase">Category</label>
                        <select
                          value={prodCategory}
                          onChange={(e) => setProdCategory(e.target.value)}
                          className="w-full bg-brand-black border border-brand-gold/10 focus:border-brand-orange rounded-lg p-2.5 text-white focus:outline-none cursor-pointer"
                        >
                          <option value="Whey Protein">Whey Protein</option>
                          <option value="Mass Gainers">Mass Gainers</option>
                          <option value="Creatine">Creatine</option>
                          <option value="Pre Workout">Pre Workout</option>
                          <option value="Fat Burners">Fat Burners</option>
                          <option value="Multivitamins">Multivitamins</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-400 font-bold uppercase">Price (₹)</label>
                        <input
                          type="number"
                          required
                          placeholder="INR pricing"
                          value={prodPrice}
                          onChange={(e) => setProdPrice(e.target.value)}
                          className="w-full bg-brand-black border border-brand-gold/10 focus:border-brand-orange rounded-lg p-2.5 text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-gray-400 font-bold uppercase">Stock Count</label>
                        <input
                          type="number"
                          required
                          placeholder="Inventory count"
                          value={prodStock}
                          onChange={(e) => setProdStock(e.target.value)}
                          className="w-full bg-brand-black border border-brand-gold/10 focus:border-brand-orange rounded-lg p-2.5 text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-400 font-bold uppercase">Availability</label>
                        <select
                          value={prodStatus}
                          onChange={(e) => setProdStatus(e.target.value as any)}
                          className="w-full bg-brand-black border border-brand-gold/10 focus:border-brand-orange rounded-lg p-2.5 text-white focus:outline-none cursor-pointer"
                        >
                          <option value="In Stock">In Stock</option>
                          <option value="Limited Stock">Limited Stock</option>
                          <option value="Out of Stock">Out of Stock</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-400 font-bold uppercase">Product Image URL</label>
                      <input
                        type="url"
                        required
                        placeholder="https://images.unsplash.com/..."
                        value={prodImage}
                        onChange={(e) => setProdImage(e.target.value)}
                        className="w-full bg-brand-black border border-brand-gold/10 focus:border-brand-orange rounded-lg p-2.5 text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-400 font-bold uppercase">Description / benefits</label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Benefits, scoop sizes..."
                        value={prodDescription}
                        onChange={(e) => setProdDescription(e.target.value)}
                        className="w-full bg-brand-black border border-brand-gold/10 focus:border-brand-orange rounded-lg p-2.5 text-white focus:outline-none resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-orange to-brand-gold py-3 text-xs font-bold text-white shadow hover:scale-[1.01] duration-300 mt-6"
                    >
                      <Save className="h-4 w-4" />
                      <span>{editingProductId ? 'Save Product Edits' : 'Publish Supplement'}</span>
                    </button>
                  </form>
                </div>
              ) : (
                <div className="rounded-2xl glass-panel p-6 border border-dashed border-brand-gold/20 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
                  <Sparkles className="h-6 w-6 text-brand-gold animate-bounce" />
                  <h3 className="text-white font-extrabold text-xs uppercase">No Active Editor</h3>
                  <p className="text-gray-500 text-[10px] max-w-[200px] leading-relaxed">
                    Click 'Publish New Supplement' or the edit icon on any list item to manage listings.
                  </p>
                  <button
                    onClick={() => setIsEditingProduct(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-gold px-5 py-2.5 text-[10px] font-bold text-white shadow"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Publish New Supplement</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right Products Table */}
            <div className="lg:col-span-8 p-6 glass-panel rounded-2xl border border-brand-gold/15">
              <h3 className="text-white font-extrabold text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                <span>Active Supplement Catalog</span>
                <span className="text-[10px] text-brand-gold bg-brand-gold/10 px-2.5 py-0.5 rounded-full border border-brand-gold/10 font-mono">
                  {products.length} Products
                </span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-brand-gold/10 text-gray-500 font-bold uppercase tracking-wider">
                      <th className="pb-3 pl-2">Product</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Price</th>
                      <th className="pb-3">Stock</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right pr-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-gold/5">
                    {products.map((product) => (
                      <tr key={product.id || product._id} className="hover:bg-brand-charcoal/20 duration-300">
                        <td className="py-4 pl-2 flex items-center gap-3">
                          <img
                            src={product.image}
                            alt=""
                            className="w-9 h-9 object-cover rounded-lg border border-brand-gold/10 shrink-0"
                            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=600'; }}
                          />
                          <div className="space-y-0.5 max-w-[150px] sm:max-w-[200px]">
                            <p className="text-white font-bold truncate">{product.name}</p>
                            <p className="text-gray-500 font-semibold uppercase text-[8px] tracking-wider">{product.brand}</p>
                          </div>
                        </td>
                        <td className="py-4 text-gray-400 font-semibold">{product.category}</td>
                        <td className="py-4 text-white font-extrabold">₹{product.price.toLocaleString('en-IN')}</td>
                        <td className="py-4">
                          <span className={`font-mono font-bold ${product.stock <= 3 ? 'text-rose-400' : 'text-gray-400'}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase ${
                            product.status === 'In Stock' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' :
                            product.status === 'Limited Stock' ? 'text-amber-400 border-amber-500/20 bg-amber-500/5' :
                            'text-rose-400 border-rose-500/20 bg-rose-500/5'
                          }`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="py-4 text-right pr-2">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => handleEditProductClick(product)}
                              className="p-2 bg-brand-charcoal hover:bg-brand-gold hover:text-brand-black text-gray-400 rounded-lg border border-brand-gold/15 duration-300"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id || product._id)}
                              className="p-2 bg-brand-charcoal hover:bg-rose-500 hover:text-white text-gray-400 rounded-lg border border-brand-gold/15 duration-300"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="p-6 glass-panel rounded-2xl border border-brand-gold/15 animate-fadeIn">
            <h3 className="text-white font-extrabold text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
              <span>Showroom Dispatch Queue</span>
              <span className="text-[10px] text-brand-gold bg-brand-gold/10 px-2.5 py-0.5 rounded-full border border-brand-gold/10 font-mono">
                {orders.length} Total Logs
              </span>
            </h3>

            {orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-brand-gold/10 text-gray-500 font-bold uppercase tracking-wider">
                      <th className="pb-3 pl-2">Order ID</th>
                      <th className="pb-3">Customer Details</th>
                      <th className="pb-3">Products List</th>
                      <th className="pb-3">Billing Total</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right pr-2">Process Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-gold/5">
                    {orders.map((order) => (
                      <tr key={order.id || order._id} className="hover:bg-brand-charcoal/20 duration-300">
                        <td className="py-4 pl-2 font-mono font-bold text-white text-[10px]">{order.id || order._id}</td>
                        <td className="py-4">
                          <p className="text-white font-bold">{order.customerDetails.name}</p>
                          <p className="text-gray-500 text-[10px]">{order.customerDetails.phone}</p>
                        </td>
                        <td className="py-4 text-gray-400 max-w-[200px] truncate">
                          {order.products.map((p: any) => `${p.name} (${p.flavor}) x${p.quantity}`).join(', ')}
                        </td>
                        <td className="py-4 text-white font-extrabold">₹{order.amount.toLocaleString('en-IN')}</td>
                        <td className="py-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase ${
                            order.status === 'Delivered' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' :
                            order.status === 'Cancelled' ? 'text-rose-400 border-rose-500/20 bg-rose-500/5' :
                            'text-brand-orange border-brand-orange/20 bg-brand-orange/5'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 text-right pr-2">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order.id || order._id, e.target.value)}
                            className="bg-brand-black border border-brand-gold/20 text-white rounded px-2.5 py-1 text-[10px] focus:outline-none cursor-pointer focus:border-brand-orange"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 text-xs">
                No orders registered in the showroom system yet.
              </div>
            )}
          </div>
        )}



      </div>
    </div>
  );
}
