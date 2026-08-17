-- Corregir el ON DELETE RESTRICT que impide eliminar ODS si tienen pagos/comprobantes asociados
ALTER TABLE commercial_documents
DROP CONSTRAINT IF EXISTS commercial_documents_order_id_fkey;

ALTER TABLE commercial_documents
ADD CONSTRAINT commercial_documents_order_id_fkey
FOREIGN KEY (order_id)
REFERENCES service_orders(id)
ON DELETE SET NULL;
