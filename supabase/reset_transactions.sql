
-- ==========================================
-- RESET DE DATOS TRANSACCIONALES (PRODUCCIN)
-- ==========================================
-- Este script elimina TODOS los clientes, vehculos, rdenes de servicio, 
-- tickets, facturas, cobros y movimientos de caja/tesorera.
--
-- Conservar:
-- - Usuarios (profiles)
-- - Sedes (branches)
-- - Catlogo de Servicios
-- - Cuentas de Tesorera (Bancos, Efectivo, etc.)
--
-- ADVERTENCIA: ESTA ACCIN NO SE PUEDE DESHACER!

TRUNCATE TABLE 
  customers,
  vehicles,
  service_orders,
  checklist_items,
  damage_markers,
  order_photos,
  order_services,
  cash_transactions,
  cash_sessions,
  treasury_movements,
  commercial_documents,
  current_account_movements,
  collections,
  collection_payments,
  allocations,
  financial_audits
RESTART IDENTITY CASCADE;

-- Reiniciamos la secuencia de los nmeros de ODS para que empiecen de nuevo en 1001
ALTER SEQUENCE IF EXISTS ods_number_seq RESTART WITH 1001;

