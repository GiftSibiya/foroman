import { Link } from 'react-router-dom';
import { useCompanyStore } from '@/stores/data/CompanyStore';

export function CompanySettingsPage() {
  const currentCompany = useCompanyStore((s) => s.currentCompany);
  const loading = useCompanyStore((s) => s.loading);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">Company</h2>
      <p className="mt-1 text-sm text-slate-600">Your business details for invoices and documents.</p>
      {loading ? (
        <p className="mt-6 text-slate-500">Loading…</p>
      ) : currentCompany ? (
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-slate-500">Company name</dt>
            <dd className="mt-1 text-slate-800">{currentCompany.name}</dd>
          </div>
          {currentCompany.address && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-slate-500">Address</dt>
              <dd className="mt-1 text-slate-800 whitespace-pre-wrap">{currentCompany.address}</dd>
            </div>
          )}
          {currentCompany.tax_id && (
            <div>
              <dt className="text-sm font-medium text-slate-500">Tax ID</dt>
              <dd className="mt-1 text-slate-800">{currentCompany.tax_id}</dd>
            </div>
          )}
        </dl>
      ) : (
        <p className="mt-6 text-slate-500">No company set. Add your company to get started.</p>
      )}
      <div className="mt-6">
        <Link
          to="/onboard"
          className="inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white no-underline hover:bg-indigo-500"
        >
          Edit company details
        </Link>
      </div>
    </div>
  );
}
