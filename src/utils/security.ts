/**
 * Super Wash Performance - Security & Sanitization Utilities
 */

/**
 * Sanitizes text inputs to prevent Cross-Site Scripting (XSS) attacks.
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};

/**
 * In-memory Client Rate Limiter to prevent Brute Force or Spamming on forms.
 */
const attemptStore = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (actionKey: string, maxAttempts = 5, windowMs = 60000): boolean => {
  const now = Date.now();
  const record = attemptStore.get(actionKey);

  if (!record || now > record.resetTime) {
    attemptStore.set(actionKey, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false; // Rate limit exceeded
  }

  record.count += 1;
  return true;
};

export interface AuthorizedUser {
  email: string;
  pass: string;
  name: string;
  role: string;
}

export const DEFAULT_AUTHORIZED_USERS: AuthorizedUser[] = [
  { email: 'admin@superwash.com', pass: 'Superw.admin123', name: 'Gustavo Cisneros (CEO)', role: 'admin' },
  { email: 'gerente@superwash.com', pass: 'Superw.gerente123', name: 'Carlos Mendoza (Director)', role: 'owner' },
  { email: 'ventas@superwash.com', pass: 'Superw.ventas123', name: 'Valeria Rivas (Ventas & Cobros)', role: 'sales' },
  { email: 'recepcion@superwash.com', pass: 'Superw.recep123', name: 'Agente Recepción', role: 'free_reception' },
];

export const getAuthorizedUsers = (): AuthorizedUser[] => {
  try {
    const saved = localStorage.getItem('sw_authorized_users');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading sw_authorized_users:', e);
  }
  // Fallback and initialize localStorage
  localStorage.setItem('sw_authorized_users', JSON.stringify(DEFAULT_AUTHORIZED_USERS));
  return DEFAULT_AUTHORIZED_USERS;
};

export const saveAuthorizedUsers = (users: AuthorizedUser[]): void => {
  localStorage.setItem('sw_authorized_users', JSON.stringify(users));
};

export const updateUserPassword = (email: string, newPass: string): boolean => {
  const users = getAuthorizedUsers();
  const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  if (index !== -1) {
    users[index].pass = newPass;
    saveAuthorizedUsers(users);
    return true;
  }
  return false;
};

export const validateUserCredentials = (email: string, pass: string): AuthorizedUser | null => {
  if (!email || !pass) return null;
  const cleanEmail = email.trim().toLowerCase();
  const users = getAuthorizedUsers();
  const match = users.find(
    (u) => u.email.toLowerCase() === cleanEmail && u.pass === pass
  );
  return match || null;
};
