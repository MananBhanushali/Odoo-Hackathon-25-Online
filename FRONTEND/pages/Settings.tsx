
import React, { useState, useEffect } from 'react';
import { Warehouse, MapPin, Save, Loader2, Plus, Trash2, X } from 'lucide-react';
import Card from '../components/ui/Card';
import { useToast } from '../context/ToastContext';
import { ShimmerButton } from '../components/ui/ShimmerButton';
import { useData } from '../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Warehouse as WarehouseType, Location as LocationType } from '../types';

const Settings: React.FC = () => {
  const { warehouses, locations, addWarehouse, updateWarehouse, deleteWarehouse, addLocation, deleteLocation } = useData();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'warehouse' | 'locations'>('warehouse');
  const [isSaving, setIsSaving] = useState(false);
  const [localWarehouses, setLocalWarehouses] = useState(warehouses);

  // Sync local state with context
  useEffect(() => {
    setLocalWarehouses(warehouses);
  }, [warehouses]);

  // Modal States
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  
  const [newWarehouse, setNewWarehouse] = useState<Partial<WarehouseType>>({ name: '', shortCode: '', address: '' });
  const [newLocation, setNewLocation] = useState<Partial<LocationType>>({ name: '', shortCode: '', warehouseId: '' });

  const handleSaveWarehouse = async (wh: WarehouseType) => {
    setIsSaving(true);
    try {
        await updateWarehouse(wh.id, wh);
        showToast('Warehouse updated successfully', 'success');
    } catch (error) {
        // Error handled in context
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteWarehouse = async (id: string) => {
      if(window.confirm('Are you sure? This will delete all associated locations and products.')) {
          await deleteWarehouse(id);
      }
  };

  const handleCreateWarehouse = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!newWarehouse.name || !newWarehouse.shortCode) return;
      
      try {
          await addWarehouse(newWarehouse);
          setIsWarehouseModalOpen(false);
          setNewWarehouse({ name: '', shortCode: '', address: '' });
      } catch (error) {}
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!newLocation.name || !newLocation.shortCode || !newLocation.warehouseId) {
          showToast('Please fill all fields', 'error');
          return;
      }
      
      try {
          await addLocation(newLocation);
          setIsLocationModalOpen(false);
          setNewLocation({ name: '', shortCode: '', warehouseId: '' });
      } catch (error) {}
  };

  const handleDeleteLocation = async (id: string) => {
      if(window.confirm('Delete this location?')) {
          await deleteLocation(id);
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-end">
         <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h2>
            <p className="text-slate-500 dark:text-gray-400">Configure your warehouse and stock locations.</p>
         </div>
      </div>

      <div className="flex border-b border-slate-200 dark:border-white/10">
        <button 
            onClick={() => setActiveTab('warehouse')}
            className={`px-6 py-3 font-medium text-sm transition-all border-b-2 ${activeTab === 'warehouse' ? 'border-blue-500 text-blue-600 dark:text-white' : 'border-transparent text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-gray-300'}`}
        >
            Warehouses
        </button>
        <button 
            onClick={() => setActiveTab('locations')}
            className={`px-6 py-3 font-medium text-sm transition-all border-b-2 ${activeTab === 'locations' ? 'border-blue-500 text-blue-600 dark:text-white' : 'border-transparent text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-gray-300'}`}
        >
            Locations
        </button>
      </div>

      {activeTab === 'warehouse' ? (
          <div className="space-y-6">
             {localWarehouses.map((wh, idx) => (
                 <Card key={wh.id} className="p-6 !bg-white dark:!bg-[#0F172A]/80" noPadding>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <Warehouse size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{wh.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-gray-400">{wh.shortCode}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDeleteWarehouse(wh.id)}
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-gray-400">Warehouse Name</label>
                                <input 
                                    type="text" 
                                    value={wh.name}
                                    onChange={e => {
                                        const updated = [...localWarehouses];
                                        updated[idx] = { ...updated[idx], name: e.target.value };
                                        setLocalWarehouses(updated);
                                    }}
                                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:border-blue-500 outline-none transition-colors" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-gray-400">Short Code</label>
                                <input 
                                    type="text" 
                                    value={wh.shortCode}
                                    onChange={e => {
                                        const updated = [...localWarehouses];
                                        updated[idx] = { ...updated[idx], shortCode: e.target.value };
                                        setLocalWarehouses(updated);
                                    }}
                                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:border-blue-500 outline-none transition-colors" 
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-gray-400">Address</label>
                                <input 
                                    type="text" 
                                    value={wh.address || ''}
                                    onChange={e => {
                                        const updated = [...localWarehouses];
                                        updated[idx] = { ...updated[idx], address: e.target.value };
                                        setLocalWarehouses(updated);
                                    }}
                                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:border-blue-500 outline-none transition-colors" 
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <ShimmerButton 
                                onClick={() => handleSaveWarehouse(wh)}
                                disabled={isSaving}
                                className="shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                                background="linear-gradient(90deg, #3B82F6, #06B6D4)"
                                shimmerColor="#ffffff"
                                borderRadius="8px"
                            >
                                <div className="flex items-center gap-2 text-white font-bold">
                                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </div>
                            </ShimmerButton>
                        </div>
                    </div>
                 </Card>
             ))}
             
             <button 
                onClick={() => setIsWarehouseModalOpen(true)}
                className="w-full border-2 border-dashed border-slate-300 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-white hover:border-blue-400 dark:hover:border-white/30 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
            >
                <span className="text-3xl mb-2">+</span>
                <span className="font-medium">Add New Warehouse</span>
            </button>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {locations.map((loc) => {
                const parentWarehouse = warehouses.find(w => w.id === loc.warehouseId);
                return (
                <Card key={loc.id} className="p-6 hover:border-blue-500/50 transition-colors group cursor-pointer !bg-white dark:!bg-[#0F172A]/80" noPadding>
                    <div className="p-6 flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg text-slate-400 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-white transition-colors">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white">{loc.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-mono text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/10 px-2 py-0.5 rounded">{loc.shortCode}</span>
                                    <span className="text-xs text-slate-400 dark:text-gray-500">• {parentWarehouse?.name || 'Unknown Warehouse'}</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteLocation(loc.id); }}
                            className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </Card>
            )})}
            <button 
                onClick={() => setIsLocationModalOpen(true)}
                className="border-2 border-dashed border-slate-300 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-white hover:border-blue-400 dark:hover:border-white/30 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
            >
                <span className="text-3xl mb-2">+</span>
                <span className="font-medium">Add Location</span>
            </button>
          </div>
      )}

      {/* Add Warehouse Modal */}
      <AnimatePresence>
        {isWarehouseModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsWarehouseModalOpen(false)}
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white dark:bg-[#0F172A] w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/5">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">New Warehouse</h3>
                        <button onClick={() => setIsWarehouseModalOpen(false)}><X size={20} className="text-slate-500" /></button>
                    </div>
                    <form onSubmit={handleCreateWarehouse} className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                            <input required value={newWarehouse.name} onChange={e => setNewWarehouse({...newWarehouse, name: e.target.value})} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500" placeholder="e.g. East Coast Hub" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Short Code</label>
                            <input required value={newWarehouse.shortCode} onChange={e => setNewWarehouse({...newWarehouse, shortCode: e.target.value})} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-mono" placeholder="e.g. WH-EAST" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                            <input value={newWarehouse.address} onChange={e => setNewWarehouse({...newWarehouse, address: e.target.value})} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500" placeholder="e.g. 123 Logistics Blvd" />
                        </div>
                        <div className="pt-4 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsWarehouseModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500">Create</button>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Add Location Modal */}
      <AnimatePresence>
        {isLocationModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsLocationModalOpen(false)}
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white dark:bg-[#0F172A] w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/5">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">New Location</h3>
                        <button onClick={() => setIsLocationModalOpen(false)}><X size={20} className="text-slate-500" /></button>
                    </div>
                    <form onSubmit={handleCreateLocation} className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Parent Warehouse</label>
                            <select 
                                required 
                                value={newLocation.warehouseId} 
                                onChange={e => setNewLocation({...newLocation, warehouseId: e.target.value})} 
                                className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 appearance-none"
                            >
                                <option value="">Select Warehouse...</option>
                                {warehouses.map(w => (
                                    <option key={w.id} value={w.id}>{w.name} ({w.shortCode})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location Name</label>
                            <input required value={newLocation.name} onChange={e => setNewLocation({...newLocation, name: e.target.value})} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500" placeholder="e.g. Aisle 1, Shelf B" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Short Code</label>
                            <input required value={newLocation.shortCode} onChange={e => setNewLocation({...newLocation, shortCode: e.target.value})} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-mono" placeholder="e.g. A1-B" />
                        </div>
                        <div className="pt-4 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsLocationModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500">Create</button>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
