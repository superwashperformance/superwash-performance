// Super Wash Performance - Enterprise Type Definitions

export type UserRole =
  | 'admin'
  | 'owner'
  | 'sales'
  | 'cashier'
  | 'manager'
  | 'free_reception';

export type ODSStatus =
  | 'received'
  | 'diagnosis'
  | 'quote_sent'
  | 'quote_approved'
  | 'in_progress'
  | 'waiting_parts'
  | 'quality_control'
  | 'completed'
  | 'delivered'
  | 'archived';

export type ItemCondition = 'ok' | 'damaged' | 'missing' | 'observation';

export type InventoryCategory = 'detailing' | 'paint';

export interface Customer {
  id: string;
  fullName: string;
  documentId: string; // Cédula / RIF / DNI
  phone: string;
  email?: string;
  address?: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  customerId: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  vin?: string;
  mileage?: string;
  lastVisit?: string;
  lastService?: string;
}

export interface ChecklistItem {
  id: string;
  key: string;
  label: string;
  condition: ItemCondition;
  notes?: string;
}

export interface DamageMarker {
  id: string;
  x: number; // Percentage X on vehicle diagram
  y: number; // Percentage Y on vehicle diagram
  view: 'front' | 'rear' | 'left' | 'right' | 'top';
  type: 'scratch' | 'dent' | 'paint_chip' | 'crack' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface OrderPhoto {
  id: string;
  photoUrl: string;
  category: 'general' | 'damage' | 'damage_front' | 'damage_rear' | 'damage_left' | 'damage_right' | 'belonging' | 'progress' | 'final';
  caption: string;
  createdAt: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: 'Detailing' | 'Pulitura' | 'Pintura' | 'Latonería' | 'PPF' | 'Polarizado' | 'Lavado Premium' | 'Reparación Menor';
  price: number;
  estimatedHours: number;
  assignedRole: UserRole;
}

export interface PresupuestoServiceItem {
  serviceId: string;
  serviceName: string;
  category: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}


export interface ServiceOrder {
  id: string;
  orderNumber: string; // e.g. ODS-1008
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerDocumentId?: string;
  clientSignature?: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleBrandModel: string;
  vehicleColor: string;
  vehicleYear: number;
  branchId?: string; // ID de la sede en la BD
  branchName?: string; // Nombre de la sede para visualización
  receptionAgent: string;
  assignedTechnician?: string;  // Técnico responsable del trabajo
  priority?: 'normal' | 'urgente' | 'vip';  // Nivel de prioridad
  status: ODSStatus;
  entryDate: string;
  estimatedDelivery?: string;
  observations?: string;
  belongingsList: string[];
  checklist: ChecklistItem[];
  damageMarkers: DamageMarker[];
  photos: OrderPhoto[];
  services: PresupuestoServiceItem[];
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  assignedStaff?: {
    id: string;
    name: string;
    role: UserRole;
  }[];
  statusHistory: {
    status: ODSStatus;
    changedAt: string;
    changedBy: string;
  }[];
}

export interface InventoryItem {
  id: string;
  category: InventoryCategory;
  name: string;
  sku: string;
  stock: number;
  minStock: number;
  unitCost: number;
  unitOfMeasure: 'ml' | 'litros' | 'unidades' | 'gramos' | 'kits' | 'galones';
  responsiblePerson: string;
  lastUpdated: string;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  date: string;
  reason: string;
  responsiblePerson: string;
}

export interface CashTransaction {
  id: string;
  orderId?: string;
  orderNumber?: string;
  customerName: string;
  amount: number;
  type: 'payment' | 'deposit' | 'refund' | 'expense';
  paymentMethod: 'efectivo' | 'zelle' | 'pago_movil' | 'tarjeta' | 'transferencia';
  paymentCondition?: 'contado' | 'cuenta_corriente';
  referenceNumber?: string;
  date: string;
  notes: string;
  receivedBy: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  specialties?: string[];
  is_active?: boolean;
}

export interface CompanyData {
  name: string;
  documentId: string;
  address: string;
  phone: string;
  email: string;
}

// ---------------------------------------------------------------------------------
// Módulo Financiero (Fase 1 / Fase 2)
// ---------------------------------------------------------------------------------

export type PaymentMethodEnum = 'efectivo' | 'transferencia' | 'tarjeta' | 'zelle' | 'pago_movil' | 'binance';
export type MovementStatus = 'valid' | 'annulled';
export type CashSessionStatus = 'open' | 'counting' | 'closed' | 'reconciled';

export interface TreasuryAccount {
  id: string;
  name: string;
  type: 'cash' | 'bank_account' | 'digital_wallet' | 'other';
  currency: string;
  balance: number;
  is_active: boolean;
}

export interface CashSession {
  id: string;
  opened_by: string;
  status: CashSessionStatus;
  opened_at: string;
  closed_at?: string;
  expected_amounts?: Record<string, number>;
  declared_amounts?: Record<string, number>;
  differences?: Record<string, number>;
}

export interface TreasuryMovement {
  id: string;
  treasury_account_id: string;
  cash_session_id?: string;
  type: 'income' | 'expense' | 'internal_transfer_in' | 'internal_transfer_out';
  amount: number;
  payment_method: PaymentMethodEnum;
  source_type: 'collection' | 'payment' | 'internal_transfer' | 'manual' | 'annulment';
  source_id?: string;
  status: MovementStatus;
  reversal_for_id?: string;
  created_by: string;
  created_at: string;
}

export interface Collection {
  id: string;
  customer_id: string;
  total_amount: number;
  status: MovementStatus;
  created_by: string;
  created_at: string;
}

export interface CollectionPayment {
  id: string;
  collection_id: string;
  treasury_movement_id: string;
  amount: number;
}

export interface CurrentAccountMovement {
  id: string;
  customer_id: string;
  type: 'debit' | 'credit';
  amount: number;
  source_type: 'commercial_document' | 'collection' | 'manual';
  source_id?: string;
  status: MovementStatus;
  reversal_for_id?: string;
  created_at: string;
}

export interface Allocation {
  id: string;
  debit_movement_id: string;
  credit_movement_id: string;
  amount: number;
  status: MovementStatus;
  created_at: string;
}
