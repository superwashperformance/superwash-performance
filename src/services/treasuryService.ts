import { supabase } from '../lib/supabase';
import { CashSession, TreasuryAccount, TreasuryMovement, Collection, CurrentAccountMovement } from '../types';

/**
 * Generates a unique UUID v4 for idempotency keys.
 */
function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

export const treasuryService = {
  // -------------------------------------------------------------------------
  // CAJA (Cajero / Manager)
  // -------------------------------------------------------------------------

  /**
   * Retrieves the active cash session for the current user.
   */
  async getActiveSession(): Promise<CashSession | null> {
    const { data: userResponse, error: authError } = await supabase.auth.getUser();
    if (authError || !userResponse?.user) {
      // In local mock mode or if not fully logged in via Supabase Auth yet:
      // Try fetching by role or just the first open session for simplicity in this demo.
      const { data, error } = await supabase
        .from('cash_sessions')
        .select('*')
        .in('status', ['open', 'counting'])
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as CashSession | null;
    }

    // Real fetch for authenticated user
    const { data, error } = await supabase
      .from('cash_sessions')
      .select('*')
      .eq('opened_by', userResponse.user.id)
      .in('status', ['open', 'counting'])
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching active session:', error);
      throw error;
    }

    return data as CashSession | null;
  },

  /**
   * Opens a new cash session.
   */
  async openCashSession(idempotencyKey = generateIdempotencyKey()): Promise<string> {
    const { data, error } = await supabase.rpc('rpc_open_cash_session', {
      p_idempotency_key: idempotencyKey,
    });

    if (error) {
      console.error('Error opening cash session:', error);
      throw error;
    }

    return data as string; // returns UUID of the session
  },

  async closeCashSession(sessionId: string, declaredAmounts: Record<string, number>, idempotencyKey = generateIdempotencyKey()): Promise<boolean> {
    const { data, error } = await supabase.rpc('rpc_close_cash_session', {
      p_session_id: sessionId,
      p_declared_amounts: declaredAmounts,
      p_idempotency_key: idempotencyKey,
    });

    if (error) {
      console.error('Error closing cash session:', error);
      throw error;
    }

    return data as boolean;
  },

  /**
   * Fetch all movements for a specific session to show in the Cashier UI
   */
  async getSessionMovements(sessionId: string): Promise<(TreasuryMovement & { customerName?: string, userName?: string })[]> {
    const { data: movements, error } = await supabase
      .from('treasury_movements')
      .select(`
        *,
        treasury_accounts (name)
      `)
      .eq('cash_session_id', sessionId)
      .eq('status', 'valid')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!movements || movements.length === 0) return [];

    // Get collection IDs to fetch customer info
    const collectionIds = movements
      .filter(m => m.source_type === 'collection' && m.source_id)
      .map(m => m.source_id);

    let customersMap: Record<string, string> = {};
    if (collectionIds.length > 0) {
      const { data: collections } = await supabase
        .from('collections')
        .select(`
          id,
          customers (
            id,
            full_name,
            document_id
          )
        `)
        .in('id', collectionIds);
        
      if (collections) {
        collections.forEach((c: any) => {
          const cust = Array.isArray(c.customers) ? c.customers[0] : c.customers;
          if (cust) {
            customersMap[c.id] = cust.full_name || 'Cliente';
          }
        });
      }
    }

    // Try to get user email (only works if we have permission to view profiles)
    let usersMap: Record<string, string> = {};
    const userIds = [...new Set(movements.map(m => m.created_by))];
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);
      if (profiles) {
        profiles.forEach(p => {
          usersMap[p.id] = p.email || 'Cajero';
        });
      }
    }

    return movements.map(m => ({
      ...m,
      customerName: m.source_type === 'collection' && m.source_id ? customersMap[m.source_id] || 'Cliente' : '-',
      userName: usersMap[m.created_by] || 'Usuario'
    }));
  },

  // -------------------------------------------------------------------------
  // COBRANZAS (Cajero / Manager)
  // -------------------------------------------------------------------------

  /**
   * Processes a CONTADO sale (B001). Registers money in Cash. No debt.
   */
  async processContadoSale(
    customerId: string,
    orderId: string | null,
    amount: number,
    payments: { account_id: string; amount: number; method: string }[],
    idempotencyKey = generateIdempotencyKey()
  ): Promise<string> {
    const { data, error } = await supabase.rpc('rpc_process_contado_sale', {
      p_customer_id: customerId,
      p_order_id: orderId,
      p_total: amount,
      p_payments: payments,
      p_idempotency_key: idempotencyKey,
    });

    if (error) {
      console.error('Error processing contado sale:', error);
      throw error;
    }
    return data as string;
  },

  /**
   * Processes a CUENTA CORRIENTE sale (CC002). Registers debt. No Cash.
   */
  async processCreditSale(
    customerId: string,
    orderId: string | null,
    amount: number,
    idempotencyKey = generateIdempotencyKey()
  ): Promise<string> {
    const { data, error } = await supabase.rpc('rpc_process_credit_sale', {
      p_customer_id: customerId,
      p_order_id: orderId,
      p_total: amount,
      p_idempotency_key: idempotencyKey,
    });

    if (error) {
      console.error('Error processing credit sale:', error);
      throw error;
    }
    return data as string;
  },

  /**
   * Processes a collection (payment) from a customer for a debt (REC004).
   * This credits their Current Account and registers Treasury Movements.
   */
  async processCollectionReceipt(
    documentId: string,
    amount: number,
    payments: { account_id: string; amount: number; method: string }[],
    idempotencyKey = generateIdempotencyKey()
  ): Promise<string> {
    const { data, error } = await supabase.rpc('rpc_process_collection_receipt', {
      p_document_id: documentId,
      p_total: amount,
      p_payments: payments,
      p_idempotency_key: idempotencyKey,
    });

    if (error) {
      console.error('Error processing collection receipt:', error);
      throw error;
    }

    return data as string; // Returns collection UUID
  },

  /**
   * Creates a credit note (NC003) to reverse/adjust a document.
   */
  async createCreditNote(
    originalDocId: string,
    amount: number,
    refunds: { account_id: string; amount: number; method: string }[] = [],
    idempotencyKey = generateIdempotencyKey()
  ): Promise<string> {
    const { data, error } = await supabase.rpc('rpc_create_credit_note', {
      p_original_doc_id: originalDocId,
      p_amount: amount,
      p_refunds: refunds,
      p_idempotency_key: idempotencyKey,
    });

    if (error) {
      console.error('Error creating credit note:', error);
      throw error;
    }

    return data as string;
  },

  /**
   * Annuls a collection.
   */
  async annulCollection(collectionId: string, reason: string, idempotencyKey = generateIdempotencyKey()): Promise<boolean> {
    const { data, error } = await supabase.rpc('rpc_annul_collection', {
      p_collection_id: collectionId,
      p_reason: reason,
      p_idempotency_key: idempotencyKey,
    });

    if (error) {
      console.error('Error annulling collection:', error);
      throw error;
    }

    return data as boolean;
  },

  // -------------------------------------------------------------------------
  // CUENTA CORRIENTE (Manager / Admin)
  // -------------------------------------------------------------------------

  /**
   * Allocates a credit (e.g. from a collection) to cover debts (commercial documents).
   */
  async allocateFunds(creditMovementId: string, debits: { debit_id: string; amount: number }[], idempotencyKey = generateIdempotencyKey()): Promise<boolean> {
    const { data, error } = await supabase.rpc('rpc_allocate_funds', {
      p_credit_id: creditMovementId,
      p_debits: debits,
      p_idempotency_key: idempotencyKey,
    });

    if (error) {
      console.error('Error allocating funds:', error);
      throw error;
    }

    return data as boolean;
  },

  /**
   * Gets current account balance and active movements for a customer.
   */
  async getCustomerAccount(customerId: string): Promise<CurrentAccountMovement[]> {
    const { data, error } = await supabase
      .from('current_account_movements')
      .select('*')
      .eq('customer_id', customerId)
      .eq('status', 'valid')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data as CurrentAccountMovement[];
  },

  /**
   * Obtiene la lista de clientes que tienen saldo deudor (deuda > 0)
   * basado en la nueva estructura de commercial_documents.
   */
  async getCustomersWithDebt(): Promise<{ customer: any, debt: number, pendingInvoices: any[] }[]> {
    const { data: docs, error: docsError } = await supabase
      .from('commercial_documents')
      .select('*, customers(*)')
      .eq('payment_condition', 'CUENTA_CORRIENTE');
      
    if (docsError) throw docsError;
    
    const customersMap: Record<string, { customer: any, debt: number, pendingInvoices: any[] }> = {};
    
    for (const doc of docs) {
      const balance = Number(doc.total_amount) - Number(doc.paid_amount || 0) - Number(doc.annulled_amount || 0);
      if (balance > 0) {
        const custId = doc.customer_id;
        if (!customersMap[custId]) {
          const c = Array.isArray(doc.customers) ? doc.customers[0] : doc.customers;
          customersMap[custId] = { customer: c, debt: 0, pendingInvoices: [] };
        }
        customersMap[custId].debt += balance;
        customersMap[custId].pendingInvoices.push({
          ...doc,
          balance
        });
      }
    }
    
    return Object.values(customersMap);
  },

  /**
   * Obtiene todos los documentos comerciales (Facturas, Tickets, Notas de Crédito)
   */
  async getCommercialDocuments(): Promise<any[]> {
    const { data, error } = await supabase
      .from('commercial_documents')
      .select('*, customers(fullName, documentId)')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  },

  /**
   * Obtiene los pagos realizados sobre un documento (para sugerir reembolsos en NC)
   */
  async getDocumentPayments(docId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('treasury_movements')
      .select('*, treasury_accounts(name)')
      .eq('source_type', 'commercial_document')
      .eq('source_id', docId)
      .eq('type', 'income');
      
    if (error) throw error;
    return data;
  },

  // -------------------------------------------------------------------------
  // TESORERÍA (Manager)
  // -------------------------------------------------------------------------

  /**
   * Gets all treasury accounts (Cajas and Bancos)
   */
  async getTreasuryAccounts(): Promise<TreasuryAccount[]> {
    const { data, error } = await supabase
      .from('treasury_accounts')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data as TreasuryAccount[];
  },

  /**
   * Internal transfer between treasury accounts.
   */
  async internalTransfer(
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    method: string,
    sessionId?: string,
    idempotencyKey = generateIdempotencyKey()
  ): Promise<string> {
    const { data, error } = await supabase.rpc('rpc_internal_transfer', {
      p_from_account_id: fromAccountId,
      p_to_account_id: toAccountId,
      p_amount: amount,
      p_method: method,
      p_session_id: sessionId || null,
      p_idempotency_key: idempotencyKey,
    });

    if (error) throw error;
    return data as string; // UUID of out movement
  },

  /**
   * Fetch Treasury movements for reporting.
   */
  async getTreasuryMovements(limit = 100): Promise<TreasuryMovement[]> {
    const { data, error } = await supabase
      .from('treasury_movements')
      .select(`
        *,
        treasury_accounts (name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as any;
  }
};
