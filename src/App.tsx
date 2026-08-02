import React, { useState } from 'react';
import { UserRole, ServiceOrder, InventoryItem, CashTransaction, ODSStatus, Agent } from './types';
import {
  mockInventory,
  mockTransactions,
  mockCustomers,
  mockVehicles,
  initialTechnicians,
  initialReceptionAgents,
} from './data/mockData';
import { odsService } from './services/odsService';
import { inventoryService } from './services/inventoryService';
import { supabase } from './lib/supabase';
import { Header } from './components/layout/Header';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { SplashScreen } from './components/views/SplashScreen';
import { ClientTrackingPortal } from './components/views/ClientTrackingPortal';
import { DashboardView } from './components/views/DashboardView';
import { ODSListView } from './components/views/ODSListView';
import { ODSCreateView } from './components/views/ODSCreateView';
import { KanbanView } from './components/views/KanbanView';
import { InventoryView } from './components/views/InventoryView';
import { CashierView } from './components/views/CashierView';
import { CustomersView } from './components/views/CustomersView';
import { VehiclesView } from './components/views/VehiclesView';
import { SettingsView } from './components/views/SettingsView';
import { ODSDetailModal } from './components/views/ODSDetailModal';
import { Search, X } from 'lucide-react';

export function App() {
  const [appMode, setAppMode] = useState<'splash' | 'admin' | 'tracking'>('splash');
  const [trackingPlate, setTrackingPlate] = useState('');
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');

  // Application State
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [transactions, setTransactions] = useState<CashTransaction[]>(mockTransactions);
  const [technicians, setTechnicians] = useState<Agent[]>(initialTechnicians);
  const [receptionAgents, setReceptionAgents] = useState<Agent[]>(initialReceptionAgents);

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);

  // Fetch initial data from Supabase
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingOrders(true);
        // 1. Fetch ODS
        const odsData = await odsService.getActiveODS();
        setOrders(odsData);

        // 2. Fetch & Seed Inventory
        await inventoryService.seedMockDataIfNeeded(mockInventory);
        const invData = await inventoryService.getInventory();
        setInventory(invData);
      } catch (error) {
        console.error('Failed to fetch data from Supabase', error);
      } finally {
        setIsLoadingOrders(false);
      }
    };
    fetchData();

    // 3. Supabase Realtime Subscription for ODS
    const channel = supabase
      .channel('ods_realtime_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'service_orders' },
        (payload) => {
          console.log('Realtime ODS change received!', payload);
          // Simple approach: re-fetch all active ODS to ensure relationships (customers, vehicles) are included.
          odsService.getActiveODS().then((newData) => {
            setOrders(newData);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Search Command Palette Modal State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle Ctrl+K shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCreateODS = async (newODS: ServiceOrder) => {
    try {
      // Optimistic update for better UX (optional) or wait for server
      const createdODS = await odsService.createODS(newODS);
      setOrders([createdODS, ...orders]);
      setActiveTab('ods');
    } catch (error) {
      console.error('Error al guardar la ODS:', error);
      alert('Hubo un error al guardar la ODS en la nube. Revisa la consola.');
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: ODSStatus) => {
    // 1. Update local state (Optimistic Update)
    setOrders(
      orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: newStatus,
              statusHistory: [
                ...o.statusHistory,
                {
                  status: newStatus,
                  changedAt: new Date().toLocaleString('es-ES'),
                  changedBy: currentRole,
                },
              ],
            }
          : o
      )
    );

    try {
      // 2. Update in DB
      await odsService.updateODSStatus(orderId, newStatus);
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('Nota: El estado se actualizó en la pantalla, pero hubo un error al guardarlo en la base de datos de Supabase. (Si añadiste "archived", asegúrate de agregarlo al ENUM en Supabase).');
    }
  };

  const handleDeleteODS = async (orderId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta Orden de Servicio de forma permanente?')) return;
    try {
      await odsService.deleteODS(orderId);
      setOrders(orders.filter((o) => o.id !== orderId));
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
    } catch (error) {
      console.error('Error al eliminar ODS:', error);
      alert('Error al eliminar la ODS en la base de datos.');
    }
  };

  const handleUpdateStock = async (itemId: string, newStock: number) => {
    try {
      await inventoryService.updateStock(itemId, newStock);
      setInventory(
        inventory.map((item) =>
          item.id === itemId
            ? { ...item, stock: newStock, lastUpdated: new Date().toLocaleString('es-ES') }
            : item
        )
      );
    } catch (error) {
      console.error('Error updating stock', error);
      alert('Hubo un error al actualizar el stock en la base de datos.');
    }
  };

  const handleDeleteProduct = async (itemId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este insumo del inventario?')) return;
    try {
      await inventoryService.deleteItem(itemId);
      setInventory(inventory.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert('Hubo un error al eliminar el insumo.');
    }
  };

  const handleAddPayment = (
    orderId: string,
    amount: number,
    method: any,
    ref: string,
    notes: string
  ) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const newPaidAmount = targetOrder.paidAmount + amount;
    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, paidAmount: newPaidAmount } : o))
    );

    const newTx: CashTransaction = {
      id: `tx-${Date.now()}`,
      orderId: targetOrder.id,
      orderNumber: targetOrder.orderNumber,
      customerName: targetOrder.customerName,
      amount: amount,
      type: 'payment',
      paymentMethod: method,
      referenceNumber: ref,
      date: new Date().toLocaleString('es-ES'),
      notes: notes || 'Abono / Pago recibido',
      receivedBy: currentRole,
    };

    setTransactions([newTx, ...transactions]);
  };

  if (appMode === 'splash') {
    return <SplashScreen 
      onEnter={() => setAppMode('admin')} 
      onTrack={(plate) => { setTrackingPlate(plate); setAppMode('tracking'); }} 
    />;
  }
  
  if (appMode === 'tracking') {
    return <ClientTrackingPortal 
      initialPlate={trackingPlate} 
      onExit={() => setAppMode('splash')} 
    />;
  }

  // Filtered search items
  const filteredSearchResults = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.vehicleBrandModel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#06080C] text-[#F0F6FC] flex flex-col font-sans antialiased selection:bg-[#00E5FF] selection:text-black">
      {/* Header */}
      <div className="print:hidden">
        <Header
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          onNewODS={() => setActiveTab('ods_new' as any)}
          onSearchOpen={() => setIsSearchOpen(true)}
        />
      </div>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden print:hidden">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} currentRole={currentRole} />

        {/* Dynamic View Area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#06080C] via-[#090C12] to-[#040609]">
          {activeTab === 'dashboard' && (
            <DashboardView
              orders={orders}
              onNewODS={() => setActiveTab('ods_new' as any)}
              onSelectOrder={setSelectedOrder}
              onNavigateTab={setActiveTab}
              currentRole={currentRole}
            />
          )}

          {activeTab === 'ods' && (
            <ODSListView
              orders={orders}
              onSelectOrder={setSelectedOrder}
              onNewODS={() => setActiveTab('ods_new' as any)}
              onDeleteODS={handleDeleteODS}
            />
          )}

          {(activeTab as any) === 'ods_new' && (
            <ODSCreateView
              onSaveODS={handleCreateODS}
              onCancel={() => setActiveTab('ods')}
              technicians={technicians}
              receptionAgents={receptionAgents}
            />
          )}

          {activeTab === 'kanban' && (
            <KanbanView
              orders={orders}
              onUpdateStatus={handleUpdateStatus}
              onSelectOrder={setSelectedOrder}
              currentRole={currentRole}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView 
              inventory={inventory} 
              onUpdateStock={handleUpdateStock} 
              onDeleteProduct={handleDeleteProduct} 
            />
          )}

          {activeTab === 'cashier' && (
            <CashierView
              orders={orders}
              transactions={transactions}
              customers={mockCustomers}
              onAddPayment={handleAddPayment}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersView customers={mockCustomers} vehicles={mockVehicles} />
          )}

          {activeTab === 'vehicles' && <VehiclesView vehicles={mockVehicles} />}

          {activeTab === 'settings' && (
            <SettingsView 
              technicians={technicians}
              setTechnicians={setTechnicians}
              receptionAgents={receptionAgents}
              setReceptionAgents={setReceptionAgents}
            />
          )}
        </main>
      </div>

      {/* ODS Detail Modal */}
      <ODSDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />

      {/* Command Palette Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 p-4">
          <div className="nike-card w-full max-w-xl p-4 flex flex-col gap-3 shadow-2xl border-cyan-500/40">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Search className="w-5 h-5 text-[#00E5FF]" />
              <input
                type="text"
                placeholder="Escribe número de ODS, Placa, Cliente o Modelo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 bg-transparent text-sm text-white focus:outline-none font-mono"
              />
              <button onClick={() => setIsSearchOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto flex flex-col gap-2">
              {filteredSearchResults.length === 0 ? (
                <div className="text-center text-xs text-slate-500 py-6 font-mono">
                  No se encontraron resultados para "{searchQuery}"
                </div>
              ) : (
                filteredSearchResults.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsSearchOpen(false);
                    }}
                    className="p-3 rounded-xl bg-slate-900/60 hover:bg-[#00E5FF]/10 border border-white/5 hover:border-cyan-500/30 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#00E5FF]">{order.orderNumber}</span>
                        <span className="font-bold text-white text-xs">{order.vehicleBrandModel}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Placa: {order.vehiclePlate} | Cliente: {order.customerName}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-white">${order.totalAmount}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
