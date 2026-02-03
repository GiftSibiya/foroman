import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { useCustomerStore } from '../../stores/data/CustomerStore';
import { useCompanyStore } from '../../stores/data/CompanyStore';
import MRTThemeProvider from '../providers/MRTThemeProvider';
import type { Customer } from '../../types/customer';
import { LuFilter } from 'react-icons/lu';

export function CustomerList() {
  const navigate = useNavigate();
  const { customers, loading, error, fetchCustomers } = useCustomerStore();
  const companyId = useCompanyStore((s) => s.currentCompany?.id);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers, companyId]);

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.trim().toLowerCase();
    return customers.filter(
      (c) =>
        (c.name?.toLowerCase().includes(q)) ||
        (c.company_name?.toLowerCase().includes(q)) ||
        (c.email?.toLowerCase().includes(q)) ||
        (c.phone?.toLowerCase().includes(q)) ||
        (c.tax_id?.toLowerCase().includes(q))
    );
  }, [customers, search]);

  const columns = useMemo<MRT_ColumnDef<Customer>[]>(
    () => [
      { accessorKey: 'name', header: 'Name', enableColumnFilter: true },
      { accessorKey: 'company_name', header: 'Business', enableColumnFilter: true },
      { accessorKey: 'email', header: 'Email', enableColumnFilter: true },
      { accessorKey: 'phone', header: 'Phone', enableColumnFilter: true },
      { accessorKey: 'tax_id', header: 'Tax ID', enableColumnFilter: true },
    ],
    []
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Customers</h1>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center text-slate-500 dark:text-slate-400">
          Loading customers…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Customers</h1>
      <div className="flex items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            <LuFilter size={18} />
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers…"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 pl-9 pr-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label="Search customers"
          />
        </div>
        <Link
          to="/app/customers/create"
          className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white no-underline hover:bg-indigo-500"
        >
          + Add customer
        </Link>
      </div>
      <MRTThemeProvider>
        <MaterialReactTable
          columns={columns}
          data={filteredCustomers}
          state={{ showAlertBanner: !!error }}
          enableTopToolbar={false}
          enableColumnFilters={false}
          enableGlobalFilter={false}
          enableColumnOrdering={false}
          enableColumnResizing={false}
          initialState={{ density: 'compact' }}
          muiTableBodyRowProps={({ row }) => ({
            onClick: () => {
              const id = row.original.id;
              if (id != null) navigate(`/app/customers/${id}`);
            },
            sx: { cursor: 'pointer' },
          })}
        />
      </MRTThemeProvider>
    </div>
  );
}
