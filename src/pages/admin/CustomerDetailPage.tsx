import { useEffect, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import CustomerService from '@/services/customerService';
import InvoiceService from '@/services/invoiceService';
import QuotationService from '@/services/quotationService';
import type { Customer } from '@/types/customer';
import type { Invoice } from '@/types/invoice';
import type { Quotation } from '@/types/quotation';
import { formatCurrency } from '@/utils/currency';

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  sole_proprietorship: 'Sole Proprietorship',
  partnership: 'Partnership',
  llc: 'LLC',
  corporation: 'Corporation',
  other: 'Other',
};

type TabId = 'summary' | 'documents';

function formatDate(str: string) {
  return new Date(str).toLocaleDateString();
}

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('summary');

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
    if (!customer?.name || activeTab !== 'documents') return;
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
    ])
      .then(([inv, quot]) => {
        if (!cancelled) {
          setInvoices(inv);
          setQuotations(quot);
        }
      })
      .finally(() => {
        if (!cancelled) setDocsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [customer?.name, activeTab]);

  const tabButtons = useMemo(
    () => [
      { id: 'summary' as TabId, label: 'Summary' },
      { id: 'documents' as TabId, label: 'Documents' },
    ],
    []
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
        <nav className="flex gap-1" aria-label="Tabs">
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

      {activeTab === 'documents' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          {docsLoading ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400">
              Loading documents…
            </div>
          ) : (
            <div className="space-y-8">
              <section>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
                  Invoices
                </h2>
                {invoices.length === 0 ? (
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
                            {formatCurrency(Number(inv.total))}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <section>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
                  Quotations
                </h2>
                {quotations.length === 0 ? (
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
                                {formatCurrency(Number(q.total))}
                              </span>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
