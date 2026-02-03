import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '@stores/data/AuthStore';
import { useCompanyStore } from '@stores/data/CompanyStore';
import CompanyService from '@/services/companyService';

export function Onboard() {
  const navigate = useNavigate();
  const sessionUser = useAuthStore((s) => s.sessionUser);
  const isLoggedIn = !!useAuthStore((s) => s.accessToken ?? s.sessionUser?.accessToken);
  const fetchUserCompanies = useCompanyStore((s) => s.fetchUserCompanies);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [taxId, setTaxId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Company name is required');
      return;
    }
    if (!isLoggedIn || !sessionUser) {
      toast.error('Please log in to save your company');
      navigate('/login', { replace: true });
      return;
    }
    setLoading(true);
    try {
      const company = await CompanyService.create({
        name: name.trim(),
        address: address.trim() || undefined,
        tax_id: taxId.trim() || undefined,
      });
      await CompanyService.linkUserToCompany(Number(sessionUser.id), company.id!);
      await fetchUserCompanies(Number(sessionUser.id));
      toast.success('Company saved');
      navigate('/app/dashboard', { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save company';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    toast.success('You can add your company later in Settings');
    navigate(isLoggedIn ? '/app/dashboard' : '/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/app" className="inline-flex items-center gap-2 text-2xl font-bold text-slate-900 no-underline">
            <img src="/favicon.png" alt="" className="h-10 w-10 rounded-lg object-contain" />
            Foroman
          </Link>
          <h2 className="mt-4 text-xl font-semibold text-slate-800">Company details</h2>
          <p className="mt-2 text-sm text-slate-600">
            Add your company now or skip and do it later.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-1">
              Company name
            </label>
            <input
              id="companyName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="Acme Ltd"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">
              Address
            </label>
            <textarea
              id="address"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="123 Main St, City"
            />
          </div>
          <div>
            <label htmlFor="taxId" className="block text-sm font-medium text-slate-700 mb-1">
              Tax ID
            </label>
            <input
              id="taxId"
              type="text"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="VAT / Tax number"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 font-medium text-white hover:bg-slate-800 disabled:opacity-50 transition"
            >
              {loading ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
