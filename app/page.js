'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Truck, ShieldAlert, Package, CheckCircle2, 
  RefreshCw, Sparkles, Trash2, User, LogOut, MapPin, 
  ClipboardList, Bike, Camera, CreditCard, Banknote, 
  Settings, Search, ServerCrash, Server, Languages, 
  Download, X, Flame, Clock, Store, Heart, FileText, 
  RotateCcw, Ban, Navigation, BarChart3, Bookmark
} from 'lucide-react';

const API_URL = 'https://a2z-backend-tgls.onrender.com/api';

// Central Hub Coordinates (Karimpur, Nadia, West Bengal) for 20-30km Radius Check
const HUB_COORDS = { lat: 23.9715, lng: 88.6265, name: 'Karimpur Central Hub' };

const NEARBY_STORES = [
  { id: 's1', name: 'Biswas Agro & Grocery Hub', category: 'GENERAL', dist: '2.4 km', rating: 4.8, tag: 'Wholesale & Retail' },
  { id: 's2', name: 'Royal Bengal Biryani & Kitchen', category: 'FOOD', dist: '1.8 km', rating: 4.7, tag: '30-Min Hot Delivery' },
  { id: 's3', name: 'LifeCare 24×7 Medico', category: 'MEDICINE', dist: '3.1 km', rating: 4.9, tag: 'Verified Pharmacy' },
  { id: 's4', name: 'TechZone Mobile & Gadgets', category: 'ELECTRONICS', dist: '4.5 km', rating: 4.6, tag: 'Official Warranty' }
];

const PROMO_BANNERS = [
  {
    id: 'b1',
    badge: 'MEGA WHOLESALE & RETAIL FEST',
    title: 'Up to 25% OFF on Bulk Grocery & Kirana Supplies',
    sub: 'Direct 20–30km utility fleet dispatch for shops & families',
    code: 'A2ZBULK',
    bg: 'from-indigo-800 via-indigo-700 to-purple-800'
  },
  {
    id: 'b2',
    badge: 'ZOMATO-STYLE EXPRESS FOOD',
    title: 'Hot Biryani, Rolls & Combos in 35 Mins',
    sub: 'Zero surge fee within local zone • Split-fleet checkout supported',
    code: 'HOTFOOD50',
    bg: 'from-rose-700 via-red-600 to-amber-600'
  }
];

export default function SuperAppHome() {
  const [viewMode, setViewMode] = useState('STORE'); // STORE | ORDERS | WISHLIST | ADMIN | ACCOUNT
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedStoreFilter, setSelectedStoreFilter] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [lang, setLang] = useState('EN');

  // Search, Auto-Suggestions & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortOption, setSortOption] = useState('NEWEST');
  const [serverStatus, setServerStatus] = useState('IDLE');

  // Product Detail Modal, Wishlist, Save for Later & Recently Viewed
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [detailQty, setDetailQty] = useState(1);
  const [zoomImg, setZoomImg] = useState(false);
  const [reviewInput, setReviewInput] = useState({ rating: 5, comment: '' });
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [savedForLater, setSavedForLater] = useState([]);

  // GST Invoice Modal State
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  // GPS Radius Geofencing State
  const [gpsInfo, setGpsInfo] = useState(null); // { distKm, withinZone, coordsText }
  const [gpsLoading, setGpsLoading] = useState(false);

  // Data States
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  // Cloud Keys State
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
    name: '', email: '', password: '', phone: '', role: 'CUSTOMER', gstNumber: ''
  });

  // Cart & Checkout States
  const [isWholesale, setIsWholesale] = useState(false);
  const [cart, setCart] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [prescriptionUrl, setPrescriptionUrl] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');

  // Admin Form State
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    shopName: 'Biswas Agro & Grocery Hub',
    category: 'GENERAL',
    price: '',
    wholesalePrice: '',
    minWholesaleQty: '5',
    stock: '100',
    variantsText: 'Regular, Large Pack',
    description: '',
    specifications: '',
    requiresPrescription: false,
    imageUrl: ''
  });

  const t = {
    EN: {
      subtitle: '20–30km Hyper-Local Wholesale & Retail Super App',
      store: 'Store',
      orders: 'Orders',
      wishlist: 'Wishlist',
      admin: '+ Admin',
      login: 'Login',
      wholesaleActive: '📦 B2B Wholesale Tiered Pricing Active',
      retailActive: '🛍️ Standard Retail Mode',
      switchRetail: 'Switch to Retail',
      switchWholesale: 'Switch to Wholesale',
      searchPlaceholder: 'Search products, brands, stores or categories...',
      nearbyStores: 'Popular Nearby Stores (20–30km)',
      trendingTitle: 'Trending & Recommended',
      recentlyViewedTitle: 'Recently Viewed Products',
      clearFilter: 'Show All Stores'
    },
    BN: {
      subtitle: '২০–৩০ কিমি হাইপার-লোকাল হোলসেল ও রিটেল সুপার অ্যাপ',
      store: 'দোকান',
      orders: 'অর্ডার',
      wishlist: 'উইশলিস্ট',
      admin: '+ অ্যাডমিন',
      login: 'লগইন',
      wholesaleActive: '📦 পাইকারি (B2B) রেট চালু আছে',
      retailActive: '🛍️ খুচরো (Retail) দাম চালু আছে',
      switchRetail: 'খুচরো রেট দেখুন',
      switchWholesale: 'পাইকারি রেট দেখুন',
      searchPlaceholder: 'পণ্য, ব্র্যান্ড, দোকান বা ক্যাটাগরি খুঁজুন...',
      nearbyStores: 'কাছাকাছি জনপ্রিয় দোকান (২০–৩০ কিমি)',
      trendingTitle: 'ট্রেন্ডিং ও সেরা পণ্য',
      recentlyViewedTitle: 'সম্প্রতি দেখা পণ্য',
      clearFilter: 'সব দোকান দেখুন'
    }
  }[lang];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      }
      try {
        const savedLang = localStorage.getItem('a2z_lang');
        if (savedLang === 'BN' || savedLang === 'EN') setLang(savedLang);

        const savedUser = localStorage.getItem('a2z_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setCurrentUser(parsed);
          if (parsed.role === 'WHOLESALE_BUYER') setIsWholesale(true);
        }

        const savedKeys = localStorage.getItem('a2z_cloud_keys');
        if (savedKeys) setCloudConfig(JSON.parse(savedKeys));

        const cachedProducts = localStorage.getItem('a2z_products_cache');
        if (cachedProducts) {
          const parsedProducts = JSON.parse(cachedProducts);
          if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
            setProducts(parsedProducts);
            setLoading(false);
          }
        }

        const savedRecent = localStorage.getItem('a2z_recent_products');
        if (savedRecent) setRecentlyViewed(JSON.parse(savedRecent));

        const savedWish = localStorage.getItem('a2z_wishlist');
        if (savedWish) setWishlist(JSON.parse(savedWish));

        const savedLater = localStorage.getItem('a2z_saved_later');
        if (savedLater) setSavedForLater(JSON.parse(savedLater));

        const savedCart = localStorage.getItem('a2z_cart_cache');
        if (savedCart) setCart(JSON.parse(savedCart));
      } catch (e) {}

      fetchProducts();
      fetchOrders();
    }
  }, []);

  useEffect(() => {
    try { localStorage.setItem('a2z_cart_cache', JSON.stringify(cart)); } catch (e) {}
  }, [cart]);

  const toggleLanguage = () => {
    const nextLang = lang === 'EN' ? 'BN' : 'EN';
    setLang(nextLang);
    try { localStorage.setItem('a2z_lang', nextLang); } catch (e) {}
  };

  const fetchProducts = async () => {
    if (products.length === 0) setLoading(true);
    const wakeTimer = setTimeout(() => setServerStatus('WAKING_UP'), 1500);
    try {
      const res = await fetch(`${API_URL}/products`);
      clearTimeout(wakeTimer);
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
        localStorage.setItem('a2z_products_cache', JSON.stringify(data));
        setServerStatus('CONNECTED');
      }
    } catch (err) {
      clearTimeout(wakeTimer);
      setServerStatus('ERROR');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (err) {} finally {
      setOrdersLoading(false);
    }
  };

  // Haversine Distance Calculator for 20-30km GPS Radius Validation
  const detectGpsRadius = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const R = 6371; // Earth radius in km
        const dLat = ((latitude - HUB_COORDS.lat) * Math.PI) / 180;
        const dLon = ((longitude - HUB_COORDS.lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((HUB_COORDS.lat * Math.PI) / 180) *
            Math.cos((latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = Number((R * c).toFixed(1));
        const withinZone = distanceKm <= 30;

        setGpsInfo({
          distKm: distanceKm,
          withinZone,
          coordsText: `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`
        });
        setDeliveryAddress(
          `GPS Pin (${latitude.toFixed(4)}, ${longitude.toFixed(4)}) • ${distanceKm} km from ${HUB_COORDS.name}`
        );
        setGpsLoading(false);
        setStatusMsg(
          withinZone
            ? `✅ GPS Verified! You are ${distanceKm} km away (Inside 30km Hyper-Local Zone).`
            : `⚠️ You are ${distanceKm} km from ${HUB_COORDS.name} (Outside standard 30km radius, regional shipping applies).`
        );
      },
      () => {
        setGpsLoading(false);
        setStatusMsg('⚠️ Could not access GPS. Please allow location permission or type address manually.');
      }
    );
  };

  // Wishlist Toggle
  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p._id === product._id);
      const updated = exists ? prev.filter((p) => p._id !== product._id) : [product, ...prev];
      try { localStorage.setItem('a2z_wishlist', JSON.stringify(updated)); } catch (e) {}
      setStatusMsg(exists ? `Removed ${product.name} from Wishlist` : `❤️ Saved ${product.name} to Wishlist!`);
      return updated;
    });
  };

  // Save for Later inside Cart
  const moveToSavedForLater = (idx) => {
    const item = cart[idx];
    if (!item) return;
    setSavedForLater((prev) => {
      const updated = [item, ...prev];
      try { localStorage.setItem('a2z_saved_later', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    setCart((prev) => prev.filter((_, i) => i !== idx));
    setStatusMsg(`📌 Saved "${item.name}" for later!`);
  };

  const moveBackToCart = (idx) => {
    const item = savedForLater[idx];
    if (!item) return;
    setCart((prev) => [...prev, item]);
    setSavedForLater((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      try { localStorage.setItem('a2z_saved_later', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    setStatusMsg(`🛒 Moved "${item.name}" back to active cart!`);
  };

  // Open Product Detail Modal
  const openProductModal = (product) => {
    const variantsList = Array.isArray(product.variants) && product.variants.length > 0
      ? product.variants
      : ['Standard Pack', 'Family / Bulk Pack'];
    setSelectedProduct(product);
    setSelectedVariant(variantsList[0]);
    setDetailQty(isWholesale ? (product.minWholesaleQty || 5) : 1);
    setZoomImg(false);

    setRecentlyViewed((prev) => {
      const filtered = prev.filter((item) => item._id !== product._id);
      const updated = [product, ...filtered].slice(0, 6);
      try { localStorage.setItem('a2z_recent_products', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  // Dynamic Tiered Wholesale Slab Calculator
  const calculateUnitPrice = (product, qty) => {
    const retail = Number(product.price || 100);
    const baseWholesale = Number(product.wholesalePrice || Math.round(retail * 0.85));
    const minMoq = Number(product.minWholesaleQty || 5);

    if (!isWholesale && qty < minMoq) return retail;
    if (qty >= 50) return Math.round(baseWholesale * 0.88);
    if (qty >= 20) return Math.round(baseWholesale * 0.94);
    if (qty >= minMoq || isWholesale) return baseWholesale;
    return retail;
  };

  const addToCart = (product, customQty, chosenVariant) => {
    const qtyToAdd = customQty || (isWholesale ? (product.minWholesaleQty || 5) : 1);
    const unitPrice = calculateUnitPrice(product, qtyToAdd);
    const variantLabel = chosenVariant || (product.variants?.[0] || 'Standard');

    setCart((prev) => [
      ...prev,
      {
        ...product,
        qty: qtyToAdd,
        finalPrice: unitPrice,
        selectedVariant: variantLabel
      }
    ]);
    setStatusMsg(`🛒 Added ${product.name} (${variantLabel} × ${qtyToAdd}) @ ₹${unitPrice}/unit`);
    if (selectedProduct) setSelectedProduct(null);
  };

  // 1-Click Repeat Previous Order
  const handleRepeatOrder = (order) => {
    if (!order.items || order.items.length === 0) return;
    const restoredItems = order.items.map((item) => {
      const prodObj = item.product && typeof item.product === 'object' ? item.product : { _id: item.product, name: 'Previous Order Item', price: item.price };
      return {
        ...prodObj,
        qty: item.quantity || 1,
        finalPrice: item.price || prodObj.price || 100,
        selectedVariant: 'Reorder Pack'
      };
    });
    setCart(restoredItems);
    setViewMode('STORE');
    setStatusMsg('🔁 Previous order items loaded into your Smart Cart!');
  };

  const updateCartQty = (idx, delta) => {
    setCart((prev) =>
      prev
        .map((item, i) => {
          if (i !== idx) return item;
          const nextQty = item.qty + delta;
          if (nextQty <= 0) return null;
          return {
            ...item,
            qty: nextQty,
            finalPrice: calculateUnitPrice(item, nextQty)
          };
        })
        .filter(Boolean)
    );
  };

  const applyCoupon = (codeToApply) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    setCouponCode(code);
    if (code === 'A2ZBULK' || code === 'HOTFOOD50') {
      setDiscountAmount(50);
      setStatusMsg(`🎉 Coupon ${code} applied! ₹50 instant discount added.`);
    } else {
      setDiscountAmount(0);
      setStatusMsg('⚠️ Invalid coupon. Try A2ZBULK or HOTFOOD50');
    }
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!reviewInput.comment.trim() || !selectedProduct) return;
    const newReview = {
      userName: currentUser ? currentUser.name : 'Verified Local Shopper',
      rating: Number(reviewInput.rating),
      comment: reviewInput.comment,
      date: 'Just now'
    };
    const updatedReviews = [newReview, ...(selectedProduct.reviews || [])];
    const updatedProduct = {
      ...selectedProduct,
      reviews: updatedReviews,
      reviewsCount: (selectedProduct.reviewsCount || 24) + 1
    };
    setSelectedProduct(updatedProduct);
    setProducts((prev) => prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p)));
    setReviewInput({ rating: 5, comment: '' });
    setStatusMsg('⭐ Thank you! Your review has been posted.');
  };

  const handleFileUpload = async (file, targetType) => {
    if (!file) return;
    setUploadingImg(true);
    setStatusMsg('📷 Processing photo...');
    try {
      let finalImageUrl = '';
      if (cloudConfig.cloudinaryCloudName && cloudConfig.cloudinaryPreset) {
        const formPayload = new FormData();
        formPayload.append('file', file);
        formPayload.append('upload_preset', cloudConfig.cloudinaryPreset);
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudConfig.cloudinaryCloudName}/image/upload`,
          { method: 'POST', body: formPayload }
        );
        const data = await res.json();
        if (!res.ok) throw new Error('Upload failed');
        finalImageUrl = data.secure_url;
      } else {
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
      } else {
        setPrescriptionUrl(finalImageUrl);
      }
      setStatusMsg('✅ Photo attached!');
    } catch (err) {
      setStatusMsg(`❌ ${err.message}`);
    } finally {
      setUploadingImg(false);
    }
  };

  const handleQuickDemoProduct = async () => {
    setStatusMsg('Adding rich sample product to MongoDB...');
    const samples = [
      {
        name: 'Aashirvaad Select Sharbati Atta',
        brand: 'ITC Aashirvaad',
        shopName: 'Biswas Agro & Grocery Hub',
        category: 'GENERAL',
        price: 460,
        wholesalePrice: 410,
        minWholesaleQty: 5,
        stock: 90,
        variants: ['5kg Pack', '10kg Family Pack', '25kg Wholesale Sack'],
        description: '100% MP Sharbati wheat flour for soft rotis. Fresh stock available for retail & kirana wholesale.',
        specifications: 'Shelf Life: 4 Months • FSSAI Certified • Moisture Proof Packaging',
        rating: 4.8,
        reviewsCount: 64,
        requiresPrescription: false,
        imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Special Royal Chicken Dum Biryani',
        brand: 'Royal Bengal Kitchen',
        shopName: 'Royal Bengal Biryani & Kitchen',
        category: 'FOOD',
        price: 240,
        wholesalePrice: 195,
        minWholesaleQty: 5,
        stock: 40,
        variants: ['Regular Plate (1 Pc)', 'Special Combo (2 Pcs + Egg)', 'Family Bucket (4 Serves)'],
        description: 'Authentic Kolkata-style fragrant basmati Dum Biryani with tender chicken, potato, boiled egg, and raita.',
        specifications: 'Prep Time: 20 Mins • Hygienic Sealed Handi • 100% Halal',
        rating: 4.9,
        reviewsCount: 112,
        requiresPrescription: false,
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Augmentin 625 Duo Tablet Strip (10 Tabs)',
        brand: 'GSK Pharma',
        shopName: 'LifeCare 24×7 Medico',
        category: 'MEDICINE',
        price: 204,
        wholesalePrice: 168,
        minWholesaleQty: 10,
        stock: 150,
        variants: ['1 Strip (10 Tablets)', 'Box of 10 Strips (Pharmacy Pack)'],
        description: 'Broad-spectrum antibiotic composed of Amoxycillin and Potassium Clavulanate. Verified pharmacy dispatch.',
        specifications: 'Cold-Chain Protected • Batch Verified • Rx Mandatory',
        rating: 4.9,
        reviewsCount: 48,
        requiresPrescription: true,
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'SuperVOOC 65W Type-C Fast Charger Adapter',
        brand: 'TechZone Official',
        shopName: 'TechZone Mobile & Gadgets',
        category: 'ELECTRONICS',
        price: 799,
        wholesalePrice: 540,
        minWholesaleQty: 5,
        stock: 55,
        variants: ['Adapter Only', 'Adapter + 1m Type-C Cable', 'Retailer 5-Pack Box'],
        description: 'High-speed 65W GaN fast charger compatible with 5G smartphones, tablets, and USB-C devices.',
        specifications: 'Output: 65W Max • Over-Voltage Protection • 6 Months Replacement Warranty',
        rating: 4.7,
        reviewsCount: 39,
        requiresPrescription: false,
        imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80'
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

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setStatusMsg('Saving product to MongoDB...');
    try {
      const variantsArr = formData.variantsText
        ? formData.variantsText.split(',').map((s) => s.trim()).filter(Boolean)
        : ['Standard'];
      const payload = {
        name: formData.name,
        brand: formData.brand || 'A2Z Verified',
        shopName: formData.shopName || 'A2Z Central Hub',
        category: formData.category,
        price: Number(formData.price),
        wholesalePrice: Number(formData.wholesalePrice || formData.price),
        minWholesaleQty: Number(formData.minWholesaleQty || 5),
        stock: Number(formData.stock || 50),
        variants: variantsArr,
        description: formData.description || 'Quality verified local product.',
        specifications: formData.specifications || 'Fast 20–30km delivery • GST Invoice Available',
        requiresPrescription: formData.requiresPrescription,
        imageUrl: formData.imageUrl
      };
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save product');
      setStatusMsg('✅ Product saved to MongoDB!');
      fetchProducts();
      setViewMode('STORE');
    } catch (err) {
      setStatusMsg(`❌ ${err.message}`);
    }
  };

  const handleQuickDemoAuth = async (demoType) => {
    const profiles = {
      CUSTOMER: { name: 'Rahul Sharma (Retail)', email: 'retail@a2zdemo.com', password: 'password123', phone: '9876543210', role: 'CUSTOMER' },
      WHOLESALE_BUYER: { name: 'Biswas Kirana Store (B2B)', email: 'wholesale@a2zdemo.com', password: 'password123', phone: '9876500001', role: 'WHOLESALE_BUYER', gstNumber: '19ABCDE1234F1Z5' },
      DELIVERY_PARTNER: { name: 'Suman Rider (20-30km Fleet)', email: 'rider@a2zdemo.com', password: 'password123', phone: '9876599999', role: 'DELIVERY_PARTNER' }
    };
    const profile = profiles[demoType];
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
      const userObj = data.user || {
        id: data._id, name: data.name, email: data.email, phone: data.phone, role: data.role, gstNumber: data.gstNumber
      };
      setCurrentUser(userObj);
      localStorage.setItem('a2z_user', JSON.stringify(userObj));
      setIsWholesale(userObj.role === 'WHOLESALE_BUYER');
      setStatusMsg(`✅ Logged in as ${userObj.name}`);
      setViewMode(userObj.role === 'DELIVERY_PARTNER' ? 'ORDERS' : 'STORE');
    } catch (err) {
      setStatusMsg(`❌ ${err.message}`);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = authMode === 'LOGIN' ? '/users/login' : '/users/register';
      const payload = authMode === 'LOGIN' ? { email: authForm.email, password: authForm.password } : authForm;
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Auth failed');
      const userObj = data.user || {
        id: data._id, name: data.name, email: data.email, phone: data.phone, role: data.role, gstNumber: data.gstNumber
      };
      setCurrentUser(userObj);
      localStorage.setItem('a2z_user', JSON.stringify(userObj));
      setIsWholesale(userObj.role === 'WHOLESALE_BUYER');
      setViewMode('STORE');
    } catch (err) {
      setStatusMsg(`❌ ${err.message}`);
    }
  };

  const saveOrderToDatabase = async (paymentLabel) => {
    setStatusMsg('Saving order to MongoDB...');
    try {
      const orderPayload = {
        customer: currentUser.id || currentUser._id,
        items: cart.map((item) => ({
          product: item._id,
          quantity: item.qty,
          price: item.finalPrice
        })),
        totalAmount: finalPayableTotal,
        deliveryAddress: `${deliveryAddress} [${paymentLabel}]`,
        prescriptionUrl: prescriptionUrl || undefined,
        deliveryType: hasFood && hasNonFood ? 'SPLIT_FLEET' : hasFood ? 'IMMEDIATE_FOOD' : 'STANDARD_20_30KM',
        status: 'PENDING'
      };
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      if (!res.ok) throw new Error('Order failed');
      setCart([]);
      setDiscountAmount(0);
      localStorage.removeItem('a2z_cart_cache');
      setPrescriptionUrl('');
      setStatusMsg(`🎉 Order Placed (${paymentLabel})!`);
      fetchOrders();
      setViewMode('ORDERS');
    } catch (err) {
      setStatusMsg(`❌ ${err.message}`);
    }
  };

  const handlePlaceOrder = async () => {
    if (!currentUser) {
      setStatusMsg('⚠️ Please login or tap a 1-Tap Demo Account first!');
      setViewMode('ACCOUNT');
      return;
    }
    if (needsRx && !prescriptionUrl.trim()) {
      alert('Prescription photo or Rx ID is mandatory for restricted medicines!');
      return;
    }
    if (!deliveryAddress.trim()) {
      alert('Please enter your delivery address or tap GPS Pin (20–30km radius)!');
      return;
    }
    if (paymentMethod === 'COD') {
      await saveOrderToDatabase('COD - Pay on Delivery');
      return;
    }
    if (cloudConfig.razorpayKeyId && typeof window !== 'undefined' && window.Razorpay) {
      const options = {
        key: cloudConfig.razorpayKeyId,
        amount: finalPayableTotal * 100,
        currency: 'INR',
        name: 'A2Z Super App',
        description: '20-30km Hyper-Local Order',
        handler: async function (response) {
          await saveOrderToDatabase(`PAID via Razorpay (${response.razorpay_payment_id})`);
        },
        prefill: { name: currentUser.name, email: currentUser.email, contact: currentUser.phone || '9876543210' },
        theme: { color: '#4338ca' }
      };
      new window.Razorpay(options).open();
    } else {
      const demoPayId = 'pay_A2Z' + Math.floor(100000 + Math.random() * 900000);
      await saveOrderToDatabase(`PAID Online (${demoPayId})`);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setStatusMsg(`✅ Order status updated to ${newStatus}!`);
        fetchOrders();
      }
    } catch (err) {}
  };

  // Search Suggestions & Filtering
  const searchSuggestions = searchQuery.trim()
    ? products.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.brand || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.shopName || '').toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const processedProducts = products
    .filter((p) => (activeTab === 'ALL' ? true : p.category === activeTab))
    .filter((p) => (selectedStoreFilter ? (p.shopName || '').includes(selectedStoreFilter) : true))
    .filter((p) =>
      searchQuery.trim() === ''
        ? true
        : (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.brand || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const priceA = isWholesale ? (a.wholesalePrice || a.price) : a.price;
      const priceB = isWholesale ? (b.wholesalePrice || b.price) : b.price;
      if (sortOption === 'PRICE_LOW') return priceA - priceB;
      if (sortOption === 'PRICE_HIGH') return priceB - priceA;
      return 0;
    });

  const hasFood = cart.some((item) => item.category === 'FOOD');
  const hasNonFood = cart.some((item) => item.category !== 'FOOD');
  const needsRx = cart.some((item) => item.category === 'MEDICINE' && item.requiresPrescription);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.finalPrice * item.qty, 0);
  const deliveryFee = cartSubtotal > 999 || cartSubtotal === 0 ? 0 : 25;
  const finalPayableTotal = Math.max(0, cartSubtotal + deliveryFee - discountAmount);

  // Admin Revenue & Low Stock Metrics
  const totalRevenue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const lowStockProducts = products.filter((p) => Number(p.stock || 100) < 20);

  return (
    <div className="min-h-screen pb-28 bg-slate-50">
      {/* Top Sticky Header */}
      <header className="bg-indigo-700 text-white sticky top-0 z-30 shadow-md print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div onClick={() => { setViewMode('STORE'); setSelectedStoreFilter(''); }} className="cursor-pointer">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-amber-300 shrink-0" />
              <h1 className="text-base sm:text-xl font-extrabold tracking-tight">A2Z Super App</h1>
            </div>
            <p className="text-[11px] text-indigo-200 flex items-center gap-1 mt-0.5">
              <Truck className="w-3 h-3 shrink-0" /> {t.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-lg text-xs font-extrabold bg-amber-400 text-slate-950 shadow-sm flex items-center gap-1"
            >
              <Languages className="w-3.5 h-3.5" /> {lang === 'EN' ? 'বাংলা' : 'EN'}
            </button>
            <button
              onClick={() => setViewMode('STORE')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                viewMode === 'STORE' ? 'bg-white text-indigo-800' : 'bg-indigo-600 text-indigo-100'
              }`}
            >
              {t.store}
            </button>
            <button
              onClick={() => setViewMode('WISHLIST')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                viewMode === 'WISHLIST' ? 'bg-white text-rose-600' : 'bg-indigo-600 text-indigo-100'
              }`}
            >
              <Heart className="w-3.5 h-3.5" /> ({wishlist.length})
            </button>
            <button
              onClick={() => { fetchOrders(); setViewMode('ORDERS'); }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                viewMode === 'ORDERS' ? 'bg-white text-indigo-800' : 'bg-indigo-600 text-indigo-100'
              }`}
            >
              <Bike className="w-3.5 h-3.5" /> {t.orders} ({orders.length})
            </button>
            <button
              onClick={() => setViewMode('ADMIN')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                viewMode === 'ADMIN' ? 'bg-amber-400 text-slate-950' : 'bg-indigo-600 text-indigo-100'
              }`}
            >
              {t.admin}
            </button>
            <button
              onClick={() => setViewMode('ACCOUNT')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                viewMode === 'ACCOUNT' ? 'bg-emerald-400 text-slate-950' : 'bg-indigo-800 text-amber-300'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              {currentUser ? currentUser.name.split(' ')[0] : t.login}
            </button>
          </div>
        </div>

        {/* Wholesale vs Retail Bar */}
        <div className="bg-indigo-900 px-4 py-2">
          <div className="max-w-5xl mx-auto flex items-center justify-between text-xs gap-2">
            <span className="text-indigo-100 font-medium truncate">
              {isWholesale ? t.wholesaleActive : t.retailActive}
            </span>
            <button
              onClick={() => setIsWholesale(!isWholesale)}
              className={`px-3 py-1 rounded-full font-bold transition whitespace-nowrap shrink-0 ${
                isWholesale
                  ? 'bg-emerald-400 text-slate-950'
                  : 'bg-indigo-600 text-white border border-indigo-400'
              }`}
            >
              {isWholesale ? t.switchRetail : t.switchWholesale}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-4 print:p-0">
        {statusMsg && (
          <div className="mb-4 p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-950 text-xs sm:text-sm font-medium flex items-center justify-between shadow-sm print:hidden">
            <span>{statusMsg}</span>
            <button onClick={() => setStatusMsg('')} className="text-xs font-bold underline ml-2">OK</button>
          </div>
        )}

        {/* ==================== 1. STOREFRONT VIEW ==================== */}
        {viewMode === 'STORE' && (
          <>
            {/* Search Bar with Live Auto-Suggestions Dropdown */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm mb-4 space-y-2.5 relative">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-indigo-600 outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-40 overflow-hidden">
                      <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold uppercase text-slate-500">
                        Matching Products & Brands
                      </div>
                      {searchSuggestions.map((item) => (
                        <div
                          key={item._id}
                          onMouseDown={() => openProductModal(item)}
                          className="px-3 py-2.5 hover:bg-indigo-50 cursor-pointer flex items-center justify-between border-t border-slate-100 text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900">{item.name}</div>
                            <div className="text-[10px] text-slate-500">
                              {item.brand || 'A2Z'} • in {item.category}
                            </div>
                          </div>
                          <span className="font-extrabold text-indigo-700">₹{item.price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="NEWEST">Sort: Featured</option>
                  <option value="PRICE_LOW">Price: Low to High</option>
                  <option value="PRICE_HIGH">Price: High to Low</option>
                </select>
              </div>

              {/* Category Pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: 'ALL', label: '🔥 All Categories' },
                  { id: 'GENERAL', label: '🛒 Grocery & Kirana' },
                  { id: 'FOOD', label: '🍛 Hot Food (Zomato Mode)' },
                  { id: 'MEDICINE', label: '💊 Pharmacy & Rx' },
                  { id: 'ELECTRONICS', label: '⚡ Electronics & Gadgets' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                      activeTab === cat.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Promotional Hero Banners */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {PROMO_BANNERS.map((banner) => (
                <div
                  key={banner.id}
                  className={`rounded-2xl p-4 text-white bg-gradient-to-r ${banner.bg} shadow-md flex flex-col justify-between`}
                >
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20">
                      {banner.badge}
                    </span>
                    <h2 className="text-base sm:text-lg font-extrabold mt-1.5 leading-snug">
                      {banner.title}
                    </h2>
                    <p className="text-xs text-white/85 mt-1">{banner.sub}</p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold bg-black/25 px-2.5 py-1 rounded-lg">
                      Use Code: {banner.code}
                    </span>
                    <button
                      onClick={() => applyCoupon(banner.code)}
                      className="bg-amber-400 text-slate-950 font-extrabold px-3 py-1 rounded-lg shadow-sm"
                    >
                      Apply ₹50 Off
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Nearby Stores Discovery */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-indigo-600" /> {t.nearbyStores}
                </h3>
                {selectedStoreFilter && (
                  <button
                    onClick={() => setSelectedStoreFilter('')}
                    className="text-xs font-bold text-rose-600 underline"
                  >
                    {t.clearFilter}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {NEARBY_STORES.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => {
                      setSelectedStoreFilter(selectedStoreFilter === st.name ? '' : st.name);
                      setActiveTab(st.category);
                    }}
                    className={`cursor-pointer p-3 rounded-2xl border transition ${
                      selectedStoreFilter === st.name
                        ? 'bg-indigo-50 border-indigo-600 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-indigo-400'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                      <span>📍 {st.dist}</span>
                      <span className="text-amber-600 font-extrabold">★ {st.rating}</span>
                    </div>
                    <div className="font-extrabold text-slate-900 text-xs line-clamp-1">{st.name}</div>
                    <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">{st.tag}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Grid Header */}
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" /> {t.trendingTitle} ({processedProducts.length})
              </h3>
              <button
                onClick={handleQuickDemoProduct}
                className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-xl flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" /> + Add Rich Demo Product
              </button>
            </div>

            {loading && products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center my-4">
                <Server className="w-8 h-8 text-indigo-500 animate-bounce mx-auto mb-2" />
                <h3 className="font-bold text-slate-800 text-sm">Loading Live Catalogue from Render...</h3>
              </div>
            ) : processedProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center my-4">
                <Package className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
                <h3 className="font-bold text-slate-800">No Matching Products</h3>
                <button
                  onClick={handleQuickDemoProduct}
                  className="mt-3 bg-indigo-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" /> Add Rich Demo Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {processedProducts.map((product) => {
                  const displayPrice = isWholesale && product.wholesalePrice
                    ? product.wholesalePrice
                    : product.price;
                  const retailMrp = product.mrp || Math.round(product.price * 1.18);
                  const discountPct = Math.max(5, Math.round(((retailMrp - displayPrice) / retailMrp) * 100));
                  const isWishlisted = wishlist.some((w) => w._id === product._id);

                  return (
                    <div
                      key={product._id}
                      className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="h-44 w-full bg-slate-100 relative overflow-hidden group">
                          <div onClick={() => openProductModal(product)} className="w-full h-full cursor-pointer">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                                Tap for Product Specs & Slabs
                              </div>
                            )}
                          </div>
                          <span className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow">
                            {discountPct}% OFF
                          </span>
                          <button
                            onClick={() => toggleWishlist(product)}
                            className={`absolute top-2.5 right-2.5 p-1.5 rounded-full shadow ${
                              isWishlisted ? 'bg-rose-600 text-white' : 'bg-white/90 text-slate-700'
                            }`}
                          >
                            <Heart className="w-3.5 h-3.5" />
                          </button>
                          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            ★ {product.rating || 4.7} ({product.reviewsCount || 24})
                          </span>
                        </div>

                        <div className="p-3.5 pb-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                              {product.brand || product.category}
                            </span>
                            {product.requiresPrescription && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700 flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3" /> Rx Required
                              </span>
                            )}
                          </div>

                          <h3
                            onClick={() => openProductModal(product)}
                            className="font-extrabold text-slate-900 text-sm sm:text-base cursor-pointer hover:text-indigo-700 line-clamp-1"
                          >
                            {product.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                            🏪 {product.shopName || 'A2Z Verified Local Partner'}
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-base sm:text-lg font-extrabold text-indigo-700">
                            ₹{displayPrice}
                            <span className="text-xs text-slate-400 line-through ml-1.5 font-normal">
                              ₹{retailMrp}
                            </span>
                          </div>
                          <div className="text-[10px] font-semibold text-emerald-700">
                            {isWholesale
                              ? `B2B MOQ: ${product.minWholesaleQty || 5} units`
                              : `Wholesale from ₹${product.wholesalePrice || Math.round(product.price * 0.85)}`}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openProductModal(product)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-2.5 py-2 rounded-xl"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => addToCart(product)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm"
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Recently Viewed Products */}
            {recentlyViewed.length > 0 && (
              <div className="mt-7 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 mb-3 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" /> {t.recentlyViewedTitle}
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                  {recentlyViewed.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => openProductModal(item)}
                      className="min-w-[150px] max-w-[150px] border border-slate-200 rounded-xl p-2.5 cursor-pointer hover:border-indigo-500 bg-slate-50/60 shrink-0"
                    >
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-20 object-cover rounded-lg mb-1.5"
                        />
                      )}
                      <div className="text-xs font-bold text-slate-900 truncate">{item.name}</div>
                      <div className="text-xs font-extrabold text-indigo-700 mt-0.5">₹{item.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Saved For Later Box */}
            {savedForLater.length > 0 && (
              <div className="mt-5 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-extrabold text-slate-800 mb-2 flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4 text-amber-600" /> Saved For Later ({savedForLater.length})
                </h3>
                <div className="space-y-2">
                  {savedForLater.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl">
                      <span className="font-bold">{item.name} (₹{item.finalPrice})</span>
                      <button
                        onClick={() => moveBackToCart(idx)}
                        className="bg-indigo-600 text-white font-bold px-3 py-1 rounded-lg"
                      >
                        Move to Cart
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ==================== SMART CART & GPS GEOFENCED CHECKOUT ==================== */}
            {cart.length > 0 && (
              <div className="mt-6 bg-white rounded-2xl border-2 border-indigo-600 p-4 shadow-lg">
                <h3 className="font-extrabold text-slate-900 text-sm mb-3 flex items-center justify-between">
                  <span>🛒 Smart Cart ({cart.length} items)</span>
                  <span className="text-indigo-700 text-base">Payable: ₹{finalPayableTotal}</span>
                </h3>

                <div className="space-y-2 max-h-56 overflow-y-auto mb-3">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div>
                        <div className="font-bold text-slate-900">
                          {item.name} <span className="text-indigo-600">({item.selectedVariant})</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Unit Rate: ₹{item.finalPrice} × {item.qty} = <strong>₹{item.finalPrice * item.qty}</strong>
                        </div>
                        <button
                          onClick={() => moveToSavedForLater(idx)}
                          className="text-[10px] font-bold text-indigo-600 underline mt-0.5"
                        >
                          Save for Later
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateCartQty(idx, -1)}
                          className="w-6 h-6 rounded-lg bg-white border font-bold text-slate-700"
                        >
                          -
                        </button>
                        <span className="font-extrabold px-1">{item.qty}</span>
                        <button
                          onClick={() => updateCartQty(idx, 1)}
                          className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Bar */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Coupon Code (Try A2ZBULK or HOTFOOD50)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-xs uppercase font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => applyCoupon()}
                    className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl"
                  >
                    Apply
                  </button>
                </div>

                {needsRx && (
                  <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2">
                    <p className="font-bold">🩺 Doctor Prescription Required for Medicine *</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <label className="cursor-pointer bg-rose-600 text-white font-bold px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 shrink-0">
                        <Camera className="w-3.5 h-3.5" /> Upload Rx Photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e.target.files?.[0], 'PRESCRIPTION')}
                        />
                      </label>
                      <input
                        type="text"
                        placeholder="Or enter Doctor Rx ID..."
                        value={prescriptionUrl}
                        onChange={(e) => setPrescriptionUrl(e.target.value)}
                        className="w-full border border-rose-300 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* GPS Location Pinning & 20-30km Radius Validation */}
                <div className="mb-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      📍 Delivery Address & 20–30km Zone Check *
                    </label>
                    <button
                      type="button"
                      onClick={detectGpsRadius}
                      className="text-[11px] bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3" />
                      {gpsLoading ? 'Detecting GPS...' : 'Auto-Detect GPS (20–30km)'}
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter village/town, landmark, and pin code..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                  {gpsInfo && (
                    <div
                      className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg ${
                        gpsInfo.withinZone ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      📡 Distance from {HUB_COORDS.name}: <strong>{gpsInfo.distKm} km</strong> ({gpsInfo.coordsText})
                    </div>
                  )}
                </div>

                {/* Bill Breakdown */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 mb-3">
                  <div className="flex justify-between"><span>Items Subtotal (Incl. GST):</span><span>₹{cartSubtotal}</span></div>
                  <div className="flex justify-between"><span>Delivery Fee (Free above ₹999):</span><span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Coupon Discount:</span><span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-sm pt-1 border-t">
                    <span>Grand Total:</span><span>₹{finalPayableTotal}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('RAZORPAY')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      paymentMethod === 'RAZORPAY' ? 'bg-indigo-50 border-indigo-600 text-indigo-900' : 'bg-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-indigo-600" /> Razorpay (UPI/Card)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      paymentMethod === 'COD' ? 'bg-emerald-50 border-emerald-600 text-emerald-900' : 'bg-white'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-emerald-600" /> Cash on Delivery
                  </button>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-1.5 shadow"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm Order (₹{finalPayableTotal})
                </button>
              </div>
            )}
          </>
        )}

        {/* ==================== 2. WISHLIST VIEW ==================== */}
        {viewMode === 'WISHLIST' && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
            <h2 className="text-base font-extrabold flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-600" /> Saved Wishlist ({wishlist.length})
            </h2>
            {wishlist.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">
                Tap the heart icon on any product to save it to your wishlist.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {wishlist.map((item) => (
                  <div key={item._id} className="p-3 rounded-xl border flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-sm">{item.name}</div>
                      <div className="text-xs font-extrabold text-indigo-700">₹{item.price}</div>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                      >
                        + Cart
                      </button>
                      <button
                        onClick={() => toggleWishlist(item)}
                        className="bg-rose-50 text-rose-600 text-xs font-bold px-2.5 py-1.5 rounded-lg"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== 3. ORDERS, CANCELLATION, RETURNS & GST INVOICE VIEW ==================== */}
        {viewMode === 'ORDERS' && (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 border flex items-center justify-between">
              <h2 className="text-base font-extrabold flex items-center gap-1.5">
                <ClipboardList className="w-5 h-5 text-indigo-600" /> Order Management & Tracking ({orders.length})
              </h2>
              <button onClick={fetchOrders} className="bg-slate-100 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl border p-8 text-center text-sm text-slate-500">
                No orders placed yet.
              </div>
            ) : (
              orders.map((order) => (
                <div key={order._id} className="bg-white rounded-2xl p-4 border shadow-sm space-y-3">
                  <div className="flex justify-between border-b pb-2.5">
                    <div>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          order.status === 'CANCELLED' || order.status === 'RETURN_REQUESTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {order.status || 'PENDING'}
                      </span>
                      <h3 className="font-bold text-sm mt-1">
                        Customer: {order.customer?.name || 'Verified Buyer'}
                      </h3>
                      <p className="text-xs text-slate-500">{order.deliveryAddress}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-extrabold text-indigo-700">₹{order.totalAmount}</div>
                      <div className="text-[10px] text-slate-400">#{order._id?.slice(-6)}</div>
                    </div>
                  </div>

                  {/* Customer Self-Service Actions: Repeat Order, GST Invoice, Cancel, Return */}
                  <div className="flex flex-wrap gap-2 pt-1 border-b pb-3">
                    <button
                      onClick={() => setInvoiceOrder(order)}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" /> Download GST Invoice
                    </button>
                    <button
                      onClick={() => handleRepeatOrder(order)}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> 1-Click Repeat Order
                    </button>
                    {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order._id, 'CANCELLED')}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1"
                      >
                        <Ban className="w-3.5 h-3.5" /> Cancel Order
                      </button>
                    )}
                    {order.status === 'DELIVERED' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order._id, 'RETURN_REQUESTED')}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Request Return / Refund
                      </button>
                    )}
                  </div>

                  {/* Delivery Partner / Admin Status Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500 font-semibold">
                      Fleet Dispatch Status Controls:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((st) => (
                        <button
                          key={st}
                          onClick={() => handleUpdateOrderStatus(order._id, st)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                            order.status === st ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {st.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ==================== 4. PRINTABLE GST TAX INVOICE MODAL ==================== */}
        {invoiceOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <div className="text-xs font-extrabold uppercase text-indigo-700">TAX INVOICE (GST COMPLIANT)</div>
                  <h3 className="text-lg font-extrabold text-slate-900">A2Z Wholesale & Retail Super App</h3>
                  <p className="text-[11px] text-slate-500">
                    Karimpur Central Hub, Nadia, West Bengal • GSTIN: 19AABCA2Z001Z5
                  </p>
                </div>
                <button onClick={() => setInvoiceOrder(null)} className="p-1.5 bg-slate-100 rounded-full print:hidden">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl">
                <div>
                  <div className="text-slate-500">Billed To:</div>
                  <div className="font-bold">{invoiceOrder.customer?.name || currentUser?.name || 'Customer'}</div>
                  {currentUser?.gstNumber && (
                    <div className="text-[11px] font-semibold text-indigo-700">Buyer GSTIN: {currentUser.gstNumber}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-slate-500">Invoice No:</div>
                  <div className="font-mono font-bold">INV-{invoiceOrder._id?.slice(-6).toUpperCase()}</div>
                  <div className="text-[11px] text-slate-500">Status: {invoiceOrder.status}</div>
                </div>
              </div>

              <div className="border rounded-xl overflow-hidden text-xs">
                <div className="bg-slate-100 px-3 py-2 font-bold flex justify-between">
                  <span>Item Description × Qty</span>
                  <span>Amount</span>
                </div>
                <div className="divide-y p-3 space-y-1.5">
                  {(invoiceOrder.items || []).map((item, idx) => (
                    <div key={idx} className="flex justify-between pt-1">
                      <span>{item.product?.name || 'Catalogue Item'} × {item.quantity || 1}</span>
                      <span className="font-semibold">₹{(item.price || 100) * (item.quantity || 1)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CGST + SGST Breakdown */}
              <div className="bg-indigo-50/60 p-3 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Taxable Value:</span>
                  <span>₹{Math.round(invoiceOrder.totalAmount * 0.88)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CGST (6%):</span>
                  <span>₹{Math.round(invoiceOrder.totalAmount * 0.06)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST (6%):</span>
                  <span>₹{Math.round(invoiceOrder.totalAmount * 0.06)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm border-t border-indigo-200 pt-1">
                  <span>Total Invoice Value:</span>
                  <span>₹{invoiceOrder.totalAmount}</span>
                </div>
              </div>

              <div className="flex gap-2 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-indigo-600 text-white font-bold py-2.5 rounded-xl text-xs"
                >
                  🖨️ Print / Save PDF Invoice
                </button>
                <button
                  onClick={() => setInvoiceOrder(null)}
                  className="bg-slate-200 text-slate-800 font-bold px-4 py-2.5 rounded-xl text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 5. ADMIN ANALYTICS & PRODUCT DASHBOARD ==================== */}
        {viewMode === 'ADMIN' && (
          <div className="space-y-4">
            {/* Executive Analytics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border shadow-sm">
                <div className="text-[11px] font-bold text-slate-500">Total Revenue</div>
                <div className="text-lg font-extrabold text-indigo-700 mt-0.5">₹{totalRevenue}</div>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border shadow-sm">
                <div className="text-[11px] font-bold text-slate-500">Total Orders</div>
                <div className="text-lg font-extrabold text-slate-900 mt-0.5">{orders.length}</div>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border shadow-sm">
                <div className="text-[11px] font-bold text-slate-500">Live Products</div>
                <div className="text-lg font-extrabold text-emerald-700 mt-0.5">{products.length}</div>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border shadow-sm">
                <div className="text-[11px] font-bold text-slate-500">Low-Stock Alerts</div>
                <div className="text-lg font-extrabold text-rose-600 mt-0.5">{lowStockProducts.length}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-1.5">
                  <BarChart3 className="w-5 h-5 text-indigo-600" /> Seller & Catalogue Management
                </h2>
                <button
                  type="button"
                  onClick={handleQuickDemoProduct}
                  className="text-xs bg-purple-100 text-purple-800 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> + 1-Tap Rich Sample
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input type="text" required placeholder="Product Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" />
                  <input type="text" placeholder="Brand Name (e.g., ITC, Tata, GSK)" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm bg-white">
                    <option value="GENERAL">GENERAL (Grocery)</option>
                    <option value="FOOD">FOOD (Restaurant)</option>
                    <option value="MEDICINE">MEDICINE (Pharmacy)</option>
                    <option value="ELECTRONICS">ELECTRONICS</option>
                  </select>
                  <input type="text" placeholder="Variants (comma separated: 500g, 1kg, 5kg)" value={formData.variantsText} onChange={(e) => setFormData({ ...formData, variantsText: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input type="number" required placeholder="Retail Price (₹) *" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" />
                  <input type="number" placeholder="Wholesale Price (₹)" value={formData.wholesalePrice} onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" />
                </div>

                <textarea placeholder="Product Description & Highlights..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-xs h-16" />

                <div className="p-3 rounded-xl bg-indigo-50 border flex flex-col sm:flex-row gap-2">
                  <label className="cursor-pointer bg-indigo-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shrink-0">
                    <Camera className="w-4 h-4" /> Take / Upload Photo
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e.target.files?.[0], 'PRODUCT')} />
                  </label>
                  <input type="text" placeholder="Or paste image URL..." value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-xs bg-white" />
                </div>

                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl">
                  Save Product to Database
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ==================== 6. PRODUCT DETAIL DRAWER ==================== */}
        {selectedProduct && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto p-5 shadow-2xl space-y-4">
              <div className="flex items-start justify-between border-b pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                    {selectedProduct.brand || selectedProduct.category}
                  </span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Sold by: <strong>{selectedProduct.shopName || 'A2Z Central Hub'}</strong> • ★ {selectedProduct.rating || 4.7}
                  </p>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="p-2 rounded-full bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedProduct.imageUrl && (
                <div onClick={() => setZoomImg(!zoomImg)} className="w-full bg-slate-100 rounded-2xl overflow-hidden cursor-zoom-in relative">
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className={`w-full object-cover transition-transform duration-300 ${zoomImg ? 'scale-150 h-80' : 'h-56'}`}
                  />
                  <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
                    {zoomImg ? 'Tap to Reset Zoom' : '🔍 Tap Image to Zoom'}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Select Pack / Variant:</label>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(selectedProduct.variants) && selectedProduct.variants.length > 0
                    ? selectedProduct.variants
                    : ['Standard Pack', 'Family / Bulk Pack']
                  ).map((v) => (
                    <button
                      key={v}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                        selectedVariant === v ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wholesale Price Slabs */}
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-3.5">
                <div className="text-xs font-extrabold text-indigo-950 mb-2">
                  📦 Tiered Wholesale & Bulk Price Slabs:
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className={`p-2 rounded-xl border ${detailQty < 5 ? 'bg-white border-indigo-600 font-bold' : 'bg-white/60'}`}>
                    <div className="text-[10px] text-slate-500">1–4 Units</div>
                    <div className="text-indigo-800 font-extrabold">₹{selectedProduct.price}</div>
                  </div>
                  <div className={`p-2 rounded-xl border ${detailQty >= 5 && detailQty < 20 ? 'bg-white border-indigo-600 font-bold' : 'bg-white/60'}`}>
                    <div className="text-[10px] text-slate-500">5–19 Units</div>
                    <div className="text-emerald-700 font-extrabold">
                      ₹{selectedProduct.wholesalePrice || Math.round(selectedProduct.price * 0.85)}
                    </div>
                  </div>
                  <div className={`p-2 rounded-xl border ${detailQty >= 20 && detailQty < 50 ? 'bg-white border-indigo-600 font-bold' : 'bg-white/60'}`}>
                    <div className="text-[10px] text-slate-500">20–49 Units</div>
                    <div className="text-emerald-700 font-extrabold">
                      ₹{Math.round((selectedProduct.wholesalePrice || selectedProduct.price * 0.85) * 0.94)}
                    </div>
                  </div>
                  <div className={`p-2 rounded-xl border ${detailQty >= 50 ? 'bg-white border-indigo-600 font-bold' : 'bg-white/60'}`}>
                    <div className="text-[10px] text-slate-500">50+ Bulk</div>
                    <div className="text-emerald-700 font-extrabold">
                      ₹{Math.round((selectedProduct.wholesalePrice || selectedProduct.price * 0.85) * 0.88)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-100 p-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Quantity:</span>
                  <button onClick={() => setDetailQty(Math.max(1, detailQty - 1))} className="w-8 h-8 rounded-xl bg-white font-extrabold border">-</button>
                  <input
                    type="number"
                    value={detailQty}
                    onChange={(e) => setDetailQty(Math.max(1, Number(e.target.value)))}
                    className="w-14 text-center font-extrabold text-sm bg-white border rounded-xl py-1"
                  />
                  <button onClick={() => setDetailQty(detailQty + 1)} className="w-8 h-8 rounded-xl bg-white font-extrabold border">+</button>
                </div>
                <button
                  onClick={() => addToCart(selectedProduct, detailQty, selectedVariant)}
                  className="bg-indigo-600 text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow"
                >
                  Add for ₹{calculateUnitPrice(selectedProduct, detailQty) * detailQty}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 7. ACCOUNT VIEW ==================== */}
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
                  </div>
                  <button
                    onClick={() => { localStorage.removeItem('a2z_user'); setCurrentUser(null); }}
                    className="bg-rose-100 text-rose-700 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setViewMode('STORE')} className="bg-indigo-600 text-white font-bold text-xs py-3 rounded-xl">
                    Go to Storefront
                  </button>
                  <button onClick={() => { fetchOrders(); setViewMode('ORDERS'); }} className="bg-slate-800 text-white font-bold text-xs py-3 rounded-xl">
                    View Live Orders
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <p className="text-xs font-extrabold text-slate-700 mb-2 flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-indigo-600" /> 1-Tap Instant Demo Login:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button onClick={() => handleQuickDemoAuth('CUSTOMER')} className="bg-white border p-2.5 rounded-xl text-xs text-left font-bold">
                      🛍️ Retail Customer
                    </button>
                    <button onClick={() => handleQuickDemoAuth('WHOLESALE_BUYER')} className="bg-white border p-2.5 rounded-xl text-xs text-left font-bold text-emerald-800">
                      📦 Wholesale Buyer (B2B)
                    </button>
                    <button onClick={() => handleQuickDemoAuth('DELIVERY_PARTNER')} className="bg-white border p-2.5 rounded-xl text-xs text-left font-bold text-amber-800">
                      🛵 Delivery Rider
                    </button>
                  </div>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-3">
                  <input type="email" required placeholder="Email Address" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" />
                  <input type="password" required placeholder="Password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" />
                  <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl text-sm">
                    Login / Continue
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
