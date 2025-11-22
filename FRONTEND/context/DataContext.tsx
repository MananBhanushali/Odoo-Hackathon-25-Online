
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Operation, Move, Warehouse, Location, KPIData } from '../types';
import { MOCK_LOCATIONS } from '../constants';
import { productService } from '../services/productService';
import { warehouseService } from '../services/warehouseService';
import { operationService } from '../services/operationService';
import { moveService } from '../services/moveService';
import { useToast } from './ToastContext';

interface DataContextType {
  products: Product[];
  operations: Operation[];
  moves: Move[];
  warehouses: Warehouse[];
  locations: Location[];
  kpi: KPIData;
  addProduct: (p: Partial<Product>) => Promise<void>;
  updateProduct: (id: string, p: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addOperation: (type: 'Receipt' | 'Delivery', scheduleDate: string, locationId: string, contact?: string, items?: { productId: string; quantity: number }[]) => Promise<Operation>;
  updateOperation: (id: string, payload: { contact?: string; items?: { productId: string; quantity: number }[] }) => Promise<Operation>;
  validateOperation: (o: Operation) => void;
  addWarehouse: (w: Partial<Warehouse>) => Promise<void>;
  updateWarehouse: (id: string, w: Partial<Warehouse>) => Promise<void>;
  deleteWarehouse: (id: string) => Promise<void>;
  addLocation: (l: Partial<Location>) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  resetData: () => void;
  refreshOperations: () => Promise<void>;
  simulateScenario: (type: 'crash' | 'viral' | 'hack') => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]); // Still mock for now or fetch from warehouse
  
  // Keep these as mocks until backend is ready
  const [operations, setOperations] = useState<Operation[]>([]);
  const [moves, setMoves] = useState<Move[]>([]);

  // Fetch Data on Mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedProducts, fetchedWarehouses, fetchedOperations, fetchedMoves] = await Promise.all([
          productService.getAll(),
          warehouseService.getAll(),
          operationService.list(),
          moveService.list()
        ]);
        
        // Map backend product to frontend product (if needed, but we aligned types mostly)
        // We need to compute status for products
        const processedProducts = fetchedProducts.map(p => ({
          ...p,
          status: (p.quantity === 0 ? 'Out of Stock' : p.quantity <= p.minThreshold ? 'Low Stock' : 'In Stock') as any
        }));

        setProducts(processedProducts);
        setWarehouses(fetchedWarehouses);
        setOperations(fetchedOperations);
        setMoves(fetchedMoves);
        
        // Flatten locations from warehouses
        const allLocations = fetchedWarehouses.flatMap(w => w.locations || []);
        setLocations(allLocations); 
      } catch (error) {
        console.error("Failed to fetch initial data", error);
        showToast("Failed to load data from server", "error");
      }
    };
    fetchData();
  }, [showToast]);

  // Dynamic KPI Calculation
  const kpi: KPIData = {
    totalProducts: products.length,
    lowStockItems: products.filter(p => p.quantity <= p.minThreshold).length,
    pendingReceipts: operations.filter(o => o.type === 'Receipt' && o.status !== 'Done' && o.status !== 'Cancelled').length,
    pendingDeliveries: operations.filter(o => o.type === 'Delivery' && o.status !== 'Done' && o.status !== 'Cancelled').length,
    totalValue: products.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0)
  };

  const addProduct = async (p: Partial<Product>) => {
    try {
      const newProduct = await productService.create(p);
      const processedProduct = {
          ...newProduct,
          status: (newProduct.quantity === 0 ? 'Out of Stock' : newProduct.quantity <= newProduct.minThreshold ? 'Low Stock' : 'In Stock') as any
      };
      setProducts(prev => [...prev, processedProduct]);
      showToast("Product created successfully", "success");
    } catch (error) {
      showToast("Failed to create product", "error");
      throw error;
    }
  };
  
  const updateProduct = async (id: string, p: Partial<Product>) => {
    try {
      const updated = await productService.update(id, p);
      const processedProduct = {
          ...updated,
          status: (updated.quantity === 0 ? 'Out of Stock' : updated.quantity <= updated.minThreshold ? 'Low Stock' : 'In Stock') as any
      };
      setProducts(prev => prev.map(prod => prod.id === id ? processedProduct : prod));
      showToast("Product updated successfully", "success");
    } catch (error) {
      showToast("Failed to update product", "error");
      throw error;
    }
  };
  
  const deleteProduct = async (id: string) => {
    try {
      await productService.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast("Product deleted successfully", "success");
    } catch (error) {
      showToast("Failed to delete product", "error");
      throw error;
    }
  };

  const addWarehouse = async (w: Partial<Warehouse>) => {
    try {
      const newWarehouse = await warehouseService.create(w);
      setWarehouses(prev => [...prev, newWarehouse]);
      showToast("Warehouse created successfully", "success");
    } catch (error) {
      showToast("Failed to create warehouse", "error");
      throw error;
    }
  };

  const updateWarehouse = async (id: string, w: Partial<Warehouse>) => {
    try {
      const updated = await warehouseService.update(id, w);
      setWarehouses(prev => prev.map(wh => wh.id === id ? updated : wh));
      showToast("Warehouse updated successfully", "success");
    } catch (error) {
      showToast("Failed to update warehouse", "error");
      throw error;
    }
  };

  const deleteWarehouse = async (id: string) => {
    try {
      await warehouseService.delete(id);
      setWarehouses(prev => prev.filter(w => w.id !== id));
      setLocations(prev => prev.filter(l => l.warehouseId !== id));
      showToast("Warehouse deleted successfully", "success");
    } catch (error) {
      showToast("Failed to delete warehouse", "error");
      throw error;
    }
  };

  const addLocation = async (l: Partial<Location>) => {
    try {
      const newLocation = await warehouseService.createLocation(l);
      setLocations(prev => [...prev, newLocation]);
      // Also update the warehouse's location list locally
      setWarehouses(prev => prev.map(w => 
        w.id === newLocation.warehouseId 
          ? { ...w, locations: [...(w.locations || []), newLocation] }
          : w
      ));
      showToast("Location created successfully", "success");
    } catch (error) {
      showToast("Failed to create location", "error");
      throw error;
    }
  };

  const deleteLocation = async (id: string) => {
    try {
      await warehouseService.deleteLocation(id);
      setLocations(prev => prev.filter(l => l.id !== id));
      setWarehouses(prev => prev.map(w => ({
        ...w,
        locations: (w.locations || []).filter(l => l.id !== id)
      })));
      showToast("Location deleted successfully", "success");
    } catch (error) {
      showToast("Failed to delete location", "error");
      throw error;
    }
  };

  // Operations are still client-side for now
  const addOperation = async (type: 'Receipt' | 'Delivery', scheduleDate: string, locationId: string, contact?: string, items: { productId: string; quantity: number }[] = []) => {
    try {
      const created = await operationService.create({ type, scheduleDate, locationId, contact, items });
      setOperations(prev => [created, ...prev]);
      return created;
    } catch (e) {
      showToast('Failed to create operation', 'error');
      throw e;
    }
  };

  const updateOperation = async (id: string, payload: { contact?: string; items?: { productId: string; quantity: number }[] }) => {
    try {
      const updated = await operationService.updateDraft(id, payload);
      setOperations(prev => prev.map(op => op.id === id ? updated : op));
      return updated;
    } catch (e) {
      showToast('Failed to update operation', 'error');
      throw e;
    }
  };

  const resetData = () => {
    // Re-fetch or clear? For now, just log
    console.log("Reset data not fully implemented for backend mode");
  };

  const refreshOperations = useCallback(async () => {
    try {
      const refreshedOperations = await operationService.list();
      setOperations(refreshedOperations);
    } catch (error) {
      showToast('Failed to refresh operations', 'error');
    }
  }, [showToast]);

  // The Core Logic: Processing an operation (Client-side simulation for now)
  const validateOperation = useCallback(async (op: Operation) => {
    if (op.status === 'Done') return;
    try {
      const updated = await operationService.updateStatus(op.id, 'DONE');
      setOperations(prev => prev.map(o => o.id === op.id ? updated : o));
      // Refresh products and moves after backend applied changes
      const [freshProducts, freshMoves, refreshedOperations] = await Promise.all([
        productService.getAll(),
        moveService.list(),
        operationService.list() // Refresh operations to get updated statuses
      ]);
      const processedProducts = freshProducts.map(p => ({
        ...p,
        status: (p.quantity === 0 ? 'Out of Stock' : p.quantity <= p.minThreshold ? 'Low Stock' : 'In Stock') as any
      }));
      setProducts(processedProducts);
      setMoves(freshMoves);
      setOperations(refreshedOperations); // Update operations with refreshed statuses
    } catch (e) {
      showToast('Failed to validate operation', 'error');
    }
  }, [showToast]);

  // Simulation Logic for Nexus
  const simulateScenario = (type: 'crash' | 'viral' | 'hack') => {
     // ... (Keep existing logic but adapt to new field names if needed)
     console.log("Simulation not adapted for backend yet");
  };

  return (
    <DataContext.Provider value={{
      products, operations, moves, warehouses, locations, kpi,
      addProduct, updateProduct, deleteProduct,
      addOperation, updateOperation, validateOperation,
      addWarehouse, updateWarehouse, deleteWarehouse,
      addLocation, deleteLocation,
      resetData, refreshOperations, simulateScenario
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
