import re

def fix_customer_service():
    with open('src/services/customerService.ts', 'r', encoding='utf-8') as f:
        c = f.read()
    c = re.sub(r'\s*type:\s*data\.type,?', '', c)
    with open('src/services/customerService.ts', 'w', encoding='utf-8') as f:
        f.write(c)

def remove_type(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        c = f.read()
    c = c.replace('account.type === ', 'account.is_cash_drawer === ')
    c = c.replace('account.description', 'account.name')
    c = c.replace('mov.treasury_accounts?.account_id', 'mov.treasury_account_id')
    c = c.replace("mov.type === 'in'", "(mov.type === 'income' || mov.type === 'internal_transfer_in')")
    c = c.replace("mov.type === 'out'", "(mov.type === 'expense' || mov.type === 'internal_transfer_out')")
    c = c.replace('mov.method', 'mov.payment_method')
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(c)

fix_customer_service()
remove_type('src/components/views/CashierView.tsx')
remove_type('src/components/views/TreasuryView.tsx')
print('Fixed TS errors from Python script')
