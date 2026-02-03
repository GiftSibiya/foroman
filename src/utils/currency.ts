/**
 * Multi-currency support: ZAR, USD, EUR
 */

export const CURRENCY_CODE = 'ZAR' as const;

export type SupportedCurrency = 'ZAR' | 'USD' | 'EUR';

export const SUPPORTED_CURRENCIES: SupportedCurrency[] = ['ZAR', 'USD', 'EUR'];

const LOCALE_BY_CURRENCY: Record<SupportedCurrency, string> = {
  ZAR: 'en-ZA',
  USD: 'en-US',
  EUR: 'de-DE',
};

export function formatCurrency(amount: number, currencyCode?: string): string {
  const code = (currencyCode as SupportedCurrency) ?? CURRENCY_CODE;
  const locale = LOCALE_BY_CURRENCY[code as SupportedCurrency] ?? 'en-ZA';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
  }).format(amount);
}
