import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import Card from '../components/ui/Card';
import { ShimmerButton } from '../components/ui/ShimmerButton';
import { useToast } from '../context/ToastContext';
import { Loader2, ArrowLeft, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NewDelivery: React.FC = () => {
  const { addOperation, products, locations } = useData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [contact, setContact] = useState<string>('');
  const [scheduleDate, setScheduleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [locationId, setLocationId] = useState<string>(locations[0]?.id || '');
  const [lines, setLines] = useState<{ productId: string; quantity: number }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createDraft = async () => {
    if (!locationId) { showToast('Select source location', 'error'); return; }
    if (lines.length === 0) { showToast('Add at least one product line', 'error'); return; }
    setIsSubmitting(true);
    try {
      const op = await addOperation('Delivery', scheduleDate, locationId, contact, lines);
      showToast('Delivery draft created', 'success');
      navigate('/operations');
    } catch {
      showToast('Failed to create delivery', 'error');
    } finally { setIsSubmitting(false); }
  };

  const addLine = (productId: string) => {
    if (!productId) return;
    if (lines.find(l => l.productId === productId)) { showToast('Product already added', 'warning'); return; }
    setLines(prev => [...prev, { productId, quantity: 1 }]);
  };

  const updateQty = (productId: string, qty: number) => {
    setLines(prev => prev.map(l => l.productId === productId ? { ...l, quantity: qty } : l));
  };

  const removeLine = (productId: string) => {
    setLines(prev => prev.filter(l => l.productId !== productId));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <a href="/operations" className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"><ArrowLeft size={18} /></a>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">New Delivery</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400">Outbound fulfillment (Draft → Waiting → Ready → Done).</p>
        </div>
      </div>

      <Card className="p-6 !bg-white dark:!bg-white/5" glow>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Schedule Date</label>
            <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="rounded-lg px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Source Location</label>
            <select value={locationId} onChange={e => setLocationId(e.target.value)} className="rounded-lg px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <option value="">Select...</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Customer / Contact</label>
            <input value={contact} onChange={e => setContact(e.target.value)} placeholder="Customer name" className="rounded-lg px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10" />
          </div>
        </div>

        <div className="space-y-8">
          <div className="border border-slate-200 dark:border-white/10 rounded-xl p-4 bg-slate-50 dark:bg-[#0F172A]/40">
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-500 dark:text-gray-400">Add Product</label>
            <select onChange={e => { if(e.target.value){ addLine(e.target.value); e.target.value=''; }}} className="w-full rounded-lg px-3 py-2 bg-white dark:bg-[#0F172A] border border-slate-300 dark:border-white/10">
              <option value="">Select product...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (stock {p.quantity})</option>)}
            </select>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 dark:bg-white/5 text-xs uppercase tracking-wider text-slate-500 dark:text-gray-400"><tr><th className="p-3 text-left">Product</th><th className="p-3">Demand</th><th className="p-3 w-12"></th></tr></thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {lines.map(l => {
                  const prod = products.find(p => p.id === l.productId);
                  const insufficient = prod && l.quantity > prod.quantity;
                  return (
                    <tr key={l.productId} className={`hover:bg-slate-50 dark:hover:bg-white/5 ${insufficient ? 'bg-red-50 dark:bg-red-900/20 border-l-2 border-red-500' : ''}`}>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">{prod?.name}</div>
                            <div className="text-xs text-blue-600 dark:text-blue-400 font-mono">{prod?.sku}</div>
                          </div>
                          {insufficient && <AlertTriangle size={16} className="text-red-500" />}
                        </div>
                        {insufficient && <div className="text-xs text-red-600 dark:text-red-400 mt-1">Insufficient stock (available: {prod?.quantity})</div>}
                      </td>
                      <td className="p-3 w-28"><input type="number" min={1} value={l.quantity} onChange={e=>updateQty(l.productId,Number(e.target.value))} className="w-24 text-center rounded bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10"/></td>
                      <td className="p-3 text-right"><button onClick={()=>removeLine(l.productId)} className="p-2 rounded hover:bg-red-500/10 text-red-500"><Trash2 size={16}/></button></td>
                    </tr>
                  );
                })}
                {lines.length===0 && <tr><td colSpan={3} className="p-6 text-center text-slate-500 dark:text-gray-500 italic">No lines yet</td></tr>}
              </tbody>
            </table>
          </div>
          <ShimmerButton disabled={isSubmitting || !locationId || lines.length===0} onClick={createDraft} background="linear-gradient(90deg,#2563EB,#1D4ED8)" shimmerColor="#fff" borderRadius="12px" className="shadow-lg shadow-blue-500/20">
            <div className="flex items-center gap-2 text-white font-bold">
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              <span>{isSubmitting ? 'Creating...' : 'Create Draft'}</span>
            </div>
          </ShimmerButton>
        </div>
      </Card>
    </div>
  );
};

export default NewDelivery;
