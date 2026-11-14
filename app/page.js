'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, PlusCircle, Truck, ShieldAlert, 
  Package, CheckCircle2, RefreshCw, Sparkles, Trash2 
} from 'lucide-react';

const API_URL = 'https://a2z-backend-tgls.onrender.com/api';

export default function SuperAppHome() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [viewMode, setViewMode] = useState('STORE'); // 'STORE' or 'ADMIN'
  const [isWholesale, setIsWholesale] = useState(false);
  const [cart, setCart] = useState([]);
  const [prescriptionUrl, setPrescriptionUrl] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  // Admin Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'GENERAL',
    price: '',
    wholesalePrice: '',
    minWholesaleQty: '10',
    stock: '100',
    requiresPrescription: false
  });

  // Fetch products from your live Render backend
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      console.error('Error connecting to backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Add Product from Admin Panel
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
        requiresPrescription: formData.requiresPrescription
      };

      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add product');

      setStatusMsg('✅ Product added successfully!');
      setFormData({
        name: '',
        category: 'GENERAL',
        price: '',
        wholesalePrice: '',
        minWholesaleQty: '10',
        stock: '100',
        requiresPrescription: false
      });
      fetchProducts();
      setTimeout(() => {
        setStatusMsg('');
        setViewMode('STORE');
      }, 1200);
    } catch (err) {
      setStatusMsg(`❌ Error: ${err.message}`);
    }
  };

  // 1-Tap Quick Demo Product Generator for Mobile Testing
  const handleQuickDemoProduct = async () => {
    setStatusMsg('Adding demo product...');
    const samples = [
      { name: 'Aashirvaad Atta (10kg Pack)', category: 'GENERAL', price: 460, wholesalePrice: 410, minWholesaleQty: 5, stock: 80, requiresPrescription: false },
      { name: 'Chicken Biryani Family Pack', category: 'FOOD', price: 320, wholesalePrice: 280, minWholesaleQty: 5, stock: 30, requiresPrescription: false },
      { name: 'Augmentin 625 Duo Strip', category: 'MEDICINE', price: 200, wholesalePrice: 165, minWholesaleQty: 10, stock: 120, requiresPrescription: true },
      { name: 'Fast Type-C 65W Charger', category: 'ELECTRONICS', price: 799, wholesalePrice: 550, minWholesaleQty: 10, stock: 45, requiresPrescription: false }
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
      setStatusMsg('❌ Failed to add demo item');
    }
  };

  const addToCart = (product) => {
    const qtyToAdd = isWholesale ? (product.minWholesaleQty || 5) : 1;
    const unitPrice = isWholesale && product.wholesalePrice ? product.wholesalePrice : product.price;

    setCart((prev) => [
      ...prev,
      { ...product, qty: qtyToAdd, finalPrice: unitPrice }
    ]);
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
    <div className="min-h-screen pb-28">
      {/* Top Navbar */}
      <header className="bg-indigo-700 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-amber-300" />
              <h1 className="text-xl font-extrabold tracking-tight">A2Z Super App</h1>
            </div>
            <p className="text-xs text-indigo-200 flex items-center gap-1 mt-0.5">
              <Truck className="w-3.5 h-3.5" /> 20–30km Hyper-Local Wholesale & Retail
            </p>
          </div>

          <button
            onClick={() => setViewMode(viewMode === 'STORE' ? 'ADMIN' : 'STORE')}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 shadow"
          >
            <PlusCircle className="w-4 h-4" />
            {viewMode === 'STORE' ? 'Admin Panel' : 'Back to Store'}
          </button>
        </div>

        {/* Retail vs Wholesale Switcher */}
        {viewMode === 'STORE' && (
          <div className="bg-indigo-800 px-4 py-2">
            <div className="max-w-4xl mx-auto flex items-center justify-between text-xs">
              <span className="text-indigo-100 font-medium">
                {isWholesale ? '📦 Wholesale B2B Pricing Active' : '🛍️ Standard Retail Mode'}
              </span>
              <button
                onClick={() => setIsWholesale(!isWholesale)}
                className={`px-3 py-1 rounded-full font-bold transition ${
                  isWholesale 
                    ? 'bg-emerald-400 text-slate-950' 
                    : 'bg-indigo-600 text-white border border-indigo-400'
                }`}
              >
                {isWholesale ? 'Switch to Retail' : 'Switch to Wholesale (B2B)'}
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-4">
        {statusMsg && (
          <div className="mb-4 p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-sm font-medium flex items-center justify-between">
            <span>{statusMsg}</span>
            <button onClick={() => setStatusMsg('')} className="text-xs underline">Dismiss</button>
          </div>
        )}

        {/* ADMIN VIEW: Add Products */}
        {viewMode === 'ADMIN' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Add New Product</h2>
              <button
                type="button"
                onClick={handleQuickDemoProduct}
                className="text-xs bg-purple-100 text-purple-800 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" /> 1-Tap Demo Item
              </button>
            </div>

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
        ) : (
          /* STOREFRONT VIEW */
          <>
            {/* Category Pills */}
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
                <h3 className="font-bold text-slate-800">No Products Yet</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Your database is connected! Add your first product to see it live.
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={handleQuickDemoProduct}
                    className="bg-indigo-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" /> Add 1-Tap Sample Product
                  </button>
                  <button
                    onClick={() => setViewMode('ADMIN')}
                    className="bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl"
                  >
                    Open Admin Form
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {filteredProducts.map((product) => {
                  const displayPrice = isWholesale && product.wholesalePrice 
                    ? product.wholesalePrice 
                    : product.price;

                  return (
                    <div
                      key={product._id}
                      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between"
                    >
                      <div>
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

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
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
                              : 'Fast 20–30km Delivery'}
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

            {/* Smart Cart Box */}
            {cart.length > 0 && (
              <div className="mt-6 bg-white rounded-2xl border-2 border-indigo-600 p-4 shadow-lg">
                <h3 className="font-extrabold text-slate-900 text-sm mb-2 flex items-center justify-between">
                  <span>Smart Cart ({cart.length} items)</span>
                  <span className="text-indigo-700">Total: ₹{cartTotal}</span>
                </h3>

                {/* Split Dispatch Notice */}
                {hasFood && hasNonFood && (
                  <div className="mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                    ⚡ <strong>Split Fleet Dispatch:</strong> Food items will arrive in 35 mins via Immediate Rider. Wholesale/General items will arrive via 20–30km Utility Fleet.
                  </div>
                )}

                {/* Prescription Check */}
                {needsRx && (
                  <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                    <p className="font-bold mb-1">🩺 Doctor Prescription Required for Medicine:</p>
                    <input
                      type="text"
                      placeholder="Paste prescription photo link or Rx ID..."
                      value={prescriptionUrl}
                      onChange={(e) => setPrescriptionUrl(e.target.value)}
                      className="w-full border border-rose-300 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                    />
                  </div>
                )}

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
                  onClick={() => {
                    if (needsRx && !prescriptionUrl) {
                      alert('Please enter a Prescription link/ID for restricted medicine!');
                      return;
                    }
                    setStatusMsg('🎉 Order verified! Ready for Customer Login & Razorpay Checkout.');
                    setCart([]);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Proceed to Checkout (₹{cartTotal})
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
