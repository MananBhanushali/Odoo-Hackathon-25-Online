
import React, { useState } from 'react';
import { Search, Plus, MapPin, Box, X, PackagePlus, Pencil, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { Product, Operation } from '../types';
import Card from '../components/ui/Card';
import { ShimmerButton } from '../components/ui/ShimmerButton';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { useData } from '../context/DataContext';

const Products: React.FC = () => {
    const { products, addProduct, updateProduct, deleteProduct, addOperation, validateOperation, warehouses, locations } = useData();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const { showToast } = useToast();
  const [activeCategory, setActiveCategory] = useState('All');
    const [filterWarehouseId, setFilterWarehouseId] = useState<string>('');
    const [filterLocationId, setFilterLocationId] = useState<string>('');
  
  // Product Form State (Unified for Add & Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Product>>({
    category: 'Raw Material',
    status: 'In Stock',
    minThreshold: 10,
    quantity: 0,
    price: 0,
    locationId: null
  });
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');

  // Quick Restock State
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState(1);

    const filteredProducts = products.filter(p => {
        const matchesCategory = (activeCategory === 'All' || p.category === activeCategory);
        const matchesSearch = (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));
        // Warehouse filtering: find location of product and check its warehouseId
        let matchesWarehouse = true;
        if (filterWarehouseId) {
            if (p.locationId) {
                const loc = locations.find(l => l.id === p.locationId);
                matchesWarehouse = loc ? loc.warehouseId === filterWarehouseId : false;
            } else {
                matchesWarehouse = false;
            }
        }
        let matchesLocation = true;
        if (filterLocationId) {
            matchesLocation = p.locationId === filterLocationId;
        }
        return matchesCategory && matchesSearch && matchesWarehouse && matchesLocation;
    });

  const categories = ['All', 'Raw Material', 'Furniture', 'Electronics', 'Chemicals', 'Tools', 'Packaging'];

  // -- Handlers --

    const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
        category: 'Raw Material',
        status: 'In Stock',
        minThreshold: 10,
        quantity: 0,
        price: 0,
        locationId: null
    });
        setSelectedWarehouseId('');
    setIsFormOpen(true);
  };

    const handleOpenEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({ ...product });
        // Derive warehouse from existing location
        if (product.locationId) {
            const loc = locations.find(l => l.id === product.locationId);
            if (loc) setSelectedWarehouseId(loc.warehouseId);
        } else {
            setSelectedWarehouseId('');
        }
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if(window.confirm('Are you sure you want to delete this product?')) {
        await deleteProduct(id);
        showToast('Product deleted', 'info');
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) {
        showToast('Name and SKU are required', 'error');
        return;
    }
    
    const productData: Partial<Product> = {
        name: formData.name,
        sku: formData.sku,
        category: formData.category || 'Uncategorized',
        quantity: Number(formData.quantity) || 0,
        minThreshold: Number(formData.minThreshold) || 0,
        price: Number(formData.price) || 0,
        locationId: formData.locationId || null,
    };

    try {
        if (editingId) {
            await updateProduct(editingId, productData);
            showToast('Product updated successfully', 'success');
        } else {
            await addProduct(productData);
            showToast('New product created', 'success');
        }
        setIsFormOpen(false);
    } catch (error) {
        // Toast handled in context
    }
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProduct) return;

    const newOp: Operation = {
        id: Date.now().toString(),
        reference: `WH/IN/Q${Math.floor(Math.random() * 10000)}`,
        type: 'Receipt',
        source: 'Direct/Vendor',
        destination: 'WH/Stock',
        contact: 'Quick Restock',
        status: 'Draft',
        scheduleDate: new Date().toISOString().split('T')[0],
        items: [{
            productId: restockProduct.id,
            quantity: restockQty,
            done: restockQty
        }]
    };

    addOperation(newOp);
    validateOperation(newOp);
    
    showToast(`Stock updated: +${restockQty} for ${restockProduct.name}`, 'success');
    setRestockProduct(null);
    setRestockQty(1);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Inventory</h2>
          <p className="text-slate-500 dark:text-gray-400 mt-1">Manage your products, prices, and stock levels.</p>
        </div>
          <div className="flex flex-wrap gap-3">
                 <ShimmerButton 
                onClick={handleOpenAdd}
                className="shadow-lg shadow-blue-500/20"
                background="linear-gradient(to right, #2563EB, #06B6D4)"
                shimmerColor="#ffffff"
                shimmerSize="0.1em"
                borderRadius="0.75rem"
             >
                <div className="flex items-center gap-2 text-white">
                   <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                   <span className="font-medium">Add Product</span>
                </div>
             </ShimmerButton>
        </div>
      </div>

      {/* Controls Section */}
      <div className="sticky top-20 z-20 space-y-4 bg-slate-50/80 dark:bg-[#020617]/80 backdrop-blur-xl py-4 -mx-4 px-4 md:mx-0 md:px-0 md:bg-transparent md:backdrop-blur-none transition-colors">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-96 relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                <div className="relative bg-white dark:bg-[#0F172A] rounded-xl flex items-center border border-slate-200 dark:border-white/10 focus-within:border-blue-500 dark:focus-within:border-blue-500 transition-colors shadow-sm">
                    <Search className="ml-4 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search by name, SKU, or tag..." 
                        className="w-full bg-transparent py-3.5 pl-3 pr-4 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 focus:outline-none font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                 <div className="bg-white dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10 flex items-center">
                    <button 
                        onClick={() => setView('grid')}
                        className={`p-2.5 rounded-lg transition-all ${view === 'grid' ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
                            <div className="bg-current rounded-[2px]"></div><div className="bg-current rounded-[2px]"></div>
                            <div className="bg-current rounded-[2px]"></div><div className="bg-current rounded-[2px]"></div>
                        </div>
                    </button>
                    <button 
                        onClick={() => setView('list')}
                        className={`p-2.5 rounded-lg transition-all ${view === 'list' ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        <div className="flex flex-col gap-0.5 w-5 h-5 justify-center">
                            <div className="bg-current h-0.5 w-full rounded-full"></div>
                            <div className="bg-current h-0.5 w-full rounded-full"></div>
                            <div className="bg-current h-0.5 w-full rounded-full"></div>
                        </div>
                    </button>
                 </div>
            </div>
          </div>

          {/* Horizontal Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                        activeCategory === cat 
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg' 
                        : 'bg-white dark:bg-white/5 text-slate-600 dark:text-gray-400 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10'
                    }`}
                  >
                      {cat}
                  </button>
              ))}
          </div>
      </div>

            {/* Warehouse / Location Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1">Warehouse Filter</label>
                    <select
                        value={filterWarehouseId}
                        onChange={e => {
                            setFilterWarehouseId(e.target.value);
                            setFilterLocationId(''); // reset dependent location
                        }}
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    >
                        <option value="">All Warehouses</option>
                        {warehouses.map(w => (
                            <option key={w.id} value={w.id}>{w.name} ({w.shortCode})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1">Location Filter</label>
                    <select
                        value={filterLocationId}
                        onChange={e => setFilterLocationId(e.target.value)}
                        disabled={!filterWarehouseId}
                        className="w-full bg-white dark:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    >
                        <option value="">{filterWarehouseId ? 'All Locations' : 'Select warehouse first'}</option>
                        {locations.filter(l => !filterWarehouseId || l.warehouseId === filterWarehouseId).map(l => (
                            <option key={l.id} value={l.id}>{l.name} ({l.shortCode})</option>
                        ))}
                    </select>
                    {filterWarehouseId && locations.filter(l => l.warehouseId === filterWarehouseId).length === 0 && (
                        <p className="text-[10px] text-red-500 mt-1">No locations for selected warehouse.</p>
                    )}
                </div>
                <div className="flex items-end">
                    <button
                        onClick={() => { setFilterWarehouseId(''); setFilterLocationId(''); }}
                        className="w-full px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white rounded-xl text-sm font-medium border border-slate-200 dark:border-white/10 transition-colors"
                    >
                        Reset Filters
                    </button>
                </div>
            </div>

      {/* Content Grid/List */}
      <div className={`grid ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6`}>
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product, idx) => {
            const stockPercentage = Math.min(100, (product.quantity / (product.minThreshold * 3 || 100)) * 100);
            const isLowStock = product.quantity <= product.minThreshold;
            const isOutStock = product.quantity === 0;
            
            return (
            <motion.div
              layout
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: idx * 0.03 }}
            >
              {view === 'grid' ? (
                <Card className="h-full flex flex-col !bg-white dark:!bg-[#0F172A]/60 hover:shadow-xl dark:hover:!bg-[#0F172A]/90 group" noPadding>
                   <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-500/30 transition-colors pointer-events-none z-10"></div>
                   
                   <div className="p-6 flex flex-col h-full relative z-0">
                        {/* Top: Icon & Status */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-gray-400 shadow-inner relative overflow-hidden group-hover:scale-105 transition-transform">
                                <Box size={20} strokeWidth={1.5} />
                                {isLowStock && <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>}
                            </div>
                            <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${
                                isOutStock ? 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-white/5 dark:border-white/10 dark:text-gray-500' :
                                isLowStock ? 'bg-red-100 border-red-200 text-red-600 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400' : 
                                'bg-emerald-100 border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
                            }`}>
                                {isOutStock ? <AlertCircle size={10} /> : isLowStock ? <AlertCircle size={10} /> : <CheckCircle size={10} />}
                                {isOutStock ? 'Out' : isLowStock ? 'Low' : 'In Stock'}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="mb-6 flex-1">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{product.name}</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 dark:text-gray-500 font-mono bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/5">{product.sku}</span>
                                <span className="text-xs text-slate-400 dark:text-gray-600">•</span>
                                <span className="text-xs text-slate-500 dark:text-gray-400">{product.category}</span>
                            </div>
                        </div>
                        
                        {/* Stock Bar */}
                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-xs mb-1 font-medium">
                                <span className="text-slate-500 dark:text-gray-400">Stock Level</span>
                                <span className={`${isLowStock ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>{product.quantity} <span className="text-slate-400 font-normal">/ {product.minThreshold} min</span></span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stockPercentage}%` }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                    className={`h-full rounded-full ${isLowStock ? 'bg-red-500' : 'bg-blue-500'}`} 
                                />
                            </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <span className="text-lg font-bold text-slate-900 dark:text-white">${product.price.toFixed(2)}</span>
                            
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleOpenEdit(product); }}
                                    className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/20 dark:hover:text-blue-400 transition-colors"
                                    title="Edit Product"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setRestockProduct(product); setRestockQty(1); }}
                                    className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-400 transition-colors"
                                    title="Quick Restock"
                                >
                                    <PackagePlus size={16} />
                                </button>
                            </div>
                        </div>
                   </div>
                </Card>
              ) : (
                 // List View
                <div className="group relative bg-white dark:bg-[#0F172A]/60 hover:bg-slate-50 dark:hover:bg-[#0F172A]/80 border border-slate-200 dark:border-white/5 rounded-xl p-4 flex items-center justify-between transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-500/30 shadow-sm dark:shadow-none">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="flex items-center gap-6 flex-[3]">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400">
                             <Box size={18} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{product.name}</h3>
                            <div className="flex gap-2 mt-0.5">
                                <span className="text-xs text-slate-500 dark:text-gray-500 font-mono">{product.sku}</span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-8 flex-[4]">
                         <div className="text-sm text-slate-600 dark:text-gray-400 w-32">{product.category}</div>
                         <div className="text-sm text-slate-600 dark:text-gray-400 flex items-center gap-1 w-32">
                             <MapPin size={12} /> {product.location?.name || 'N/A'}
                         </div>
                    </div>

                    <div className="flex items-center gap-8 flex-[4] justify-end">
                        <div className="flex flex-col gap-1 w-24">
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                                <div className={`h-full ${isLowStock ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${stockPercentage}%` }}></div>
                            </div>
                            <div className="text-[10px] text-right text-slate-500">{product.quantity} units</div>
                        </div>
                        
                        <div className="text-right w-20">
                             <span className="text-sm font-bold text-slate-900 dark:text-white">${product.price.toFixed(2)}</span>
                        </div>

                        <div className="flex items-center gap-1">
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleOpenEdit(product); }}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                <Pencil size={16} />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setRestockProduct(product); setRestockQty(1); }}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                            >
                                <PackagePlus size={16} />
                            </button>
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>
              )}
            </motion.div>
          )})}
        </AnimatePresence>
      </div>

      {/* Unified Add/Edit Product Modal */}
      <AnimatePresence>
        {isFormOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsFormOpen(false)}
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white dark:bg-[#0F172A] w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/5">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{editingId ? 'Edit Product' : 'New Product'}</h3>
                            <p className="text-sm text-slate-500 dark:text-gray-400">{editingId ? 'Update product details and inventory settings.' : 'Add a new item to your inventory.'}</p>
                        </div>
                        <button onClick={() => setIsFormOpen(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white"><X size={20} /></button>
                    </div>
                    
                    <div className="overflow-y-auto p-6 custom-scrollbar">
                        <form id="productForm" onSubmit={handleFormSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Basic Info */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1">Product Name</label>
                                    <input autoFocus required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="e.g. Titanium Alloy Screws" />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1">SKU</label>
                                    <input required value={formData.sku || ''} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono" placeholder="e.g. TAS-200" />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1">Category</label>
                                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none">
                                        {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                {/* Pricing & Location */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1">Price ($)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                        <input type="number" step="0.01" required value={formData.price || ''} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 pl-8 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="0.00" />
                                    </div>
                                </div>

                                                                {/* Warehouse Selection */}
                                                                <div>
                                                                        <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1">Warehouse</label>
                                                                        <select
                                                                            value={selectedWarehouseId}
                                                                            onChange={e => {
                                                                                const wid = e.target.value;
                                                                                setSelectedWarehouseId(wid);
                                                                                // Reset location when warehouse changes
                                                                                setFormData({ ...formData, locationId: null });
                                                                            }}
                                                                            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                                                                        >
                                                                            <option value="">Select warehouse...</option>
                                                                            {warehouses.map(w => (
                                                                                <option key={w.id} value={w.id}>{w.name} ({w.shortCode})</option>
                                                                            ))}
                                                                        </select>
                                                                        <p className="text-[10px] text-slate-400 mt-1">Choose the warehouse to narrow available locations.</p>
                                                                </div>
                                                                {/* Location Selection */}
                                                                <div>
                                                                        <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1">Location</label>
                                                                        <select
                                                                            value={formData.locationId || ''}
                                                                            onChange={e => setFormData({ ...formData, locationId: e.target.value || null })}
                                                                            disabled={!selectedWarehouseId}
                                                                            className="w-full bg-slate-100 dark:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                                                                        >
                                                                            <option value="">{selectedWarehouseId ? 'Select location...' : 'Select warehouse first'}</option>
                                                                            {locations.filter(l => l.warehouseId === selectedWarehouseId).map(l => (
                                                                                <option key={l.id} value={l.id}>{l.name} ({l.shortCode})</option>
                                                                            ))}
                                                                        </select>
                                                                        <p className="text-[10px] text-slate-400 mt-1">Filtered by selected warehouse. Manage locations in Settings.</p>
                                                                        {selectedWarehouseId && locations.filter(l => l.warehouseId === selectedWarehouseId).length === 0 && (
                                                                            <p className="text-[10px] text-red-500 mt-1">No locations found for this warehouse.</p>
                                                                        )}
                                                                </div>

                                {/* Inventory Settings */}
                                <div className="md:col-span-2 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 space-y-4">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Box size={16} className="text-blue-500" /> Inventory Control
                                    </h4>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1">Current Stock</label>
                                            <input type="number" value={formData.quantity || ''} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="0" />
                                            <p className="text-[10px] text-slate-400 mt-1">Initial quantity on hand.</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1">Min. Threshold</label>
                                            <input type="number" value={formData.minThreshold || ''} onChange={e => setFormData({...formData, minThreshold: parseInt(e.target.value)})} className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="10" />
                                            <p className="text-[10px] text-slate-400 mt-1">Alert triggered below this value.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 text-slate-600 dark:text-gray-300 font-medium hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-colors">Cancel</button>
                        <button form="productForm" type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                            {editingId ? 'Update Product' : 'Create Product'}
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Quick Restock Modal */}
      <AnimatePresence>
        {restockProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => setRestockProduct(null)}
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white dark:bg-[#0F172A] w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/5">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Quick Restock</h3>
                            <p className="text-sm text-slate-500 dark:text-gray-400">Add inventory to <span className="text-blue-500 font-medium">{restockProduct.name}</span></p>
                        </div>
                        <button onClick={() => setRestockProduct(null)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white"><X size={20} /></button>
                    </div>
                    
                    <form onSubmit={handleRestockSubmit} className="p-6 space-y-6">
                        <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider font-bold">Current Stock</span>
                                <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{restockProduct.quantity}</span>
                            </div>
                            <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10"></div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider font-bold">Min Limit</span>
                                <span className="text-lg font-medium text-slate-600 dark:text-gray-400 font-mono">{restockProduct.minThreshold}</span>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">Quantity to Add</label>
                            <div className="relative flex items-center">
                                 <button 
                                    type="button"
                                    onClick={() => setRestockQty(Math.max(1, restockQty - 1))}
                                    className="absolute left-2 p-2 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20"
                                 >
                                     <div className="w-4 h-0.5 bg-current"></div>
                                 </button>
                                 <input 
                                    type="number" 
                                    min="1" 
                                    autoFocus
                                    required 
                                    value={restockQty} 
                                    onChange={e => setRestockQty(Math.max(1, parseInt(e.target.value) || 0))} 
                                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-4 text-center text-slate-900 dark:text-white outline-none focus:border-blue-500 font-mono text-2xl font-bold" 
                                 />
                                 <button 
                                    type="button"
                                    onClick={() => setRestockQty(restockQty + 1)}
                                    className="absolute right-2 p-2 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20"
                                 >
                                     <Plus size={16} />
                                 </button>
                            </div>
                        </div>
                        
                        <div className="pt-2 flex gap-3">
                            <button type="button" onClick={() => setRestockProduct(null)} className="flex-1 px-4 py-3 text-slate-600 dark:text-gray-300 font-medium hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">Cancel</button>
                            <button type="submit" className="flex-[2] px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95">
                                <PackagePlus size={20} />
                                Confirm Restock
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
