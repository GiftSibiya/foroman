import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import CustomerService from '@/services/customerService';
import InvoiceService from '@/services/invoiceService';
import QuotationService from '@/services/quotationService';
import PaymentService from '@/services/paymentService';
import type { Customer } from '@/types/customer';
import type { Invoice } from '@/types/invoice';
import type { Quotation } from '@/types/quotation';
import type { Payment } from '@/types/payment';
import { PAYMENT_METHODS } from '@/types/payment';
import { formatCurrency, SUPPORTED_CURRENCIES } from '@/utils/currency';
import { generateStatementPdf, type StatementRow } from '@/utils/statementPdf';

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  sole_proprietorship: 'Sole Proprietorship',
  partnership: 'Partnership',
  llc: 'LLC',
  corporation: 'Corporation',
  other: 'Other',
};

type TabId = 'summary' | 'quotations' | 'invoices' | 'payments' | 'statements';

function formatDate(str: string) {
  return new Date(str).toLocaleDateString();
}

function firstDayOfCurrentMonth(): string {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().split('T')[0];
}

function lastDayOfCurrentMonth(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  return d.toISOString().split('T')[0];
}

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('summary');

  // Statement tab state — default to current month
  const [stmtFromDate, setStmtFromDate] = useState<string>(() => firstDayOfCurrentMonth());
  const [stmtToDate, setStmtToDate] = useState<string>(() => lastDayOfCurrentMonth());
  const [stmtCurrency, setStmtCurrency] = useState<string>('ZAR');
  const [stmtRows, setStmtRows] = useState<StatementRow[]>([]);
  const [stmtLoading, setStmtLoading] = useState(false);
  const [stmtGenerated, setStmtGenerated] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    CustomerService.findById(Number(id))
      .then((data) => {
        if (!cancelled) setCustomer(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load customer');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!customer?.name) return;
    let cancelled = false;
    setDocsLoading(true);
    Promise.all([
      InvoiceService.findAll({
        where: { customer_name: customer.name },
        orderBy: 'issue_date',
        orderDirection: 'DESC',
        limit: 200,
      }),
      QuotationService.findAll({
        where: { customer_name: customer.name },
        limit: 200,
      }).catch(() => [] as Quotation[]),
      PaymentService.findByCustomer(customer.name).catch(() => [] as Payment[]),
    ])
      .then(([inv, quot, pay]) => {
        if (!cancelled) {
          setInvoices(inv);
          setQuotations(quot);
          setPayments(Array.isArray(pay) ? pay : []);
        }
      })
      .finally(() => {
        if (!cancelled) setDocsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [customer?.name]);

  const tabButtons = useMemo(
    () => [
      { id: 'summary' as TabId, label: 'Summary' },
      { id: 'quotations' as TabId, label: 'Quotations' },
      { id: 'invoices' as TabId, label: 'Invoices' },
      { id: 'payments' as TabId, label: 'Payments' },
      { id: 'statements' as TabId, label: 'Statements' },
    ],
    []
  );

  const balanceByCurrency = useMemo(() => {
    const byCurrency: Record<string, number> = {};
    for (const inv of invoices) {
      const c = inv.currency || 'ZAR';
      byCurrency[c] = (byCurrency[c] ?? 0) + Number(inv.total ?? 0);
    }
    for (const pay of payments) {
      const c = pay.currency || 'ZAR';
      byCurrency[c] = (byCurrency[c] ?? 0) - Number(pay.amount ?? 0);
    }
    return byCurrency;
  }, [invoices, payments]);

  const totalsByCurrency = useMemo(() => {
    const invoicesTotal: Record<string, number> = {};
    const paymentsTotal: Record<string, number> = {};
    for (const inv of invoices) {
      const c = inv.currency || 'ZAR';
      invoicesTotal[c] = (invoicesTotal[c] ?? 0) + Number(inv.total ?? 0);
    }
    for (const pay of payments) {
      const c = pay.currency || 'ZAR';
      paymentsTotal[c] = (paymentsTotal[c] ?? 0) + Number(pay.amount ?? 0);
    }
    return { invoicesTotal, paymentsTotal };
  }, [invoices, payments]);

  const generateStatement = useCallback(async () => {
    if (!customer?.name) return;
    setStmtLoading(true);
    setStmtGenerated(false);
    try {
      const [invList, payList] = await Promise.all([
        InvoiceService.findAll({
          where: { customer_name: customer.name },
          orderBy: 'issue_date',
          orderDirection: 'ASC',
          limit: 1000,
        }),
        PaymentService.findByCustomer(customer.name),
      ]);

      const from = stmtFromDate || '1970-01-01';
      const to = stmtToDate || '9999-12-31';
      const filterByDate = (d: string) => d >= from && d <= to;

      const combined: Array<{ date: string; type: 'invoice' | 'payment'; reference: string; amount: number; currency: string }> = [];
      for (const inv of invList) {
        const d = inv.issue_date?.split('T')[0] ?? inv.issue_date ?? '';
        if (filterByDate(d)) {
          combined.push({
            date: d,
            type: 'invoice',
            reference: inv.invoice_number ?? `Invoice #${inv.id}`,
            amount: Number(inv.total) || 0,
            currency: inv.currency || 'ZAR',
          });
        }
      }
      for (const pay of payList) {
        const d = pay.date?.split('T')[0] ?? pay.date ?? '';
        if (filterByDate(d)) {
          combined.push({
            date: d,
            type: 'payment',
            reference: pay.reference || `Payment #${pay.id}`,
            amount: Number(pay.amount) || 0,
            currency: pay.currency || 'ZAR',
          });
        }
      }
      combined.sort((a, b) => a.date.localeCompare(b.date));

      const byCurrency = new Map<string, StatementRow[]>();
      for (const item of combined) {
        const c = item.currency;
        if (!byCurrency.has(c)) byCurrency.set(c, []);
        const list = byCurrency.get(c)!;
        const prevBalance = list.length > 0 ? list[list.length - 1].balance : 0;
        const balance = item.type === 'invoice' ? prevBalance + item.amount : prevBalance - item.amount;
        list.push({
          date: item.date,
          type: item.type,
          reference: item.reference,
          debit: item.type === 'invoice' ? item.amount : 0,
          credit: item.type === 'payment' ? item.amount : 0,
          balance,
          currency: c,
        });
      }

      const allRows: StatementRow[] = [];
      byCurrency.forEach((list) => allRows.push(...list));
      allRows.sort((a, b) => a.date.localeCompare(b.date));
      setStmtRows(allRows);
      setStmtGenerated(true);
    } catch (err) {
      console.error(err);
      setStmtRows([]);
    } finally {
      setStmtLoading(false);
    }
  }, [customer?.name, stmtFromDate, stmtToDate]);

  const handleDownloadStatementPdf = useCallback(async () => {
    if (!customer?.name || stmtRows.length === 0) return;
    const from = (stmtFromDate || stmtRows[0]?.date) ?? '';
    const to = (stmtToDate || stmtRows[stmtRows.length - 1]?.date) ?? '';
    await generateStatementPdf(customer.name, from, to, stmtRows, stmtCurrency);
  }, [customer?.name, stmtFromDate, stmtToDate, stmtRows, stmtCurrency]);

  const stmtFilteredRows = useMemo(
    () => stmtRows.filter((r) => r.currency === stmtCurrency),
    [stmtRows, stmtCurrency]
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-slate-500 dark:text-slate-400">Loading…</div>
      </div>
    );
  }
  if (error || !customer) {
    return (
      <div className="space-y-4">
        <p className="text-red-600 dark:text-red-400">{error ?? 'Customer not found.'}</p>
        <Link
          to="/app/customers"
          className="text-indigo-600 dark:text-indigo-400 hover:underline no-underline"
        >
          Back to customers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{customer.name}</h1>
        <Link
          to="/app/customers"
          className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline no-underline"
        >
          ← Back to customers
        </Link>
      </div>

      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="flex gap-1 flex-wrap" aria-label="Tabs">
          {tabButtons.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 bg-white dark:bg-slate-800'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'summary' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Email</dt>
              <dd className="mt-1 text-slate-800 dark:text-slate-200">{customer.email ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Phone</dt>
              <dd className="mt-1 text-slate-800 dark:text-slate-200">{customer.phone ?? '—'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Business / company name
              </dt>
              <dd className="mt-1 text-slate-800 dark:text-slate-200">
                {customer.company_name ?? '—'}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Address</dt>
              <dd className="mt-1 text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                {customer.address ?? '—'}
              </dd>
            </div>
          </dl>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Financial summary
            </h3>
            {docsLoading ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm">Loading…</p>
            ) : (
              <div className="space-y-4">
                {/* Statement summary: what they owe at a glance (costs - payments) */}
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-200 dark:border-slate-600">
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                    Statement summary (invoices − payments)
                  </dt>
                  <dd className="flex flex-wrap items-baseline gap-3 gap-y-1">
                    {Object.keys(balanceByCurrency).length === 0 ? (
                      <span className="text-slate-500 dark:text-slate-400">No activity</span>
                    ) : (
                      Object.entries(balanceByCurrency).map(([curr, bal]) => {
                        const isOwed = bal > 0;
                        const isCredit = bal < 0;
                        const isZero = bal === 0;
                        return (
                          <span
                            key={curr}
                            className={`text-xl font-bold ${
                              isOwed
                                ? 'text-amber-600 dark:text-amber-400'
                                : isCredit
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {isOwed && 'Owed: '}
                            {isCredit && 'Credit: '}
                            {isZero && 'Balance: '}
                            {formatCurrency(bal, curr)}
                          </span>
                        );
                      })
                    )}
                  </dd>
                </div>

                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-lg p-3 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/40">
                    <dt className="text-sm font-medium text-amber-700 dark:text-amber-400">
                      Invoices (costs)
                    </dt>
                    <dd className="mt-1 flex flex-wrap gap-2 items-baseline">
                      {Object.keys(totalsByCurrency.invoicesTotal).length === 0 ? (
                        <span className="text-slate-500 dark:text-slate-400">—</span>
                      ) : (
                        Object.entries(totalsByCurrency.invoicesTotal).map(([curr, tot]) => (
                          <span key={curr} className="font-semibold text-amber-800 dark:text-amber-200">
                            {formatCurrency(tot, curr)}
                          </span>
                        ))
                      )}
                      <span className="text-slate-500 dark:text-slate-400 text-sm">
                        ({invoices.length} invoice{invoices.length !== 1 ? 's' : ''})
                      </span>
                    </dd>
                  </div>
                  <div className="rounded-lg p-3 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200/60 dark:border-emerald-800/40">
                    <dt className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      Payments received
                    </dt>
                    <dd className="mt-1 flex flex-wrap gap-2 items-baseline">
                      {Object.keys(totalsByCurrency.paymentsTotal).length === 0 ? (
                        <span className="text-slate-500 dark:text-slate-400">—</span>
                      ) : (
                        Object.entries(totalsByCurrency.paymentsTotal).map(([curr, tot]) => (
                          <span key={curr} className="font-semibold text-emerald-800 dark:text-emerald-200">
                            {formatCurrency(tot, curr)}
                          </span>
                        ))
                      )}
                      <span className="text-slate-500 dark:text-slate-400 text-sm">
                        ({payments.length} payment{payments.length !== 1 ? 's' : ''})
                      </span>
                    </dd>
                  </div>
                  <div className="rounded-lg p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 sm:col-span-2 lg:col-span-1">
                    <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Balance due (per currency)
                    </dt>
                    <dd className="mt-1 flex flex-wrap gap-2">
                      {Object.keys(balanceByCurrency).length === 0 ? (
                        <span className="text-slate-500 dark:text-slate-400">—</span>
                      ) : (
                        Object.entries(balanceByCurrency).map(([curr, bal]) => (
                          <span
                            key={curr}
                            className={`font-semibold ${
                              bal > 0
                                ? 'text-amber-600 dark:text-amber-400'
                                : bal < 0
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {formatCurrency(bal, curr)}
                          </span>
                        ))
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>

          {(customer.business_type ||
            customer.tax_id ||
            customer.registration_number ||
            customer.vat_number ||
            customer.industry ||
            customer.website) && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Business credentials
              </h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {customer.business_type && (
                  <div>
                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Business type
                    </dt>
                    <dd className="mt-1 text-slate-800 dark:text-slate-200">
                      {BUSINESS_TYPE_LABELS[customer.business_type] ?? customer.business_type}
                    </dd>
                  </div>
                )}
                {customer.tax_id && (
                  <div>
                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Tax ID
                    </dt>
                    <dd className="mt-1 text-slate-800 dark:text-slate-200">{customer.tax_id}</dd>
                  </div>
                )}
                {customer.registration_number && (
                  <div>
                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Registration number
                    </dt>
                    <dd className="mt-1 text-slate-800 dark:text-slate-200">
                      {customer.registration_number}
                    </dd>
                  </div>
                )}
                {customer.vat_number && (
                  <div>
                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      VAT number
                    </dt>
                    <dd className="mt-1 text-slate-800 dark:text-slate-200">
                      {customer.vat_number}
                    </dd>
                  </div>
                )}
                {customer.industry && (
                  <div>
                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Industry
                    </dt>
                    <dd className="mt-1 text-slate-800 dark:text-slate-200">
                      {customer.industry}
                    </dd>
                  </div>
                )}
                {customer.website && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Website
                    </dt>
                    <dd className="mt-1">
                      <a
                        href={
                          customer.website.startsWith('http')
                            ? customer.website
                            : `https://${customer.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        {customer.website}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
          {customer.notes && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Notes</dt>
              <dd className="mt-1 text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                {customer.notes}
              </dd>
            </div>
          )}
        </div>
      )}

      {activeTab === 'quotations' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          {docsLoading ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400">
              Loading quotations…
            </div>
          ) : quotations.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              No quotations for this customer.
            </p>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
              {quotations.map((q) => (
                <li key={q.id} className="py-3 first:pt-0">
                  <Link
                    to={q.id != null ? `/app/quotations/${q.id}` : '#'}
                    className="block focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400">
                      <span className="font-medium">
                        {q.quotation_number ? `Quote ${q.quotation_number}` : `Quotation #${q.id}`}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {q.issue_date ? formatDate(q.issue_date) : '—'} · {q.status ?? '—'}
                      </span>
                      {q.total != null && (
                        <span className="text-sm font-medium">
                          {formatCurrency(Number(q.total), q.currency)}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          {docsLoading ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400">
              Loading invoices…
            </div>
          ) : invoices.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              No invoices for this customer.
            </p>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
              {invoices.map((inv) => (
                <li key={inv.id} className="py-3 first:pt-0">
                  <Link
                    to={`/app/invoices/${inv.id}`}
                    className="flex flex-wrap items-center justify-between gap-2 text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 no-underline"
                  >
                    <span className="font-medium">{inv.invoice_number}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {formatDate(inv.issue_date)} · {inv.status}
                    </span>
                    <span className="text-sm font-medium">
                      {formatCurrency(Number(inv.total), inv.currency)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Payments</h2>
            <Link
              to={`/app/payments/create?customer=${encodeURIComponent(customer.name)}`}
              className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white no-underline hover:bg-indigo-500"
            >
              Record payment
            </Link>
          </div>
          {docsLoading ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400">
              Loading payments…
            </div>
          ) : payments.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              No payments recorded for this customer.
            </p>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
              {payments.map((pay) => {
                const methodLabel = PAYMENT_METHODS.find((m) => m.value === pay.payment_method)?.label ?? pay.payment_method ?? '—';
                return (
                  <li key={pay.id} className="py-3 first:pt-0 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-slate-800 dark:text-slate-200">
                      {formatDate(pay.date)}
                      <span className="text-slate-500 dark:text-slate-400 ml-1">· {methodLabel}</span>
                      {pay.reference ? ` · ${pay.reference}` : ''}
                    </span>
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {formatCurrency(Number(pay.amount), pay.currency)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {activeTab === 'statements' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
            Generate a statement for {customer.name} with date range and running balance. Dates default to the current month.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
            <div className="flex flex-col">
              <label htmlFor="stmt-from" className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                From date
              </label>
              <input
                id="stmt-from"
                type="date"
                value={stmtFromDate}
                onChange={(e) => setStmtFromDate(e.target.value)}
                className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="stmt-to" className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                To date
              </label>
              <input
                id="stmt-to"
                type="date"
                value={stmtToDate}
                onChange={(e) => setStmtToDate(e.target.value)}
                className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="stmt-currency" className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                Currency
              </label>
              <select
                id="stmt-currency"
                value={stmtCurrency}
                onChange={(e) => setStmtCurrency(e.target.value)}
                className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={generateStatement}
                disabled={stmtLoading}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {stmtLoading ? 'Generating…' : 'Generate'}
              </button>
              {stmtGenerated && stmtFilteredRows.length > 0 && (
                <button
                  type="button"
                  onClick={handleDownloadStatementPdf}
                  className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Download PDF
                </button>
              )}
            </div>
          </div>

          {stmtGenerated && (
            <div className="mt-8 space-y-6">
              {/* Statement header */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/70 px-6 py-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                  Statement of Account
                </h2>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2 text-sm">
                  <div>
                    <dt className="inline font-medium text-slate-500 dark:text-slate-400">Account </dt>
                    <dd className="inline text-slate-800 dark:text-slate-200">{customer.name}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium text-slate-500 dark:text-slate-400">Period </dt>
                    <dd className="inline text-slate-800 dark:text-slate-200">
                      {stmtFromDate ? formatDate(stmtFromDate) : '—'} to {stmtToDate ? formatDate(stmtToDate) : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline font-medium text-slate-500 dark:text-slate-400">Currency </dt>
                    <dd className="inline text-slate-800 dark:text-slate-200">{stmtCurrency}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium text-slate-500 dark:text-slate-400">Generated </dt>
                    <dd className="inline text-slate-800 dark:text-slate-200">
                      {new Date().toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Summary totals */}
              {stmtFilteredRows.length > 0 && (() => {
                const totalDebits = stmtFilteredRows.reduce((s, r) => s + r.debit, 0);
                const totalCredits = stmtFilteredRows.reduce((s, r) => s + r.credit, 0);
                const openingBalance = stmtFilteredRows.length > 0
                  ? stmtFilteredRows[0].balance - stmtFilteredRows[0].debit + stmtFilteredRows[0].credit
                  : 0;
                const closingBalance = stmtFilteredRows.length > 0
                  ? stmtFilteredRows[stmtFilteredRows.length - 1].balance
                  : 0;
                return (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Opening balance
                      </p>
                      <p className="mt-0.5 text-base font-semibold text-slate-800 dark:text-slate-200">
                        {formatCurrency(openingBalance, stmtCurrency)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
                        Total debits (invoices)
                      </p>
                      <p className="mt-0.5 text-base font-semibold text-amber-800 dark:text-amber-200">
                        {formatCurrency(totalDebits, stmtCurrency)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                        Total credits (payments)
                      </p>
                      <p className="mt-0.5 text-base font-semibold text-emerald-800 dark:text-emerald-200">
                        {formatCurrency(totalCredits, stmtCurrency)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Closing balance
                      </p>
                      <p
                        className={`mt-0.5 text-base font-bold ${
                          closingBalance > 0
                            ? 'text-amber-600 dark:text-amber-400'
                            : closingBalance < 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {formatCurrency(closingBalance, stmtCurrency)}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Transaction table */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Transaction history
                </h3>
                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm">
                  <table className="w-full text-sm text-left text-slate-800 dark:text-slate-200">
                    <thead className="bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Date</th>
                        <th className="px-4 py-3 font-semibold">Type</th>
                        <th className="px-4 py-3 font-semibold">Reference</th>
                        <th className="px-4 py-3 font-semibold text-right">Debit</th>
                        <th className="px-4 py-3 font-semibold text-right">Credit</th>
                        <th className="px-4 py-3 font-semibold text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                      {stmtFilteredRows.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-10 text-center text-slate-500 dark:text-slate-400">
                            No transactions in this currency for the selected period.
                          </td>
                        </tr>
                      ) : (
                        stmtFilteredRows.map((row, i) => (
                          <tr
                            key={`${row.date}-${row.type}-${row.reference}-${i}`}
                            className={i % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}
                          >
                            <td className="px-4 py-3 whitespace-nowrap">{formatDate(row.date)}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                                  row.type === 'invoice'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                                }`}
                              >
                                {row.type === 'invoice' ? 'Invoice' : 'Payment'}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-medium">{row.reference}</td>
                            <td className="px-4 py-3 text-right tabular-nums">
                              {row.debit > 0 ? formatCurrency(row.debit, row.currency) : '—'}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums">
                              {row.credit > 0 ? formatCurrency(row.credit, row.currency) : '—'}
                            </td>
                            <td
                              className={`px-4 py-3 text-right font-semibold tabular-nums ${
                                row.balance > 0
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : row.balance < 0
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : ''
                              }`}
                            >
                              {formatCurrency(row.balance, row.currency)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
