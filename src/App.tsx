import React, { useState } from 'react';
import { UserRole, ServiceOrder, InventoryItem, InventoryMovement, CashTransaction, ODSStatus, Agent, CompanyData, ServiceItem, Customer, Vehicle, Branch } from './types';
import {
  mockInventory,
  mockInventoryMovements,
  mockTransactions,
  mockCustomers,
  mockVehicles,
  initialTechnicians,
  initialReceptionAgents,
  mockServicesCatalog,
} from './data/mockData';
import { odsService } from './services/odsService';
import { branchService } from './services/branchService';
import { customerService } from './services/customerService';
import { vehicleService } from './services/vehicleService';
import { treasuryService } from './services/treasuryService';
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
import { TreasuryView } from './components/views/TreasuryView';
import { LegacyCashView } from './components/views/LegacyCashView';
import { CustomersView } from './components/views/CustomersView';
import { VehiclesView } from './components/views/VehiclesView';
import { SettingsView } from './components/views/SettingsView';
import { ODSDetailModal } from './components/views/ODSDetailModal';
import { Search, X } from 'lucide-react';
import { AuthModal, UserSession } from './components/views/AuthModal';

export function App() {
  const [appMode, setAppMode] = useState<'splash' | 'admin' | 'tracking'>('splash');
  const [trackingPlate, setTrackingPlate] = useState('');
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  
  // User Session Management
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  // Initialize Session from Supabase
  React.useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session && session.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        const role = profile ? profile.role : 'admin';
        const fullName = profile ? profile.full_name : session.user.email?.split('@')[0] || 'Usuario';
        
        setUserSession({
          id: session.user.id,
          email: session.user.email || '',
          fullName,
          role: role as UserRole,
          avatar: fullName.substring(0, 2).toUpperCase(),
          token: session.access_token,
        });
        setAppMode('admin');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session && session.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        const role = profile ? profile.role : 'admin';
        const fullName = profile ? profile.full_name : session.user.email?.split('@')[0] || 'Usuario';
        
        setUserSession({
          id: session.user.id,
          email: session.user.email || '',
          fullName,
          role: role as UserRole,
          avatar: fullName.substring(0, 2).toUpperCase(),
          token: session.access_token,
        });
      } else {
        setUserSession(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const currentRole: UserRole = userSession?.role || 'admin';

  // Application State
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>(mockInventoryMovements);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [technicians, setTechnicians] = useState<Agent[]>(initialTechnicians);
  const [receptionAgents, setReceptionAgents] = useState<Agent[]>(initialReceptionAgents);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [companyData, setCompanyData] = useState<CompanyData>({
    name: 'Super Wash Performance C.A.',
    documentId: 'J-40199281-0',
    address: 'Sede Principal Las Mercedes',
    phone: '+58 412-1234567',
    email: 'contacto@superwash.com'
  });
  const [servicesCatalog, setServicesCatalog] = useState<ServiceItem[]>(mockServicesCatalog);

  // Cash Register State
  const [registerState, setRegisterState] = useState<{isOpen: boolean; openedAt: string | null; initialAmount: number}>({ isOpen: false, openedAt: null, initialAmount: 0 });

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);

  // Fetch initial data from Supabase
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingOrders(true);
        // 1. Fetch ODS
        const odsData = await odsService.getActiveODS();
        setOrders(prevOrders => {
          return odsData.map(fetched => {
            const existing = prevOrders.find(o => o.id === fetched.id);
            if (existing) {
              return {
                ...fetched,
                checklist: existing.checklist?.length ? existing.checklist : fetched.checklist,
                // FASE B: Photos debe provenir de Supabase, no del estado local
                photos: fetched.photos,
                services: existing.services?.length ? existing.services : fetched.services,
                damageMarkers: existing.damageMarkers?.length ? existing.damageMarkers : fetched.damageMarkers,
              };
            }
            return fetched;
          });
        });

        // 2. Fetch inventory
        await inventoryService.seedMockDataIfNeeded(mockInventory);
        const invData = await inventoryService.getInventory();
        setInventory(invData);
        
        // 3. Fetch branches
        const branchData = await branchService.getBranches();
        setBranches(branchData);
        
        // 4. Fetch Customers, Vehicles, and Transactions
        const [fetchedCustomers, fetchedVehicles] = await Promise.all([
          customerService.getCustomers(),
          vehicleService.getVehicles()
        ]);
        setCustomers(fetchedCustomers);
        setVehicles(fetchedVehicles);
        
        // Fetch Cash Session State
        const activeSession = await treasuryService.getActiveSession();
        if (activeSession) {
          setRegisterState({ isOpen: true, openedAt: activeSession.opened_at, initialAmount: 0 });
        } else {
          setRegisterState({ isOpen: false, openedAt: null, initialAmount: 0 });
        }
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
          // Re-fetch all but preserve local nested relations
          odsService.getActiveODS().then(odsData => {
            setOrders(prevOrders => {
              return odsData.map(fetched => {
                const existing = prevOrders.find(o => o.id === fetched.id);
                if (existing) {
                  return {
                    ...fetched,
                    checklist: existing.checklist?.length ? existing.checklist : fetched.checklist,
                    // FASE B: Photos debe provenir de Supabase, no del estado local
                    photos: fetched.photos,
                    services: existing.services?.length ? existing.services : fetched.services,
                    damageMarkers: existing.damageMarkers?.length ? existing.damageMarkers : fetched.damageMarkers,
                  };
                }
                return fetched;
              });
            });
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
    
    const orderToDelete = orders.find(o => o.id === orderId);
    if (!orderToDelete) return;

    try {
      await odsService.deleteODS(orderId, orderToDelete.photos);
      
      // SOLO si no hubo error, eliminamos localmente (No hay actualizacin optimista)
      setOrders(orders.filter((o) => o.id !== orderId));
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
      alert('ODS eliminada correctamente.');
    } catch (error: any) {
      if (error?.message === 'SUCCESS_DB_FAIL_STORAGE') {
        // ODS se borr de BD, por lo tanto actualizamos la UI para removerla,
        // pero advertimos del problema en Storage
        setOrders(orders.filter((o) => o.id !== orderId));
        if (selectedOrder?.id === orderId) setSelectedOrder(null);
        console.warn('La ODS se eliminó de la BD, pero hubo un error al borrar las fotos físicas de Storage.');
        alert('ODS eliminada, PERO hubo un error limpiando algunas imgenes del Storage. Por favor repórtalo.');
      } else {
        console.error('Error al eliminar ODS:', error);
        alert(error?.message || 'Error al eliminar la ODS en la base de datos.');
        // Removemos el recargo forzoso para que puedas ver el error y la UI no parpadee 
      }
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
    notes: string,
    condition: 'contado' | 'cuenta_corriente'
  ) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const newPaidAmount = condition === 'contado' 
      ? targetOrder.paidAmount + amount 
      : targetOrder.paidAmount; // If it's a debt transfer, the ODS remains unpaid
    
    // Optimistic Update local state
    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, paidAmount: newPaidAmount } : o))
    );

    // Save to DB in background (only if the paid amount changed)
    if (newPaidAmount !== targetOrder.paidAmount) {
      odsService.updateODSPaidAmount(orderId, newPaidAmount).catch(err => {
        console.error('Error saving payment to DB:', err);
      });
    }

    const newTx: CashTransaction = {
      id: `tx-${Date.now()}`,
      orderId: targetOrder.id,
      orderNumber: targetOrder.orderNumber,
      customerName: targetOrder.customerName,
      amount: amount,
      type: 'payment',
      paymentMethod: method,
      paymentCondition: condition,
      referenceNumber: ref,
      date: new Date().toLocaleString('es-ES'),
      notes: notes || 'Abono / Pago recibido',
      receivedBy: currentRole,
    };

    setTransactions([newTx, ...transactions]);
  };

  const handleAccountPayment = (
    customerId: string,
    amount: number,
    method: any,
    ref: string,
    notes: string
  ) => {
    // Find customer name from orders or transactions
    const orderRef = orders.find(o => o.customerId === customerId || o.customerName === customerId);
    const txRef = transactions.find(t => t.customerName === customerId);
    const customerName = orderRef?.customerName || txRef?.customerName || customerId;

    let remainingAmount = amount;
    const unpaidOrders = orders
      .filter(o => (o.customerId === customerId || o.customerName === customerName) && o.totalAmount > o.paidAmount)
      .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());

    const updatedOrders = [...orders];

    for (const order of unpaidOrders) {
      if (remainingAmount <= 0) break;
      const orderDebt = order.totalAmount - order.paidAmount;
      const amountToApply = Math.min(orderDebt, remainingAmount);
      
      const newPaidAmount = order.paidAmount + amountToApply;
      remainingAmount -= amountToApply;

      // Update in local state copy
      const index = updatedOrders.findIndex(o => o.id === order.id);
      if (index !== -1) {
        updatedOrders[index] = { ...updatedOrders[index], paidAmount: newPaidAmount };
      }

      // Save to DB
      odsService.updateODSPaidAmount(order.id, newPaidAmount).catch(err => {
        console.error('Error saving account payment to DB:', err);
      });
    }

    setOrders(updatedOrders);

    const newTx: CashTransaction = {
      id: `tx-${Date.now()}`,
      customerName: customerName,
      amount: amount,
      type: 'payment',
      paymentMethod: method,
      paymentCondition: 'abono_cuenta' as any,
      referenceNumber: ref,
      date: new Date().toLocaleString('es-ES'),
      notes: notes || 'Abono a Cuenta Corriente',
      receivedBy: currentRole,
    };

    setTransactions([newTx, ...transactions]);
    return newTx;
  };

  const handleAddPhotoToOrder = async (orderId: string, photo: any) => {
    try {
      // We assume photo already has publicUrl, if it comes from ODSDetailModal upload
      const photoUrl = photo.photoUrl || photo.url;
      const dbPhoto = await odsService.addPhotoToOrder(orderId, photoUrl, photo.category, photo.caption);
      
      setOrders(
        orders.map((o) => (o.id === orderId ? { ...o, photos: [...o.photos, dbPhoto] } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, photos: [...selectedOrder.photos, dbPhoto] });
      }
    } catch (error) {
      console.error('Error adding photo to ODS:', error);
      alert('Hubo un error al guardar la foto en la orden.');
    }
  };

  const handleDeletePhotoFromOrder = async (orderId: string, photoId: string) => {
    try {
      await odsService.deletePhoto(photoId);
      setOrders(
        orders.map((o) => (o.id === orderId ? { ...o, photos: o.photos.filter(p => p.id !== photoId) } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, photos: selectedOrder.photos.filter(p => p.id !== photoId) });
      }
    } catch (err) {
      console.error('Failed to delete photo', err);
    }
  };

  const handleAddExtraServiceToOrder = async (orderId: string, serviceName: string, price: number) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    try {
      const inserted = await odsService.addExtraService(orderId, serviceName, price, order.subtotalAmount, order.totalAmount);
      
      const newService = {
        serviceId: inserted.id,
        serviceName,
        category: 'extra',
        unitPrice: price,
        quantity: 1,
        totalPrice: price
      };
      
      const updatedOrder = { 
        ...order, 
        services: [...order.services, newService as any],
        subtotalAmount: order.subtotalAmount + price,
        totalAmount: order.totalAmount + price
      };

      setOrders(orders.map((o) => (o.id === orderId ? updatedOrder : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updatedOrder);
      }
    } catch (err) {
      console.error('Failed to add extra service', err);
    }
  };

  const handleEditServiceInOrder = async (orderId: string, serviceId: string, serviceName: string, unitPrice: number, quantity: number) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const serviceIndex = order.services.findIndex(s => s.serviceId === serviceId);
    if (serviceIndex === -1) return;

    const oldService = order.services[serviceIndex];
    const newTotalPrice = unitPrice * quantity;
    const diff = newTotalPrice - oldService.totalPrice;

    const newSubtotal = order.subtotalAmount + diff;
    const newTotal = order.totalAmount + diff;

    try {
      await odsService.updateService(orderId, serviceId, serviceName, unitPrice, quantity, newTotalPrice, newSubtotal, newTotal);
      
      const updatedService = {
        ...oldService,
        serviceName,
        unitPrice,
        quantity,
        totalPrice: newTotalPrice
      };
      
      const updatedServices = [...order.services];
      updatedServices[serviceIndex] = updatedService;

      const updatedOrder = { 
        ...order, 
        services: updatedServices,
        subtotalAmount: newSubtotal,
        totalAmount: newTotal
      };

      setOrders(orders.map((o) => (o.id === orderId ? updatedOrder : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updatedOrder);
      }
    } catch (err) {
      console.error('Failed to edit service', err);
    }
  };

  const handleAddCustomer = async (newCust: Customer) => {
    const created = await customerService.createCustomer(newCust);
    if (created) {
      setCustomers([created, ...customers]);
    }
  };

  const handleUpdateCustomer = async (updatedCust: Customer) => {
    const success = await customerService.updateCustomer(updatedCust.id, updatedCust);
    if (success) {
      setCustomers(customers.map((c) => (c.id === updatedCust.id ? updatedCust : c)));
    }
  };

  const handleAddVehicle = async (newVeh: Vehicle) => {
    const created = await vehicleService.createVehicle(newVeh);
    if (created) {
      setVehicles([created, ...vehicles]);
    }
  };

  if (appMode === 'splash') {
    return (
      <SplashScreen 
        onEnter={() => {
          // Si el login fue exitoso en SplashScreen, la sesion se establece vía onAuthStateChange
          setAppMode('admin');
        }} 
        onTrack={(plate) => { setTrackingPlate(plate); setAppMode('tracking'); }} 
      />
    );
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-[#00E5FF] selection:text-black">
      {/* Header */}
      <div className="print:hidden">
        <Header
          currentRole={currentRole}
          onRoleChange={(r) => {
            if (userSession) {
              setUserSession({ ...userSession, role: r });
            }
          }}
          onNewODS={() => setActiveTab('ods_new' as any)}
          onSearchOpen={() => setIsSearchOpen(true)}
          userSession={userSession}
          onLogout={async () => {
            await supabase.auth.signOut();
            setShowAuthModal(false);
            setAppMode('splash');
          }}
          onOpenAuth={() => setShowAuthModal(true)}
        />
      </div>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden print:hidden">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} currentRole={currentRole} />

        {/* Dynamic View Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {activeTab === 'dashboard' && (
            <DashboardView
              orders={orders}
              transactions={transactions}
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
              servicesCatalog={servicesCatalog}
              customers={customers}
              vehicles={vehicles}
              orders={orders}
              onAddCustomer={handleAddCustomer}
              onAddVehicle={handleAddVehicle}
              branches={branches}
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
              inventoryMovements={inventoryMovements}
              onUpdateStock={handleUpdateStock}
              onDeleteProduct={handleDeleteProduct} 
            />
          )}

          {activeTab === 'cashier' && (
            <CashierView 
              orders={orders} 
              customers={customers}
            />
          )}

          {activeTab === 'treasury' && (
            <TreasuryView />
          )}

          {activeTab === 'legacy_cash' && (
            <LegacyCashView transactions={transactions} />
          )}

          {activeTab === 'customers' && (
            <CustomersView 
              customers={customers} 
              vehicles={vehicles} 
              onAddCustomer={handleAddCustomer}
              onUpdateCustomer={handleUpdateCustomer}
              onAddVehicle={handleAddVehicle}
            />
          )}

          {activeTab === 'vehicles' && <VehiclesView vehicles={vehicles} />}

          {activeTab === 'settings' && (
            <SettingsView 
              userRole={userSession?.role || currentRole}
              technicians={technicians}
              setTechnicians={setTechnicians}
              receptionAgents={receptionAgents}
              setReceptionAgents={setReceptionAgents}
              companyData={companyData}
              setCompanyData={setCompanyData}
              servicesCatalog={servicesCatalog}
              setServicesCatalog={setServicesCatalog}
              inventory={inventory}
              branches={branches}
              setBranches={setBranches}
            />
          )}
        </main>
      </div>

      {/* ODS Detail Modal */}
      <ODSDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          companyData={companyData}
          onAddPhoto={handleAddPhotoToOrder}
          onAddExtraService={handleAddExtraServiceToOrder}
          onEditService={handleEditServiceInOrder}
          onDeletePhoto={handleDeletePhotoFromOrder}
        />

      {/* Command Palette Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
          <div className="glass-card w-full max-w-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Escribe número de ODS, Placa, Cliente o Modelo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 bg-transparent text-sm text-slate-900 focus:outline-none font-mono placeholder:text-slate-400"
              />
              <button onClick={() => setIsSearchOpen(false)} className="text-slate-400 hover:text-slate-800 transition-colors">
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
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#7A1B28]/30 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#7A1B28]">{order.orderNumber}</span>
                        <span className="font-bold text-slate-800 text-xs">{order.vehicleBrandModel}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Placa: {order.vehiclePlate} | Cliente: {order.customerName}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-800">${order.totalAmount}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Login / Register Modal */}
      {(showAuthModal || !userSession) && (
        <AuthModal
          onLoginSuccess={(session) => {
            setUserSession(session);
            setShowAuthModal(false);
          }}
          onCancel={() => {
            if (userSession) setShowAuthModal(false);
          }}
        />
      )}
    </div>
  );
}

export default App;
