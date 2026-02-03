/**
 * App-wide currency: South African Rand (ZAR)
 */

export const CURRENCY_CODE = 'ZAR' as const;
const LOCALE = 'en-ZA';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY_CODE,
  }).format(amount);
}
