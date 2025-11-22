
import React, { useState, useEffect } from 'react';
import { ArrowUpRight, AlertTriangle } from 'lucide-react';
import Card from '../components/ui/Card';
import { useData } from '../context/DataContext';
import { operationService } from '../services/operationService';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const { operations } = useData();
  const [metrics, setMetrics] = useState({
    receipts: { pending: 0, received: 0 },
    deliveries: { waiting: 0, ready: 0, delivered: 0 },
    flow: [] as { date: string; receipts: number; deliveries: number }[]
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await operationService.metrics();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
        // Fallback to client-side calculation if backend fails
        const receiptOps = operations.filter(o => o.type === 'Receipt');
        const deliveryOps = operations.filter(o => o.type === 'Delivery');
        setMetrics({
          receipts: {
            pending: receiptOps.filter(o => o.status === 'Draft').length,
            received: receiptOps.filter(o => o.status === 'Done').length
          },
          deliveries: {
            waiting: deliveryOps.filter(o => o.status === 'Waiting').length,
            ready: deliveryOps.filter(o => o.status === 'Ready').length,
            delivered: deliveryOps.filter(o => o.status === 'Done').length
          },
          flow: []
        });
      }
    };
    fetchMetrics();
  }, [operations]);

  // Calculate totals for display
  const receiptOps = operations.filter(o => o.type === 'Receipt');
  const deliveryOps = operations.filter(o => o.type === 'Delivery');

  const ReceiptPanel: React.FC<{ pending: number; received: number; total: number }> = ({ pending, received, total }) => (
    <Card className="!bg-white dark:!bg-white/5 p-6 flex flex-col gap-6" glow>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Receipts</h3>
        <span className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 font-mono text-slate-600 dark:text-gray-300">{total} ops</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-white/10 p-4 bg-slate-50 dark:bg-black/20">
          <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-gray-400 font-bold mb-1">Pending</p>
          <span className="text-3xl font-bold font-mono text-orange-600 dark:text-orange-400">{pending}</span>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-white/10 p-4 bg-slate-50 dark:bg-black/20">
          <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-gray-400 font-bold mb-1">Received</p>
          <span className="text-3xl font-bold font-mono text-green-600 dark:text-green-400">{received}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400">
        <ArrowUpRight size={14} />
        <span>Flow: Draft → Done (Stock Increased)</span>
      </div>
    </Card>
  );

  const DeliveryPanel: React.FC<{ waiting: number; ready: number; delivered: number; total: number }> = ({ waiting, ready, delivered, total }) => (
    <Card className="!bg-white dark:!bg-white/5 p-6 flex flex-col gap-6" glow>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Deliveries</h3>
        <span className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 font-mono text-slate-600 dark:text-gray-300">{total} ops</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 dark:border-white/10 p-3 bg-slate-50 dark:bg-black/20">
          <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-gray-400 font-bold mb-1">Waiting</p>
          <span className="text-2xl font-bold font-mono text-orange-600 dark:text-orange-400">{waiting}</span>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-white/10 p-3 bg-slate-50 dark:bg-black/20">
          <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-gray-400 font-bold mb-1">Ready</p>
          <span className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">{ready}</span>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-white/10 p-3 bg-slate-50 dark:bg-black/20">
          <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-gray-400 font-bold mb-1">Delivered</p>
          <span className="text-2xl font-bold font-mono text-green-600 dark:text-green-400">{delivered}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400">
        <ArrowUpRight size={14} />
        <span>Flow: Draft → Waiting/Ready → Done (Stock Reduced)</span>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </div>
          <span className="text-xs font-bold text-green-600 dark:text-green-500 uppercase tracking-widest">Operational</span>
        </motion.div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard</h2>
        <p className="text-sm text-slate-500 dark:text-gray-400">Focused view: inbound & outbound flows.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ReceiptPanel 
          pending={metrics.receipts.pending} 
          received={metrics.receipts.received} 
          total={receiptOps.length} 
        />
        <DeliveryPanel 
          waiting={metrics.deliveries.waiting}
          ready={metrics.deliveries.ready}
          delivered={metrics.deliveries.delivered}
          total={deliveryOps.length} 
        />
      </div>

      <Card className="mt-4 !bg-white dark:!bg-white/5 p-6" glow>
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-red-500" />
          <h4 className="font-bold text-slate-900 dark:text-white">Low Stock Alerts</h4>
        </div>
        <p className="text-sm text-slate-500 dark:text-gray-400">Placeholder – integrate alert list next iteration.</p>
      </Card>
    </div>
  );
};

export default Dashboard;
