import { useMemo } from 'react';

const PHONE_MIN = 10;
const PHONE_MAX = 15;

function digitsOnly(value: string) {
  return value.replace(/\D+/g, '');
}

export function normalizePhoneValue(raw: string) {
  const digits = digitsOnly(raw);
  if (!digits) return '';

  // Приводим российские номера 8XXXXXXXXXX к +7XXXXXXXXXX
  const normalized = digits.startsWith('8') && digits.length === 11 ? `7${digits.slice(1)}` : digits;
  return `+${normalized}`;
}

export function isValidPhoneValue(raw: string) {
  const digits = digitsOnly(raw);
  return digits.length >= PHONE_MIN && digits.length <= PHONE_MAX;
}

export function usePhoneValidation() {
  return useMemo(
    () => ({
      normalizePhone: normalizePhoneValue,
      isValidPhone: isValidPhoneValue,
    }),
    [],
  );
}
