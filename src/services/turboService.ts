import { UserRole, ServiceOrder } from '../types';
import { odsService } from './odsService';

export interface TurboMessage {
  id: string;
  sender: 'turbo' | 'user';
  text: string;
  timestamp: string;
  isActionable?: boolean;
  actionData?: any;
}

export const turboService = {
  getWelcomeMessage(role: UserRole): string {
    switch (role) {
      case 'admin':
      case 'owner':
        return "¡Hola Jefe! Soy Turbo. Puedo darte un resumen rápido de las ODS activas o buscar vehículos por placa o número de orden.";
      case 'sales':
        return "¡Qué tal equipo de ventas! Si necesitas consultar el estado de un vehículo para un cliente, dime la placa o el número de ODS.";
      case 'polisher':
      case 'dismantler':
      case 'painter':
      case 'prep_tech':
      case 'ppf_installer':
        return "¡Hola equipo técnico! Revisa el Kanban para ver tus vehículos asignados. Si necesitas buscar una placa en específico, envíamela por aquí.";
      case 'free_reception':
        return "¡Hola Recepción! Recuerda llenar cuidadosamente el Checklist y tomar fotos al ingresar vehículos. Dime si necesitas buscar una orden.";
      default:
        return "¡Hola! Soy Turbo, tu asistente. ¿En qué te ayudo hoy?";
    }
  },

  getRoleExplanation(role: UserRole): string {
    switch (role) {
      case 'admin':
      case 'owner':
        return "Como Administrador/Dueño, tienes acceso total. Puedes ver métricas financieras, gestionar roles, ver inventario y supervisar todo el flujo de trabajo en el Kanban.";
      case 'sales':
        return "Tu rol de Ventas te permite crear órdenes, realizar cotizaciones y mantener informados a los clientes. Usa el buscador o la tabla de ODS para hacer seguimiento.";
      case 'polisher':
      case 'dismantler':
      case 'painter':
      case 'prep_tech':
      case 'ppf_installer':
        return "Como Técnico, tu panel principal es el Kanban. Allí verás los vehículos en tu área. Al terminar un proceso, arrastra la tarjeta a la siguiente columna.";
      case 'free_reception':
        return "Tu responsabilidad principal es la Recepción de vehículos. Debes crear la ODS inicial, registrar daños, pertenencias y asignar el estatus inicial.";
      default:
        return "Tu rol define a qué secciones tienes acceso en el menú lateral.";
    }
  },

  generateAlerts(orders: ServiceOrder[]): string[] {
    const alerts: string[] = [];
    
    // Check for orders stuck in waiting_parts
    const waitingParts = orders.filter(o => o.status === 'waiting_parts');
    if (waitingParts.length > 0) {
      alerts.push(`⚠️ Tienes ${waitingParts.length} vehículo(s) esperando repuestos. ¡Revisa el inventario!`);
    }

    // Check for high priority orders
    const highPriority = orders.filter(o => o.priority === 'urgente' || o.priority === 'vip');
    if (highPriority.length > 0) {
      alerts.push(`🔥 Tienes ${highPriority.length} orden(es) de ALTA prioridad en el taller.`);
    }

    return alerts;
  },

  async processUserMessage(text: string, role: UserRole, currentOrders: ServiceOrder[]): Promise<TurboMessage> {
    const lowerText = text.toLowerCase().trim();
    const timestamp = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    const createResponse = (responseText: string, actionData?: any): TurboMessage => ({
      id: Date.now().toString(),
      sender: 'turbo',
      text: responseText,
      timestamp,
      isActionable: !!actionData,
      actionData
    });

    // 1. Role explanation intent
    if (lowerText.includes('como se maneja') || lowerText.includes('mi rol') || lowerText.includes('que debo hacer') || lowerText.includes('como funciona')) {
      return createResponse(this.getRoleExplanation(role));
    }

    // 2. Alerts intent
    if (lowerText.includes('alerta') || lowerText.includes('resumen') || lowerText.includes('pendientes')) {
      const alerts = this.generateAlerts(currentOrders);
      if (alerts.length === 0) {
        return createResponse("¡Todo marcha sobre ruedas! 🏎️ No hay alertas críticas en este momento.");
      }
      return createResponse("Aquí tienes tu reporte:\n\n" + alerts.join('\n\n'));
    }

    // 3. Search intent (Plate or Order Number)
    // Basic regex for ODS format: ODS-1001 or just 1001
    const odsMatch = text.match(/(?:ODS-)?(\d{4,})/i);
    if (odsMatch) {
      const orderNumber = `ODS-${odsMatch[1]}`;
      const foundOrder = currentOrders.find(o => o.orderNumber.toUpperCase() === orderNumber.toUpperCase());
      
      if (foundOrder) {
        return createResponse(
          `Encontré la orden **${foundOrder.orderNumber}** (${foundOrder.vehiclePlate}). Actualmente está en estado: ${foundOrder.status}.`,
          { type: 'view_order', orderId: foundOrder.id, orderNumber: foundOrder.orderNumber }
        );
      }
    }

    // Regex for Plate (e.g. ABC123X, ABC-123X, 123ABCX)
    const words = text.split(/\s+/);
    for (const word of words) {
      const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      if (cleanWord.length >= 6 && cleanWord.length <= 8) {
        try {
          const dbOrder = await odsService.getTrackingByPlate(cleanWord);
          if (dbOrder) {
            return createResponse(
              `¡Listo! El vehículo con placa **${dbOrder.vehiclePlate}** pertenece a ${dbOrder.customerName}. Su estado es: ${dbOrder.status}.`,
              { type: 'view_order', orderId: dbOrder.id, orderNumber: dbOrder.orderNumber }
            );
          }
        } catch (e) {
          console.error("Error buscando placa en DB", e);
        }
      }
    }

    // 4. Default fallback
    return createResponse("Recibido. Mi red neuronal completa está en desarrollo. Puedo ayudarte con:\n• 'Mostrar alertas'\n• 'Explicar mi rol'\n• Busca un auto escribiendo su placa (ej. ABC123X) o número de orden (ej. ODS-1001).");
  }
};
