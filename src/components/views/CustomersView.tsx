import React, { useState } from 'react';
import { Customer, Vehicle } from '../../types';
import { Users, Phone, Mail, MapPin, Plus, Search, Edit3, X, CheckCircle, UserCheck, Car, Trash2, AlertTriangle } from 'lucide-react';

interface CustomersViewProps {
  customers: Customer[];
  vehicles: Vehicle[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onAddVehicle: (vehicle: Vehicle) => void;
  onDeleteCustomer: (id: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  vehicles,
  onAddCustomer,
  onUpdateCustomer,
  onAddVehicle,
  onDeleteCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

  // Vehicle Modal State
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [vehicleCustomer, setVehicleCustomer] = useState<Customer | null>(null);
  const [vehPlate, setVehPlate] = useState('');
  const [vehBrand, setVehBrand] = useState('');
  const [vehModel, setVehModel] = useState('');
  const [vehYear, setVehYear] = useState<number>(2024);
  const [vehColor, setVehColor] = useState('');
  const [vehVin, setVehVin] = useState('');

  const openAddVehicleModal = (cust: Customer) => {
    setVehicleCustomer(cust);
    setVehPlate('');
    setVehBrand('');
    setVehModel('');
    setVehYear(new Date().getFullYear());
    setVehColor('');
    setVehVin('');
    setIsVehicleModalOpen(true);
  };

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleCustomer || !vehPlate.trim() || !vehBrand.trim() || !vehModel.trim()) return;

    const newVeh: Vehicle = {
      id: `veh-${Date.now()}`,
      customerId: vehicleCustomer.id,
      plate: vehPlate.trim().toUpperCase(),
      brand: vehBrand.trim(),
      model: vehModel.trim(),
      year: vehYear,
      color: vehColor.trim() || 'Desconocido',
      vin: vehVin.trim() || undefined,
    };

    onAddVehicle(newVeh);
    setIsVehicleModalOpen(false);
    setVehicleCustomer(null);
  };

  // Form State (Customer)
  const [fullName, setFullName] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // Form State (Initial Vehicle)
  const [initialVehPlate, setInitialVehPlate] = useState('');
  const [initialVehBrand, setInitialVehBrand] = useState('');
  const [initialVehModel, setInitialVehModel] = useState('');
  const [initialVehYear, setInitialVehYear] = useState<number>(2024);
  const [initialVehColor, setInitialVehColor] = useState('');

  const openNewCustomerModal = () => {
    setEditingCustomer(null);
    setFullName('');
    setDocumentId('');
    setPhone('');
    setEmail('');
    setAddress('');
    setInitialVehPlate('');
    setInitialVehBrand('');
    setInitialVehModel('');
    setInitialVehYear(new Date().getFullYear());
    setInitialVehColor('');
    setIsModalOpen(true);
  };

  const openEditCustomerModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFullName(customer.fullName);
    setDocumentId(customer.documentId);
    setPhone(customer.phone);
    setEmail(customer.email || '');
    setAddress(customer.address || '');
    setInitialVehPlate('');
    setInitialVehBrand('');
    setInitialVehModel('');
    setInitialVehYear(new Date().getFullYear());
    setInitialVehColor('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !documentId.trim() || !phone.trim()) return;

    let targetCustId = '';

    if (editingCustomer) {
      targetCustId = editingCustomer.id;
      const updated: Customer = {
        ...editingCustomer,
        fullName: fullName.trim(),
        documentId: documentId.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
      };
      onUpdateCustomer(updated);
    } else {
      targetCustId = `cust-${Date.now()}`;
      const newCust: Customer = {
        id: targetCustId,
        fullName: fullName.trim(),
        documentId: documentId.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        createdAt: new Date().toLocaleDateString('es-ES'),
      };
      onAddCustomer(newCust);
    }

    // Auto-create vehicle if vehicle fields were filled out
    if (initialVehPlate.trim() && initialVehBrand.trim() && initialVehModel.trim()) {
      const newVeh: Vehicle = {
        id: `veh-${Date.now()}`,
        customerId: targetCustId,
        plate: initialVehPlate.trim().toUpperCase(),
        brand: initialVehBrand.trim(),
        model: initialVehModel.trim(),
        year: initialVehYear,
        color: initialVehColor.trim() || 'Desconocido',
      };
      onAddVehicle(newVeh);
    }

    closeModal();
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.documentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-slate-800 tracking-wide flex items-center gap-2">
            Directorio de Clientes <Users className="w-6 h-6 text-[#7A1B28]" />
          </h2>
          <p className="text-xs text-slate-500">Base de datos centralizada para crear, buscar y gestionar clientes.</p>
        </div>

        <button
          onClick={openNewCustomerModal}
          className="btn-primary text-xs py-2.5 px-4 flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> AGREGAR CLIENTE
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2.5 w-full max-w-md shadow-sm">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Buscar por Nombre, Cédula/RIF, Teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none outline-none text-slate-900 w-full text-sm placeholder:text-slate-400"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-xs text-slate-400 hover:text-slate-800">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Customers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full glass-card p-12 flex flex-col items-center justify-center text-center">
            <UserCheck className="w-12 h-12 text-slate-400 mb-3" />
            <h3 className="font-display text-xl text-slate-800 mb-1">No se encontraron clientes</h3>
            <p className="text-xs text-slate-500 mb-4">Intenta con otra búsqueda o crea un nuevo cliente.</p>
            <button onClick={openNewCustomerModal} className="btn-secondary text-xs py-2 px-4">
              <Plus className="w-4 h-4" /> Agregar Nuevo Cliente
            </button>
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            const custVehicles = vehicles.filter((v) => v.customerId === cust.id);
            return (
              <div key={cust.id} className="glass-card p-5 flex flex-col justify-between gap-4 group relative overflow-hidden">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-[#7A1B28] font-bold">{cust.documentId}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono">Desde {cust.createdAt}</span>
                      <button
                        onClick={() => openEditCustomerModal(cust)}
                        className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors border border-slate-200"
                        title="Modificar Cliente"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setCustomerToDelete(cust.id)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg transition-colors border border-red-200"
                        title="Eliminar Cliente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-display text-2xl text-slate-800 tracking-wide">{cust.fullName}</h3>

                  <div className="flex flex-col gap-1.5 mt-3 text-xs text-slate-600 font-mono">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{cust.phone}</span>
                    </div>
                    {cust.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{cust.email}</span>
                      </div>
                    )}
                    {cust.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{cust.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Registered Vehicles */}
                <div className="border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      Vehículos Asociados ({custVehicles.length})
                    </span>
                    <button
                      onClick={() => openAddVehicleModal(cust)}
                      className="text-[10px] font-mono font-bold text-[#7A1B28] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Agregar Auto
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {custVehicles.length === 0 ? (
                      <span className="text-[11px] text-slate-400 font-mono italic">Sin vehículos registrados</span>
                    ) : (
                      custVehicles.map((v) => (
                        <div key={v.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                          <span className="font-bold text-slate-700">{v.brand} {v.model} ({v.year})</span>
                          <span className="font-mono text-[10px] text-[#7A1B28] font-bold">{v.plate}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-card p-6 w-full max-w-md flex flex-col gap-4 border border-slate-200 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-xl text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#7A1B28]" />
                {editingCustomer ? 'MODIFICAR CLIENTE' : 'NUEVO CLIENTE'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Nombre Completo / Razón Social *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Gustavo Cisneros"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-[#7A1B28] outline-none font-medium"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">Cédula / RIF / DNI *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. V-18940293 o J-30199281-0"
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:border-[#7A1B28] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Teléfono Principal *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. +58 412-1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:border-[#7A1B28] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="cliente@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-[#7A1B28] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">Dirección de Domicilio / Fiscal</label>
                <input
                  type="text"
                  placeholder="Ej. Av. Principal Las Mercedes, Edif. Centro, Piso 4"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-[#7A1B28] outline-none"
                />
              </div>

              {/* Section: Associated Vehicle (Optional during customer creation) */}
              <div className="mt-2 pt-3 border-t border-slate-100 flex flex-col gap-3">
                <span className="font-mono text-xs font-bold text-slate-600 flex items-center gap-1.5 uppercase">
                  <Car className="w-4 h-4 text-slate-400" /> Registrar Vehículo del Cliente (Opcional)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Placa / Matrícula</label>
                    <input
                      type="text"
                      placeholder="Ej. AA991GT"
                      value={initialVehPlate}
                      onChange={(e) => setInitialVehPlate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-900 font-mono uppercase font-bold focus:border-[#7A1B28] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Año</label>
                    <input
                      type="number"
                      value={initialVehYear}
                      onChange={(e) => setInitialVehYear(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-900 font-mono focus:border-[#7A1B28] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Marca</label>
                    <input
                      type="text"
                      placeholder="Ej. Toyota"
                      value={initialVehBrand}
                      onChange={(e) => setInitialVehBrand(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-900 focus:border-[#7A1B28] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Modelo</label>
                    <input
                      type="text"
                      placeholder="Ej. Hilux GT"
                      value={initialVehModel}
                      onChange={(e) => setInitialVehModel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-900 focus:border-[#7A1B28] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Color</label>
                  <input
                    type="text"
                    placeholder="Ej. Negro Zafiro"
                    value={initialVehColor}
                    onChange={(e) => setInitialVehColor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-900 focus:border-[#7A1B28] outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-white border border-slate-300 text-slate-700 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors uppercase tracking-wider"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary py-2.5 rounded-lg text-xs justify-center flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" /> {editingCustomer ? 'GUARDAR CAMBIOS' : 'GUARDAR CLIENTE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {isVehicleModalOpen && vehicleCustomer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-card p-6 w-full max-w-md flex flex-col gap-4 border border-slate-200 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display text-xl text-slate-800 flex items-center gap-2">
                  <Car className="w-5 h-5 text-[#7A1B28]" />
                  REGISTRAR VEHÍCULO
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  Cliente: <span className="font-bold text-slate-700">{vehicleCustomer.fullName}</span>
                </p>
              </div>
              <button onClick={() => setIsVehicleModalOpen(false)} className="text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Placa / Matrícula *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. AB123CD"
                    value={vehPlate}
                    onChange={(e) => setVehPlate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono uppercase font-bold focus:border-[#7A1B28] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Año *</label>
                  <input
                    type="number"
                    required
                    value={vehYear}
                    onChange={(e) => setVehYear(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:border-[#7A1B28] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Marca *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Toyota / Porsche"
                    value={vehBrand}
                    onChange={(e) => setVehBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-[#7A1B28] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Modelo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Corolla / 911"
                    value={vehModel}
                    onChange={(e) => setVehModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-[#7A1B28] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Color</label>
                  <input
                    type="text"
                    placeholder="Ej. Negro Zafiro"
                    value={vehColor}
                    onChange={(e) => setVehColor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-[#7A1B28] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">VIN / Chasis</label>
                  <input
                    type="text"
                    placeholder="Opcional"
                    value={vehVin}
                    onChange={(e) => setVehVin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:border-[#7A1B28] outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsVehicleModalOpen(false)}
                  className="flex-1 bg-white border border-slate-300 text-slate-700 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors uppercase tracking-wider"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary py-2.5 rounded-lg text-xs justify-center flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" /> GUARDAR VEHÍCULO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-display text-slate-900 mb-2">¿Eliminar Cliente?</h3>
              <p className="text-sm text-slate-500 font-mono">Esta acción eliminará al cliente y todos sus vehículos asociados de forma permanente.</p>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setCustomerToDelete(null)}
                  className="flex-1 bg-white border border-slate-300 text-slate-700 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors uppercase tracking-wider"
                >
                  CANCELAR
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteCustomer(customerToDelete);
                    setCustomerToDelete(null);
                  }}
                  className="flex-1 bg-rose-600 text-white py-2.5 rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors uppercase tracking-wider shadow-lg shadow-rose-600/20"
                >
                  ELIMINAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
