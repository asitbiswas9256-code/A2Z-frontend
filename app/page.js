'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, PlusCircle, Truck, ShieldAlert, 
  Package, CheckCircle2, RefreshCw, Sparkles, 
  Trash2, User, LogOut, MapPin, ClipboardList, 
  Bike, Camera, CreditCard, Banknote, Settings, ExternalLink
} from 'lucide-react';

const API_URL = 'https://a2z-backend-tgls.onrender.com/api';

export default function SuperAppHome() {
  // Navigation: 'STORE' | 'ORDERS' | 'ACCOUNT' | 'ADMIN'
  const [viewMode, setViewMode] = useState('STORE');
  const [activeTab, setActiveTab] = useState('ALL');
  const [statusMsg, setStatusMsg] = useState('');

  // Data States
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  // Cloud Keys (Can be configured right inside the Admin Panel UI!)
  const [cloudConfig, setCloudConfig] = useState({
    cloudinaryCloudName: '',
    cloudinaryPreset: '',
    razorpayKeyId: ''
  });
  const [showKeySettings, setShowKeySettings] = useState(false);

  // User & Auth States
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('LOGIN');
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'CUSTOMER',
    gstNumber: ''
  });

  // Cart & Checkout States
  const [isWholesale, setIsWholesale] = useState(false);
  const [cart, setCart] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [prescriptionUrl, setPrescriptionUrl] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY'); // 'RAZORPAY' or 'COD'

  // Admin New Product State
  const [formData, setFormData] = useState({
    name: '',
    category: 'GENERAL',
    price: '',
    wholesalePrice: '',
    minWholesaleQty: '10',
    stock: '100',
    requiresPrescription: false,
    imageUrl: ''
  });

  // Load saved user session, cloud keys, and initial data
  useEffect(() => {
    const savedUser = localStorage.getItem('a2z_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        if (parsed.role === 'WHOLESALE_BUYER') setIsWholesale(true);
      } catch (e) {
        console.error(e);
      }
    }

    const savedKeys = localStorage.getItem('a2z_cloud_keys');
    if (savedKeys) {
      try {
        setCloudConfig(JSON.parse(savedKeys));
      } catch (e) {
        console.error(e);
      }
    }

    fetchProducts();
    fetchOrders();
  }, []);

  const saveCloudKeys = (e) => {
    e.preventDefault();
    localStorage.setItem('a2z_cloud_keys', JSON.stringify(cloudConfig));
    setShowKeySettings(false);
    setStatusMsg('✅ Cloudinary & Razorpay keys saved on this device!');
  };

  // Universal Photo Uploader (Cloudinary Direct + Automatic Phone Compression Fallback)
  const handleFileUpload = async (file, targetType) => {
    if (!file) return;
    setUploadingImg(true);
    setStatusMsg('📷 Processing photo...');

    try {
      let finalImageUrl = '';

      // 1. If Cloudinary keys are entered, upload straight to Cloudinary
      if (cloudConfig.cloudinaryCloudName && cloudConfig.cloudinaryPreset) {
        const formPayload = new FormData();
        formPayload.append('file', file);
        formPayload.append('upload_preset', cloudConfig.cloudinaryPreset);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudConfig.cloudinaryCloudName}/image/upload`,
          { method: 'POST', body: formPayload }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || 'Cloudinary upload failed');
        finalImageUrl = data.secure_url;
      } else {
        // 2. Smart Mobile Fallback: Compress image on phone so it works immediately without keys
        finalImageUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 500;
              const scaleSize = MAX_WIDTH / img.width;
              canvas.width = img.width > MAX_WIDTH ? MAX_WIDTH : img.width;
              canvas.height = img.width > MAX_WIDTH ? img.height * scaleSize : img.height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL('image/jpeg', 0.72));
            };
            img.onerror = reject;
          };
          reader.onerror = reject;
        });
      }

      if (targetType === 'PRODUCT') {
        setFormData((prev) => ({ ...prev, imageUrl: finalImageUrl }));
        setStatusMsg('✅ Product photo attached!');
      } else if (targetType === 'PRESCRIPTION') {
        setPrescriptionUrl(finalImageUrl);
        setStatusMsg('✅ Prescription photo attached!');
      }
    } catch (err) {
      setStatusMsg(`❌ Upload Error: ${err.message}`);
    } finally {
      setUploadingImg(false);
    }
  };

  // 1. Fetch Products from Render
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Orders from Render
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // 3. Register or Login User
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg(authMode === 'LOGIN' ? 'Logging in...' : 'Creating account...');

    try {
      const endpoint = authMode === 'LOGIN' ? '/users/login' : '/users/register';
      const payload = authMode === 'LOGIN'
        ? { email: authForm.email, password: authForm.password }
        : authForm;

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      const loggedInUser = data.user || {
        id: data._id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        gstNumber: data.gstNumber
      };

      setCurrentUser(loggedInUser);
      localStorage.setItem('a2z_user', JSON.stringify(loggedInUser));

      if (loggedInUser.role === 'WHOLESALE_BUYER') setIsWholesale(true);
      setViewMode(loggedInUser.role === 'DELIVERY_PARTNER' ? 'ORDERS' : 'STORE');
      setStatusMsg(`✅ Welcome, ${loggedInUser.name}!`);
    } catch (err) {
      setStatusMsg(`❌ ${err.message}`);
    }
  };

  // 1-Tap Quick Demo Account Switcher
  const handleQuickDemoAuth = async (demoType) => {
    const demoProfiles = {
      CUSTOMER: {
        name: 'Rahul Sharma (Retail)',
        email: 'retail@a2zdemo.com',
        password: 'password123',
        phone: '9876543210',
        role: 'CUSTOMER'
      },
      WHOLESALE_BUYER: {
        name: 'Biswas Kirana Store (B2B)',
        email: 'wholesale@a2zdemo.com',
        password: 'password123',
        phone: '9876500001',
        role: 'WHOLESALE_BUYER',
        gstNumber: '19ABCDE1234F1Z5'
      },
      DELIVERY_PARTNER: {
        name: 'Suman Rider (20-30km Fleet)',
        email: 'rider@a2zdemo.com',
        password: 'password123',
        phone: '9876599999',
        role: 'DELIVERY_PARTNER'
      }
    };

    const profile = demoProfiles[demoType];
    setStatusMsg(`Connecting as ${profile.name}...`);

    try {
      let res = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profile.email, password: profile.password })
      });

      if (!res.ok) {
        res = await fetch(`${API_URL}/users/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile)
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Demo login failed');

      const userObj = data.user || {
        id: data._id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        gstNumber: data.gstNumber
      };

      setCurrentUser(userObj);
      localStorage.setItem('a2z_user', JSON.stringify(userObj));
      setIsWholesale(userObj.role === 'WHOLESALE_BUYER');
      setStatusMsg(`✅ Logged in as ${userObj.name}`);

      if (userObj.role === 'DELIVERY_PARTNER') {
        fetchOrders();
        setViewMode('ORDERS');
      } else {
        setViewMode('STORE');
      }
    } catch (err) {
      setStatusMsg(`❌ ${err.message}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('a2z_user');
    setCurrentUser(null);
    setIsWholesale(false);
    setStatusMsg('Logged out successfully.');
  };

  // Save Verified Order to MongoDB
  const saveOrderToDatabase = async (paymentStatusText) => {
    setStatusMsg('Saving order to MongoDB...');
    try {
      const orderPayload = {
        customer: currentUser.id || currentUser._id,
        items: cart.map((item) => ({
          product: item._id,
          quantity: item.qty,
          price: item.finalPrice
        })),
        totalAmount: cartTotal,
        deliveryAddress: `${deliveryAddress} [${paymentStatusText}]`,
        prescriptionUrl: prescriptionUrl || undefined,
        deliveryType: hasFood && hasNonFood 
          ? 'SPLIT_FLEET' 
          : hasFood 
            ? 'IMMEDIATE_FOOD' 
            : 'STANDARD_20_30KM',
        status: 'PENDING'
      };

      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');

      setCart([]);
      setPrescriptionUrl('');
      setStatusMsg(`🎉 Order Placed (${paymentStatusText})!`);
      fetchOrders();
      setViewMode('ORDERS');
    } catch (err) {
      setStatusMsg(`❌ Order Error: ${err.message}`);
    }
  };

  // 4. Handle Checkout (Razorpay Popup or COD)
  const handlePlaceOrder = async () => {
    if (!currentUser) {
      setStatusMsg('⚠️ Please log in or tap a 1-Tap Demo Account first!');
      setViewMode('ACCOUNT');
      return;
    }

    if (needsRx && !prescriptionUrl.trim()) {
      alert('Please upload a Doctor Prescription photo or enter Rx ID for restricted medicine!');
      return;
    }

    if (!deliveryAddress.trim()) {
      alert('Please enter your delivery address (within 20–30km radius)!');
      return;
    }

    // Option A: Cash on Delivery
    if (paymentMethod === 'COD') {
      await saveOrderToDatabase('COD - Pay on Delivery');
      return;
    }

    // Option B: Live Razorpay Checkout (if Key ID is configured)
    if (cloudConfig.razorpayKeyId && typeof window !== 'undefined' && window.Razorpay) {
      const options = {
        key: cloudConfig.razorpayKeyId,
        amount: cartTotal * 100, // Amount in paise
        currency: 'INR',
        name: 'A2Z Wholesale & Retail',
        description: '20-30km Hyper-Local Order',
        handler: async function (response) {
          await saveOrderToDatabase(`PAID via Razorpay (${response.razorpay_payment_id})`);
        },
        prefill: {
          name: currentUser.name,
          email: currentUser.email,
          contact: currentUser.phone || '9876543210'
        },
        theme: { color: '#4338ca' }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      // Instant Demo Razorpay Simulation if user hasn't pasted rzp_test_ key yet
      const demoPayId = 'pay_A2Z' + Math.floor(100000 + Math.random() * 900000);
      await saveOrderToDatabase(`PAID Online (${demoPayId})`);
    }
  };

  // 5. Update Order Status (Delivery Partner / Admin)
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setStatusMsg(`Updating order to ${newStatus}...`);
    try {
      const payload = { status: newStatus };
      if (currentUser && currentUser.role === 'DELIVERY_PARTNER') {
        payload.deliveryPartner = currentUser.id || currentUser._id;
      }

      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      setStatusMsg(`✅ Order marked as ${newStatus}!`);
      fetchOrders();
    } catch (err) {
      setStatusMsg(`❌ ${err.message}`);
    }
  };

  // 6. Add Product from Admin Panel
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setStatusMsg('Saving product to MongoDB...');
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        wholesalePrice: Number(formData.wholesalePrice || formData.price),
        minWholesaleQty: Number(formData.minWholesaleQty || 10),
        stock: Number(formData.stock || 50),
        requiresPrescription: formData.requiresPrescription,
        imageUrl: formData.imageUrl
      };

      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add product');

      setStatusMsg('✅ Product with photo saved to MongoDB!');
      setFormData({
        name: '',
        category: 'GENERAL',
        price: '',
        wholesalePrice: '',
        minWholesaleQty: '10',
        stock: '100',
        requiresPrescription: false,
        imageUrl: ''
      });
      fetchProducts();
      setViewMode('STORE');
    } catch (err) {
      setStatusMsg(`❌ Error: ${err.message}`);
    }
  };

  // 1-Tap Sample Product Generator (with Product Photos!)
  const handleQuickDemoProduct = async () => {
    setStatusMsg('Adding sample product with photo...');
    const samples = [
      { 
        name: 'Aashirvaad Select Atta (10kg)', 
        category: 'GENERAL', 
        price: 460, 
        wholesalePrice: 410, 
        minWholesaleQty: 5, 
        stock: 80, 
        requiresPrescription: false,
        imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80'
      },
      { 
        name: 'Hyderabadi Chicken Biryani Pack', 
        category: 'FOOD', 
        price: 320, 
        wholesalePrice: 280, 
        minWholesaleQty: 5, 
        stock: 30, 
        requiresPrescription: false,
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80'
      },
      { 
        name: 'Augmentin 625 Duo Tablet Strip', 
        category: 'MEDICINE', 
        price: 200, 
        wholesalePrice: 165, 
        minWholesaleQty: 10, 
        stock: 120, 
        requiresPrescription: true,
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80'
      },
      { 
        name: 'SuperVOOC 65W Type-C Fast Charger', 
        category: 'ELECTRONICS', 
        price: 799, 
        wholesalePrice: 550, 
        minWholesaleQty: 10, 
        stock: 45, 
        requiresPrescription: false,
        imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=500&q=80'
      }
    ];
    const randomItem = samples[Math.floor(Math.random() * samples.length)];

    try {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(randomItem)
      });
      if (res.ok) {
        setStatusMsg(`✅ Added "${randomItem.name}"!`);
        fetchProducts();
      }
    } catch (err) {
      setStatusMsg('❌ Failed to add sample item');
    }
  };

  const addToCart = (product) => {
    const qtyToAdd = isWholesale ? (product.minWholesaleQty || 5) : 1;
    const unitPrice = isWholesale && product.wholesalePrice ? product.wholesalePrice : product.price;
    setCart((prev) => [...prev, { ...product, qty: qtyToAdd, finalPrice: unitPrice }]);
    setStatusMsg(`🛒 Added ${product.name} (×${qtyToAdd}) to cart`);
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const filteredProducts = activeTab === 'ALL' 
    ? products 
    : products.filter((p) => p.category === activeTab);

  const hasFood = cart.some((item) => item.category === 'FOOD');
  const hasNonFood = cart.some((item) => item.category !== 'FOOD');
  const needsRx = cart.some((item) => item.category === 'MEDICINE' && item.requiresPrescription);
  const cartTotal = cart.reduce((sum, item) => sum + item.finalPrice * item.qty, 0);

  return (
    <div className="min-h-screen pb-28 bg-slate-50">
      {/* Top Header */}
      <header className="bg-indigo-700 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div onClick={() => setViewMode('STORE')} className="cursor-pointer">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-amber-300" />
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">A2Z Super App</h1>
            </div>
            <p className="text-[11px] text-indigo-200 flex items-center gap-1 mt-0.5">
              <Truck className="w-3 h-3" /> 20–30km Hyper-Local Wholesale & Retail
            </p>
          </div>

          {/* Top Navigation Pills */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setViewMode('STORE')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'STORE' ? 'bg-white text-indigo-800' : 'bg-indigo-600 text-indigo-100'
              }`}
            >
              Store
            </button>
            <button
              onClick={() => {
                fetchOrders();
                setViewMode('ORDERS');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                viewMode === 'ORDERS' ? 'bg-white text-indigo-800' : 'bg-indigo-600 text-indigo-100'
              }`}
            >
              <Bike className="w-3.5 h-3.5" /> Orders ({orders.length})
            </button>
            <button
              onClick={() => setViewMode('ADMIN')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'ADMIN' ? 'bg-amber-400 text-slate-950' : 'bg-indigo-600 text-indigo-100'
              }`}
            >
              + Admin
            </button>
            <button
              onClick={() => setViewMode('ACCOUNT')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                viewMode === 'ACCOUNT' ? 'bg-emerald-400 text-slate-950' : 'bg-indigo-800 text-amber-300'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              {currentUser ? currentUser.name.split(' ')[0] : 'Login'}
            </button>
          </div>
        </div>

        {/* Retail vs Wholesale Switcher Bar */}
        {viewMode === 'STORE' && (
          <div className="bg-indigo-800 px-4 py-2">
            <div className="max-w-4xl mx-auto flex items-center justify-between text-xs">
              <span className="text-indigo-100 font-medium truncate">
                {isWholesale ? '📦 B2B Wholesale Rates Active' : '🛍️ Standard Retail Pricing'}
                {currentUser ? ` • ${currentUser.role}` : ''}
              </span>
              <button
                onClick={() => setIsWholesale(!isWholesale)}
                className={`px-3 py-1 rounded-full font-bold transition whitespace-nowrap ${
                  isWholesale 
                    ? 'bg-emerald-400 text-slate-950' 
                    : 'bg-indigo-600 text-white border border-indigo-400'
                }`}
              >
                {isWholesale ? 'Switch to Retail' : 'Switch to Wholesale'}
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-4">
        {/* Status Toast Alert */}
        {statusMsg && (
          <div className="mb-4 p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-950 text-xs sm:text-sm font-medium flex items-center justify-between shadow-sm">
            <span>{statusMsg}</span>
            <button onClick={() => setStatusMsg('')} className="text-xs font-bold underline ml-2">
              OK
            </button>
          </div>
        )}

        {/* ==================== 1. ACCOUNT & LOGIN VIEW ==================== */}
        {viewMode === 'ACCOUNT' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            {currentUser ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {currentUser.role}
                    </span>
                    <h2 className="text-lg font-extrabold text-slate-900 mt-1">{currentUser.name}</h2>
                    <p className="text-xs text-slate-500">{currentUser.email} • 📞 {currentUser.phone}</p>
                    {currentUser.gstNumber && (
                      <p className="text-xs font-semibold text-indigo-700 mt-1">
                        GSTIN: {currentUser.gstNumber}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-rose-100 text-rose-700 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => setViewMode('STORE')}
                    className="bg-indigo-600 text-white font-bold text-xs py-3 rounded-xl"
                  >
                    Go to Storefront
                  </button>
                  <button
                    onClick={() => {
                      fetchOrders();
                      setViewMode('ORDERS');
                    }}
                    className="bg-slate-800 text-white font-bold text-xs py-3 rounded-xl"
                  >
                    View Live Orders / Rider App
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <p className="text-xs font-extrabold text-slate-700 mb-2 flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-indigo-600" /> 1-Tap Instant Login (Saves to MongoDB):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      onClick={() => handleQuickDemoAuth('CUSTOMER')}
                      className="bg-white border border-slate-300 hover:border-indigo-500 text-left p-2.5 rounded-xl text-xs"
                    >
                      <div className="font-bold text-slate-900">🛍️ Retail Customer</div>
                      <div className="text-[11px] text-slate-500">Standard single-unit prices</div>
                    </button>
                    <button
                      onClick={() => handleQuickDemoAuth('WHOLESALE_BUYER')}
                      className="bg-white border border-slate-300 hover:border-emerald-500 text-left p-2.5 rounded-xl text-xs"
                    >
                      <div className="font-bold text-emerald-800">📦 Wholesale Buyer</div>
                      <div className="text-[11px] text-slate-500">Bulk B2B rates + GST</div>
                    </button>
                    <button
                      onClick={() => handleQuickDemoAuth('DELIVERY_PARTNER')}
                      className="bg-white border border-slate-300 hover:border-amber-500 text-left p-2.5 rounded-xl text-xs"
                    >
                      <div className="font-bold text-amber-800">🛵 Delivery Rider</div>
                      <div className="text-[11px] text-slate-500">Accept & deliver orders</div>
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 mb-4 border-b pb-3">
                  <button
                    onClick={() => setAuthMode('LOGIN')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold ${
                      authMode === 'LOGIN' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Customer / Partner Login
                  </button>
                  <button
                    onClick={() => setAuthMode('REGISTER')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold ${
                      authMode === 'REGISTER' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Create New Account
                  </button>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-3">
                  {authMode === 'REGISTER' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Full Name / Shop Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., Asit General Store"
                          value={authForm.name}
                          onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                          className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Phone Number *</label>
                          <input
                            type="text"
                            required
                            placeholder="9876543210"
                            value={authForm.phone}
                            onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Account Role *</label>
                          <select
                            value={authForm.role}
                            onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}
                            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
                          >
                            <option value="CUSTOMER">Retail Customer</option>
                            <option value="WHOLESALE_BUYER">Wholesale Buyer (B2B)</option>
                            <option value="DELIVERY_PARTNER">Delivery Partner</option>
                          </select>
                        </div>
                      </div>

                      {authForm.role === 'WHOLESALE_BUYER' && (
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Shop GST Number (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g., 19ABCDE1234F1Z5"
                            value={authForm.gstNumber}
                            onChange={(e) => setAuthForm({ ...authForm, gstNumber: e.target.value })}
                            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                          />
                        </div>
                      )}
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm shadow"
                  >
                    {authMode === 'LOGIN' ? 'Login to Account' : 'Register Account in MongoDB'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ==================== 2. ORDERS & DELIVERY PARTNER VIEW ==================== */}
        {viewMode === 'ORDERS' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                  <ClipboardList className="w-5 h-5 text-indigo-600" />
                  Live Orders & Fleet Dispatch
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time order feed from MongoDB • Verify Rx & update statuses
                </p>
              </div>
              <button
                onClick={fetchOrders}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            {ordersLoading ? (
              <div className="text-center py-12 text-slate-500 text-sm">Loading orders from MongoDB...</div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                <Bike className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
                <h3 className="font-bold text-slate-800">No Orders Placed Yet</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Add items to your cart in the Store and place your first order!
                </p>
                <button
                  onClick={() => setViewMode('STORE')}
                  className="bg-indigo-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl"
                >
                  Go to Storefront
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between border-b pb-2.5">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                          Status: {order.status || 'PENDING'}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm mt-1">
                          Customer: {order.customer?.name || 'Registered Buyer'}
                          {order.customer?.phone ? ` (📞 ${order.customer.phone})` : ''}
                        </h3>
                        {order.deliveryAddress && (
                          <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            {order.deliveryAddress}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-base font-extrabold text-indigo-700">
                          ₹{order.totalAmount || 0}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          ID: #{order._id?.slice(-6)}
                        </div>
                      </div>
                    </div>

                    {/* Ordered Items List */}
                    <div className="bg-slate-50 rounded-xl p-2.5 space-y-1">
                      {order.items && order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-slate-700">
                          <span>
                            • {item.product?.name || 'Product Item'} × {item.quantity || 1}
                          </span>
                          <span className="font-semibold">
                            ₹{(item.price || item.product?.price || 0) * (item.quantity || 1)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Prescription Image Preview or Link */}
                    {order.prescriptionUrl && (
                      <div className="text-xs bg-rose-50 border border-rose-200 text-rose-900 p-2.5 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {order.prescriptionUrl.startsWith('data:image') || order.prescriptionUrl.startsWith('http') ? (
                            <img
                              src={order.prescriptionUrl}
                              alt="Prescription Rx"
                              className="w-12 h-12 object-cover rounded-lg border border-rose-300"
                            />
                          ) : null}
                          <div>
                            <div className="font-bold">🩺 Doctor Prescription Attached</div>
                            <div className="text-[11px] text-rose-700 truncate max-w-[200px]">
                              {order.prescriptionUrl.startsWith('data:') ? 'Uploaded from Phone Camera' : order.prescriptionUrl}
                            </div>
                          </div>
                        </div>
                        {order.prescriptionUrl.startsWith('http') && (
                          <a
                            href={order.prescriptionUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-rose-600 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1"
                          >
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Delivery Partner Controls */}
                    <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-slate-500">
                        {order.deliveryPartner?.name
                          ? `🛵 Assigned Rider: ${order.deliveryPartner.name}`
                          : '🛵 Awaiting Rider Pickup'}
                      </span>

                      <div className="flex flex-wrap gap-1.5">
                        {['CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((st) => (
                          <button
                            key={st}
                            onClick={() => handleUpdateOrderStatus(order._id, st)}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition ${
                              order.status === st
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 hover:bg-indigo-100 text-slate-700'
                            }`}
                          >
                            {st.replace(/_/g, ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== 3. ADMIN PANEL VIEW ==================== */}
        {viewMode === 'ADMIN' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h2 className="text-lg font-bold text-slate-800">Add New Product</h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowKeySettings(!showKeySettings)}
                    className="text-xs bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                  >
                    <Settings className="w-3.5 h-3.5" /> Cloud Keys
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickDemoProduct}
                    className="text-xs bg-purple-100 text-purple-800 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> 1-Tap Photo Item
                  </button>
                </div>
              </div>

              {/* Optional Cloud Keys Setup Box */}
              {showKeySettings && (
                <form onSubmit={saveCloudKeys} className="mb-5 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-extrabold text-slate-800">
                    ⚙️ Optional Live Cloud Keys (Works immediately with built-in phone fallback if left blank)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Cloudinary Cloud Name</label>
                      <input
                        type="text"
                        placeholder="e.g., dxyz12345"
                        value={cloudConfig.cloudinaryCloudName}
                        onChange={(e) => setCloudConfig({ ...cloudConfig, cloudinaryCloudName: e.target.value.trim() })}
                        className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Unsigned Upload Preset</label>
                      <input
                        type="text"
                        placeholder="e.g., a2z_unsigned"
                        value={cloudConfig.cloudinaryPreset}
                        onChange={(e) => setCloudConfig({ ...cloudConfig, cloudinaryPreset: e.target.value.trim() })}
                        className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Razorpay Key ID</label>
                      <input
                        type="text"
                        placeholder="e.g., rzp_test_12345"
                        value={cloudConfig.razorpayKeyId}
                        onChange={(e) => setCloudConfig({ ...cloudConfig, razorpayKeyId: e.target.value.trim() })}
                        className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg"
                  >
                    Save Keys
                  </button>
                </form>
              )}

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Fortune Mustard Oil 1L"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                  />
                </div>

                {/* Product Photo Camera / Gallery Upload */}
                <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-2">
                  <label className="block text-xs font-bold text-indigo-950">
                    📷 Product Photo (Upload from Phone Camera/Gallery or Paste URL)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shrink-0 shadow-sm">
                      <Camera className="w-4 h-4" />
                      {uploadingImg ? 'Uploading...' : 'Choose / Take Photo'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files?.[0], 'PRODUCT')}
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Or paste image link (https://...)"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs bg-white"
                    />
                  </div>
                  {formData.imageUrl && (
                    <div className="flex items-center gap-2 pt-1">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-14 h-14 object-cover rounded-xl border border-indigo-300"
                      />
                      <span className="text-[11px] text-emerald-700 font-bold">
                        ✅ Photo Ready to Save!
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white"
                    >
                      <option value="GENERAL">GENERAL (Grocery)</option>
                      <option value="FOOD">FOOD (Fast Delivery)</option>
                      <option value="MEDICINE">MEDICINE (Pharmacy)</option>
                      <option value="ELECTRONICS">ELECTRONICS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Stock Qty</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Retail Price (₹) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g., 180"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Wholesale Price (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g., 155"
                      value={formData.wholesalePrice}
                      onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                    />
                  </div>
                </div>

                {formData.category === 'MEDICINE' && (
                  <label className="flex items-center gap-2 bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs font-semibold text-rose-900">
                    <input
                      type="checkbox"
                      checked={formData.requiresPrescription}
                      onChange={(e) => setFormData({ ...formData, requiresPrescription: e.target.checked })}
                      className="w-4 h-4"
                    />
                    Requires Doctor Prescription (Rx Mandatory)
                  </label>
                )}

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow"
                >
                  Save Product to Database
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ==================== 4. STOREFRONT & SMART CART VIEW ==================== */}
        {viewMode === 'STORE' && (
          <>
            {/* Category Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
              {['ALL', 'GENERAL', 'FOOD', 'MEDICINE', 'ELECTRONICS'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
                    activeTab === cat
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {cat === 'ALL' ? 'All Items' : cat}
                </button>
              ))}
              <button
                onClick={fetchProducts}
                className="px-3 py-2 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="text-center py-16 text-slate-500 text-sm">
                Loading live inventory from Render...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center my-4">
                <Package className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
                <h3 className="font-bold text-slate-800">No Products in This Category</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Tap below to insert a sample product with photo directly into MongoDB.
                </p>
                <button
                  onClick={handleQuickDemoProduct}
                  className="bg-indigo-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" /> Add 1-Tap Sample Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                {filteredProducts.map((product) => {
                  const displayPrice = isWholesale && product.wholesalePrice 
                    ? product.wholesalePrice 
                    : product.price;

                  return (
                    <div
                      key={product._id}
                      className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        {product.imageUrl && (
                          <div className="h-40 w-full bg-slate-100 overflow-hidden">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-4 pb-0">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {product.category}
                            </span>
                            {product.requiresPrescription && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700 flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3" /> Rx Required
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-slate-900 text-base">{product.name}</h3>
                        </div>
                      </div>

                      <div className="p-4 mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-lg font-extrabold text-indigo-700">
                            ₹{displayPrice}
                            {isWholesale && (
                              <span className="text-xs text-slate-400 line-through ml-1.5 font-normal">
                                ₹{product.price}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {isWholesale 
                              ? `Min Order: ${product.minWholesaleQty || 5} units` 
                              : '20–30km Fast Delivery'}
                          </div>
                        </div>

                        <button
                          onClick={() => addToCart(product)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm"
                        >
                          + Add {isWholesale ? `(${product.minWholesaleQty || 5})` : ''}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Smart Cart, Prescription Camera Upload & Razorpay Checkout */}
            {cart.length > 0 && (
              <div className="mt-6 bg-white rounded-2xl border-2 border-indigo-600 p-4 shadow-lg">
                <h3 className="font-extrabold text-slate-900 text-sm mb-2 flex items-center justify-between">
                  <span>Smart Cart ({cart.length} items)</span>
                  <span className="text-indigo-700 text-base">Total: ₹{cartTotal}</span>
                </h3>

                {/* Split Fleet Dispatch Notice */}
                {hasFood && hasNonFood && (
                  <div className="mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                    ⚡ <strong>Split Fleet Dispatch:</strong> Hot Food will arrive in 35 mins via Immediate Rider. Wholesale/General items will arrive via 20–30km Utility Fleet.
                  </div>
                )}

                {/* Mandatory Prescription Camera Upload */}
                {needsRx && (
                  <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2">
                    <p className="font-bold">🩺 Doctor Prescription Required for Medicine *</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <label className="cursor-pointer bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 shrink-0">
                        <Camera className="w-3.5 h-3.5" />
                        {uploadingImg ? 'Uploading...' : 'Upload Rx Photo'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e.target.files?.[0], 'PRESCRIPTION')}
                        />
                      </label>
                      <input
                        type="text"
                        placeholder="Or type Doctor Rx ID / Paste link..."
                        value={prescriptionUrl}
                        onChange={(e) => setPrescriptionUrl(e.target.value)}
                        className="w-full border border-rose-300 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                      />
                    </div>
                    {prescriptionUrl && (
                      <div className="text-[11px] font-bold text-emerald-700">
                        ✅ Prescription Attached!
                      </div>
                    )}
                  </div>
                )}

                {/* Delivery Address Input */}
                <div className="mb-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    📍 Delivery Address (20–30km Zone) *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter village/town, landmark, and pin code..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                {/* Payment Method Selector: Razorpay vs Cash on Delivery */}
                <div className="mb-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    💳 Select Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('RAZORPAY')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        paymentMethod === 'RAZORPAY'
                          ? 'bg-indigo-50 border-indigo-600 text-indigo-900'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-indigo-600" />
                      Razorpay (UPI / Card)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('COD')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        paymentMethod === 'COD'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      Cash on Delivery
                    </button>
                  </div>
                </div>

                {/* Cart Items List */}
                <div className="space-y-1.5 max-h-40 overflow-y-auto mb-3">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg">
                      <span className="font-medium text-slate-800">
                        {item.name} × {item.qty}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">₹{item.finalPrice * item.qty}</span>
                        <button onClick={() => removeFromCart(idx)} className="text-rose-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handlePlaceOrder}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-1.5 shadow"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {paymentMethod === 'RAZORPAY'
                    ? `Pay ₹${cartTotal} via Razorpay & Order`
                    : `Place COD Order (₹${cartTotal})`}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
