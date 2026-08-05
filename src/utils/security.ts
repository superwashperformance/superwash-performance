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

export const AUTHORIZED_USERS: AuthorizedUser[] = [
  { email: 'admin@superwash.com', pass: 'admin123', name: 'Gustavo Cisneros (CEO)', role: 'admin' },
  { email: 'gerente@superwash.com', pass: 'gerente123', name: 'Carlos Mendoza (Director)', role: 'owner' },
  { email: 'ventas@superwash.com', pass: 'ventas123', name: 'Valeria Rivas (Ventas & Cobros)', role: 'sales' },
  { email: 'recepcion@superwash.com', pass: 'recep123', name: 'Agente Recepción', role: 'free_reception' },
];

export const validateUserCredentials = (email: string, pass: string): AuthorizedUser | null => {
  if (!email || !pass) return null;
  const cleanEmail = email.trim().toLowerCase();
  const match = AUTHORIZED_USERS.find(
    (u) => u.email.toLowerCase() === cleanEmail && u.pass === pass
  );
  return match || null;
};
