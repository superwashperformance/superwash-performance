import { Customer, Vehicle, ServiceOrder, InventoryItem, CashTransaction, UserProfile, ServiceItem, ChecklistItem } from '../types';

export const defaultChecklistItems: ChecklistItem[] = [
  { id: 'chk-1', key: 'bateria', label: 'Batería y Carga de Voltaje', condition: 'ok' },
  { id: 'chk-2', key: 'luces_internas', label: 'Luces Internas y de Ambiente', condition: 'ok' },
  { id: 'chk-3', key: 'luces_externas', label: 'Luces Externas / Faros', condition: 'ok' },
  { id: 'chk-4', key: 'luces_tablero', label: 'Indicadores de Tablero / Alertas', condition: 'ok' },
  { id: 'chk-5', key: 'aire_acondicionado', label: 'Aire Acondicionado', condition: 'ok' },
  { id: 'chk-6', key: 'bocina', label: 'Bocina / Claxon', condition: 'ok' },
  { id: 'chk-7', key: 'alfombras', label: 'Alfombras de Habitáculo', condition: 'ok' },
  { id: 'chk-8', key: 'limpiaparabrisas', label: 'Limpiaparabrisas / Plumas', condition: 'ok' },
  { id: 'chk-9', key: 'caucho_repuesto', label: 'Caucho de Repuesto', condition: 'ok' },
  { id: 'chk-10', key: 'gato_hidraulico', label: 'Gato Hidráulico', condition: 'ok' },
  { id: 'chk-11', key: 'triangulo', label: 'Triángulo de Seguridad', condition: 'ok' },
  { id: 'chk-12', key: 'estereo', label: 'Estéreo / Multimedia', condition: 'ok' },
  { id: 'chk-13', key: 'rociadores', label: 'Rociadores de Agua', condition: 'ok' },
  { id: 'chk-14', key: 'ventanas', label: 'Ventanas y Elevalunas', condition: 'ok' },
  { id: 'chk-15', key: 'parabrisas', label: 'Parabrisas Frontal y Trasero', condition: 'ok' },
  { id: 'chk-16', key: 'tuercas', label: 'Tuercas de Rines / Seguridad', condition: 'ok' },
  { id: 'chk-17', key: 'manillas', label: 'Manillas de Puertas', condition: 'ok' },
  { id: 'chk-18', key: 'puertas', label: 'Puertas y Capó', condition: 'ok' },
  { id: 'chk-19', key: 'accesorios', label: 'Accesorios Especiales / Cámaras', condition: 'ok' },
  { id: 'chk-20', key: 'otros', label: 'Otros Detalles Mecánicos / Escape', condition: 'ok' },
];

export const mockUsers: UserProfile[] = [
  { id: 'usr-1', name: 'Carlos Mendoza', email: 'admin@superwash.com', role: 'admin' },
  { id: 'usr-2', name: 'Alejandro Rivas', email: 'owner@superwash.com', role: 'owner' },
  { id: 'usr-3', name: 'Valeria Gómez', email: 'ventas@superwash.com', role: 'sales' },
  { id: 'usr-4', name: 'Jonathan Silva', email: 'pulidor@superwash.com', role: 'free_reception' },
  { id: 'usr-5', name: 'Marcos Benítez', email: 'pintor@superwash.com', role: 'free_reception' },
  { id: 'usr-6', name: 'Diego Torres', email: 'ppf@superwash.com', role: 'free_reception' },
  { id: 'usr-7', name: 'Agente Patio', email: 'recepcion@superwash.com', role: 'free_reception' },
];

export const mockServicesCatalog: ServiceItem[] = [
  { id: 'srv-1', name: 'Corrección de Pintura de 3 Pasos (Detailing Premier)', category: 'Pulitura', price: 380, estimatedHours: 12, assignedRole: 'free_reception' },
  { id: 'srv-2', name: 'Tratamiento Cerámico Graphene 9H (3 Años)', category: 'Detailing', price: 450, estimatedHours: 8, assignedRole: 'free_reception' },
  { id: 'srv-3', name: 'Instalación de PPF Carrocería Completa (Xpel Ultimate)', category: 'PPF', price: 2800, estimatedHours: 40, assignedRole: 'free_reception' },
  { id: 'srv-4', name: 'Pintura y Reparación de Parachoques Delantero', category: 'Pintura', price: 240, estimatedHours: 16, assignedRole: 'free_reception' },
  { id: 'srv-5', name: 'Latonería & Corrección de Abolladura sin Pintar (PDR)', category: 'Latonería', price: 180, estimatedHours: 6, assignedRole: 'free_reception' },
  { id: 'srv-6', name: 'Polarizado Cerámico Nano-Carbon (Parabrisas + Ventanas)', category: 'Polarizado', price: 220, estimatedHours: 4, assignedRole: 'free_reception' },
  { id: 'srv-7', name: 'Lavado Premium Interiores + Detallado Motor', category: 'Lavado Premium', price: 95, estimatedHours: 3, assignedRole: 'free_reception' },
  { id: 'srv-8', name: 'Restauración y Cristalizado de Ópticas/Faros', category: 'Reparación Menor', price: 70, estimatedHours: 2, assignedRole: 'free_reception' },
];

export const mockCustomers: Customer[] = [
  { id: 'cust-1', fullName: 'Gustavo Cisneros', documentId: 'V-14892011', phone: '+58 414-9982311', email: 'g.cisneros@gmail.com', address: 'Altamira, Caracas', createdAt: '2026-06-10' },
  { id: 'cust-2', fullName: 'Roberto Da Silva', documentId: 'V-18772349', phone: '+58 412-3321144', email: 'roberto.dasilva@outlok.com', address: 'Las Mercedes, Caracas', createdAt: '2026-06-15' },
  { id: 'cust-3', fullName: 'Sofía Fernández', documentId: 'V-20199482', phone: '+58 424-5510928', email: 'sofi.fdez@hotmail.com', address: 'La Castellana, Caracas', createdAt: '2026-07-01' },
];

export const mockVehicles: Vehicle[] = [
  { id: 'veh-1', customerId: 'cust-1', plate: 'AA991GT', brand: 'Porsche', model: '911 GT3 RS', year: 2024, color: 'Gris Nardo / Cyan Accent', vin: 'WP0ZZZ99ZLS298110' },
  { id: 'veh-2', customerId: 'cust-2', plate: 'M4COMP8', brand: 'BMW', model: 'M4 Competition', year: 2023, color: 'Negro Zafiro Metalizado', vin: 'WBS43AZ040FJ88219' },
  { id: 'veh-3', customerId: 'cust-3', plate: 'AMG63VR', brand: 'Mercedes-AMG', model: 'G63 V8 Biturbo', year: 2024, color: 'Blanco Mate Magno', vin: 'W1N4632761X390192' },
];

export const mockServiceOrders: ServiceOrder[] = [
  {
    id: 'ods-1001',
    orderNumber: 'ODS-1001',
    customerId: 'cust-1',
    customerName: 'Gustavo Cisneros',
    customerPhone: '+58 414-9982311',
    vehicleId: 'veh-1',
    vehiclePlate: 'AA991GT',
    vehicleBrandModel: 'Porsche 911 GT3 RS',
    vehicleColor: 'Gris Nardo / Cyan Accent',
    vehicleYear: 2024,
    branchName: 'Sede Principal (Las Mercedes)',
    receptionAgent: 'Valeria Gómez',
    status: 'in_progress',
    entryDate: '2026-07-24 09:30 AM',
    estimatedDelivery: '2026-07-28 04:00 PM',
    observations: 'Cliente exige extremo cuidado en alerón de carbono. Aplicar sellador térmico en rines.',
    belongingsList: ['Llave inteligente con estuche', 'Kit de primeros auxilios Porsche', 'Manual de usuario'],
    checklist: [
      { id: 'chk-1', key: 'bateria', label: 'Batería y Carga', condition: 'ok', notes: 'Estado óptimo 12.8V' },
      { id: 'chk-2', key: 'luces_internas', label: 'Luces Internas y Ambiente', condition: 'ok' },
      { id: 'chk-3', key: 'luces_externas', label: 'Luces Externas (PDLS Plus)', condition: 'ok' },
      { id: 'chk-4', key: 'luces_tablero', label: 'Indicadores de Tablero', condition: 'ok' },
      { id: 'chk-5', key: 'aire_acondicionado', label: 'Aire Acondicionado', condition: 'ok' },
      { id: 'chk-6', key: 'bocina', label: 'Bocina / Claxon', condition: 'ok' },
      { id: 'chk-7', key: 'alfombras', label: 'Alfombras de Fibra de Carbono', condition: 'ok' },
      { id: 'chk-8', key: 'limpiaparabrisas', label: 'Plumas Limpiaparabrisas', condition: 'ok' },
      { id: 'chk-9', key: 'caucho_repuesto', label: 'Caucho de Repuesto / Kit Inflado', condition: 'ok' },
      { id: 'chk-10', key: 'gato_hidraulico', label: 'Gato y Llave de Tuerca Central', condition: 'ok' },
      { id: 'chk-11', key: 'triangulo', label: 'Triángulo de Seguridad', condition: 'ok' },
      { id: 'chk-12', key: 'estereo', label: 'Estéreo / Pantalla PCM', condition: 'ok' },
      { id: 'chk-13', key: 'rociadores', label: 'Rociadores de Limpieza', condition: 'ok' },
      { id: 'chk-14', key: 'ventanas', label: 'Ventanas y Elevalunas', condition: 'ok' },
      { id: 'chk-15', key: 'parabrisas', label: 'Parabrisas Frontal', condition: 'damaged', notes: 'Piquete menor de piedra lado copiloto' },
      { id: 'chk-16', key: 'tuercas', label: 'Tuercas / Monotuerca Central', condition: 'ok' },
      { id: 'chk-17', key: 'manillas', label: 'Manillas de Puertas', condition: 'ok' },
      { id: 'chk-18', key: 'puertas', label: 'Ajuste de Puertas', condition: 'ok' },
      { id: 'chk-19', key: 'accesorios', label: 'Cámara de Reversa & Sensores', condition: 'ok' },
      { id: 'chk-20', key: 'otros', label: 'Escape Deportivo Titanio', condition: 'ok' }
    ],
    damageMarkers: [
      { id: 'dm-1', x: 28, y: 42, view: 'front', type: 'paint_chip', description: 'Piquetes leves por micro-piedras en paragolpes', severity: 'low' },
      { id: 'dm-2', x: 75, y: 60, view: 'right', type: 'scratch', description: 'Rayón micro en faldón lateral derecho', severity: 'low' }
    ],
    photos: [
      { id: 'ph-1', photoUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=800&auto=format&fit=crop', category: 'general', caption: 'Vista General de Ingreso - Frontal 3/4', createdAt: '2026-07-24 09:35 AM' },
      { id: 'ph-2', photoUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop', category: 'damage_front', caption: 'Detalle de micro-rayón en faldón', createdAt: '2026-07-24 09:37 AM' }
    ],
    services: [
      { serviceId: 'srv-1', serviceName: 'Corrección de Pintura de 3 Pasos (Detailing Premier)', category: 'Pulitura', unitPrice: 380, quantity: 1, totalPrice: 380 },
      { serviceId: 'srv-2', serviceName: 'Tratamiento Cerámico Graphene 9H (3 Años)', category: 'Detailing', unitPrice: 450, quantity: 1, totalPrice: 450 },
      { serviceId: 'srv-6', serviceName: 'Polarizado Cerámico Nano-Carbon', category: 'Polarizado', unitPrice: 220, quantity: 1, totalPrice: 220 }
    ],
    subtotalAmount: 1050,
    taxAmount: 0,
    totalAmount: 1050,
    paidAmount: 500,
    assignedStaff: [
      { id: 'usr-4', name: 'Jonathan Silva', role: 'free_reception' },
      { id: 'usr-6', name: 'Diego Torres', role: 'free_reception' }
    ],
    statusHistory: [
      { status: 'received', changedAt: '2026-07-24 09:30 AM', changedBy: 'Valeria Gómez' },
      { status: 'diagnosis', changedAt: '2026-07-24 10:15 AM', changedBy: 'Valeria Gómez' },
      { status: 'quote_approved', changedAt: '2026-07-24 11:00 AM', changedBy: 'Gustavo Cisneros (Cliente)' },
      { status: 'in_progress', changedAt: '2026-07-24 01:30 PM', changedBy: 'Jonathan Silva' }
    ]
  },
  {
    id: 'ods-1002',
    orderNumber: 'ODS-1002',
    customerId: 'cust-2',
    customerName: 'Roberto Da Silva',
    customerPhone: '+58 412-3321144',
    vehicleId: 'veh-2',
    vehiclePlate: 'M4COMP8',
    vehicleBrandModel: 'BMW M4 Competition',
    vehicleColor: 'Negro Zafiro Metalizado',
    vehicleYear: 2023,
    branchName: 'Sede Principal (Las Mercedes)',
    receptionAgent: 'Valeria Gómez',
    status: 'diagnosis',
    entryDate: '2026-07-25 10:00 AM',
    estimatedDelivery: '2026-07-29 05:00 PM',
    observations: 'Requiere pintura de parachoques delantero y corrección de pintura general.',
    belongingsList: ['Llavero M-Performance', 'Gafas de sol en guantera'],
    checklist: [
      { id: 'chk-1', key: 'bateria', label: 'Batería', condition: 'ok' },
      { id: 'chk-3', key: 'luces_externas', label: 'Luces Laser BMW', condition: 'ok' },
      { id: 'chk-15', key: 'parabrisas', label: 'Parabrisas', condition: 'ok' }
    ],
    damageMarkers: [
      { id: 'dm-10', x: 50, y: 85, view: 'front', type: 'dent', description: 'Abolladura moderada con desprendimiento de pintura en fascia inferior', severity: 'high' }
    ],
    photos: [
      { id: 'ph-10', photoUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=800&auto=format&fit=crop', category: 'general', caption: 'Ingreso BMW M4 - Vista Lateral', createdAt: '2026-07-25 10:05 AM' }
    ],
    services: [
      { serviceId: 'srv-4', serviceName: 'Pintura y Reparación de Parachoques Delantero', category: 'Pintura', unitPrice: 240, quantity: 1, totalPrice: 240 },
      { serviceId: 'srv-1', serviceName: 'Corrección de Pintura de 3 Pasos', category: 'Pulitura', unitPrice: 380, quantity: 1, totalPrice: 380 }
    ],
    subtotalAmount: 620,
    taxAmount: 0,
    totalAmount: 620,
    paidAmount: 0,
    assignedStaff: [
      { id: 'usr-5', name: 'Marcos Benítez', role: 'free_reception' }
    ],
    statusHistory: [
      { status: 'received', changedAt: '2026-07-25 10:00 AM', changedBy: 'Valeria Gómez' },
      { status: 'diagnosis', changedAt: '2026-07-25 10:45 AM', changedBy: 'Marcos Benítez' }
    ]
  },
  {
    id: 'ods-1003',
    orderNumber: 'ODS-1003',
    customerId: 'cust-3',
    customerName: 'Sofía Fernández',
    customerPhone: '+58 424-5510928',
    vehicleId: 'veh-3',
    vehiclePlate: 'AMG63VR',
    vehicleBrandModel: 'Mercedes-AMG G63 V8',
    vehicleColor: 'Blanco Mate Magno',
    vehicleYear: 2024,
    branchName: 'Sede Principal (Las Mercedes)',
    receptionAgent: 'Agente Patio',
    status: 'quality_control',
    entryDate: '2026-07-23 08:00 AM',
    estimatedDelivery: '2026-07-26 06:00 PM',
    observations: 'Instalación completa de PPF Mate especial para pintura Magno.',
    belongingsList: ['Llave con llavero AMG', 'Cargador MagSafe de consola'],
    checklist: [
      { id: 'chk-1', key: 'bateria', label: 'Batería', condition: 'ok' },
      { id: 'chk-5', key: 'aire_acondicionado', label: 'Aire Acondicionado Multi-zona', condition: 'ok' }
    ],
    damageMarkers: [],
    photos: [
      { id: 'ph-20', photoUrl: 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?q=80&w=800&auto=format&fit=crop', category: 'final', caption: 'Acabado PPF Mate Finalizado', createdAt: '2026-07-26 11:00 AM' }
    ],
    services: [
      { serviceId: 'srv-3', serviceName: 'Instalación de PPF Carrocería Completa', category: 'PPF', unitPrice: 2800, quantity: 1, totalPrice: 2800 }
    ],
    subtotalAmount: 2800,
    taxAmount: 0,
    totalAmount: 2800,
    paidAmount: 2800,
    assignedStaff: [
      { id: 'usr-6', name: 'Diego Torres', role: 'free_reception' }
    ],
    statusHistory: [
      { status: 'received', changedAt: '2026-07-23 08:00 AM', changedBy: 'Agente Patio' },
      { status: 'in_progress', changedAt: '2026-07-23 11:00 AM', changedBy: 'Diego Torres' },
      { status: 'quality_control', changedAt: '2026-07-26 11:30 AM', changedBy: 'Carlos Mendoza' }
    ]
  }
];

export const mockInventory: InventoryItem[] = [
  { id: 'inv-d1', category: 'detailing', name: 'Compuesto Pulidor de Corte Rápido Meguiar’s M110', sku: 'DET-M110-32', stock: 14, minStock: 5, unitCost: 45, unitOfMeasure: 'unidades', responsiblePerson: 'Jonathan Silva', lastUpdated: '2026-07-25' },
  { id: 'inv-d2', category: 'detailing', name: 'Recubrimiento Cerámico Graphene 9H Pro 50ml', sku: 'DET-CER-9H', stock: 6, minStock: 4, unitCost: 120, unitOfMeasure: 'unidades', responsiblePerson: 'Jonathan Silva', lastUpdated: '2026-07-26' },
  { id: 'inv-d3', category: 'detailing', name: 'Pad Microfibra de Corte 5" Menzerna', sku: 'DET-PAD-5MF', stock: 28, minStock: 10, unitCost: 12, unitOfMeasure: 'unidades', responsiblePerson: 'Jonathan Silva', lastUpdated: '2026-07-20' },
  { id: 'inv-d4', category: 'detailing', name: 'Shampoo Neutro de Espuma Activa Koch Chemie GS', sku: 'DET-SHAMP-5L', stock: 3, minStock: 5, unitCost: 65, unitOfMeasure: 'galones', responsiblePerson: 'Jonathan Silva', lastUpdated: '2026-07-26' },
  { id: 'inv-d5', category: 'detailing', name: 'Película PPF Xpel Ultimate Plus 1.52m x 15m', sku: 'DET-PPF-XPEL', stock: 2, minStock: 1, unitCost: 1400, unitOfMeasure: 'kits', responsiblePerson: 'Diego Torres', lastUpdated: '2026-07-22' },

  { id: 'inv-p1', category: 'paint', name: 'Barniz Transparente Alto Sólidos Glasurit 923-255', sku: 'PNT-GLAS-BS', stock: 18, minStock: 6, unitCost: 85, unitOfMeasure: 'litros', responsiblePerson: 'Marcos Benítez', lastUpdated: '2026-07-24' },
  { id: 'inv-p2', category: 'paint', name: 'Catalizador Estándar Glasurit 929-93', sku: 'PNT-GLAS-CAT', stock: 10, minStock: 4, unitCost: 40, unitOfMeasure: 'litros', responsiblePerson: 'Marcos Benítez', lastUpdated: '2026-07-24' },
];

export const mockTransactions: CashTransaction[] = [];

export const mockReceptionAgents = [
  { id: 'recep-1', name: 'Luis Fern�ndez' },
  { id: 'recep-2', name: 'Mar�a Gonz�lez' },
  { id: 'recep-3', name: 'Pedro Castillo' },
];

export const initialTechnicians = [
  { id: 'agent-1', name: 'Carlos Rodríguez', role: 'Detailing & Cerámica', avatar: 'CR' },
  { id: 'agent-2', name: 'Miguel Herrera', role: 'Pintura & Latonería', avatar: 'MH' },
  { id: 'agent-3', name: 'Andrés López', role: 'PPF & Vinilo', avatar: 'AL' },
  { id: 'agent-4', name: 'José Martínez', role: 'Pulimento & Corrección', avatar: 'JM' },
  { id: 'agent-5', name: 'Luis Fernández', role: 'Recepción & Coordinación', avatar: 'LF' },
];

export const initialReceptionAgents = [
  { id: 'recep-1', name: 'Luis Fernández' },
  { id: 'recep-2', name: 'María González' },
  { id: 'recep-3', name: 'Pedro Castillo' },
];

import { InventoryMovement } from '../types';

export const mockInventoryMovements: InventoryMovement[] = [
  { id: 'mov-1', itemId: 'inv-d1', itemName: 'Koch Chemie H9.01 Heavy Cut', type: 'in', quantity: 5, date: '2026-07-20 09:00 AM', reason: 'Compra a proveedor local', responsiblePerson: 'Jonathan Silva' },
  { id: 'mov-2', itemId: 'inv-d1', itemName: 'Koch Chemie H9.01 Heavy Cut', type: 'out', quantity: 1, date: '2026-07-24 10:30 AM', reason: 'Consumo en ODS-1001', responsiblePerson: 'Carlos Rodríguez' },
  { id: 'mov-3', itemId: 'inv-p4', itemName: 'Masa/Masilla Poliéster Ultraligera 3M Platinum', type: 'out', quantity: 2, date: '2026-07-25 02:15 PM', reason: 'Consumo en ODS-1002 (Parachoques)', responsiblePerson: 'Miguel Herrera' },
  { id: 'mov-4', itemId: 'inv-d3', itemName: 'CarPro CQUARTZ UK 3.0 (Kit 50ml)', type: 'in', quantity: 10, date: '2026-07-28 11:00 AM', reason: 'Reposición de stock crítico', responsiblePerson: 'Administrador' },
  { id: 'mov-5', itemId: 'inv-d3', itemName: 'CarPro CQUARTZ UK 3.0 (Kit 50ml)', type: 'out', quantity: 1, date: '2026-07-29 09:30 AM', reason: 'Consumo en ODS-1003', responsiblePerson: 'Carlos Rodríguez' },
  { id: 'mov-6', itemId: 'inv-p2', itemName: 'Catalizador Estándar Glasurit 929-93', type: 'adjustment', quantity: -1, date: '2026-08-01 04:00 PM', reason: 'Lata derramada en taller', responsiblePerson: 'Marcos Benítez' },
];
