-- =================================================================================
-- FASE 2 - PRUEBAS DE CALIDAD (QA SQL)
-- =================================================================================
-- Estas pruebas están diseñadas para ejecutarse manualmente en el editor SQL
-- de Supabase, sustituyendo UUIDs por valores reales existentes.

-- ---------------------------------------------------------------------------------
-- TEST 1: ABRIR CAJA CORRECTAMENTE
-- ---------------------------------------------------------------------------------
-- select rpc_open_cash_session(gen_random_uuid());

-- ---------------------------------------------------------------------------------
-- TEST 2: INTENTAR ABRIR SEGUNDA CAJA (Debe fallar)
-- ---------------------------------------------------------------------------------
-- select rpc_open_cash_session(gen_random_uuid());

-- ---------------------------------------------------------------------------------
-- TEST 3: COBRANZA $1000 (Efectivo $300, Zelle $700)
-- ---------------------------------------------------------------------------------
-- select rpc_process_collection(
--     'ID_DEL_CLIENTE'::uuid, 
--     1000.00, 
--     '[{"account_id": "ID_CUENTA_EFECTIVO", "amount": 300, "method": "cash"}, {"account_id": "ID_CUENTA_ZELLE", "amount": 700, "method": "transfer"}]'::jsonb, 
--     gen_random_uuid()
-- );

-- ---------------------------------------------------------------------------------
-- TEST 4: COBRANZA DESCUADRADA (Debe hacer rollback completo)
-- ---------------------------------------------------------------------------------
-- select rpc_process_collection(
--     'ID_DEL_CLIENTE'::uuid, 
--     1000.00, 
--     '[{"account_id": "ID_CUENTA_EFECTIVO", "amount": 300, "method": "cash"}, {"account_id": "ID_CUENTA_ZELLE", "amount": 600, "method": "transfer"}]'::jsonb, 
--     gen_random_uuid()
-- );

-- ---------------------------------------------------------------------------------
-- TEST 5: IDEMPOTENCIA
-- ---------------------------------------------------------------------------------
-- select rpc_process_collection('ID_DEL_CLIENTE'::uuid, 1000.00, '[...]'::jsonb, 'UUID_DUPLICADO'::uuid);
-- (Ejecutar varias veces, la segunda devolverá el mismo ID sin insertar nada extra).

-- ---------------------------------------------------------------------------------
-- TEST 6: IMPUTAR (ALLOCATE)
-- ---------------------------------------------------------------------------------
-- select rpc_allocate_funds(
--     'ID_DEL_CREDITO'::uuid, 
--     '[{"debit_id": "ID_DEL_DEBITO_1", "amount": 600}, {"debit_id": "ID_DEL_DEBITO_2", "amount": 400}]'::jsonb,
--     gen_random_uuid()
-- );

-- ---------------------------------------------------------------------------------
-- TEST 7: INTENTAR SOBREIMPUTAR $1100 (Debe fallar)
-- ---------------------------------------------------------------------------------
-- select rpc_allocate_funds(
--     'ID_DEL_CREDITO'::uuid, 
--     '[{"debit_id": "ID_DEL_DEBITO_1", "amount": 1100}]'::jsonb,
--     gen_random_uuid()
-- );

-- ---------------------------------------------------------------------------------
-- TEST 8: TRANSFERENCIA INTERNA
-- ---------------------------------------------------------------------------------
-- select rpc_internal_transfer(
--     'ID_CUENTA_EFECTIVO'::uuid, 
--     'ID_CUENTA_BANCO'::uuid, 
--     500.00, 
--     'transfer'::payment_method_enum,
--     'ID_SESION'::uuid,
--     gen_random_uuid()
-- );

-- ---------------------------------------------------------------------------------
-- TEST 9: ANULAR COBRANZA
-- ---------------------------------------------------------------------------------
-- select rpc_annul_collection('ID_DE_LA_COBRANZA'::uuid, 'Error de digitación', gen_random_uuid());

-- ---------------------------------------------------------------------------------
-- TEST 10: CERRAR CAJA
-- ---------------------------------------------------------------------------------
-- select rpc_close_cash_session('ID_SESION'::uuid, '{"expected_cash": 300}'::jsonb, gen_random_uuid());

-- ---------------------------------------------------------------------------------
-- TEST 11: RLS (Debe ser rechazado si se ejecuta desde cliente sin RPC)
-- ---------------------------------------------------------------------------------
-- (Ejecutar simulando autenticación frontend o desde cliente REST API directamente a la tabla)
-- INSERT INTO treasury_movements (treasury_account_id, type, amount, source_type) 
-- VALUES ('ID', 'income', 100, 'collection'); 
-- -> Fallará porque no hay política INSERT.

-- ---------------------------------------------------------------------------------
-- TEST 12: ANULACIÓN INDEPENDIENTE DE COBRANZAS GEMELAS (TEST 20 en la solicitud)
-- ---------------------------------------------------------------------------------
-- 1. Crear dos cobranzas idénticas en el mismo segundo exacto para el mismo cliente:
-- select rpc_process_collection('CLIENTE_ID'::uuid, 500, '[{"account_id":"EFECTIVO_ID", "amount":500, "method":"cash"}]', gen_random_uuid());
-- select rpc_process_collection('CLIENTE_ID'::uuid, 500, '[{"account_id":"EFECTIVO_ID", "amount":500, "method":"cash"}]', gen_random_uuid());
-- 2. Anular SÓLO UNA de ellas:
-- select rpc_annul_collection('ID_DE_COBRANZA_1'::uuid, 'Prueba de anulación gemela', gen_random_uuid());
-- 3. Verificar que current_account_movements tenga 1 anulada y 1 válida. No deben confundirse.

-- ---------------------------------------------------------------------------------
-- TEST 13 & 14: ALLOCATION IDEMPOTENTE Y CONCURRENTE
-- ---------------------------------------------------------------------------------
-- 1. Ejecutar: select rpc_allocate_funds('CREDITO_ID', '[{"debit_id":"DEBITO_ID", "amount":100}]', 'IDEMPOTENCY_KEY_1');
-- 2. Ejecutar EXACATAMENTE la misma consulta de nuevo (retry).
-- 3. Verificar: `select count(*) from allocations where idempotency_key = 'IDEMPOTENCY_KEY_1'` debe ser 1.
-- 4. Para concurrencia: Enviar ambos requests al mismo tiempo desde dos conexiones (o hilos). El UNIQUE index en allocations lanzará un constraint error en el perdedor, o el PERFORM 1 en la función retornará TRUE prematuramente sin duplicar, y la concurrencia en current_account_movements (SELECT FOR UPDATE) evita sobreimputar si fuesen llaves distintas.

-- ---------------------------------------------------------------------------------
-- TEST 15 & 16: APERTURA IDEMPOTENTE Y CONCURRENTE
-- ---------------------------------------------------------------------------------
-- 1. Ejecutar: select rpc_open_cash_session('IDEMPOTENCY_KEY_2');
-- 2. Ejecutar nuevamente (retry): Debe devolver la misma sesión sin error.
-- 3. Concurrencia: Si se envían 2 requests con la misma key simultáneos, el UNIQUE index `idx_cash_sessions_idempotency` o `idx_one_open_session_per_user` protegen contra duplicación, levantando un error limpio o reaccionando a la transacción perdedora.

-- ---------------------------------------------------------------------------------
-- TEST 17: CIERRE IDEMPOTENTE
-- ---------------------------------------------------------------------------------
-- 1. Cerrar caja: select rpc_close_cash_session('SESION_ID', '{}', 'IDEMPOTENCY_KEY_3');
-- 2. Repetir: select rpc_close_cash_session('SESION_ID', '{}', 'IDEMPOTENCY_KEY_3');
-- 3. Resultado: Debe retornar TRUE silenciosamente gracias a la consulta a `financial_audits`.

-- ---------------------------------------------------------------------------------
-- TEST 18 & 19: ANULACIÓN IDEMPOTENTE Y CONCURRENTE
-- ---------------------------------------------------------------------------------
-- 1. Anular: select rpc_annul_collection('COBRANZA_ID', 'Motivo', 'IDEMPOTENCY_KEY_4');
-- 2. Repetir: select rpc_annul_collection('COBRANZA_ID', 'Motivo', 'IDEMPOTENCY_KEY_4');
-- 3. Resultado: Debe retornar TRUE silenciosamente consultando `financial_audits`, sin duplicar contra-asientos.
-- 4. Concurrencia: El lock `FOR UPDATE` sobre `collections` asegura que si 2 hilos envían peticiones diferentes para anular la misma, el segundo fallará ordenadamente diciendo 'La cobranza ya se encuentra anulada'.


