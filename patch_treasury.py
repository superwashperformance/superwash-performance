import re

with open("src/components/views/TreasuryView.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update imports
content = content.replace(
    "import { TreasuryAccount, TreasuryMovement, CashSession } from '../../types';",
    "import { TreasuryAccount, TreasuryMovement, CashSession, Customer, CurrentAccountMovement } from '../../types';"
)
content = content.replace(
    "import { treasuryService } from '../../services/treasuryService';",
    "import { treasuryService } from '../../services/treasuryService';\nimport { customerService } from '../../services/customerService';"
)

# 2. Add state
state_code = """
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [ccMovements, setCcMovements] = useState<CurrentAccountMovement[]>([]);
"""
content = content.replace(
    "const [documents, setDocuments] = useState<any[]>([]);",
    "const [documents, setDocuments] = useState<any[]>([]);" + state_code
)

# 3. Modify fetchData
fetchData_old = """      const [accs, movs, debts, docs, sessions] = await Promise.all([
        treasuryService.getTreasuryAccounts(),
        treasuryService.getTreasuryMovements(100),
        treasuryService.getCustomersWithDebt(),
        treasuryService.getCommercialDocuments(),
        treasuryService.getAllCashSessions(50)
      ]);
      setAccounts(accs || []);
      setMovements(movs || []);
      setDebtors(debts || []);
      setDocuments(docs || []);
      setCashSessions(sessions || []);"""

fetchData_new = """      const [accs, movs, debts, docs, sessions, custs] = await Promise.all([
        treasuryService.getTreasuryAccounts(),
        treasuryService.getTreasuryMovements(100),
        treasuryService.getCustomersWithDebt(),
        treasuryService.getCommercialDocuments(),
        treasuryService.getAllCashSessions(50),
        customerService.getCustomers()
      ]);
      setAccounts(accs || []);
      setMovements(movs || []);
      setDebtors(debts || []);
      setDocuments(docs || []);
      setCashSessions(sessions || []);
      setCustomers(custs || []);"""

content = content.replace(fetchData_old, fetchData_new)

# 4. Add useEffect for selectedCustomerId
effect_code = """
  useEffect(() => {
    if (selectedCustomerId) {
      treasuryService.getCustomerAccount(selectedCustomerId).then(setCcMovements).catch(console.error);
    } else {
      setCcMovements([]);
    }
  }, [selectedCustomerId]);
"""
content = content.replace("useEffect(() => {\n    fetchData();\n  }, []);", "useEffect(() => {\n    fetchData();\n  }, []);\n" + effect_code)

# 5. Redesign cc tab
cc_tab_old = """      {activeTab === 'cc' && (
        <div className="glass-card p-0 overflow-hidden animate-fade-in border-slate-200">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 font-display text-sm tracking-wider uppercase text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-4">CLIENTE</th>
                <th className="p-4">DOCUMENTO (CC002)</th>
                <th className="p-4 text-right">SALDO PENDIENTE</th>
                <th className="p-4 text-center">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {debtors.flatMap(d => d.pendingInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-900">
                    {d.customer?.full_name || d.customer?.fullName || 'Cliente'}
                  </td>
                  <td className="p-4 font-mono text-xs text-slate-500 flex flex-col">
                    <span className="font-bold text-slate-700">{inv.document_number}</span>
                    <span>Total Orig: ${inv.total_amount}</span>
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-rose-700">
                    <CurrencyDisplay amount={inv.balance} size="md" />
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => openCollectionModal(inv.id, inv.balance)}
                      disabled={isProcessing}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase disabled:opacity-50"
                    >
                      Cobrar a Ticket
                    </button>
                  </td>
                </tr>
              )))}
              {debtors.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    No hay tickets de cuenta corriente pendientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}"""

cc_tab_new = """      {activeTab === 'cc' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="glass-card p-4 border-slate-200 flex flex-col sm:flex-row items-center gap-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Seleccionar Cliente:</label>
            <select 
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-900 font-bold focus:border-[#7A1B28] focus:ring-1 focus:ring-[#7A1B28] outline-none"
            >
              <option value="">-- Todos los deudores --</option>
              {customers.map(c => (
                 <option key={c.id} value={c.id}>{c.full_name || c.fullName || 'Sin nombre'} - {c.document_id || c.documentId || ''}</option>
              ))}
            </select>
          </div>

          {!selectedCustomerId ? (
            <div className="glass-card p-0 overflow-hidden border-slate-200">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-100 font-display text-sm tracking-wider uppercase text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-4">CLIENTE</th>
                    <th className="p-4">DOCUMENTO PENDIENTE</th>
                    <th className="p-4 text-right">SALDO PENDIENTE</th>
                    <th className="p-4 text-center">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {debtors.flatMap(d => d.pendingInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-900">
                        {d.customer?.full_name || d.customer?.fullName || 'Cliente'}
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-500 flex flex-col">
                        <span className="font-bold text-slate-700">{inv.document_number}</span>
                        <span>Total Orig: ${inv.total_amount}</span>
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-rose-700">
                        <CurrencyDisplay amount={inv.balance} size="md" />
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => openCollectionModal(inv.id, inv.balance)}
                          disabled={isProcessing}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase disabled:opacity-50"
                        >
                          Cobrar a Ticket
                        </button>
                      </td>
                    </tr>
                  )))}
                  {debtors.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500">
                        No hay tickets de cuenta corriente pendientes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Panel 1: Pending Invoices for selected customer */}
              <div className="glass-card p-0 overflow-hidden border-slate-200">
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
                   <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                     <List className="w-4 h-4 text-[#7A1B28]" />
                     Tickets Pendientes de Pago
                   </h3>
                </div>
                <table className="w-full text-left text-sm text-slate-700">
                  <tbody className="divide-y divide-slate-200">
                    {(() => {
                      const customerDebts = debtors.find(d => d.customer?.id === selectedCustomerId || d.customer?.customer_id === selectedCustomerId);
                      if (!customerDebts || customerDebts.pendingInvoices.length === 0) {
                        return (
                          <tr><td colSpan={3} className="p-6 text-center text-slate-500">No tiene tickets pendientes de pago.</td></tr>
                        );
                      }
                      return customerDebts.pendingInvoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-mono text-xs text-slate-500 flex flex-col">
                            <span className="font-bold text-slate-700">{inv.document_number}</span>
                            <span>Orig: ${inv.total_amount}</span>
                          </td>
                          <td className="p-4 text-right font-mono font-bold text-rose-700">
                            <CurrencyDisplay amount={inv.balance} size="md" />
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => openCollectionModal(inv.id, inv.balance)}
                              disabled={isProcessing}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase"
                            >
                              Cobrar
                            </button>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Panel 2: Ledger (Movements) */}
              <div className="glass-card p-0 overflow-hidden border-slate-200">
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                   <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                     <Landmark className="w-4 h-4 text-[#7A1B28]" />
                     Historial de Cuenta (Mayor)
                   </h3>
                   <div className="text-[10px] font-mono text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                     Saldo a Favor / Deuda Actual
                   </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 font-display text-[10px] tracking-wider uppercase text-slate-600 border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="p-3">FECHA</th>
                        <th className="p-3">REFERENCIA</th>
                        <th className="p-3 text-right">MONTO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ccMovements.map(m => (
                        <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-mono text-slate-500">{new Date(m.created_at || '').toLocaleDateString('es-VE')}</td>
                          <td className="p-3">
                            <div className="flex flex-col">
                               <span className={`font-bold ${m.type === 'debit' ? 'text-slate-700' : 'text-emerald-700'}`}>
                                 {m.type === 'debit' ? 'TICKET A CC (Deuda)' : 'PAGO/NC (Abono)'}
                               </span>
                               <span className="text-[10px] uppercase text-slate-400">{m.source_type}</span>
                            </div>
                          </td>
                          <td className={`p-3 text-right font-mono font-bold text-sm ${m.type === 'debit' ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {m.type === 'credit' ? '-' : '+'}${Number(m.amount).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {ccMovements.length === 0 && (
                        <tr><td colSpan={3} className="p-6 text-center text-slate-500">Sin movimientos registrados.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}"""

content = content.replace(cc_tab_old, cc_tab_new)

with open("src/components/views/TreasuryView.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Patch applied.")
