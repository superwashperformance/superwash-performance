import React, { useState } from 'react';
import { UserRole, ServiceOrder, InventoryItem, CashTransaction, ODSStatus } from './types';
import {
  mockServiceOrders,
  mockInventory,
  mockTransactions,
  mockCustomers,
  mockVehicles,
} from './data/mockData';
import { Header } from './components/layout/Header';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { SplashScreen } from './components/views/SplashScreen';
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
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');

  // Application State
  const [orders, setOrders] = useState<ServiceOrder[]>(mockServiceOrders);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [transactions, setTransactions] = useState<CashTransaction[]>(mockTransactions);

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);

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

  const handleCreateODS = (newODS: ServiceOrder) => {
    setOrders([newODS, ...orders]);
    setActiveTab('ods');
  };

  const handleUpdateStatus = (orderId: string, newStatus: ODSStatus) => {
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
  };

  const handleUpdateStock = (itemId: string, newStock: number) => {
    setInventory(
      inventory.map((item) => (item.id === itemId ? { ...item, stock: newStock } : item))
    );
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

  if (showSplash) {
    return <SplashScreen onEnter={() => setShowSplash(false)} />;
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
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onNewODS={() => setActiveTab('ods_new' as any)}
        onSearchOpen={() => setIsSearchOpen(true)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
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
            />
          )}

          {(activeTab as any) === 'ods_new' && (
            <ODSCreateView
              onSaveODS={handleCreateODS}
              onCancel={() => setActiveTab('ods')}
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
            <InventoryView inventory={inventory} onUpdateStock={handleUpdateStock} />
          )}

          {activeTab === 'cashier' && (
            <CashierView
              orders={orders}
              transactions={transactions}
              onAddPayment={handleAddPayment}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersView customers={mockCustomers} vehicles={mockVehicles} />
          )}

          {activeTab === 'vehicles' && <VehiclesView vehicles={mockVehicles} />}

          {activeTab === 'settings' && <SettingsView />}
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
